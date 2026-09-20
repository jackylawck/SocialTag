/**
 * 🎮 js/game.js
 * 核心狀態機常數與業務邏輯
 */

const RoomStatus = {
  LOBBY: 'LOBBY',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  RECLAIM: 'RECLAIM'
};

class ClientGameSession {
  constructor(roomId, myPeerId, myName) {
    this.roomId = roomId;
    this.myPeerId = myPeerId;
    this.myName = myName;

    this.status = RoomStatus.LOBBY;
    this.seq = 0;
    this.initialStickers = 3;
    this.inventory = 3;
    this.clockOffset = 0;
    this.givenTo = new Set();
    this.receivedStickers = [];
    this.pendingTransfers = new Map();

    this.restoreSnapshot();
  }

  getServerNow() {
    return Date.now() + (this.clockOffset || 0);
  }

  getRemainingSec(serverStartAt, durationSec) {
    if (!serverStartAt) return durationSec;
    const elapsedSec = (this.getServerNow() - serverStartAt) / 1000;
    return Math.max(0, Math.ceil(durationSec - elapsedSec));
  }

  saveSnapshot() {
    try {
      localStorage.setItem(`ice_c_${this.roomId}_${this.myPeerId}`, JSON.stringify({
        status: this.status,
        seq: this.seq,
        initialStickers: this.initialStickers,
        inventory: this.inventory,
        clockOffset: this.clockOffset,
        givenTo: Array.from(this.givenTo),
        receivedStickers: this.receivedStickers,
        savedAt: Date.now()
      }));
    } catch (e) { console.warn('[Client Snapshot]', e); }
  }

  restoreSnapshot() {
    try {
      const raw = localStorage.getItem(`ice_c_${this.roomId}_${this.myPeerId}`);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (Date.now() - d.savedAt < 7200000) {
        this.status = d.status;
        this.seq = d.seq;
        this.initialStickers = d.initialStickers || 3;
        this.inventory = d.inventory;
        this.clockOffset = d.clockOffset || 0;
        this.givenTo = new Set(d.givenTo);
        this.receivedStickers = d.receivedStickers || [];
      }
    } catch (e) { console.warn('[Client Restore]', e); }
  }

  createTransferPayload(targetPeerId) {
    if (this.status !== RoomStatus.ACTIVE) throw new Error('目前非活動進行階段');
    if (this.inventory <= 0) throw new Error('貼紙已全部送出');
    if (this.givenTo.has(targetPeerId)) throw new Error('不可重複貼同一位朋友');

    const transferId = `tx_${this.myPeerId}_${Date.now()}_${uid(6)}`;

    this.inventory--;
    this.givenTo.add(targetPeerId);

    const pendingItem = { targetPeerId, timer: null };

    pendingItem.timer = setTimeout(() => {
      if (this.pendingTransfers.has(transferId)) {
        this.givenTo.delete(targetPeerId);
        this.pendingTransfers.delete(transferId);
        this.saveSnapshot();
        if (typeof Net !== 'undefined') Net.sendToHost({ type: 'PULL_SYNC', from: this.myPeerId });
        showToast('⚠️ 貼紙逾時，已同步最新狀態', 'warning');
        if (typeof UI !== 'undefined') UI.render();
      }
    }, 3500);

    this.pendingTransfers.set(transferId, pendingItem);
    this.saveSnapshot();

    return {
      type: 'TRANSFER',
      transferId,
      from: this.myPeerId,
      fromName: this.myName,
      to: targetPeerId,
      timestamp: Date.now()
    };
  }

  createReturnPayload(transferId) {
    if (this.status !== RoomStatus.RECLAIM) throw new Error('目前非歸還階段');
    return {
      type: 'RETURN',
      transferId,
      returnedBy: this.myPeerId,
      timestamp: Date.now()
    };
  }

