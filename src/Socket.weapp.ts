class SocketWeapp {
  onopen: () => void;
  onmessage: () => void;
  onclose: () => void;
  onerror: () => void;

  constructor(serverURL) {
    this.onopen = () => {};
    this.onmessage = () => {};
    this.onclose = () => {};
    this.onerror = () => {};

    // @ts-ignore
    wx.onSocketOpen(() => {
      this.onopen();
    });

    // @ts-ignore
    wx.onSocketMessage(msg => {
      // @ts-ignore
      this.onmessage(msg);
    });

    // @ts-ignore
    wx.onSocketClose(event => {
      // @ts-ignore
      this.onclose(event);
    });

    // @ts-ignore
    wx.onSocketError(error => {
      // @ts-ignore
      this.onerror(error);
    });

    // @ts-ignore
    wx.connectSocket({
      url: serverURL,
    });
  }

  send(data) {
    // @ts-ignore
    wx.sendSocketMessage({ data });
  }

  close() {
    // @ts-ignore
    wx.closeSocket();
  }
}

export default SocketWeapp;
