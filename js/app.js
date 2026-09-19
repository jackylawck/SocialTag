/**
 * 🚀 js/app.js
 * 主程式初始化與生命週期管理
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room') || 'room_test';
  const isHost = urlParams.get('role') === 'host';
  const myName = urlParams.get('name') || (isHost ? '主持人' : `學員_${uid(3)}`);

  const myPeerId = isHost ? 'host_peer' : getPersistentPeerId(roomId);
  document.getElementById('app-title').innerText = `房間: ${roomId}`;

  Net.init(roomId, isHost, myPeerId);

  if (isHost) {
    window.hostSession = new HostServerSession(roomId);
    document.getElementById('role-badge').innerText = 'HOST (筆電大螢幕)';
    document.getElementById('role-badge').classList.add('bg-amber-100', 'text-amber-800');
    document.getElementById('host-controls').classList.remove('hidden');
    document.getElementById('sticker-box').classList.add('hidden');
    document.getElementById('client-view').classList.add('hidden');

    const btnStart = document.getElementById('btn-start');
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

    const btnReclaim = document.getElementById('btn-reclaim');
    btnReclaim.onclick = (e) => {
      const reply = window.hostSession.triggerReclaim();
      if (reply) {
        e.target.disabled = true;
        e.target.classList.add('opacity-50', 'cursor-not-allowed');
        Net.broadcast(reply);
      }
    };

    window.hostSession.recoverTimers();
    setTimeout(() => Net.broadcast(window.hostSession.generateSyncBroadcast()), 150);
  } else {
    window.clientSession = new ClientGameSession(roomId, myPeerId, myName);
    document.getElementById('role-badge').innerText = `學員: ${myName}`;
    document.getElementById('role-badge').classList.add('bg-emerald-100', 'text-emerald-800');

    Net.sendToHost({ type: 'JOIN', peerId: myPeerId, name: myName });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        Net.sendToHost({ type: 'PULL_SYNC', from: myPeerId });
      }
    });
  }

  // 🛡️ 關閉分頁前的最後一道快照存檔保險
  window.addEventListener('beforeunload', () => {
    if (window.clientSession) window.clientSession.saveSnapshot();
    if (window.hostSession) window.hostSession.saveSnapshot();
  });

  // 安全渲染定時循環
  setInterval(() => {
    try {
      UI.render();
    } catch (e) {
      console.warn('[Loop UI Error]', e);
    }
  }, 1000);
});
