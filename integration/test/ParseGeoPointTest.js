'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');
const TestPoint = Parse.Object.extend('TestPoint');
const Container = Parse.Object.extend('Container');

describe('Geo Point', () => {
  beforeAll((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.CoreManager.set('REQUEST_ATTEMPT_LIMIT', 1);
    Parse.Storage._clear();
    clear().then(() => {
      const sacramento = new TestPoint();
      sacramento.set('location', new Parse.GeoPoint(38.52, -121.50));
      sacramento.set('name', 'Sacramento');

      const honolulu = new TestPoint();
      honolulu.set('location', new Parse.GeoPoint(21.35, -157.93));
      honolulu.set('name', 'Honolulu');

      const sf = new TestPoint();
      sf.set('location', new Parse.GeoPoint(37.75, -122.68));
      sf.set('name', 'San Francisco');

      return Parse.Object.saveAll([sacramento, honolulu, sf]);
    }).then(() => {
      return Parse.User.logOut();
    }).then(() => { done() }, () => { done() });
  });

  it('can save geo points', (done) => {
    const point = new Parse.GeoPoint(44.0, -11.0);
    const obj = new TestObject();
    obj.set('location', point)
    obj.set('name', 'Ferndale');
    obj.save().then(() => {
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert(o.get('location'));
      assert.equal(o.get('location').latitude, 44.0);
      assert.equal(o.get('location').longitude, -11.0);
      done();
    });
  });

  it('can only store one geo point per object', (done) => {
    const point = new Parse.GeoPoint(20, 20);
    const obj = new Container();
    obj.set('locationOne', point);
    obj.set('locationTwo', point);
    obj.save().then(done.fail).catch(() => {
      done();
    });
  });

  it('can sequence a line of points by distance - without unsorted parameter', (done) => {
    const line = [];
    for (let i = 0; i < 10; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(i * 4 - 12, i * 3.2 - 11);
      obj.set('location', point);
      obj.set('construct', 'line');
      obj.set('seq', i);
      line.push(obj);
    }
    Parse.Object.saveAll(line).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(24, 19);
      query.equalTo('construct', 'line');
      query.withinMiles('location', point, 10000);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 10);
      assert.equal(results[0].get('seq'), 9);
      assert.equal(results[3].get('seq'), 6);
      done();
    });
  });

  it('can sequence a line of points by distance - with unsorted parameter', (done) => {
    const line = [];
    for (let i = 0; i < 10; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(i * 4 - 12, i * 3.2 - 11);
      obj.set('location', point);
      obj.set('construct', 'line_unsorted');
      obj.set('seq', i);
      line.push(obj);
    }
    Parse.Object.saveAll(line).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(24, 19);
      query.equalTo('construct', 'line_unsorted');
      query.withinMiles('location', point, 10000, true);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 10);
      assert.equal(results[0].get('seq'), 9);
      assert.equal(results[3].get('seq'), 6);
      done();
    });
  });

  it('can query within large distances', (done) => {
    const objects = [];
    for (let i = 0; i < 3; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(0, i * 45);
      obj.set('location', point);
      obj.set('construct', 'large_dist')
      obj.set('index', i);
      objects.push(obj);
    }
    Parse.Object.saveAll(objects).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(1, -1);
      query.equalTo('construct', 'large_dist');
      query.withinRadians('location', point, 3.14);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can query within medium distances', (done) => {
    const objects = [];
    for (let i = 0; i < 3; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(0, i * 45);
      obj.set('location', point);
      obj.set('construct', 'medium_dist')
      obj.set('index', i);
      objects.push(obj);
    }
    Parse.Object.saveAll(objects).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(1, -1);
      query.equalTo('construct', 'medium_dist');
      query.withinRadians('location', point, 3.14 * 0.5);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('index'), 0);
      assert.equal(results[1].get('index'), 1);
      done();
    });
  });

  it('can query within small distances', (done) => {
    const objects = [];
    for (let i = 0; i < 3; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(0, i * 45);
      obj.set('location', point);
      obj.set('construct', 'small_dist')
      obj.set('index', i);
      objects.push(obj);
    }
    Parse.Object.saveAll(objects).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(1, -1);
      query.equalTo('construct', 'small_dist');
      query.withinRadians('location', point, 3.14 * 0.25);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('index'), 0);
      done();
    });
  });

  it('can measure distance within km - everywhere', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 4000.0);
    query.find().then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can measure distance within km - california', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 3700.0);
    query.find().then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('name'), 'San Francisco');
      assert.equal(results[1].get('name'), 'Sacramento');
      done();
    });
  });

  it('can measure distance within km - bay area', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 100.0);
    query.find().then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'San Francisco');
      done();
    });
  });

  it('can measure distance within km - mid peninsula', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 10.0);
    query.find().then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('can measure distance within miles - everywhere', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 2500.0);
    query.find().then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can measure distance within miles - california', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 2200.0);
    query.find().then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('name'), 'San Francisco');
      assert.equal(results[1].get('name'), 'Sacramento');
      done();
    });
  });

  it('can measure distance within miles - bay area', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 75.0);
    query.find().then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'San Francisco');
      done();
    });
  });

  it('can measure distance within miles - mid peninsula', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 10.0);
    query.find().then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('can query within large distances unsorted', (done) => {
    const objects = [];
    for (let i = 0; i < 3; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(0, i * 45);
      obj.set('location', point);
      obj.set('construct', 'large_dist_unsorted');
      obj.set('index', i);
      objects.push(obj);
    }
    Parse.Object.saveAll(objects).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(1, -1);
      query.equalTo('construct', 'large_dist_unsorted');
      query.withinRadians('location', point, 3.14, false);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can query within medium distances unsorted', (done) => {
    const objects = [];
    for (let i = 0; i < 3; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(0, i * 45);
      obj.set('location', point);
      obj.set('construct', 'medium_dist_unsorted');
      obj.set('index', i);
      objects.push(obj);
    }
    Parse.Object.saveAll(objects).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(1, -1);
      query.equalTo('construct', 'medium_dist_unsorted');
      query.withinRadians('location', point, 3.14 * 0.5, false);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('index'), 0);
      assert.equal(results[1].get('index'), 1);
      done();
    });
  });

  it('can query within small distances unsorted', (done) => {
    const objects = [];
    for (let i = 0; i < 3; i++) {
      const obj = new TestObject();
      const point = new Parse.GeoPoint(0, i * 45);
      obj.set('location', point);
      obj.set('construct', 'small_dist_unsorted');
      obj.set('index', i);
      objects.push(obj);
    }
    Parse.Object.saveAll(objects).then(() => {
      const query = new Parse.Query(TestObject);
      const point = new Parse.GeoPoint(1, -1);
      query.equalTo('construct', 'small_dist_unsorted');
      query.withinRadians('location', point, 3.14 * 0.25, false);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('index'), 0);
      done();
    });
  });

  it('can measure distance within km unsorted - everywhere', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 4000.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can measure distance within km unsorted - california', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 3700.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('name'), 'San Francisco');
      assert.equal(results[1].get('name'), 'Sacramento');
      done();
    });
  });

  it('can measure distance within km unsorted - bay area', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 100.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'San Francisco');
      done();
    });
  });

  it('can measure distance within km unsorted - mid peninsula', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinKilometers('location', sfo, 10.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('can measure distance within miles unsorted - everywhere', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 2500.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('can measure distance within miles unsorted - california', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 2200.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('name'), 'San Francisco');
      assert.equal(results[1].get('name'), 'Sacramento');
      done();
    });
  });

  it('can measure distance within miles unsorted - bay area', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 75.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'San Francisco');
      done();
    });
  });

  it('can measure distance within miles unsorted - mid peninsula', (done) => {
    const sfo = new Parse.GeoPoint(37.6189722, -122.3748889);
    const query = new Parse.Query(TestPoint);
    query.withinMiles('location', sfo, 10.0, false);
    query.find().then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('supports withinPolygon open path', (done) => {
    const points = [
      new Parse.GeoPoint(37.85, -122.33),
      new Parse.GeoPoint(37.85, -122.90),
      new Parse.GeoPoint(37.68, -122.90),
      new Parse.GeoPoint(37.68, -122.33)
    ];
    const query = new Parse.Query(TestPoint);
    query.withinPolygon('location', points);
    query.find().then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('supports withinPolygon closed path', (done) => {
    const points = [
      new Parse.GeoPoint(38.52, -121.50),
      new Parse.GeoPoint(37.75, -157.93),
      new Parse.GeoPoint(37.578072, -121.379914),
      new Parse.GeoPoint(38.52, -121.50)
    ];
    const query = new Parse.Query(TestPoint);
    query.withinPolygon('location', points);
    query.find().then((results) => {
      assert.equal(results.length, 2);
      done();
    });
  });

  it('non array withinPolygon', (done) => {
    const query = new Parse.Query(TestPoint);
    query.withinPolygon('location', 1234);
    query.find().catch((err) => {
      assert.equal(err.code, Parse.Error.INVALID_JSON);
      done();
    });
  });

  it('invalid array withinPolygon', (done) => {
    const query = new Parse.Query(TestPoint);
    query.withinPolygon('location', [1234]);
    query.find().catch((err) => {
      assert.equal(err.code, Parse.Error.INVALID_JSON);
      done();
    });
  });

  xit('minimum 3 points withinPolygon', function(done) {
    const query = new Parse.Query(TestPoint);
    query.withinPolygon('location', []);
    query.find().then(done.fail, (err) => {
      assert.equal(err.code, Parse.Error.INVALID_JSON);
      done();
    })
      .catch(done.fail);
  }, 'Test passes locally but not on CI');
});
