'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

describe('Array Operations', () => {
  before((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('initializes a field', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'bar', 'baz']);
    object.save().then(() => {
      let query = new Parse.Query('TestObject');
      return query.get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 3);
      assert.equal(strings[0], 'foo');
      assert.equal(strings[1], 'bar');
      assert.equal(strings[2], 'baz');
      done();
    });
  });

  it('adds values', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo']);
    object.save().then(() => {
      object.add('strings', 'foo');
      object.add('strings', 'bar');
      object.add('strings', 'baz');
      return object.save();
    }).then(() => {
      let query = new Parse.Query('TestObject');
      return query.get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 4);
      assert.equal(strings[0], 'foo');
      assert.equal(strings[1], 'foo');
      assert.equal(strings[2], 'bar');
      assert.equal(strings[3], 'baz');
      done();
    });
  });

  it('adds values on a fresh object', (done) => {
    let object = new Parse.Object('TestObject');
    object.add('strings', 'foo');
    object.add('strings', 'bar');
    object.add('strings', 'baz');
    object.save().then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 3);
      assert.equal(strings[0], 'foo');
      assert.equal(strings[1], 'bar');
      assert.equal(strings[2], 'baz');
      done();
    });
  });

  it('sets then adds objects', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo']);
    object.save().then(() => {
      object.set('strings', ['bar']);
      object.add('strings', 'bar');
      object.add('strings', 'baz');
      return object.save();
    }).then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 3);
      assert.equal(strings[0], 'bar');
      assert.equal(strings[1], 'bar');
      assert.equal(strings[2], 'baz');
      done();
    });
  });

  it('adds values atomically', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo']);
    object.save().then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      assert(o !== object);
      o.add('strings', 'bar');
      o.add('strings', 'baz');
      object.add('strings', 'bar');
      object.add('strings', 'baz');
      return o.save();
    }).then(() => {
      assert(object.dirty());
      return object.save();
    }).then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 5);
      done();
    });
  });

  it('adds unique values', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo']);
    object.save().then(() => {
      object.addUnique('strings', 'foo');
      object.addUnique('strings', 'bar');
      object.addUnique('strings', 'foo');
      object.addUnique('strings', 'baz');
      return object.save();
    }).then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      strings.sort();
      assert.equal(strings.length, 3);
      assert.equal(strings[0], 'bar');
      assert.equal(strings[1], 'baz');
      assert.equal(strings[2], 'foo');
      done();
    });
  });

  it('adds unique values on a fresh object', (done) => {
    let object = new Parse.Object('TestObject');
    object.addUnique('strings', 'foo');
    object.addUnique('strings', 'bar');
    object.addUnique('strings', 'foo');
    object.addUnique('strings', 'baz');
    object.save().then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      strings.sort();
      assert.equal(strings.length, 3);
      assert.equal(strings[0], 'bar');
      assert.equal(strings[1], 'baz');
      assert.equal(strings[2], 'foo');
      done();
    });
  });

  it('adds unique values after a set', () => {
    let object = new Parse.Object('TestObject');
    object.set('numbers', [1,2,3,3,4,4]);
    [1,4,4,5].forEach((number) => {
      object.addUnique('numbers', number);
    });
    assert.equal(object.get('numbers').length, 7);
  });

  it('adds unique values atomically', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo']);
    object.save().then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      o.addUnique('strings', 'bar');
      o.addUnique('strings', 'baz');
      object.addUnique('strings', 'baz');
      object.addUnique('strings', 'bat');
      return o.save();
    }).then(() => {
      assert(object.dirty());
      return object.save();
    }).then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      strings.sort();
      assert.equal(strings.length, 4);
      assert.equal(strings[0], 'bar');
      assert.equal(strings[1], 'bat');
      assert.equal(strings[2], 'baz');
      assert.equal(strings[3], 'foo');
      done();
    });
  });

  it('removes values', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'foo', 'bar', 'baz']);
    object.save().then(() => {
      object.remove('strings', 'foo');
      object.remove('strings', 'baz');
      object.remove('strings', 'bat');
      return object.save();
    }).then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 1);
      assert.equal(strings[0], 'bar');
      done();
    });
  });

  it('sets then removes values', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo']);
    object.save().then(() => {
      object.set('strings', ['bar', 'baz', 'bat']);
      object.remove('strings', 'bar');
      object.remove('strings', 'baz');
      object.remove('strings', 'zzz');
      return object.save();
    }).then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 1);
      assert.equal(strings[0], 'bat');
      done();
    });
  });

  it('removes values on a fresh object', (done) => {
    let object = new Parse.Object('TestObject');
    object.remove('strings', 'foo');
    object.remove('strings', 'baz');
    object.remove('strings', 'bat');
    object.save().then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      assert.equal(strings.length, 0);
      done();
    });
  });

  it('removes values atomically', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'foo', 'bar', 'baz']);
    object.save().then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      o.remove('strings', 'foo');
      o.remove('strings', 'zzz');
      object.remove('strings', 'bar');
      object.remove('strings', 'zzz');
      return o.save();
    }).then(() => {
      assert(object.dirty());
      return object.save();
    }).then(() => {
      return new Parse.Query('TestObject').get(object.id);
    }).then((o) => {
      let strings = o.get('strings');
      strings.sort();
      assert.equal(strings.length, 1);
      assert.equal(strings[0], 'baz');
      done();
    });
  });

  it('fails when combining add unique with add', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'bar']);
    object.save().then(() => {
      object.add('strings', 'bar');
      object.addUnique('strings', 'bar');
    }).fail((e) => {
      assert.equal(e.message, 'Cannot merge AddUnique Op with the previous Op');
      done();
    });
  });

  it('fails when combining add with add unique', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'bar']);
    object.save().then(() => {
      object.addUnique('strings', 'bar');
      object.add('strings', 'bar');
    }).fail((e) => {
      assert.equal(e.message, 'Cannot merge Add Op with the previous Op');
      done();
    });
  });

  it('fails when combining remove with add', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'bar']);
    object.save().then(() => {
      object.add('strings', 'bar');
      object.remove('strings', 'bar');
    }).fail((e) => {
      assert.equal(e.message, 'Cannot merge Remove Op with the previous Op');
      done();
    });
  });

  it('fails when combining add with remove', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'bar']);
    object.save().then(() => {
      object.remove('strings', 'bar');
      object.add('strings', 'bar');
    }).fail((e) => {
      assert.equal(e.message, 'Cannot merge Add Op with the previous Op');
      done();
    });
  });

  it('fails when combining remove with add unique', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'bar']);
    object.save().then(() => {
      object.addUnique('strings', 'bar');
      object.remove('strings', 'bar');
    }).fail((e) => {
      assert.equal(e.message, 'Cannot merge Remove Op with the previous Op');
      done();
    });
  });

  it('fails when combining remove with add unique', (done) => {
    let object = new Parse.Object('TestObject');
    object.set('strings', ['foo', 'bar']);
    object.save().then(() => {
      object.remove('strings', 'bar');
      object.addUnique('strings', 'bar');
    }).fail((e) => {
      assert.equal(e.message, 'Cannot merge AddUnique Op with the previous Op');
      done();
    });
  });

  it('adds unique objects by id', (done) => {
    let snowflake = new Parse.Object('Snowflake');
    let pocket = new Parse.Object('Pocket');
    snowflake.set('color', 'white');
    snowflake.save().then(() => {
      pocket.set('snowflakes', [snowflake]);
      let snowflakeQuery = new Parse.Query('Snowflake');
      return snowflakeQuery.get(snowflake.id);
    }).then((flake) => {
      pocket.addUnique('snowflakes', flake);
      assert.equal(pocket.get('snowflakes').length, 1);
      return pocket.save();
    }).then(() => {
      let pocketQuery = new Parse.Query('Pocket');
      pocketQuery.include('snowflakes');
      return pocketQuery.get(pocket.id);
    }).then((newPocket) => {
      assert.notEqual(pocket, newPocket);
      assert.equal(newPocket.get('snowflakes').length, 1);
      let flake = newPocket.get('snowflakes')[0];
      assert.equal(flake.get('color'), 'white');
      done();
    });
  });

  it('removes objects by id', (done) => {
    let badEgg = new Parse.Object('Egg');
    badEgg.set('quality', 'rotten');
    let goodEgg = new Parse.Object('Egg');
    goodEgg.set('quality', 'good');
    let ostrichEgg = new Parse.Object('Egg');
    ostrichEgg.set('quality', 'huge');
    let eggs = [badEgg, goodEgg, ostrichEgg];
    let shelf = new Parse.Object('Shelf');
    Parse.Object.saveAll(eggs).then(() => {
      shelf.set('eggs', eggs);
      let badEggQuery = new Parse.Query('Egg');
      return badEggQuery.get(badEgg.id);
    }).then((badEggRef) => {
      assert.notEqual(badEgg, badEggRef);
      shelf.remove('eggs', badEggRef);
      let fetchedEggs = shelf.get('eggs');
      assert.equal(fetchedEggs.length, 2);
      assert.equal(fetchedEggs[0].get('quality'), 'good');
      assert.equal(fetchedEggs[1].get('quality'), 'huge');
      return shelf.save();
    }).then(() => {
      return shelf.fetch();
    }).then(() => {
      assert.equal(shelf.get('eggs').length, 2);
      done();
    });
  });
});
