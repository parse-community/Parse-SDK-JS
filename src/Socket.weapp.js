module.exports = class SocketWeapp {
  constructor(serverURL) {
    this.onopen = () => {}
    this.onmessage = () => {}
    this.onclose = () => {}
    this.onerror = () => {}

    wx.connectSocket({
      url: serverURL
    })

    wx.onSocketOpen(() => {
      this.onopen();
    })

    wx.onSocketMessage((msg) => {
      this.onmessage(msg);
    });

    wx.onSocketClose(() => {
      this.onclose();
    })

    wx.onSocketError((error) => {
      this.onerror(error);
    })
  }

  send(data) {
    wx.sendSocketMessage({ data });
  }

  close() {
    wx.closeSocket();
  }
}
