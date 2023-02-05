module.exports = class SocketWeapp {
  constructor(serverURL) {
    this.onopen = () => {};
    this.onmessage = () => {};
    this.onclose = () => {};
    this.onerror = () => {};

    wx.onSocketOpen(() => {
      this.onopen();
    });

    wx.onSocketMessage(msg => {
      this.onmessage(msg);
    });

    wx.onSocketClose((event) => {
      this.onclose(event);
    });

    wx.onSocketError(error => {
      this.onerror(error);
    });

    wx.connectSocket({
      url: serverURL,
    });
  }

  send(data) {
    wx.sendSocketMessage({ data });
  }

  close() {
    wx.closeSocket();
  }
};
