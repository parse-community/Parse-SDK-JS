module.exports = class XhrWeapp {
  constructor() {
    this.header = {};
    this.readyState = 4;
    this.status = 0;
    this.response = '';
    this.responseType = '';
    this.responseText = '';
    this.responseHeader = {};
    this.method = '';
    this.url = '';
    this.onabort = () => {};
    this.onerror = () => {};
    this.onreadystatechange = () => {};
    this.requestTask = null;
  }

  getAllResponseHeaders() {
    let header = '';
    for(const key in this.responseHeader){
      header += key + ':' + this.getResponseHeader(key) + '\r\n'
    }
    return header;
  }

  getResponseHeader(key) {
    return this.responseHeader[key];
  }

  setRequestHeader(key, value) {
    this.header[key] = value;
  }

  open(method, url) {
    this.method = method;
    this.url = url;
  }

  abort() {
    if (!this.requestTask) {
      return;
    }
    this.requestTask.abort();
    this.status = 0;
    this.onabort();
  }

  send(data) {
    this.requestTask = wx.request({
      url: this.url,
      method: this.method,
      data: data,
      header: this.header,
      responseType: this.responseType,
      success: (res) => {
        this.status = res.statusCode;
        this.response = res.data;
        this.responseHeader = res.header;
        this.responseText = JSON.stringify(res.data);
        this.requestTask = null;
        this.onreadystatechange();
      },
      fail: (err) => {
        this.requestTask = null;
        this.onerror(err);
      }
    })
  }
};
