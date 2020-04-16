/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
/* global XMLHttpRequest, Blob */
import CoreManager from './CoreManager';
import type { FullOptions } from './RESTController';

let XHR = null;
if (typeof XMLHttpRequest !== 'undefined') {
  XHR = XMLHttpRequest;
}
if (process.env.PARSE_BUILD === 'weapp') {
  XHR = require('./Xhr.weapp');
}

type Base64 = { base64: string };
type Uri = { uri: string };
type FileData = Array<number> | Base64 | Blob | Uri;
export type FileSource = {
  format: 'file';
  file: Blob;
  type: string
} | {
  format: 'base64';
  base64: string;
  type: string
} | {
  format: 'uri';
  uri: string;
  type: string
};

const dataUriRegexp =
  /^data:([a-zA-Z]+\/[-a-zA-Z0-9+.]+)(;charset=[a-zA-Z0-9\-\/]*)?;base64,/;

function b64Digit(number: number): string {
  if (number < 26) {
    return String.fromCharCode(65 + number);
  }
  if (number < 52) {
    return String.fromCharCode(97 + (number - 26));
  }
  if (number < 62) {
    return String.fromCharCode(48 + (number - 52));
  }
  if (number === 62) {
    return '+';
  }
  if (number === 63) {
    return '/';
  }
  throw new TypeError('Tried to encode large digit ' + number + ' in base64.');
}

/**
 * A Parse.File is a local representation of a file that is saved to the Parse
 * cloud.
 * @alias Parse.File
 */
class ParseFile {
  _name: string;
  _url: ?string;
  _source: FileSource;
  _previousSave: ?Promise<ParseFile>;
  _data: ?string;
  _requestTask: ?any;
  _metadata: ?Object;
  _tags: ?Object;

