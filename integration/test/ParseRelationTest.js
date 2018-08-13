'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

describe('Parse Relation', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can do a simple add and remove', (done) => {
    const ChildObject = Parse.Object.extend('ChildObject');
    const childObjects = [];
    for (let i = 0; i < 10; i++) {
      childObjects.push(new ChildObject({x: i}));
    }
    let rel = null;
    let parent = null;
    Parse.Object.saveAll(childObjects).then(() => {
      parent = new Parse.Object('ParentObject');
      parent.set('x', 4);
      rel = parent.relation('child');
      rel.add(childObjects[0]);
      return parent.save();
    }).then((parentAgain) => {
      assert(!parent.dirty('child'));
      assert(!parentAgain.dirty('child'));
      return rel.query().find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].id, childObjects[0].id);

      rel.remove(childObjects[0]);
      return parent.save();
    }).then((parentAgain) => {
      assert(!parent.dirty('child'));
      assert(!parentAgain.dirty('child'));
      return rel.query().find();
    }).then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('can query relation without schema', (done) => {
    const ChildObject = Parse.Object.extend('ChildObject');
    const childObjects = [];
    for (let i = 0; i < 10; i++) {
      childObjects.push(new ChildObject({x: i}));
    }
    let parent = null;
    Parse.Object.saveAll(childObjects).then(() => {
      parent = new Parse.Object('ParentObject');
      parent.set('x', 4);
      const rel = parent.relation('child');
      rel.add(childObjects[0]);
      return parent.save();
    }).then((parentAgain) => {
      assert(!parent.dirty('child'));
      assert(!parentAgain.dirty('child'));
      return parentAgain.relation('child').query().find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].id, childObjects[0].id);
      done();
    });
  });

  it('can compound add and remove operations', (done) => {
    const ChildObject = Parse.Object.extend('ChildObject');
    const childObjects = [];
    for (let i = 0; i < 10; i++) {
      childObjects.push(new ChildObject({x: i}));
    }
    let parent = null;
    let rel = null;
    Parse.Object.saveAll(childObjects).then(() => {
      parent = new Parse.Object('ParentObject');
      parent.set('x', 4);
      rel = parent.relation('child');
      rel.add(childObjects[0]);
      rel.add(childObjects[1]);
      rel.remove(childObjects[0]);
      rel.add(childObjects[2]);
      return parent.save();
    }).then(() => {
      return rel.query().find();
    }).then((results) => {
      assert.equal(results.length, 2);

      rel.remove(childObjects[1]);
      rel.remove(childObjects[2]);
      rel.add(childObjects[1]);
      rel.add(childObjects[0]);

      return parent.save();
    }).then(() => {
      return rel.query().find();
    }).then((results) => {
      assert.equal(results.length, 2);
      done();
    });
  });

  it('can refine relation queries', (done) => {
    const ChildObject = Parse.Object.extend('ChildObject');
    const childObjects = [];
    for (let i = 0; i < 10; i++) {
      childObjects.push(new ChildObject({x: i}));
    }
    Parse.Object.saveAll(childObjects).then(() => {
      const parent = new Parse.Object('ParentObject');
      parent.set('x', 4);
      const rel = parent.relation('child');
      rel.add(childObjects[0]);
      rel.add(childObjects[1]);
      rel.add(childObjects[2]);
      return parent.save();
    }).then((parentAgain) => {
      const q = parentAgain.relation('child').query();
      q.equalTo('x', 2);
      return q.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].id, childObjects[2].id);
      done();
    });
  });

  it('can query relation fields', (done) => {
    const ChildObject = Parse.Object.extend('ChildObject');
    const childObjects = [];
    for (let i = 0; i < 10; i++) {
      childObjects.push(new ChildObject({x: i}));
    }
    Parse.Object.saveAll(childObjects).then(() => {
      const parent = new Parse.Object('ParentObject');
      parent.set('x', 4);
      const rel = parent.relation('child');
      rel.add(childObjects[0]);
      rel.add(childObjects[1]);
      rel.add(childObjects[2]);
      const parent2 = new Parse.Object('ParentObject');
      parent2.set('x', 3);
      const rel2 = parent2.relation('child');
      rel2.add(childObjects[4]);
      rel2.add(childObjects[5]);
      rel2.add(childObjects[6]);
      return Parse.Object.saveAll([parent, parent2]);
    }).then(() => {
      const q = new Parse.Query('ParentObject');
      const objects = [childObjects[4], childObjects[9]];
      q.containedIn('child', objects);
      return q.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].get('x'), 3);
      done();
    });
  });

  it('can get a query on a relation when the parent is unfetched', (done) => {
    const Wheel = Parse.Object.extend('Wheel');
    const Car = Parse.Object.extend('Car');
    const origWheel = new Wheel();
    origWheel.save().then(() => {
      const car = new Car();
      const relation = car.relation('wheels');
      relation.add(origWheel);
      return car.save();
    }).then((car) => {
      const unfetchedCar = new Car();
      unfetchedCar.id = car.id;
      const relation = unfetchedCar.relation('wheels');
      const query = relation.query();

      return query.get(origWheel.id);
    }).then((wheel) => {
      assert.equal(wheel.className, 'Wheel');
      assert.equal(wheel.id, origWheel.id);
      done();
    });
  });

  it('can find a query on a relation when the parent is unfetched', (done) => {
    const Wheel = Parse.Object.extend('Wheel');
    const Car = Parse.Object.extend('Car');
    const origWheel = new Wheel();
    origWheel.save().then(() => {
      const car = new Car();
      const relation = car.relation('wheels');
      relation.add(origWheel);
      return car.save();
    }).then((car) => {
      const unfetchedCar = new Car();
      unfetchedCar.id = car.id;
      const relation = unfetchedCar.relation('wheels');
      const query = relation.query();

      return query.find();
    }).then((wheels) => {
      assert.equal(wheels.length, 1);
      assert.equal(wheels[0].className, 'Wheel');
      assert.equal(wheels[0].id, origWheel.id);
      done();
    });
  });
});
