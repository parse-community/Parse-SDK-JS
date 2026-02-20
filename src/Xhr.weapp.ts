/* istanbul ignore file */

// @ts-ignore
function parseResponse(res: wx.RequestSuccessCallbackResult) {
  let headers = res.header || {};
  headers = Object.keys(headers).reduce((map, key) => {
    map[key.toLowerCase()] = headers[key];
    return map;
  }, {});

  return {
    status: res.statusCode,
    json: () => {
      if (typeof res.data === 'object') {
        return Promise.resolve(res.data);
      }
      let json = {};
      try {
        json = JSON.parse(res.data);
      } catch (err) {
        console.error(err);
      }
      return Promise.resolve(json);
    },
    headers: {
      keys: () => Object.keys(headers),
      get: (n: string) => headers[n.toLowerCase()],
      has: (n: string) => n.toLowerCase() in headers,
      entries: () => {
        const all = [];
        for (const key in headers) {
          if (headers[key]) {
            all.push([key, headers[key]]);
          }
        }
        return all;
      },
    },
  };
}

export function polyfillFetch() {
  const typedGlobal = global as any;
  if (typeof typedGlobal.fetch !== 'function') {
    typedGlobal.fetch = (url: string, options: any) => {
      const TEXT_FILE_EXTS = /\.(txt|json|html|txt|csv)/;
      const dataType = url.match(TEXT_FILE_EXTS) ? 'text' : 'arraybuffer';
      return new Promise((resolve, reject) => {
        // @ts-ignore
        wx.request({
          url,
          method: options.method || 'GET',
          data: options.body,
          header: options.headers,
          dataType,
          responseType: dataType,
          success: response => resolve(parseResponse(response)),
          fail: error => reject(error),
        });
      });
    };
  }
}