  /**
   * @param name {String} The file's name. This will be prefixed by a unique
   *     value once the file has finished saving. The file name must begin with
   *     an alphanumeric character, and consist of alphanumeric characters,
   *     periods, spaces, underscores, or dashes.
   * @param data {Array} The data for the file, as either:
   *     1. an Array of byte value Numbers, or
   *     2. an Object like { base64: "..." } with a base64-encoded String.
   *     3. an Object like { uri: "..." } with a uri String.
   *     4. a File object selected with a file upload control. (3) only works
   *        in Firefox 3.6+, Safari 6.0.2+, Chrome 7+, and IE 10+.
   *        For example:
   * <pre>
   * var fileUploadControl = $("#profilePhotoFileUpload")[0];
   * if (fileUploadControl.files.length > 0) {
   *   var file = fileUploadControl.files[0];
   *   var name = "photo.jpg";
   *   var parseFile = new Parse.File(name, file);
   *   parseFile.save().then(function() {
   *     // The file has been saved to Parse.
   *   }, function(error) {
   *     // The file either could not be read, or could not be saved to Parse.
   *   });
   * }</pre>
   * @param type {String} Optional Content-Type header to use for the file. If
   *     this is omitted, the content type will be inferred from the name's
   *     extension.
   * @param metadata {Object} Optional key value pairs to be stored with file object
   * @param tags {Object} Optional key value pairs to be stored with file object
   */
  constructor(name: string, data?: FileData, type?: string, metadata?: Object, tags?: Object) {
    const specifiedType = type || '';

    this._name = name;
    this._metadata = metadata || {};
    this._tags = tags || {};

    if (data !== undefined) {
      if (Array.isArray(data)) {
        this._data = ParseFile.encodeBase64(data);
        this._source = {
          format: 'base64',
          base64: this._data,
          type: specifiedType
        };
      } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
        this._source = {
          format: 'file',
          file: data,
          type: specifiedType
        };
      } else if (data && typeof data.uri === 'string' && data.uri !== undefined) {
        this._source = {
          format: 'uri',
          uri: data.uri,
          type: specifiedType
        };
      } else if (data && typeof data.base64 === 'string') {
        const base64 = data.base64;
        const commaIndex = base64.indexOf(',');

        if (commaIndex !== -1) {
          const matches = dataUriRegexp.exec(base64.slice(0, commaIndex + 1));
          // if data URI with type and charset, there will be 4 matches.
          this._data = base64.slice(commaIndex + 1);
          this._source = {
            format: 'base64',
            base64: this._data,
            type: matches[1]
          };
        } else {
          this._data = base64;
          this._source = {
            format: 'base64',
            base64: base64,
            type: specifiedType
          };
        }
      } else {
        throw new TypeError('Cannot create a Parse.File with that data.');
      }
    }
  }

  /**
   * Return the data for the file, downloading it if not already present.
   * Data is present if initialized with Byte Array, Base64 or Saved with Uri.
   * Data is cleared if saved with File object selected with a file upload control
   *
   * @return {Promise} Promise that is resolve with base64 data
   */
  async getData(): Promise<String> {
    if (this._data) {
      return this._data;
    }
    if (!this._url) {
      throw new Error('Cannot retrieve data for unsaved ParseFile.');
    }
    const options = {
      requestTask: (task) => this._requestTask = task,
    };
    const controller = CoreManager.getFileController();
    const result = await controller.download(this._url, options);
    this._data = result.base64;
    return this._data;
  }

  /**
   * Gets the name of the file. Before save is called, this is the filename
   * given by the user. After save is called, that name gets prefixed with a
   * unique identifier.
   * @return {String}
   */
  name(): string {
    return this._name;
  }

  /**
   * Gets the url of the file. It is only available after you save the file or
   * after you get the file from a Parse.Object.
   * @param {Object} options An object to specify url options
   * @return {String}
   */
  url(options?: { forceSecure?: boolean }): ?string {
    options = options || {};
    if (!this._url) {
      return;
    }
    if (options.forceSecure) {
      return this._url.replace(/^http:\/\//i, 'https://');
    } else {
      return this._url;
    }
  }

  /**
   * Gets the metadata of the file.
   * @return {Object}
   */
  metadata(): Object {
    return this._metadata;
  }

  /**
   * Gets the tags of the file.
   * @return {Object}
   */
  tags(): Object {
    return this._tags;
  }

  /**
   * Saves the file to the Parse cloud.
   * @param {Object} options
   *  * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *     behalf of a specific user.
   *   <li>progress: In Browser only, callback for upload progress. For example:
   * <pre>
   * let parseFile = new Parse.File(name, file);
   * parseFile.save({
   *   progress: (progressValue, loaded, total, { type }) => {
   *     if (type === "upload" && progressValue !== null) {
   *       // Update the UI using progressValue
   *     }
   *   }
   * });
   * </pre>
   * </ul>
   * @return {Promise} Promise that is resolved when the save finishes.
   */
  save(options?: FullOptions) {
    options = options || {};
    options.requestTask = (task) => this._requestTask = task;
    options.metadata = this._metadata;
    options.tags = this._tags;

    const controller = CoreManager.getFileController();
    if (!this._previousSave) {
      if (this._source.format === 'file') {
        this._previousSave = controller.saveFile(this._name, this._source, options).then((res) => {
          this._name = res.name;
          this._url = res.url;
          this._data = null;
          this._requestTask = null;
          return this;
        });
      } else if (this._source.format === 'uri') {
        this._previousSave = controller.download(this._source.uri, options).then((result) => {
          if (!(result && result.base64)) {
            return {};
          }
          const newSource = {
            format: 'base64',
            base64: result.base64,
            type: result.contentType,
          };
          this._data = result.base64;
          this._requestTask = null;
          return controller.saveBase64(this._name, newSource, options);
        }).then((res) => {
          this._name = res.name;
          this._url = res.url;
          this._requestTask = null;
          return this;
        });
      } else {
        this._previousSave = controller.saveBase64(this._name, this._source, options).then((res) => {
          this._name = res.name;
          this._url = res.url;
          this._requestTask = null;
          return this;
        });
      }
    }
    if (this._previousSave) {
      return this._previousSave;
    }
  }

  /**
   * Aborts the request if it has already been sent.
   */
  cancel() {
    if (this._requestTask && typeof this._requestTask.abort === 'function') {
      this._requestTask.abort();
    }
    this._requestTask = null;
  }

  /**
   * Deletes the file from the Parse cloud.
   * In Cloud Code and Node only with Master Key
   *
   * @return {Promise} Promise that is resolved when the delete finishes.
   */
  destroy() {
    if (!this._name) {
      throw new Error('Cannot delete an unsaved ParseFile.');
    }
    const controller = CoreManager.getFileController();
    return controller.deleteFile(this._name).then(() => {
      this._data = null;
      this._requestTask = null;
      return this;
    });
  }

  toJSON(): { name: ?string, url: ?string } {
    return {
      __type: 'File',
      name: this._name,
      url: this._url
    };
  }

  equals(other: mixed): boolean {
    if (this === other) {
      return true;
    }
    // Unsaved Files are never equal, since they will be saved to different URLs
    return (
      (other instanceof ParseFile) &&
      this.name() === other.name() &&
      this.url() === other.url() &&
      typeof this.url() !== 'undefined'
    );
  }

  /**
   * Sets metadata to be saved with file object. Overwrites existing metadata
   * @param {Object} metadata Key value pairs to be stored with file object
   */
  setMetadata(metadata: any) {
    if (metadata && typeof metadata === 'object') {
      Object.keys(metadata).forEach((key) => {
        this.addMetadata(key, metadata[key]);
      });
    }
  }

  /**
   * Sets metadata to be saved with file object. Adds to existing metadata
   * @param {String} key
   * @param {Mixed} value
   */
  addMetadata(key: string, value: any) {
    if (typeof key === 'string') {
      this._metadata[key] = value;
    }
  }

  /**
   * Sets tags to be saved with file object. Overwrites existing tags
   * @param {Object} tags Key value pairs to be stored with file object
   */
  setTags(tags: any) {
    if (tags && typeof tags === 'object') {
      Object.keys(tags).forEach((key) => {
        this.addTag(key, tags[key]);
      });
    }
  }

  /**
   * Sets tags to be saved with file object. Adds to existing tags
   * @param {String} key
   * @param {Mixed} value
   */
  addTag(key: string, value: string) {
    if (typeof key === 'string') {
      this._tags[key] = value;
    }
  }

  static fromJSON(obj): ParseFile {
    if (obj.__type !== 'File') {
      throw new TypeError('JSON object does not represent a ParseFile');
    }
    const file = new ParseFile(obj.name);
    file._url = obj.url;
    return file;
  }

  static encodeBase64(bytes: Array<number>): string {
    const chunks = [];
    chunks.length = Math.ceil(bytes.length / 3);
    for (let i = 0; i < chunks.length; i++) {
      const b1 = bytes[i * 3];
      const b2 = bytes[i * 3 + 1] || 0;
      const b3 = bytes[i * 3 + 2] || 0;

      const has2 = (i * 3 + 1) < bytes.length;
      const has3 = (i * 3 + 2) < bytes.length;

      chunks[i] = [
        b64Digit((b1 >> 2) & 0x3F),
        b64Digit(((b1 << 4) & 0x30) | ((b2 >> 4) & 0x0F)),
        has2 ? b64Digit(((b2 << 2) & 0x3C) | ((b3 >> 6) & 0x03)) : '=',
        has3 ? b64Digit(b3 & 0x3F) : '='
      ].join('');
    }

    return chunks.join('');
  }
}

