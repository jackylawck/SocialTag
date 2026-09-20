/**
 * 🛠️ js/utils.js
 * 輔助工具：安全隨機數、持久化 PeerID、防疊加 Toast、頭像分配器
 */

function uid(len = 8) {
  if (typeof crypto !== 'undefined') {
    if (crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '').slice(0, len);
    if (crypto.getRandomValues) {
      const buf = new Uint8Array(Math.ceil(len / 2));
      crypto.getRandomValues(buf);
      return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('').slice(0, len);
    }
  }
  return Math.random().toString(36).slice(2, 2 + len);
}

function getPersistentPeerId(roomId) {
  const key = `ice_persistent_peer_${roomId}`;
  let storedId = localStorage.getItem(key);
  if (!storedId) {
    storedId = `p_${Date.now().toString(36)}_${uid(5)}`;
    localStorage.setItem(key, storedId);
  }
  return storedId;
}

// 🌟 新增：根據 PeerID 哈希值確定性分配生動 Emoji，避免 undefined 報錯
function getAvatarForPeer(peerId) {
  const avatars = ['🦊', '🐼', '🐨', '🦁', '🐯', '🦄', '🐙', '🦉', '🐬', '🦔', '🐝', '🐧', '🐶', '🐱'];
  if (!peerId) return '🙂';
  let hash = 0;
  for (let i = 0; i < peerId.length; i++) {
    hash = (hash << 5) - hash + peerId.charCodeAt(i);
    hash |= 0;
  }
  return avatars[Math.abs(hash) % avatars.length];
}

function showToast(msg, type = 'info') {
  const el = document.createElement('div');
  const bg = type === 'warning' ? 'bg-amber-600' : (type === 'error' ? 'bg-rose-600' : 'bg-slate-800');
  const existing = document.querySelectorAll('.toast-item').length;
  el.className = `toast-item fixed left-1/2 -translate-x-1/2 ${bg} text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50 transition-all`;
  el.style.top = `${16 + existing * 44}px`;
  el.innerText = msg;
  document.body.appendChild(el);
  if (navigator.vibrate) navigator.vibrate(100);
  setTimeout(() => el.remove(), 2500);
}