  handleReject(payload) {
    const { transferId, reason } = payload;
    const item = this.pendingTransfers.get(transferId);
    if (item) {
      clearTimeout(item.timer);
      this.givenTo.delete(item.targetPeerId);
      this.pendingTransfers.delete(transferId);
      this.saveSnapshot();

      if (typeof Net !== 'undefined') {
        Net.sendToHost({ type: 'PULL_SYNC', from: this.myPeerId });
      }
      showToast(reason === 'DUPLICATE_TARGET' ? '已貼過該朋友' : '貼標籤被拒絕', 'warning');
    }
  }

  applySync(payload) {
    if (payload.seq <= this.seq) return;
    this.seq = payload.seq;
    this.status = payload.status;
    if (payload.initialStickers) this.initialStickers = payload.initialStickers;

    if (payload.serverNow) {
      this.clockOffset = payload.serverNow - Date.now();
    }

    // 1. 結算確認的 pending
    const logIds = new Set((payload.transferLog || []).map(t => t.transferId));
    for (const [txId, item] of this.pendingTransfers.entries()) {
      if (logIds.has(txId)) {
        clearTimeout(item.timer);
        this.pendingTransfers.delete(txId);
      }
    }

    // 2. 權威庫存對齊：Host 權威值扣除尚在 pending 中的數量
    const myData = payload.participants && payload.participants[this.myPeerId];
    if (myData) {
      this.inventory = myData.inventory - this.pendingTransfers.size;
    }

    // 3. 重建 givenTo：權威記錄 ∪ 未結算 pending 的目標
    const authorityGiven = new Set(
      (payload.transferLog || [])
        .filter(t => t.from === this.myPeerId)
        .map(t => t.to)
    );
    for (const item of this.pendingTransfers.values()) {
      authorityGiven.add(item.targetPeerId);
    }
    this.givenTo = authorityGiven;

    // 4. 重建收到的標籤日誌
    const returnedSet = new Set(payload.returnedIds || []);
    this.receivedStickers = (payload.transferLog || [])
      .filter(t => t.to === this.myPeerId)
      .map(t => ({
        transferId: t.transferId,
        fromPeerId: t.from,
        fromName: t.fromName,
        returned: returnedSet.has(t.transferId)
      }));

    this.saveSnapshot();
  }
}

class HostServerSession {
  constructor(roomId) {
    this.roomId = roomId;
    this.INITIAL_STICKERS = 3;
    this.GAME_DURATION_SEC = 300;
    this.MAX_PARTICIPANTS = 50; // 🌟 設定單房保險上限：最多 50 人，防止 Host 筆電過載

    this.status = RoomStatus.LOBBY;
    this.seq = 0;
    this.serverStartAt = null;
    this.reclaimAt = null;

    this.participants = {};
    this.transferLog = [];
    this.processedTransferIds = new Set();
    this.pairKeys = new Set();
    this.returnedIds = new Set();

    this.autoEndTimer = null;
    this.autoReclaimTimer = null;

    this.restoreSnapshot();
  }

  saveSnapshot() {
    try {
      localStorage.setItem(`ice_h_${this.roomId}`, JSON.stringify({
        status: this.status,
        seq: this.seq,
        serverStartAt: this.serverStartAt,
        reclaimAt: this.reclaimAt,
        participants: this.participants,
        transferLog: this.transferLog,
        processedTransferIds: Array.from(this.processedTransferIds),
        pairKeys: Array.from(this.pairKeys),
        returnedIds: Array.from(this.returnedIds),
        savedAt: Date.now()
      }));
    } catch (e) { console.warn('[Host Snapshot]', e); }
  }

  restoreSnapshot() {
    try {
      const raw = localStorage.getItem(`ice_h_${this.roomId}`);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (Date.now() - d.savedAt < 7200000) {
        this.status = d.status;
        this.seq = d.seq;
        this.serverStartAt = d.serverStartAt;
        this.reclaimAt = d.reclaimAt;
        this.participants = d.participants || {};
        this.transferLog = d.transferLog || [];
        this.processedTransferIds = new Set(d.processedTransferIds || []);
        this.pairKeys = new Set(d.pairKeys || []);
        this.returnedIds = new Set(d.returnedIds || []);
      }
    } catch (e) { console.warn('[Host Restore]', e); }
  }

