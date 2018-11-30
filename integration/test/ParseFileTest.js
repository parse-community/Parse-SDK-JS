'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const str = 'Hello World!';
const data = [];
for (let i = 0; i < str.length; i += 1) {
  data.push(str.charCodeAt(i));
}

describe('Parse File', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can get file progress', async (done) => {
    const file = new Parse.File('hello.txt', data, 'text/plain');
    let flag = false;
    await file.save({
      progress: () => {
        flag = true;
      }
    });
    assert.equal(flag, false);
    done();
  });
});
