const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Polygon', () => {
  beforeAll(() => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
  });

  beforeEach((done) => {
    clear().then(() => {
      done();
    });
  });

  it('can save polygon with points', (done) => {
    const openPoints = [[0,0], [0,1], [1,1], [1,0]];
    const closedPoints = [[0,0], [0,1], [1,1], [1,0], [0,0]];
    const polygon = new Parse.Polygon(openPoints);
    const obj = new TestObject({ polygon });
    obj.save().then(() => {
      const query = new Parse.Query(TestObject);
      query.equalTo('polygon', polygon);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.deepEqual(results[0].get('polygon').coordinates, closedPoints);
      const closedPolygon = new Parse.Polygon(closedPoints);
      const query = new Parse.Query(TestObject);
      query.equalTo('polygon', closedPolygon);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.deepEqual(results[0].get('polygon').coordinates, closedPoints);
      done();
    }, done.fail);
  });

  it('can save polygon with GeoPoints', (done) => {
    const p1 = new Parse.GeoPoint(0, 0);
    const p2 = new Parse.GeoPoint(0, 1);
    const p3 = new Parse.GeoPoint(1, 1);
    const p4 = new Parse.GeoPoint(1, 0);
    const p5 = new Parse.GeoPoint(0, 0);
    const closedPoints = [[0,0], [0,1], [1,1], [1,0], [0,0]];
    const polygon = new Parse.Polygon([p1, p2, p3, p4, p5]);
    const obj = new TestObject({ polygon });
    obj.save().then(() => {
      const query = new Parse.Query(TestObject);
      query.equalTo('polygon', polygon);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.deepEqual(results[0].get('polygon').coordinates, closedPoints);
      const closedPolygon = new Parse.Polygon(closedPoints);
      const query = new Parse.Query(TestObject);
      query.equalTo('polygon', closedPolygon);
      return query.find();
    }).then((results) => {
      assert.deepEqual(results[0].get('polygon').coordinates, closedPoints);
      done();
    }, done.fail);
  });

  it('fail save with 3 point minumum', (done) => {
    try {
      new Parse.Polygon([[0, 0]]);
    } catch (e) {
      done();
    }
  });

  it('fail save with non array', (done) => {
    try {
      new Parse.Polygon(123);
    } catch (e) {
      done();
    }
  });

  it('fail save with invalid array', (done) => {
    try {
      new Parse.Polygon([['str1'], ['str2'], ['str3']]);
    } catch (e) {
      done();
    }
  });

  it('containsPoint', (done) => {
    const points = [[0,0], [0,1], [1,1], [1,0]];
    const inside = new Parse.GeoPoint(0.5, 0.5);
    const outside = new Parse.GeoPoint(10, 10);
    const polygon = new Parse.Polygon(points);

    assert.equal(polygon.containsPoint(inside), true);
    assert.equal(polygon.containsPoint(outside), false);
    done();
  });

  it('equality', (done) => {
    const points = [[0,0], [0,1], [1,1], [1,0]];
    const diff = [[0,0], [0,2], [2,2], [2,0]];

    const polygonA = new Parse.Polygon(points);
    const polygonB = new Parse.Polygon(points);
    const polygonC = new Parse.Polygon(diff);

    assert.equal(polygonA.equals(polygonA), true);
    assert.equal(polygonA.equals(polygonB), true);
    assert.equal(polygonB.equals(polygonA), true);

    assert.equal(polygonA.equals(true), false);
    assert.equal(polygonA.equals(polygonC), false);

    done();
  });

  it('supports polygonContains', (done) => {
    const p1 = [[0,0], [0,1], [1,1], [1,0]];
    const p2 = [[0,0], [0,2], [2,2], [2,0]];
    const p3 = [[10,10], [10,15], [15,15], [15,10], [10,10]];

    const polygon1 = new Parse.Polygon(p1);
    const polygon2 = new Parse.Polygon(p2);
    const polygon3 = new Parse.Polygon(p3);

    const obj1 = new TestObject({ polygon: polygon1 });
    const obj2 = new TestObject({ polygon: polygon2 });
    const obj3 = new TestObject({ polygon: polygon3 });

    Parse.Object.saveAll([obj1, obj2, obj3]).then(() => {
      const point = new Parse.GeoPoint(0.5, 0.5);
      const query = new Parse.Query(TestObject);
      query.polygonContains('polygon', point);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      done();
    }, done.fail);
  });

  it('polygonContains invalid input', (done) => {
    const points = [[0,0], [0,1], [1,1], [1,0]];
    const polygon = new Parse.Polygon(points);
    const obj = new TestObject({ polygon });
    obj.save().then(() => {
      const query = new Parse.Query(TestObject);
      query.polygonContains('polygon', 1234);
      return query.find();
    }).then(() => {
      fail();
    }).catch(() => {
      done();
    });
  });
});