  recoverTimers() {
    const now = Date.now();
    if (this.status === RoomStatus.ACTIVE && this.serverStartAt) {
      const remaining = (this.GAME_DURATION_SEC + 1) * 1000 - (now - this.serverStartAt);
      if (remaining <= 0) {
        this.triggerAutoEnd();
      } else {
        this.autoEndTimer = setTimeout(() => this.triggerAutoEnd(), remaining);
      }
    } else if (this.status === RoomStatus.ENDED && this.reclaimAt) {
      const remaining = this.reclaimAt - now;
      if (remaining <= 0) {
        this.triggerAutoReclaim();
      } else {
        this.autoReclaimTimer = setTimeout(() => this.triggerAutoReclaim(), remaining);
      }
    }
  }

  triggerAutoEnd() {
    if (this.status !== RoomStatus.ACTIVE) return;
    this.endGame();
    if (typeof Net !== 'undefined') Net.broadcast(this.generateSyncBroadcast());
  }

  triggerAutoReclaim() {
    if (this.status !== RoomStatus.ENDED) return;
    this.triggerReclaim();
    if (typeof Net !== 'undefined') Net.broadcast(this.generateSyncBroadcast());
  }

  handleJoin({ peerId, name, avatar }) {
    const safeName = String(name || '無名氏').slice(0, 16).replace(/[<>"'&]/g, '');
    const safeAvatar = String(avatar || '🙂').slice(0, 4).replace(/[<>"'&]/g, '');

    // 1. 已在名單內的舊學員（重連 / 刷新）放行並更新名字
    if (this.participants[peerId]) {
      this.participants[peerId].name = safeName;
      this.participants[peerId].avatar = safeAvatar;
    } else {
      // 2. 遊戲進行中不准新學員入場
      if (this.status !== RoomStatus.LOBBY) {
        return { type: 'JOIN_REJECTED', reason: 'GAME_IN_PROGRESS' };
      }

      // 3. 🌟 單房人數上限檢查：超過 50 人拒絕加入
      const currentCount = Object.keys(this.participants).length;
      if (currentCount >= this.MAX_PARTICIPANTS) {
        return { 
          type: 'JOIN_REJECTED', 
          reason: 'FULL', 
          max: this.MAX_PARTICIPANTS 
        };
      }

      // 4. 正常新增學員
      this.participants[peerId] = {
        name: safeName,
        avatar: safeAvatar,
        inventory: this.INITIAL_STICKERS,
        receivedCount: 0,
        returnedCount: 0
      };
    }

    this.seq++;
    this.saveSnapshot();
    return this.generateSyncBroadcast();
  }

  handlePullSync() {
    return this.generateSyncBroadcast();
  }

  startGame() {
    if (this.status !== RoomStatus.LOBBY) return null;
    this.status = RoomStatus.ACTIVE;
    this.serverStartAt = Date.now();
    this.seq++;

    if (this.autoEndTimer) clearTimeout(this.autoEndTimer);
    this.autoEndTimer = setTimeout(() => this.triggerAutoEnd(), (this.GAME_DURATION_SEC + 1) * 1000);

    this.saveSnapshot();
    return this.generateSyncBroadcast();
  }

  endGame() {
    if (this.status !== RoomStatus.ACTIVE) return null;
    this.status = RoomStatus.ENDED;
    this.reclaimAt = Date.now() + 45000;
    this.seq++;

    if (this.autoEndTimer) clearTimeout(this.autoEndTimer);
    if (this.autoReclaimTimer) clearTimeout(this.autoReclaimTimer);
    this.autoReclaimTimer = setTimeout(() => this.triggerAutoReclaim(), 45000);

    this.saveSnapshot();
    return this.generateSyncBroadcast();
  }

  triggerReclaim() {
    if (this.status !== RoomStatus.ENDED) return null;
    this.status = RoomStatus.RECLAIM;
    this.seq++;

    if (this.autoReclaimTimer) clearTimeout(this.autoReclaimTimer);

    this.saveSnapshot();
    return this.generateSyncBroadcast();
  }

  handleTransfer(payload) {
    if (this.status !== RoomStatus.ACTIVE) {
      return { isReject: true, type: 'TRANSFER_REJECT', transferId: payload.transferId, reason: 'TIMEOUT' };
    }

    if (Date.now() - this.serverStartAt > (this.GAME_DURATION_SEC + 3) * 1000) {
      this.triggerAutoEnd();
      return { isReject: true, type: 'TRANSFER_REJECT', transferId: payload.transferId, reason: 'TIMEOUT' };
    }

    const { transferId, from, to, fromName } = payload;

    if (this.processedTransferIds.has(transferId)) {
      return this.generateSyncBroadcast();
    }

    if (from === to) return null;

    const pairKey = `${from}->${to}`;
    if (this.pairKeys.has(pairKey)) {
      return { isReject: true, type: 'TRANSFER_REJECT', transferId, reason: 'DUPLICATE_TARGET' };
    }

    const sender = this.participants[from];
    const receiver = this.participants[to];
    if (!sender || !receiver || sender.inventory <= 0) {
      return { isReject: true, type: 'TRANSFER_REJECT', transferId, reason: 'NO_INVENTORY' };
    }

    this.processedTransferIds.add(transferId);
    this.pairKeys.add(pairKey);
    sender.inventory--;
    receiver.receivedCount++;
    this.transferLog.push({
      transferId,
      from,
      to,
      fromName: fromName || sender.name,
      at: Date.now()
    });

    this.seq++;
    this.saveSnapshot();
    return this.generateSyncBroadcast();
  }

  handleReturn(payload) {
    if (this.status !== RoomStatus.RECLAIM) return null;
    const { transferId, returnedBy } = payload;

    const transfer = this.transferLog.find(t => t.transferId === transferId);
    if (!transfer || transfer.to !== returnedBy) return null;

    if (!this.returnedIds.has(transferId)) {
      this.returnedIds.add(transferId);
      if (this.participants[returnedBy]) {
        this.participants[returnedBy].returnedCount++;
      }
      this.seq++;
      this.saveSnapshot();
      return this.generateSyncBroadcast();
    }
    return null;
  }

  generateSyncBroadcast() {
    const totalTransfers = this.transferLog.length;
    const totalReturns = this.returnedIds.size;
    const isAllReturned = totalTransfers > 0 && totalReturns === totalTransfers;

    return {
      type: 'SYNC',
      seq: this.seq,
      status: this.status,
      serverNow: Date.now(),
      initialStickers: this.INITIAL_STICKERS,
      serverStartAt: this.serverStartAt,
      durationSec: this.GAME_DURATION_SEC,
      reclaimAt: this.reclaimAt,
      participants: this.participants,
      transferLog: this.transferLog,
      returnedIds: Array.from(this.returnedIds),
      reclaimProgress: totalTransfers > 0 ? (totalReturns / totalTransfers) : 0,
      isAllReturned,
      leaderboard: this.buildLeaderboard()
    };
  }

  buildLeaderboard() {
    if (this.status !== RoomStatus.ENDED && this.status !== RoomStatus.RECLAIM) return null;
    const list = Object.entries(this.participants).map(([id, p]) => ({ id, ...p }));
    const mostReceived = [...list].sort((a, b) => b.receivedCount - a.receivedCount)[0];
    const fastestGivers = [...list].filter(p => p.inventory === 0);
    return { mostReceived, fastestGivers };
  }
}
