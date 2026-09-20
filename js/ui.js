/**
 * 🎨 js/ui.js
 * 雙語渲染與介面管理
 */

const UI = {
  lastSyncPayload: null,

  // 刷新所有帶有 data-i18n 的靜態文字
  renderStaticTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.innerText = I18n.t(key);
    });
    // 更新語言切換按鈕字樣
    document.querySelectorAll('.lang-switch-text').forEach(el => {
      el.innerText = I18n.lang === 'zh' ? 'EN' : '中文';
    });
    // 🌟 更新房間與名字輸入框 placeholder，確保全英/全中切換無死角
    const inputRoom = document.getElementById('input-room');
    if (inputRoom) inputRoom.placeholder = I18n.t('room_placeholder_auto');

    const inputName = document.getElementById('input-name');
    if (inputName) inputName.placeholder = I18n.t('name_placeholder');
  },

  handleIncomingData(data) {
    if (!data || typeof data.type !== 'string') return;

    if (data.type === 'SYNC') {
      this.lastSyncPayload = data;
      if (window.clientSession) window.clientSession.applySync(data);
      this.render();
    } else if (data.type === 'TRANSFER_REJECT') {
      if (window.clientSession) window.clientSession.handleReject(data);
      this.render();
    } else if (data.type === 'JOIN_REJECTED') {
      // 🌟 分流處理：人數已滿 vs 錯過開場
      if (data.reason === 'FULL') {
        document.getElementById('room-status').innerText = I18n.t('room_full_title');
        document.getElementById('participant-list').innerHTML =
          `<div class="text-center text-rose-500 py-6 text-sm font-medium">
            ${I18n.t('room_full_desc', { max: data.max || 50 })}
          </div>`;
      } else {
        document.getElementById('room-status').innerText = I18n.t('missed_start');
        document.getElementById('participant-list').innerHTML =
          `<div class="text-center text-slate-400 py-6 text-sm">${I18n.t('missed_desc')}</div>`;
      }
      document.getElementById('timer-display').innerText = '--:--';
      document.getElementById('sticker-box').classList.add('hidden');
    }
  },

  render() {
    try {
      this.renderStaticTexts();
      const sync = this.lastSyncPayload || (window.hostSession ? window.hostSession.generateSyncBroadcast() : null);
      if (!sync) return;

      document.getElementById('room-status').innerText = sync.status;

      // 倒數時鐘
      if (sync.status === RoomStatus.ACTIVE && sync.serverStartAt) {
        const remaining = window.clientSession
          ? window.clientSession.getRemainingSec(sync.serverStartAt, sync.durationSec)
          : Math.max(0, Math.ceil(sync.durationSec - (Date.now() - sync.serverStartAt) / 1000));
        const m = String(Math.floor(remaining / 60)).padStart(2, '0');
        const s = String(remaining % 60).padStart(2, '0');
        document.getElementById('timer-display').innerText = `${m}:${s}`;
      } else if (sync.status === RoomStatus.ENDED) {
        document.getElementById('timer-display').innerText = I18n.t('game_ended_title');
        if (Net.isHost) document.getElementById('btn-reclaim').classList.remove('hidden');
      } else if (sync.status === RoomStatus.RECLAIM) {
        document.getElementById('timer-display').innerText = I18n.t('game_reclaim_title');
      }

      // Leaderboard
      const lbBox = document.getElementById('leaderboard-box');
      if (sync.leaderboard && (sync.status === RoomStatus.ENDED || sync.status === RoomStatus.RECLAIM)) {
        lbBox.classList.remove('hidden');
        const mr = sync.leaderboard.mostReceived;
        document.getElementById('lb-most-received').innerText =
          mr ? `${mr.avatar} ${mr.name}${I18n.t('lb_count', { n: mr.receivedCount })}` : I18n.t('lb_empty');
        const fg = sync.leaderboard.fastestGivers;
        document.getElementById('lb-fastest').innerText =
          fg && fg.length ? fg.map(p => `${p.avatar} ${p.name}`).join('、') : I18n.t('lb_empty');
      } else {
        lbBox.classList.add('hidden');
      }

      // 進度條
      if (sync.status === RoomStatus.RECLAIM) {
        document.getElementById('progress-box').classList.remove('hidden');
        const pct = Math.round(sync.reclaimProgress * 100);
        document.getElementById('progress-text').innerText = `${pct}%`;
        document.getElementById('progress-bar').style.width = `${pct}%`;
      }

      // 學員名單
      if (!Net.isHost && window.clientSession) {
        document.getElementById('my-stickers').innerText = window.clientSession.inventory;

        const pList = document.getElementById('participant-list');
        pList.innerHTML = '';
        const others = Object.entries(sync.participants).filter(([pid]) => pid !== Net.myPeerId);

        others.forEach(([pid, p]) => {
          const isGiven = window.clientSession.givenTo.has(pid);
          const btn = document.createElement('button');
          btn.className = `w-full flex justify-between items-center p-2.5 rounded-lg border text-sm transition ${
            isGiven ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' : 'bg-white border-slate-300 hover:border-indigo-500'
          }`;
          btn.disabled = isGiven || window.clientSession.inventory <= 0 || sync.status !== RoomStatus.ACTIVE;
          btn.innerHTML = `<span>${p.avatar} ${p.name}</span><span class="text-xs font-semibold">${isGiven ? I18n.t('btn_tagged') : I18n.t('btn_tag')}</span>`;
          btn.onclick = () => {
            try {
              const payload = window.clientSession.createTransferPayload(pid);
              Net.sendToHost(payload);
              UI.render();
            } catch (err) {
              showToast(err.message, 'warning');
            }
          };
          pList.appendChild(btn);
        });

        // 收到的標籤
        const rList = document.getElementById('received-list');
        rList.innerHTML = '';
        if (window.clientSession.receivedStickers.length === 0) {
          rList.innerHTML = `<div class="text-xs text-slate-400 italic">${I18n.t('empty_stickers')}</div>`;
        } else {
          window.clientSession.receivedStickers.forEach(item => {
            const card = document.createElement('div');
            card.className = 'flex justify-between items-center bg-slate-50 border p-2 rounded text-xs';
            card.innerHTML = `<span>${I18n.t('received_from', { name: `<b>${item.fromName}</b>` })}</span>`;
            if (sync.status === RoomStatus.RECLAIM) {
              const retBtn = document.createElement('button');
              retBtn.className = `px-2 py-1 rounded transition ${item.returned ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`;
              retBtn.innerText = item.returned ? I18n.t('btn_returned') : I18n.t('btn_return');
              retBtn.disabled = item.returned;
              retBtn.onclick = () => {
                const payload = window.clientSession.createReturnPayload(item.transferId);
                Net.sendToHost(payload);
              };
              card.appendChild(retBtn);
            }
            rList.appendChild(card);
          });
        }
      }
    } catch (err) {
      console.warn('[UI.render Guard]', err);
    }
  }
};
