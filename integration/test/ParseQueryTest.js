'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Parse Query', () => {
  before((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      let numbers = [];
      for (let i = 0; i < 10; i++) {
        numbers[i] = new Parse.Object({ className: 'BoxedNumber', number: i });
      }
      return Parse.Object.saveAll(numbers);
    }).then(() => {
      done();
    });
  });

  it('can do basic queries', (done) => {
    let baz = new TestObject({ foo: 'baz' });
    let qux = new TestObject({ foo: 'qux' });
    Parse.Object.saveAll([baz, qux]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('foo', 'baz');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('foo'), 'baz');
      done();
    });
  });

  it('can do a query with a limit', () => {
    let baz = new TestObject({ foo: 'baz' });
    let qux = new TestObject({ foo: 'qux' });
    Parse.Object.saveAll([baz, qux]).then(() => {
      let query = new Parse.Query(TestObject);
      query.limit(1);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('foo'), 'baz');
      done();
    });
  });

  it('can do containedIn queries with arrays', (done) => {
    let messageList = [];
    for (let i = 0; i < 4; i++) {
      let message = new Parse.Object('Message');
      if (i > 0) {
        message.set('prior', messageList[i - 1]);
      }
      messageList.push(message);
    }

    Parse.Object.saveAll(messageList).then(() => {
      assert.equal(messageList.length, 4);

      let inList = [];
      inList.push(messageList[0]);
      inList.push(messageList[2]);

      let query = new Parse.Query('Message');
      query.containedIn('prior', inList);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      done();
    });
  });

  it('can do containsAll queries with numbers', (done) => {
    let NumberSet = Parse.Object.extend('NumberSet');
    let objectsList = [];
    objectsList.push(new NumberSet({ numbers: [1,2,3,4,5] }));
    objectsList.push(new NumberSet({ numbers: [1,3,4,5] }));
    Parse.Object.saveAll(objectsList).then(() => {
      let query = new Parse.Query(NumberSet);
      query.containsAll('numbers', [1,2,3]);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can do containsAll queries with strings', (done) => {
    let StringSet = Parse.Object.extend('StringSet');
    let objectsList = [];
    objectsList.push(new StringSet({ strings: ['a', 'b', 'c', 'd', 'e'] }));
    objectsList.push(new StringSet({ strings: ['a', 'c', 'd'] }));
    Parse.Object.saveAll(objectsList).then(() => {
      let query = new Parse.Query(StringSet);
      query.containsAll('strings', ['a', 'b', 'c']);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can do containsAll queries with dates', (done) => {
    let DateSet = Parse.Object.extend('DateSet');

    function parseDate(iso) {
      let regexp = new RegExp(
        '^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})' + 'T' +
        '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})' +
        '(.([0-9]+))?' + 'Z$');
      let match = regexp.exec(iso);
      if (!match) {
        return null;
      }

      let year = match[1] || 0;
      let month = (match[2] || 1) - 1;
      let day = match[3] || 0;
      let hour = match[4] || 0;
      let minute = match[5] || 0;
      let second = match[6] || 0;
      let milli = match[8] || 0;

      return new Date(Date.UTC(year, month, day, hour, minute, second, milli));
    }

    function makeDates(stringArray) {
      return stringArray.map((date) => {
        return parseDate(date + 'T00:00:00Z');
      });
    }

    let objectsList = [];
    objectsList.push(new DateSet({
      dates: makeDates(['2013-02-01', '2013-02-02', '2013-02-03'])
    }));
    objectsList.push(new DateSet({
      dates: makeDates(['2013-02-01', '2013-02-03', '2013-02-04'])
    }));

    Parse.Object.saveAll(objectsList).then(() => {
      let query = new Parse.Query(DateSet);
      query.containsAll('dates', makeDates(
        ['2013-02-01', '2013-02-02', '2013-02-03']
      ));
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    }).fail(e => console.log(e));
  });

  it('can do containsAll queries with objects', (done) => {
    let MessageSet = Parse.Object.extend('MessageSet');

    let messageList = [];
    for (let i = 0; i < 4; i++) {
      messageList.push(new TestObject({i: i}));
    }

    Parse.Object.saveAll(messageList).then(() => {
      assert.equal(messageList.length, 4);

      let messageSetList = [];
      messageSetList.push(new MessageSet({messages: messageList}));

      let someList = [];
      someList.push(messageList[0]);
      someList.push(messageList[1]);
      someList.push(messageList[3]);
      messageSetList.push(new MessageSet({messages: someList}));

      return Parse.Object.saveAll(messageSetList);
    }).then(() => {
      let inList = [];
      inList.push(messageList[0]);
      inList.push(messageList[2]);

      let query = new Parse.Query(MessageSet);
      query.containsAll('messages', inList);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can do equalTo queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.equalTo('number', 3);
    query.find().then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can test equality with undefined', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.equalTo('number', undefined);
    query.find().then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('can perform lessThan queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.lessThan('number', 7);
    query.find().then((results) => {
      assert.equal(results.length, 7);
      done();
    });
  });

  it('can perform lessThanOrEqualTo queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.lessThanOrEqualTo('number', 7);
    query.find().then((results) => {
      assert.equal(results.length, 8);
      done();
    });
  });

  it('can perform greaterThan queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.greaterThan('number', 7);
    query.find().then((results) => {
      assert.equal(results.length, 2);
      done();
    });
  });

  it('can perform greaterThanOrEqualTo queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.greaterThanOrEqualTo('number', 7);
    query.find().then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can combine lessThanOrEqualTo and greaterThanOrEqualTo queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.lessThanOrEqualTo('number', 7);
    query.greaterThanOrEqualTo('number', 7);
    query.find().then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can combine lessThan and greaterThan queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.lessThan('number', 9);
    query.greaterThan('number', 3);
    query.find().then((results) => {
      assert.equal(results.length, 5);
      done();
    });
  });

  it('can perform notEqualTo queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.notEqualTo('number', 5);
    query.find().then((results) => {
      assert.equal(results.length, 9);
      done();
    });
  });

  it('can perform containedIn queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.containedIn('number', [3,5,7,9,11]);
    query.find().then((results) => {
      assert.equal(results.length, 4);
      done();
    });
  });

  it('can perform notContainedIn queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.notContainedIn('number', [3,5,7,9,11]);
    query.find().then((results) => {
      assert.equal(results.length, 6);
      done();
    });
  });

  it('can test objectId in containedIn queries', (done) => {
    new Parse.Query('BoxedNumber').ascending('number').find().then((numbers) => {
      let ids = [numbers[2].id, numbers[3].id, 'nonsense'];
      let query = new Parse.Query('BoxedNumber');
      query.containedIn('objectId', ids);
      query.ascending('number');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('number'), 2);
      assert.equal(results[1].get('number'), 3);
      done();
    });
  });

  it('can test objectId in equalTo queries', (done) => {
    new Parse.Query('BoxedNumber').ascending('number').find().then((numbers) => {
      let id = numbers[5].id;
      let query = new Parse.Query('BoxedNumber');
      query.equalTo('objectId', id);
      query.ascending('number');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('number'), 5);
      done();
    });
  });

  it('can find no elements', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.equalTo('number', 15);
    query.find().then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('handles when find throws errors', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.equalTo('$foo', 'bar');
    query.find().fail((e) => {
      assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      done();
    });
  });

  it('can get by objectId', (done) => {
    let object = new TestObject();
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((result) => {
      assert.equal(result.id, object.id);
      assert(result.createdAt);
      assert(result.updatedAt);
      done();
    });
  });

  it('handles get with undefined id', (done) => {
    let object = new TestObject();
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(undefined);
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('handles get with invalid id', (done) => {
    let object = new TestObject();
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(undefined);
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('can query for the first result', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.ascending('number');
    query.first().then((result) => {
      assert.equal(result.get('number'), 0);
      done();
    });
  });

  it('can query for the first with no results', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.equalTo('number', 20);
    query.first().then((result) => {
      assert.equal(result, undefined);
      done();
    });
  });

  it('can query for the first with two results', (done) => {
    Parse.Object.saveAll([new TestObject({x: 44}), new TestObject({x: 44})]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('x', 44);
      return query.first()
    }).then((result) => {
      assert.equal(result.get('x'), 44);
      done();
    });
  });

  it('handles when first throws errors', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.equalTo('$foo', 'bar');
    query.first().fail((e) => {
      assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      done();
    });
  });

  it('can test object inequality', (done) => {
    let item1 = new TestObject();
    let item2 = new TestObject();
    let container1 = new Parse.Object({className: 'CoolContainer', item: item1});
    let container2 = new Parse.Object({className: 'CoolContainer', item: item2});
    Parse.Object.saveAll([item1, item2, container1, container2]).then(() => {
      let query = new Parse.Query('CoolContainer');
      query.notEqualTo('item', item1);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can skip', (done) => {
    Parse.Object.saveAll([
      new TestObject({ canSkip: true }),
      new TestObject({ canSkip: true }),
      new TestObject({ canSkip: true })
    ]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('canSkip', true);
      query.skip(1);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      let query = new Parse.Query(TestObject);
      query.equalTo('canSkip', true);
      query.skip(3);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('does not consider skip in count queries', (done) => {
    Parse.Object.saveAll([
      new TestObject({ skipCount: true }),
      new TestObject({ skipCount: true }),
      new TestObject({ skipCount: true })
    ]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('skipCount', true);
      return query.count();
    }).then((count) => {
      assert.equal(count, 3);
      let query = new Parse.Query(TestObject);
      query.equalTo('skipCount', true);
      query.skip(1);
      return query.count();
    }).then((count) => {
      assert.equal(count, 3);
      let query = new Parse.Query(TestObject);
      query.equalTo('skipCount', true);
      query.skip(2);
      return query.count();
    }).then((count) => {
      assert.equal(count, 3);
      done();
    });
  });

  it('can perform count queries', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.greaterThan('number', 1);
    query.count().then((count) => {
      assert.equal(count, 8);
      done();
    });
  });

  it('can order by ascending numbers', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.ascending('number');
    query.find().then((results) => {
      assert.equal(results[0].get('number'), 0);
      assert.equal(results[9].get('number'), 9);
      done();
    });
  });

  it('can order by descending numbers', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.descending('number');
    query.find().then((results) => {
      assert.equal(results[0].get('number'), 9);
      assert.equal(results[9].get('number'), 0);
      done();
    });
  });

  it('can order by asecending number then descending string', (done) => {
     Parse.Object.saveAll([
      new TestObject({ doubleOrder: true, number: 3, string: 'a' }),
      new TestObject({ doubleOrder: true, number: 1, string: 'b' }),
      new TestObject({ doubleOrder: true, number: 3, string: 'c' }),
      new TestObject({ doubleOrder: true, number: 2, string: 'd' }),
    ]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('doubleOrder', true);
      query.ascending('number').addDescending('string');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 1);
      assert.equal(results[0].get('string'), 'b');
      assert.equal(results[1].get('number'), 2);
      assert.equal(results[1].get('string'), 'd');
      assert.equal(results[2].get('number'), 3);
      assert.equal(results[2].get('string'), 'c');
      assert.equal(results[3].get('number'), 3);
      assert.equal(results[3].get('string'), 'a');
      done();
    });
  });

  it('can order by descending number then ascending string', (done) => {
    Parse.Object.saveAll([
      new TestObject({ otherDoubleOrder: true, number: 3, string: 'a' }),
      new TestObject({ otherDoubleOrder: true, number: 1, string: 'b' }),
      new TestObject({ otherDoubleOrder: true, number: 3, string: 'c' }),
      new TestObject({ otherDoubleOrder: true, number: 2, string: 'd' }),
    ]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('otherDoubleOrder', true);
      query.descending('number').addAscending('string');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'a');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'c');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');
      done();
    });
  });

  it('can order by descending number and string', (done) => {
    Parse.Object.saveAll([
      new TestObject({ doubleDescending: true, number: 3, string: 'a' }),
      new TestObject({ doubleDescending: true, number: 1, string: 'b' }),
      new TestObject({ doubleDescending: true, number: 3, string: 'c' }),
      new TestObject({ doubleDescending: true, number: 2, string: 'd' }),
    ]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending('number,string');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');
      
      let query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending('number, string');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');

      let query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending(['number', 'string']);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');
      
      let query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending('number', 'string');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');
      
      done();
    });
  });

  it('can not order by password', (done) => {
    let query = new Parse.Query('BoxedNumber');
    query.ascending('_password');
    query.find().fail((e) => {
      assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      done();
    });
  });

  it('can order by _created_at', (done) => {
    new Parse.Object({className: 'TestObject', orderedDate: true}).save().then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate: true}).save();
    }).then(() => {
      let query = new Parse.Query('TestObject');
      query.equalTo('orderedDate', true);
      query.ascending('_created_at');
      return query.find()
    }).then((results) => {
      assert(results[0].createdAt < results[1].createdAt);
      assert(results[1].createdAt < results[2].createdAt);
      assert(results[2].createdAt < results[3].createdAt);
      done();
    });
  });

  it('can order by createdAt', (done) => {
    new Parse.Object({className: 'TestObject', orderedDate2: true}).save().then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate2: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate2: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate2: true}).save();
    }).then(() => {
      let query = new Parse.Query('TestObject');
      query.equalTo('orderedDate2', true);
      query.descending('createdAt');
      return query.find()
    }).then((results) => {
      assert(results[0].createdAt > results[1].createdAt);
      assert(results[1].createdAt > results[2].createdAt);
      assert(results[2].createdAt > results[3].createdAt);
      done();
    });
  });

  it('can order by _updated_at', (done) => {
    new Parse.Object({className: 'TestObject', orderedDate3: true}).save().then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate3: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate3: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate3: true}).save();
    }).then(() => {
      let query = new Parse.Query('TestObject');
      query.equalTo('orderedDate3', true);
      query.ascending('_updated_at');
      return query.find()
    }).then((results) => {
      assert(results[0].updatedAt < results[1].updatedAt);
      assert(results[1].updatedAt < results[2].updatedAt);
      assert(results[2].updatedAt < results[3].updatedAt);
      done();
    });
  });

  it('can order by updatedAt', (done) => {
    new Parse.Object({className: 'TestObject', orderedDate4: true}).save().then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate4: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate4: true}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', orderedDate4: true}).save();
    }).then(() => {
      let query = new Parse.Query('TestObject');
      query.equalTo('orderedDate4', true);
      query.descending('updatedAt');
      return query.find()
    }).then((results) => {
      assert(results[0].updatedAt > results[1].updatedAt);
      assert(results[1].updatedAt > results[2].updatedAt);
      assert(results[2].updatedAt > results[3].updatedAt);
      done();
    });
  });

  it('can test time equality', () => {
    new Parse.Object({className: 'TestObject', timed: true, name: 'item1'}).save().then(() => {
      return new Parse.Object({className: 'TestObject', timed: true, name: 'item2'}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', timed: true, name: 'item3'}).save();
    }).then(() => {
      return new Parse.Object({className: 'TestObject', timed: true, name: 'item4'}).save();
    }).then((last) => {
      let query = new Parse.Query('TestObject');
      query.equalTo('timed', true);
      query.equalTo('createdAt', last.createdAt);
      return query.find()
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'item4');
      done();
    });
  });

  it('can test time inequality', () => {
    let objects = [
      new Parse.Object({className: 'TestObject', timed2: true, name: 'item1'}),
      new Parse.Object({className: 'TestObject', timed2: true, name: 'item2'}),
      new Parse.Object({className: 'TestObject', timed2: true, name: 'item3'}),
      new Parse.Object({className: 'TestObject', timed2: true, name: 'item4'})
    ];

    objects[0].save().then(() => {
      return objects[1].save();
    }).then(() => {
      return objects[2].save();
    }).then(() => {
      return objects[2].save();
    }).then(() => {
      let query = new Parse.Query('TestObject');
      query.equalTo('timed2', true);
      query.lessThan('createdAt', objects[2].createdAt);
      query.ascending('createdAt');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].id, objects[0].id);
      assert.equal(results[1].id, objects[1].id);
      
      let query = new Parse.Query('TestObject');
      query.equalTo('timed2', true);
      query.greaterThan('createdAt', objects[2].createdAt);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].id, objects[3].id);
      done();
    });
  });

  it('can test string matching', (done) => {
    let obj1 = new TestObject();
    obj1.set('myString', 'football');
    let obj2 = new TestObject();
    obj2.set('myString', 'soccer');
    Parse.Object.saveAll([obj1, obj2]).then(() => {
      let query = new Parse.Query(TestObject);
      query.matches('myString', '^fo*\\wb[^o]l+$');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('myString'), 'football');

      let query = new Parse.Query(TestObject);
      query.matches('myString', /^fo*\wb[^o]l+$/);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('myString'), 'football');
      done();
    });
  });

  it('can test case insensitive regex', (done) => {
    let obj = new TestObject();
    obj.set('myString', 'hockey');
    obj.save().then(() => {
      let query = new Parse.Query(TestObject);
      query.matches('myString', 'Hockey', 'i');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('myString'), 'hockey');
      done();
    });
  });

  it('fails for invalid regex options', (done) => {
    let query = new Parse.Query(TestObject);
    query.matches('myString', 'football', 'some invalid thing');
    query.find().fail((e) => {
      assert.equal(e.code, Parse.Error.INVALID_QUERY);
      done();
    });
  });

  it('can use a regex with all modifiers', (done) => {
    let obj = new TestObject();
    obj.set('website', 'PArSe\nCom');
    obj.save().then(() => {
      let query = new Parse.Query(TestObject);
      query.matches(
        'website',
        'parse # First fragment. We\'ll write this in one case but match ' +
        'insensitively\n.com  # Second fragment. This can be separated by any ' +
        'character, including newline',
        'mixs'
      );
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can include regexp modifiers in the constructor', (done) => {
    let obj = new TestObject();
    obj.set('website', '\n\nbuffer\n\nparse.COM');
    obj.save().then(() => {
      let query = new Parse.Query(TestObject);
      query.matches('website', /parse\.com/mi);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can test contains', (done) => {
    let someAscii = "\\E' !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTU" +
                    "VWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'";
    Parse.Object.saveAll([
      new TestObject({contains: true, myString: 'zax' + someAscii + 'qub'}),
      new TestObject({contains: true, myString: 'start' + someAscii}),
      new TestObject({contains: true, myString: someAscii + 'end'}),
      new TestObject({contains: true, myString: someAscii})
    ]).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('contains', true);
      query.startsWith('myString', someAscii);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      let query = new Parse.Query(TestObject);
      query.equalTo('contains', true);
      query.startsWith('myString', someAscii);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      done();
    });
  });

  it('can test if a key exists', (done) => {
    let objects = [];
    for (let i = 0; i < 10; i++) {
      let item = new TestObject();
      if (i % 2) {
        item.set('y', i + 1);
      } else {
        item.set('z', i + 1);
      }
      objects.push(item);
    }
    Parse.Object.saveAll(objects).then(() => {
      let query = new Parse.Query(TestObject);
      query.exists('y');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('y'));
      }
      done();
    }).fail(e => console.log(e));
  });

  it('can test if a key does not exist', (done) => {
    let objects = [];
    for (let i = 0; i < 10; i++) {
      let item = new TestObject({ dne: true });
      if (i % 2) {
        item.set('y', i + 1);
      } else {
        item.set('z', i + 1);
      }
      objects.push(item);
    }
    Parse.Object.saveAll(objects).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('dne', true);
      query.doesNotExist('y');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('z'));
      }
      done();
    });
  });

  it('can test if a relation exists', (done) => {
    let objects = [];
    for (let i = 0; i < 10; i++) {
      let container = new Parse.Object('Container', { relation_exists: true });
      if (i % 2) {
        container.set('y', i);
      } else {
        let item = new TestObject();
        item.set('x', i);
        container.set('x', item);
        objects.push(item);
      }
      objects.push(container);
    }
    Parse.Object.saveAll(objects).then(() => {
      let query = new Parse.Query('Container');
      query.equalTo('relation_exists', true);
      query.exists('x');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('x'));
      }
      done();
    });
  });

  it('can test if a relation does not exist', (done) => {
    let objects = [];
    for (let i = 0; i < 10; i++) {
      let container = new Parse.Object('Container', { relation_dne: true });
      if (i % 2) {
        container.set('y', i);
      } else {
        let item = new TestObject();
        item.set('x', i);
        container.set('x', item);
        objects.push(item);
      }
      objects.push(container);
    }
    Parse.Object.saveAll(objects).then(() => {
      let query = new Parse.Query('Container');
      query.equalTo('relation_dne', true);
      query.doesNotExist('x');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('y'));
      }
      done();
    });
  });

  it('does not include by default', (done) => {
    let child = new TestObject();
    let parent = new Parse.Object('Container');
    child.set('foo', 'bar');
    parent.set('child', child);
    Parse.Object.saveAll([child, parent]).then(() => {
      let query = new Parse.Query('Container');
      query.equalTo('objectId', parent.id);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      let parentAgain = results[0];
      assert(parentAgain.get('child'));
      assert(parentAgain.get('child').id);
      assert(!parentAgain.get('child').get('foo'));
      done();
    }).fail(e => console.log(e));
  });

  it('can include nested objects', (done) => {
    let child = new TestObject();
    let parent = new Parse.Object('Container');
    child.set('foo', 'bar');
    parent.set('child', child);
    Parse.Object.saveAll([child, parent]).then(() => {
      let query = new Parse.Query('Container');
      query.equalTo('objectId', parent.id);
      query.include('child');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      let parentAgain = results[0];
      assert(parentAgain.get('child'));
      assert(parentAgain.get('child').id);
      assert.equal(parentAgain.get('child').get('foo'), 'bar');
      done();
    });
  });

  it('can include nested objects via array', (done) => {
    let child = new TestObject();
    let parent = new Parse.Object('Container');
    child.set('foo', 'bar');
    parent.set('child', child);
    Parse.Object.saveAll([child, parent]).then(() => {
      let query = new Parse.Query('Container');
      query.equalTo('objectId', parent.id);
      query.include(['child']);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      let parentAgain = results[0];
      assert(parentAgain.get('child'));
      assert(parentAgain.get('child').id);
      assert.equal(parentAgain.get('child').get('foo'), 'bar');
      done();
    });
  });

  it('can do a nested include', (done) => {
    let Child = Parse.Object.extend('Child');
    let Parent = Parse.Object.extend('Parent');
    let Grandparent = Parse.Object.extend('Grandparent');

    let objects = [];
    for (let i = 0; i < 5; i++) {
      let grandparent = new Grandparent({
        nested: true,
        z: i,
        parent: new Parent({
          y: i,
          child: new Child({
            x: i
          }),
        }),
      });

      objects.push(grandparent);
    }

    Parse.Object.saveAll(objects).then(() => {
      let q = new Parse.Query('Grandparent');
      q.equalTo('nested', true);
      q.include('parent.child');
      return q.find();
    }).then((results) => {
      assert.equal(results.length, 5);
      results.forEach((o) => {
        assert.equal(o.get('z'), o.get('parent').get('y'));
        assert.equal(o.get('z'), o.get('parent').get('child').get('x'));
      });
      done();
    });
  });

  it('can include without changing dirty', (done) => {
    let parent = new Parse.Object('ParentObject');
    let child = new Parse.Object('ChildObject');
    parent.set('child', child);
    child.set('foo', 'bar');

    Parse.Object.saveAll([child, parent]).then(() => {
      let query = new Parse.Query('ParentObject');
      query.include('child');
      query.equalTo('objectId', parent.id);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      let parentAgain = results[0];
      let childAgain = parentAgain.get('child');
      assert.equal(child.id, childAgain.id);
      assert.equal(parent.id, parentAgain.id);
      assert.equal(childAgain.get('foo'), 'bar');
      assert(!parentAgain.dirty());
      assert(!childAgain.dirty());
      done();
    });
  });

  it('uses subclasses when creating objects', (done) => {
    let ParentObject = Parse.Object.extend({ className: 'ParentObject' });
    let ChildObject = Parse.Object.extend('ChildObject', {
      foo() {
        return 'foo';
      }
    });

    let parent = new ParentObject();
    let child = new ChildObject();
    parent.set('child', child);
    Parse.Object.saveAll([child, parent]).then(() => {
      ChildObject = Parse.Object.extend('ChildObject', {
        bar() {
          return 'bar';
        }
      });

      let query = new Parse.Query(ParentObject);
      query.equalTo('objectId', parent.id);
      query.include('child');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      let parentAgain = results[0];
      let childAgain = parentAgain.get('child');
      assert.equal(childAgain.foo(), 'foo');
      assert.equal(childAgain.bar(), 'bar');
      done();
    });
  });

  it('can match the results of another query', (done) => {
    let ParentObject = Parse.Object.extend('ParentObject');
    let ChildObject = Parse.Object.extend('ChildObject');
    let objects = [];
    for (let i = 0; i < 10; i++) {
      objects.push(new ParentObject({
        child: new ChildObject({x: i, qtest: true}),
        x: 10 + i,
      }));
    }
    Parse.Object.saveAll(objects).then(() => {
      let subQuery = new Parse.Query(ChildObject);
      subQuery.equalTo('qtest', true);
      subQuery.greaterThan('x', 5);
      let q = new Parse.Query(ParentObject);
      q.matchesQuery('child', subQuery);
      return q.find();
    }).then((results) => {
      assert.equal(results.length, 4);
      results.forEach((o) => {
        assert(o.get('x') > 15);
      });
      done();
    });
  });

  it('can not match the results of another query', (done) => {
    let ParentObject = Parse.Object.extend('ParentObject');
    let ChildObject = Parse.Object.extend('ChildObject');
    let objects = [];
    for (let i = 0; i < 10; i++) {
      objects.push(new ParentObject({
        child: new ChildObject({x: i, dneqtest: true}),
        dneqtest: true,
        x: 10 + i,
      }));
    }
    Parse.Object.saveAll(objects).then(() => {
      let subQuery = new Parse.Query(ChildObject);
      subQuery.equalTo('dneqtest', true);
      subQuery.greaterThan('x', 5);
      let q = new Parse.Query(ParentObject);
      q.equalTo('dneqtest', true);
      q.doesNotMatchQuery('child', subQuery);
      return q.find();
    }).then((results) => {
      assert.equal(results.length, 6);
      results.forEach((o) => {
        assert(o.get('x') >= 10);
        assert(o.get('x') <= 15);
      });
      done();
    });
  });

  it('can select keys from a matched query', (done) => {
    let Restaurant = Parse.Object.extend('Restaurant');
    let Person = Parse.Object.extend('Person');
    let objects = [
      new Restaurant({ rating: 5, location: 'Djibouti' }),
      new Restaurant({ rating: 3, location: 'Ouagadougou' }),
      new Person({ name: 'Bob', hometown: 'Djibouti' }),
      new Person({ name: 'Tom', hometown: 'Ouagadougou' }),
      new Person({ name: 'Billy', hometown: 'Detroit' }),
    ];

    Parse.Object.saveAll(objects).then(() => {
      let query = new Parse.Query(Restaurant);
      query.greaterThan('rating', 4);
      let mainQuery = new Parse.Query(Person);
      mainQuery.matchesKeyInQuery('hometown', 'location', query);
      return mainQuery.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'Bob');
      
      let query = new Parse.Query(Restaurant);
      query.greaterThan('rating', 4);
      let mainQuery = new Parse.Query(Person);
      mainQuery.doesNotMatchKeyInQuery('hometown', 'location', query);
      mainQuery.ascending('name');
      return mainQuery.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('name'), 'Billy');
      assert.equal(results[1].get('name'), 'Tom');

      done();
    });
  });

  it('supports objects with length', (done) => {
    let obj = new TestObject();
    obj.set('length', 5);
    assert.equal(obj.get('length'), 5);
    obj.save().then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('objectId', obj.id);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('length'), 5);
      done();
    });
  });

  it('can include User fields', (done) => {
    Parse.User.signUp('bob', 'password', { age: 21 }).then((user) => {
      let obj = new TestObject();
      return obj.save({ owner: user });
    }).then((obj) => {
      let query = new Parse.Query(TestObject);
      query.include('owner');
      return query.get(obj.id);
    }).then((objAgain) => {
      assert(objAgain.get('owner') instanceof Parse.User);
      assert.equal(objAgain.get('owner').get('age'), 21);
      done();
    });
  });

  it('can build OR queries', (done) => {
    let objects = [];
    for (let i = 0; i < 10; i++) {
      let obj = new Parse.Object('BoxedNumber');
      obj.set({ x: i, orquery: true });
      objects.push(obj);
    }
    Parse.Object.saveAll(objects).then(() => {
      let q1 = new Parse.Query('BoxedNumber');
      q1.equalTo('orquery', true);
      q1.lessThan('x', 2);
      let q2 = new Parse.Query('BoxedNumber');
      q2.equalTo('orquery', true);
      q2.greaterThan('x', 5);
      let orQuery = Parse.Query.or(q1, q2);
      return orQuery.find();
    }).then((results) => {
      assert.equal(results.length, 6);
      results.forEach((number) => {
        assert(number.get('x') < 2 || number.get('x') > 5);
      });
      done();
    });
  });

  it('can build complex OR queries', (done) => {
    let objects = [];
    for (let i = 0; i < 10; i++) {
      let child = new Parse.Object('Child');
      child.set('x', i);
      child.set('complexor', true);
      let parent = new Parse.Object('Parent');
      parent.set('child', child);
      parent.set('complexor', true);
      parent.set('y', i);
      objects.push(parent);
    }
    Parse.Object.saveAll(objects).then(() => {
      let subQuery = new Parse.Query('Child');
      subQuery.equalTo('x', 4);
      subQuery.equalTo('complexor', true);
      let q1 = new Parse.Query('Parent');
      q1.matchesQuery('child', subQuery);
      let q2 = new Parse.Query('Parent');
      q2.equalTo('complexor', true);
      q2.lessThan('y', 2);
      let orQuery = new Parse.Query.or(q1, q2);
      return orQuery.find();
    }).then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can iterate over results with each', (done) => {
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push(new TestObject({ x: i, eachtest: true }));
    }
    let seen = [];
    Parse.Object.saveAll(items).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);

      return query.each((obj) => {
        seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
      });
    }).then(() => {
      assert.equal(seen.length, 25);
      for (let i = 0; i < seen.length; i++) {
        assert.equal(seen[i], 1);
      }
      done();
    });
  });

  it('fails query.each with order', (done) => {
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push(new TestObject({ x: i, eachtest: true }));
    }
    let seen = [];
    Parse.Object.saveAll(items).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);
      query.ascending('x');

      return query.each((obj) => {
        seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
      });
    }).then(null, () => {
      done();
    });
  });

  it('fails query.each with limit', (done) => {
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push(new TestObject({ x: i, eachtest: true }));
    }
    let seen = [];
    Parse.Object.saveAll(items).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);
      query.limit(20);

      return query.each((obj) => {
        seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
      });
    }).then(null, () => {
      done();
    });
  });

  it('fails query.each with skip', (done) => {
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push(new TestObject({ x: i, eachtest: true }));
    }
    let seen = [];
    Parse.Object.saveAll(items).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);
      query.skip(20);

      return query.each((obj) => {
        seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
      });
    }).then(null, () => {
      done();
    });
  });

  it('can select specific keys', (done) => {
    let obj = new TestObject({ foo: 'baz', bar: 1 });
    obj.save().then(() => {
      let q = new Parse.Query(TestObject);
      q.equalTo('objectId', obj.id);
      q.select('foo');
      return q.first();
    }).then((result) => {
      assert(result.id);
      assert(result.createdAt);
      assert(result.updatedAt);
      assert(!result.dirty());
      assert.equal(result.get('foo'), 'baz');
      assert.equal(result.get('bar'), undefined);
      done();
    });
  });

  it('can select specific keys with each', (done) => {
    let obj = new TestObject({ foo: 'baz', bar: 1 });
    obj.save().then(() => {
      let q = new Parse.Query(TestObject);
      q.equalTo('objectId', obj.id);
      q.select('foo');
      return q.each((o) => {
        assert(o.id);
        assert.equal(o.get('foo'), 'baz');
        assert.equal(o.get('bar'), undefined);
      });
    }).then(() => {
      done();
    });
  });
});