const DefaultController = {
  saveFile: async function(name: string, source: FileSource, options?: FullOptions) {
    if (source.format !== 'file') {
      throw new Error('saveFile can only be used with File-type sources.');
    }
    const base64Data = await new Promise((res, rej) => {
      // eslint-disable-next-line no-undef
      const reader = new FileReader();
      reader.readAsDataURL(source.file);
      reader.onload = () => res(reader.result);
      reader.onerror = error => rej(error);
    });
    // we only want the data after the comma
    // For example: "data:application/pdf;base64,JVBERi0xLjQKJ..." we would only want "JVBERi0xLjQKJ..."
    const [first, second] = base64Data.split(',');
    // in the event there is no 'data:application/pdf;base64,' at the beginning of the base64 string
    // use the entire string instead
    const data = second ? second : first;
    const newSource = {
      format: 'base64',
      base64: data,
      type: source.type || (source.file ? source.file.type : null),
    };
    return await DefaultController.saveBase64(name, newSource, options);
  },

  saveBase64: function(name: string, source: FileSource, options?: FullOptions) {
    if (source.format !== 'base64') {
      throw new Error('saveBase64 can only be used with Base64-type sources.');
    }
    const data: { base64: any; _ContentType?: any, fileData: Object } = {
      base64: source.base64,
      fileData: {
        metadata: { ...options.metadata },
        tags: { ...options.tags },
      },
    };
    delete options.metadata;
    delete options.tags;
    if (source.type) {
      data._ContentType = source.type;
    }
    const path = 'files/' + name;
    return CoreManager.getRESTController().request('POST', path, data, options);
  },

  download: function(uri, options) {
    if (XHR) {
      return this.downloadAjax(uri, options);
    } else if (process.env.PARSE_BUILD === 'node') {
      return new Promise((resolve, reject) => {
        const client = uri.indexOf('https') === 0
          ? require('https')
          : require('http');
        const req = client.get(uri, (resp) => {
          resp.setEncoding('base64');
          let base64 = '';
          resp.on('data', (data) => base64 += data);
          resp.on('end', () => {
            resolve({
              base64,
              contentType: resp.headers['content-type'],
            });
          });
        });
        req.on('abort', () => {
          resolve({});
        });
        req.on('error', reject);
        options.requestTask(req);
      });
    } else {
      return Promise.reject('Cannot make a request: No definition of XMLHttpRequest was found.');
    }
  },

  downloadAjax: function(uri, options) {
    return new Promise((resolve, reject) => {
      const xhr = new XHR();
      xhr.open('GET', uri, true);
      xhr.responseType = 'arraybuffer';
      xhr.onerror = function(e) { reject(e); };
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== xhr.DONE) {
          return;
        }
        if (!this.response) {
          return resolve({});
        }
        const bytes = new Uint8Array(this.response);
        resolve({
          base64: ParseFile.encodeBase64(bytes),
          contentType: xhr.getResponseHeader('content-type'),
        });
      };
      options.requestTask(xhr);
      xhr.send();
    });
  },

  deleteFile: function(name) {
    const headers = {
      'X-Parse-Application-ID': CoreManager.get('APPLICATION_ID'),
      'X-Parse-Master-Key': CoreManager.get('MASTER_KEY'),
    };
    let url = CoreManager.get('SERVER_URL');
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    url += 'files/' + name;
    return CoreManager.getRESTController().ajax('DELETE', url, '', headers).catch(response => {
      // TODO: return JSON object in server
      if (!response || response === 'SyntaxError: Unexpected end of JSON input') {
        return Promise.resolve();
      } else {
        return CoreManager.getRESTController().handleError(response);
      }
    });
  },

  _setXHR(xhr: any) {
    XHR = xhr;
  },
};

CoreManager.setFileController(DefaultController);

export default ParseFile;
