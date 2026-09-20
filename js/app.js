/**
 * 🚀 js/app.js
 */
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  let roomId = urlParams.get('room');
  const role = urlParams.get('role');
  const nameParam = urlParams.get('name');

  UI.renderStaticTexts();

  const hasIdentity = (role === 'host' || !!nameParam) && !!roomId;

  if (!hasIdentity) {
    const modal = document.getElementById('entry-modal');
    modal.classList.remove('hidden');

    const inputRoom = document.getElementById('input-room');
    const inputName = document.getElementById('input-name');
    const btnRandom = document.getElementById('btn-random-room');

    // 🎲 隨機產生獨立房號 (例如: tag-6391)
    if (btnRandom) {
      btnRandom.onclick = () => {
        inputRoom.value = `tag-${Math.floor(1000 + Math.random() * 9000)}`;
      };
    }

    // 🖥️ 主持人進入：自訂房號或留空自動產生全新專屬房號
    document.getElementById('btn-join-host').onclick = () => {
      const room = inputRoom.value.trim() || `tag-${Math.floor(1000 + Math.random() * 9000)}`;
      window.location.search = `?room=${encodeURIComponent(room)}&role=host`;
    };

    // 📱 學員進入：必須具備房號
    const joinAsClient = () => {
      const room = inputRoom.value.trim() || roomId;
      if (!room) {
        inputRoom.focus();
        return;
      }
      const name = inputName.value.trim() || `學員_${uid(3)}`;
      window.location.search = `?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
    };

    document.getElementById('btn-join-client').onclick = joinAsClient;

    // 支援輸入完名字直接按 Enter 鍵進入
    inputName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') joinAsClient();
    });

    return;
  }

  const isHost = role === 'host';
  const myName = nameParam || (isHost ? '主持人' : `學員_${uid(3)}`);
  const myPeerId = isHost ? 'host_peer' : getPersistentPeerId(roomId);

  // 渲染獨立房號標籤
  const displayRoomEl = document.getElementById('display-room-id');
  if (displayRoomEl) displayRoomEl.innerText = roomId;

  Net.init(roomId, isHost, myPeerId);

  if (isHost) {
    window.hostSession = new HostServerSession(roomId);
    document.getElementById('role-badge').innerText = I18n.t('role_host');
    document.getElementById('role-badge').classList.add('bg-amber-100', 'text-amber-800');
    document.getElementById('host-controls').classList.remove('hidden');
    document.getElementById('sticker-box').classList.add('hidden');
    document.getElementById('client-view').classList.add('hidden');

    // 🌟 大螢幕 QR Code 生成與顯示
    const inviteBox = document.getElementById('host-invite-box');
    if (inviteBox) {
      inviteBox.classList.remove('hidden');
      const inviteCodeEl = document.getElementById('invite-room-code');
      if (inviteCodeEl) inviteCodeEl.innerText = roomId;

      const clientJoinUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
      const qrContainer = document.getElementById('qrcode-container');
      if (qrContainer && typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
          text: clientJoinUrl,
          width: 110,
          height: 110,
          colorDark: "#1e1b4b",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }

    const btnStart = document.getElementById('btn-start');
    const btnReclaim = document.getElementById('btn-reclaim');
    const btnReset = document.getElementById('btn-reset');

    // 依水合後的狀態對齊按鈕
    if (window.hostSession.status !== RoomStatus.LOBBY) {
      btnStart.disabled = true;
      btnStart.classList.add('opacity-50', 'cursor-not-allowed');
    }

    btnStart.onclick = (e) => {
      const reply = window.hostSession.startGame();
      if (reply) {
        e.target.disabled = true;
        e.target.classList.add('opacity-50', 'cursor-not-allowed');
        Net.broadcast(reply);
      }
    };

    btnReclaim.onclick = (e) => {
      const reply = window.hostSession.triggerReclaim();
      if (reply) {
        e.target.disabled = true;
        e.target.classList.add('opacity-50', 'cursor-not-allowed');
        Net.broadcast(reply);
      }
    };

    // 重設房間：清空快照並重載回乾淨的 LOBBY
    if (btnReset) {
      btnReset.onclick = () => {
        if (confirm('確定要清空資料並重新開局？全場學員將重回 LOBBY 狀態。')) {
          localStorage.removeItem(`ice_h_${roomId}`);
          window.location.reload();
        }
      };
    }

    window.hostSession.recoverTimers();
    setTimeout(() => Net.broadcast(window.hostSession.generateSyncBroadcast()), 150);
  } else {
    window.clientSession = new ClientGameSession(roomId, myPeerId, myName);
    document.getElementById('role-badge').innerText = `${I18n.t('role_client_prefix')}${myName}`;
    document.getElementById('role-badge').classList.add('bg-emerald-100', 'text-emerald-800');

    Net.sendToHost({ type: 'JOIN', peerId: myPeerId, name: myName });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        Net.sendToHost({ type: 'PULL_SYNC', from: myPeerId });
      }
    });
  }

  window.addEventListener('beforeunload', () => {
    if (window.clientSession) window.clientSession.saveSnapshot();
    if (window.hostSession) window.hostSession.saveSnapshot();
  });

  setInterval(() => {
    try {
      UI.render();
    } catch (e) {
      console.warn('[Loop UI Error]', e);
    }
  }, 1000);
});
