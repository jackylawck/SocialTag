/**
 * 🚀 js/app.js
 */
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room') || 'room_test';
  const role = urlParams.get('role');
  const nameParam = urlParams.get('name');

  UI.renderStaticTexts();

  const hasIdentity = role === 'host' || !!nameParam;

  if (!hasIdentity) {
    const modal = document.getElementById('entry-modal');
    modal.classList.remove('hidden');

    document.getElementById('btn-join-host').onclick = () => {
      const room = document.getElementById('input-room').value.trim() || 'room_test';
      window.location.search = `?room=${encodeURIComponent(room)}&role=host`;
    };

    document.getElementById('btn-join-client').onclick = () => {
      const room = document.getElementById('input-room').value.trim() || 'room_test';
      const name = document.getElementById('input-name').value.trim() || `學員_${uid(3)}`;
      window.location.search = `?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
    };
    return;
  }

  const isHost = role === 'host';
  const myName = nameParam || (isHost ? '主持人' : `學員_${uid(3)}`);
  const myPeerId = isHost ? 'host_peer' : getPersistentPeerId(roomId);
  
  document.getElementById('app-title').innerText = `${I18n.t('app_title')} (${roomId})`;

  Net.init(roomId, isHost, myPeerId);

  if (isHost) {
    window.hostSession = new HostServerSession(roomId);
    document.getElementById('role-badge').innerText = I18n.t('role_host');
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
