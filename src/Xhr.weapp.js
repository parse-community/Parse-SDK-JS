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
    this.onerror = () => {}
    this.onreadystatechange = () => {}
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

  send(data) {
    wx.request({
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

        this.onreadystatechange();
      },
      fail: (err) => {
        this.onerror(err);
      }
    })
  }
};
