/**
 * 📡 js/net.js
 * 通訊協議層 (封裝 BroadcastChannel 模擬 WebRTC，含 Host Guard)
 */

const Net = {
  channel: null,
  isHost: false,
  myPeerId: null,

  init(roomId, isHost, myPeerId) {
    this.isHost = isHost;
    this.myPeerId = myPeerId;
    this.channel = new BroadcastChannel(`mock_p2p_${roomId}`);

    this.channel.onmessage = (event) => {
      const { from, targetPeer, data } = event.data;

      if (this.isHost && from !== 'HOST') {
        if (!window.hostSession) return;

        let reply = null;
        if (data.type === 'JOIN') reply = window.hostSession.handleJoin(data);
        if (data.type === 'PULL_SYNC') reply = window.hostSession.handlePullSync();
        if (data.type === 'TRANSFER') {
          reply = window.hostSession.handleTransfer(data);
          if (reply && reply.isReject) {
            this.channel.postMessage({ from: 'HOST', targetPeer: from, data: reply });
            return;
          }
        }
        if (data.type === 'RETURN') reply = window.hostSession.handleReturn(data);

        if (reply) {
          if (reply.type === 'JOIN_REJECTED') {
            this.channel.postMessage({ from: 'HOST', targetPeer: from, data: reply });
          } else {
            this.broadcast(reply);
          }
        }
      } else if (!this.isHost && from === 'HOST') {
        if (targetPeer && targetPeer !== this.myPeerId) return;
        if (typeof UI !== 'undefined') UI.handleIncomingData(data);
      }
    };
  },

  broadcast(data) {
    if (!data) return;
    this.channel.postMessage({ from: 'HOST', data });
    if (typeof UI !== 'undefined') UI.handleIncomingData(data);
  },

  sendToHost(data) {
    if (this.isHost) return; // 🛡️ Host 永不對自己發送 Client 訊息
    if (!data) return;
    this.channel.postMessage({ from: this.myPeerId, data });
  }
};
