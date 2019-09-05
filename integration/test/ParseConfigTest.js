'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

describe('Parse Config', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can create a config', (done) => {
    Parse.Config.save({
      str: 'hello',
      num: 42
    }).then((c) => {
      assert(c);
      assert.equal(c.get('str'), 'hello');
      assert.equal(c.get('num'), 42);
      done();
    });
  });

  it('can get a config', (done) => {
    Parse.Config.save({
      str: 'hello',
      num: 42
    }).then(() => {
      return Parse.Config.get();
    }).then((c) => {
      assert(c);
      assert.equal(c.get('str'), 'hello');
      assert.equal(c.get('num'), 42);
      done();
    });
  });

  it('can get internal config parameter with masterkey', (done) => {
    const data = {
      params: {"internal": "i", "public": "p"},
      masterKeyOnly: {"internal": true}
    };
    Parse.CoreManager.getRESTController().request(
      'PUT',
      'config',
      data,
      {"useMasterKey": true}
    ).then(() => {
      return Parse.Config.get({"useMasterKey": true});
    }).then((c) => {
      assert(c);
      expect(c.get('internal')).toBe("i");
      expect(c.get('public')).toBe("p");
      done();
    });
  });

  it('cannot get internal config parameter without masterkey', (done) => {
    const data = {
      params: {"internal": "i", "public": "p"},
      masterKeyOnly: {"internal": true}
    };
    Parse.CoreManager.getRESTController().request(
      'PUT',
      'config',
      data,
      {"useMasterKey": true}
    ).then(() => {
      return Parse.Config.get();
    }).then((c) => {
      assert(c);
      expect(c.get('internal')).toBeUndefined();
      expect(c.get('public')).toBe("p");
      done();
    });
  });
});
