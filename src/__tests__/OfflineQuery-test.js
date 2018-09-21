/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

const matchesQuery = require('../OfflineQuery').matchesQuery;
const validateQuery = require('../OfflineQuery').validateQuery;
const ParseError = require('../ParseError').default;
const ParseObject = require('../ParseObject').default;
const ParseQuery = require('../ParseQuery').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParsePolygon = require('../ParsePolygon').default;
const ParseUser = require('../ParseUser').default;

describe('OfflineQuery', () => {

  it('matches blank queries', () => {
    const obj = new ParseObject('Item');
    const q = new ParseQuery('Item');
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);
    expect(matchesQuery(q.className, obj._toFullJSON(), [], q.toJSON().where)).toBe(true);
  });

  it('can handle unknown query', () => {
    const obj = new ParseObject('Item');
    const q = new ParseQuery('Item');
    q._addCondition('key', 'unknown', 'value');
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);
    expect(matchesQuery(q.className, obj._toFullJSON(), [], q.toJSON().where)).toBe(false);
  });

  it('matches queries null field', () => {
    const obj = new ParseObject('Item');
    const q = new ParseQuery('Item');
    q.equalTo('field', null);
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);
  });

  it('matches queries invalid key', () => {
    const obj = new ParseObject('Item');
    const q = new ParseQuery('Item');
    q.equalTo('$foo', 'bar');
    try {
      matchesQuery(q.className, obj, [], q)
    } catch (e) {
      expect(e.message).toBe('Invalid Key: $foo');
    }
  });

  it('matches queries date field', () => {
    const date = new Date();
    const obj = new ParseObject('Item');
    obj.set('field', date)
    const q = new ParseQuery('Item');
    q.greaterThanOrEqualTo('field', date);
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);
  });

  it('matches queries relation', () => {
    const obj = new ParseObject('Item');
    const relation = obj.relation("author");
    const q = relation.query();
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);
  });

  it('matches existence queries', () => {
    const obj = new ParseObject('Item');
    obj.set('count', 100);
    const q = new ParseQuery('Item');
    q.exists('count');
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);
    q.exists('name');
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);
  });

  it('matches queries with doesNotExist constraint', () => {
    const obj = new ParseObject('Item');
    obj.set('count', 100);

    let q = new ParseQuery('Item');
    q.doesNotExist('name');
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);

    q = new ParseQuery('Item');
    q.doesNotExist('count');
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);
  });

  it('matches on equality queries', () => {
    const day = new Date();
    const location = new ParseGeoPoint({
      latitude: 37.484815,
      longitude: -122.148377,
    });
    const obj = new ParseObject('Person');
    obj
      .set('score', 12)
      .set('name', 'Bill')
      .set('birthday', day)
      .set('lastLocation', location);

    let q = new ParseQuery('Person');
    q.equalTo('score', 12);
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);

    q = new ParseQuery('Person');
    q.equalTo('name', 'Bill');
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);
    q.equalTo('name', 'Jeff');
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);

    q = new ParseQuery('Person');
    q.containedIn('name', ['Adam', 'Ben', 'Charles']);
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);
    q.containedIn('name', ['Adam', 'Bill', 'Charles']);
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);

    q = new ParseQuery('Person');
    q.notContainedIn('name', ['Adam', 'Bill', 'Charles']);
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);
    q.notContainedIn('name', ['Adam', 'Ben', 'Charles']);
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);

    q = new ParseQuery('Person');
    q.equalTo('birthday', day);
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);
    q.equalTo('birthday', new Date(1990, 1));
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);

    q = new ParseQuery('Person');
    q.equalTo('lastLocation', location);
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);
    q.equalTo('lastLocation', new ParseGeoPoint({
      latitude: 37.4848,
      longitude: -122.1483,
    }));
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);

    q.equalTo('lastLocation', new ParseGeoPoint({
      latitude: 37.484815,
      longitude: -122.148377,
    }));
    q.equalTo('score', 12);
    q.equalTo('name', 'Bill');
    q.equalTo('birthday', day);
    expect(matchesQuery(q.className, obj, [], q)).toBe(true);

    q.equalTo('name', 'bill');
    expect(matchesQuery(q.className, obj, [], q)).toBe(false);

    let img = new ParseObject('Image');
    img.set('tags', ['nofilter', 'latergram', 'tbt']);

    q = new ParseQuery('Image');
    q.equalTo('tags', 'selfie');
    expect(matchesQuery(q.className, img, [], q)).toBe(false);
    q.equalTo('tags', 'tbt');
    expect(matchesQuery(q.className, img, [], q)).toBe(true);

    const q2 = new ParseQuery('Image');
    q2.containsAll('tags', ['latergram', 'nofilter']);
    expect(matchesQuery(q.className, img, [], q2)).toBe(true);
    q2.containsAll('tags', ['latergram', 'selfie']);
    expect(matchesQuery(q.className, img, [], q2)).toBe(false);

    const u = new ParseUser();
    u.id = 'U2';
    q = new ParseQuery('Image');
    q.equalTo('owner', u);

    img = new ParseObject('Image');
    img.set('owner', u);

    expect(matchesQuery(q.className, img, [], q)).toBe(true);

    let json = img.toJSON();
    json.owner.objectId = 'U3';
    expect(matchesQuery(json, q)).toBe(false);

    // pointers in arrays
    q = new ParseQuery('Image');
    q.equalTo('owners', u);

    img = new ParseObject('Image');
    img.set('owners', [u]);
    expect(matchesQuery(q.className, img, [], q)).toBe(true);

    json = img.toJSON();
    json.owners[0].objectId = 'U3';
    expect(matchesQuery(json, q)).toBe(false);
  });

  it('matches on inequalities', () => {
    const player = new ParseObject('Person');
    player
      .set('score', 12)
      .set('name', 'Bill')
      .set('birthday', new Date(1980, 2, 4));

    let q = new ParseQuery('Person');
    q.lessThan('score', 15);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    q.lessThan('score', 10);
    expect(matchesQuery(q.className, player, [], q)).toBe(false);

    q = new ParseQuery('Person');
    q.lessThanOrEqualTo('score', 15);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    q.lessThanOrEqualTo('score', 12);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    q.lessThanOrEqualTo('score', 10);
    expect(matchesQuery(q.className, player, [], q)).toBe(false);

    q = new ParseQuery('Person');
    q.greaterThan('score', 15);
    expect(matchesQuery(q.className, player, [], q)).toBe(false);
    q.greaterThan('score', 10);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);

    q = new ParseQuery('Person');
    q.greaterThanOrEqualTo('score', 15);
    expect(matchesQuery(q.className, player, [], q)).toBe(false);
    q.greaterThanOrEqualTo('score', 12);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    q.greaterThanOrEqualTo('score', 10);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);

    q = new ParseQuery('Person');
    q.notEqualTo('score', 12);
    expect(matchesQuery(q.className, player, [], q)).toBe(false);
    q.notEqualTo('score', 40);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
  });

  it('matches an $or query', () => {
    const player = new ParseObject('Player');
    player
      .set('score', 12)
      .set('name', 'Player 1');

    const q = new ParseQuery('Player');
    q.equalTo('name', 'Player 1');
    const q2 = new ParseQuery('Player');
    q2.equalTo('name', 'Player 2');
    const q3 = new ParseQuery('Player');
    q3.equalTo('name', 'Player 3');
    const orQuery1 = ParseQuery.or(q, q2);
    const orQuery2 = ParseQuery.or(q2, q3);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    expect(matchesQuery(q.className, player, [], q2)).toBe(false);
    expect(matchesQuery(q.className, player, [], orQuery1)).toBe(true);
    expect(matchesQuery(q.className, player, [], orQuery2)).toBe(false);
  });

  it('matches an $and query', () => {
    const player = new ParseObject('Player');
    player
      .set('score', 12)
      .set('name', 'Player 1');

    const q = new ParseQuery('Player');
    q.equalTo('name', 'Player 1');
    const q2 = new ParseQuery('Player');
    q2.equalTo('score',  12);
    const q3 = new ParseQuery('Player');
    q3.equalTo('score',  100);
    const andQuery1 = ParseQuery.and(q, q2);
    const andQuery2 = ParseQuery.and(q, q3);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    expect(matchesQuery(q.className, player, [], q2)).toBe(true);
    expect(matchesQuery(q.className, player, [], andQuery1)).toBe(true);
    expect(matchesQuery(q.className, player, [], andQuery2)).toBe(false);
  });

  it('matches an $nor query', () => {
    const player = new ParseObject('Player');
    player
      .set('score', 12)
      .set('name', 'Player 1');

    const q = new ParseQuery('Player');
    q.equalTo('name', 'Player 1');
    const q2 = new ParseQuery('Player');
    q2.equalTo('name', 'Player 2');
    const q3 = new ParseQuery('Player');
    q3.equalTo('name', 'Player 3');

    const norQuery1 = ParseQuery.nor(q, q2);
    const norQuery2 = ParseQuery.nor(q2, q3);
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    expect(matchesQuery(q.className, player, [], q2)).toBe(false);
    expect(matchesQuery(q.className, player, [], q3)).toBe(false);
    expect(matchesQuery(q.className, player, [], norQuery1)).toBe(false);
    expect(matchesQuery(q.className, player, [], norQuery2)).toBe(true);
  });

  it('matches $regex queries', () => {
    const player = new ParseObject('Player');
    player
      .set('score', 12)
      .set('name', 'Player 1');

    let q = new ParseQuery('Player');
    q.startsWith('name', 'Play');
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    q.startsWith('name', 'Ploy');
    expect(matchesQuery(q.className, player, [], q)).toBe(false);

    q = new ParseQuery('Player');
    q.endsWith('name', ' 1');
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    q.endsWith('name', ' 2');
    expect(matchesQuery(q.className, player, [], q)).toBe(false);

    // Check that special characters are escaped
    player.set('name', 'Android-7');
    q = new ParseQuery('Player');
    q.contains('name', 'd-7');
    expect(matchesQuery(q.className, player, [], q)).toBe(true);

    q = new ParseQuery('Player');
    q.matches('name', /A.d/, 'm');
    expect(matchesQuery(q.className, player, [], q)).toBe(true);

    q.matches('name', /A[^n]d/);
    expect(matchesQuery(q.className, player, [], q)).toBe(false);

    // Check that the string \\E is returned to normal
    player.set('name', 'Slash \\E');
    q = new ParseQuery('Player');
    q.endsWith('name', 'h \\E');
    expect(matchesQuery(q.className, player, [], q)).toBe(true);

    q.endsWith('name', 'h \\Ee');
    expect(matchesQuery(q.className, player, [], q)).toBe(false);

    player.set('name', 'Slash \\Q and more');
    q = new ParseQuery('Player');
    q.contains('name', 'h \\Q and');
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
    q.contains('name', 'h \\Q or');
    expect(matchesQuery(q.className, player, [], q)).toBe(false);

    q = new ParseQuery('Player');
    q._addCondition('status', '$regex', { test: function() { return true } });
    expect(matchesQuery(q.className, player, [], q)).toBe(true);
  });

  it('matches $nearSphere queries', () => {
    let q = new ParseQuery('Checkin');
    q.near('location', new ParseGeoPoint(20, 20));
    // With no max distance, any GeoPoint is 'near'
    const pt = new ParseObject('Checkin');
    pt.set('location', new ParseGeoPoint(40, 40));

    const ptUndefined = new ParseObject('Checkin');

    const ptNull = new ParseObject('Checkin');
    ptNull.set('location', null);

    expect(matchesQuery(q.className, pt, [], q)).toBe(true);
    expect(matchesQuery(q.className, ptUndefined, [], q)).toBe(false);
    expect(matchesQuery(q.className, ptNull, [], q)).toBe(false);

    q = new ParseQuery('Checkin');
    pt.set('location', new ParseGeoPoint(40, 40));

    q.withinRadians('location', new ParseGeoPoint(30, 30), 0.3);
    expect(matchesQuery(q.className, pt, [], q)).toBe(true);

    q.withinRadians('location', new ParseGeoPoint(30, 30), 0.2);
    expect(matchesQuery(q.className, pt, [], q)).toBe(false);

    q = new ParseQuery('Checkin');
    q._addCondition('location', '$maxDistance', 100);
    expect(matchesQuery(q.className, pt, [], q)).toBe(true);
  });

  it('matches $within queries', () => {
    const caltrainStation = new ParseObject('Checkin');
    caltrainStation
      .set('name', 'Caltrain')
      .set('location', new ParseGeoPoint(37.776346, -122.394218));

    const santaClara = new ParseObject('Checkin');
    santaClara
      .set('name', 'Santa Clara')
      .set('location', new ParseGeoPoint(37.325635, -121.945753));

    const noLocation = new ParseObject('Checkin');
    noLocation.set('name', 'Santa Clara');

    const nullLocation = new ParseObject('Checkin');
    nullLocation
      .set('name', 'Santa Clara')
      .set('location', null);


    let q = new ParseQuery('Checkin').withinGeoBox(
      'location',
      new ParseGeoPoint(37.708813, -122.526398),
      new ParseGeoPoint(37.822802, -122.373962),
    );

    expect(matchesQuery(q.className, caltrainStation, [], q)).toBe(true);
    expect(matchesQuery(q.className, santaClara, [], q)).toBe(false);
    expect(matchesQuery(q.className, noLocation, [], q)).toBe(false);
    expect(matchesQuery(q.className, nullLocation, [], q)).toBe(false);
    // Invalid rectangles
    q = new ParseQuery('Checkin').withinGeoBox(
      'location',
      new ParseGeoPoint(37.822802, -122.373962),
      new ParseGeoPoint(37.708813, -122.526398),
    );

    expect(matchesQuery(q.className, caltrainStation, [], q)).toBe(false);
    expect(matchesQuery(q.className, santaClara, [], q)).toBe(false);

    q = new ParseQuery('Checkin').withinGeoBox(
      'location',
      new ParseGeoPoint(37.708813, -122.373962),
      new ParseGeoPoint(37.822802, -122.526398),
    );

    expect(matchesQuery(q.className, caltrainStation, [], q)).toBe(false);
    expect(matchesQuery(q.className, santaClara, [], q)).toBe(false);
  });

  it('matches on subobjects with dot notation', () => {
    const message = new ParseObject('Message');
    message
      .set('test', 'content')
      .set('status', { x: 'read', y: 'delivered' });

    let q = new ParseQuery('Message');
    q.equalTo('status.x', 'read');
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.equalTo('status.z', 'read');
    expect(matchesQuery(q.className, message, [], q)).toBe(false);

    q = new ParseQuery('Message');
    q.equalTo('status.x', 'delivered');
    expect(matchesQuery(q.className, message, [], q)).toBe(false);

    q = new ParseQuery('Message');
    q.notEqualTo('status.x', 'read');
    expect(matchesQuery(q.className, message, [], q)).toBe(false);

    q = new ParseQuery('Message');
    q.notEqualTo('status.z', 'read');
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.notEqualTo('status.x', 'delivered');
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.exists('status.x');
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.exists('status.z');
    expect(matchesQuery(q.className, message, [], q)).toBe(false);

    q = new ParseQuery('Message');
    q.exists('nonexistent.x');
    expect(matchesQuery(q.className, message, [], q)).toBe(false);

    q = new ParseQuery('Message');
    q.doesNotExist('status.x');
    expect(matchesQuery(q.className, message, [], q)).toBe(false);

    q = new ParseQuery('Message');
    q.doesNotExist('status.z');
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.doesNotExist('nonexistent.z');
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.equalTo('status.x', 'read');
    q.doesNotExist('status.y');
    expect(matchesQuery(q.className, message, [], q)).toBe(false);

    q = new ParseQuery('Message');
    q._addCondition('status', '$exists', 'invalid');
    expect(matchesQuery(q.className, message, [], q)).toBe(true);
  });

  it('should support containedIn with pointers', () => {
    const profile = new ParseObject('Profile');
    profile.id = 'abc';
    const message = new ParseObject('Message');
    message.set('profile', profile);

    let q = new ParseQuery('Message');
    q.containedIn('profile', [ParseObject.fromJSON({ className: 'Profile', objectId: 'abc' }),
      ParseObject.fromJSON({ className: 'Profile', objectId: 'def' })]);
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.containedIn('profile', [ParseObject.fromJSON({ className: 'Profile', objectId: 'ghi' }),
      ParseObject.fromJSON({ className: 'Profile', objectId: 'def' })]);
    expect(matchesQuery(q.className, message, [], q)).toBe(false);
  });

  it('should support notContainedIn with pointers', () => {
    const profile = new ParseObject('Profile');
    profile.id = 'abc';
    let message = new ParseObject('Message');
    message.id = 'O1';
    message.set('profile', profile);

    let q = new ParseQuery('Message');
    q.notContainedIn('profile', [ParseObject.fromJSON({ className: 'Profile', objectId: 'def' }),
      ParseObject.fromJSON({ className: 'Profile', objectId: 'ghi' })]);
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    profile.id = 'def';
    message = new ParseObject('Message');
    message.set('profile', profile);
    q = new ParseQuery('Message');
    q.notContainedIn('profile', [ParseObject.fromJSON({ className: 'Profile', objectId: 'ghi' }),
      ParseObject.fromJSON({ className: 'Profile', objectId: 'def' })]);
    expect(matchesQuery(q.className, message, [], q)).toBe(false);
  });

  it('should support containedIn queries with [objectId]', () => {
    const profile = new ParseObject('Profile');
    profile.id = 'abc';
    let message = new ParseObject('Message');
    message.set('profile', profile);

    let q = new ParseQuery('Message');
    q.containedIn('profile', ['abc', 'def']);
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    profile.id = 'ghi';
    message = new ParseObject('Message');
    message.set('profile', profile);

    q = new ParseQuery('Message');
    q.containedIn('profile', ['abc', 'def']);
    expect(matchesQuery(q.className, message, [], q)).toBe(false);
  });

  it('should support notContainedIn queries with [objectId]', () => {
    const profile = new ParseObject('Profile');
    profile.id = 'ghi';
    const message = new ParseObject('Message');
    message.set('profile', profile);

    let q = new ParseQuery('Message');
    q.notContainedIn('profile', ['abc', 'def']);
    expect(matchesQuery(q.className, message, [], q)).toBe(true);

    q = new ParseQuery('Message');
    q.notContainedIn('profile', ['abc', 'def', 'ghi']);
    expect(matchesQuery(q.className, message, [], q)).toBe(false);
  });

  it('should support matchesKeyInQuery', () => {
    const restaurant = new ParseObject('Restaurant');
    restaurant.set('ratings', 5);
    restaurant.set('location', 'Earth');
    const person1 = new ParseObject('Person');
    person1.set('hometown', 'Earth');
    const person2 = new ParseObject('Person');
    person2.set('hometown', 'Mars');

    let query = new ParseQuery('Restaurant');
    query.greaterThan('rating', 4);
    let mainQuery = new ParseQuery('Person');

    mainQuery.matchesKeyInQuery('hometown', 'location', query);
    expect(matchesQuery(mainQuery.className, person1, [person1, person2, restaurant], mainQuery)).toBe(true);
    expect(matchesQuery(mainQuery.className, person2, [person1, person2, restaurant], mainQuery)).toBe(false);
    expect(matchesQuery(mainQuery.className, person1, [], mainQuery)).toBe(false);

    query = new ParseQuery('Restaurant');
    query.greaterThan('rating', 4);
    mainQuery = new ParseQuery('Person');

    mainQuery.doesNotMatchKeyInQuery('hometown', 'location', query);
    expect(matchesQuery(mainQuery.className, person1, [person1, person2, restaurant._toFullJSON()], mainQuery)).toBe(false);
    expect(matchesQuery(mainQuery.className, person2, [person1, person2, restaurant], mainQuery)).toBe(true);
    expect(matchesQuery(mainQuery.className, person1, [], mainQuery)).toBe(false);
  });

  it('should support matchesQuery', () => {
    const parentObjects = [];
    const childObjects = [];
    for (let i = 0; i < 10; i += 1) {
      const child = new ParseObject('ChildObject');
      child.id = 100 + i;
      child.set('x', i);
      const parent = new ParseObject('ParentObject');
      parent.id = 10 + i;
      parent.set('child', child);
      childObjects.push(child);
      parentObjects.push(parent);
    }
    let subQuery = new ParseQuery('ChildObject');
    subQuery.greaterThan('x', 5);
    let q = new ParseQuery('ParentObject');
    q.matchesQuery('child', subQuery);
    expect(matchesQuery(q.className, parentObjects[0], [...parentObjects, ...childObjects], q)).toBe(false);
    expect(matchesQuery(q.className, parentObjects[9], [...parentObjects, ...childObjects], q)).toBe(true);
    expect(matchesQuery(q.className, parentObjects[0], [], q)).toBe(false);

    subQuery = new ParseQuery('ChildObject');
    subQuery.greaterThan('x', 5);
    q = new ParseQuery('ParentObject');
    q.doesNotMatchQuery('child', subQuery);
    expect(matchesQuery(q.className, parentObjects[0], [...parentObjects, ...childObjects], q)).toBe(true);
    expect(matchesQuery(q.className, parentObjects[9], [...parentObjects, ...childObjects], q)).toBe(false);
    expect(matchesQuery(q.className, parentObjects[0], [], q)).toBe(true);
  });

  it('should support containedBy query', () => {
    const obj1 = new ParseObject('Numbers');
    const obj2 = new ParseObject('Numbers');
    const obj3 = new ParseObject('Numbers');
    obj1.set('numbers', [0, 1, 2]);
    obj2.set('numbers', [2, 0]);
    obj3.set('numbers', [1, 2, 3, 4]);

    const q = new ParseQuery('Numbers');
    q.containedBy('numbers', [1, 2, 3, 4, 5]);
    expect(matchesQuery(q.className, obj1, [], q)).toBe(false);
    expect(matchesQuery(q.className, obj2, [], q)).toBe(false);
    expect(matchesQuery(q.className, obj3, [], q)).toBe(true);
  });

  it('should support withinPolygon query', () => {
    const sacramento = new ParseObject('Location');
    sacramento.set('location', new ParseGeoPoint(38.52, -121.50));
    sacramento.set('name', 'Sacramento');

    const honolulu = new ParseObject('Location');
    honolulu.set('location', new ParseGeoPoint(21.35, -157.93));
    honolulu.set('name', 'Honolulu');

    const sf = new ParseObject('Location');
    sf.set('location', new ParseGeoPoint(37.75, -122.68));
    sf.set('name', 'San Francisco')

    const points = [
      new ParseGeoPoint(37.85, -122.33),
      new ParseGeoPoint(37.85, -122.90),
      new ParseGeoPoint(37.68, -122.90),
      new ParseGeoPoint(37.68, -122.33)
    ];
    const q = new ParseQuery('Location');
    q.withinPolygon('location', points);

    expect(matchesQuery(q.className, sacramento, [], q)).toBe(false);
    expect(matchesQuery(q.className, honolulu, [], q)).toBe(false);
    expect(matchesQuery(q.className, sf, [], q)).toBe(true);
  });

  it('should support polygonContains query', () => {
    const p1 = [[0,0], [0,1], [1,1], [1,0]];
    const p2 = [[0,0], [0,2], [2,2], [2,0]];
    const p3 = [[10,10], [10,15], [15,15], [15,10], [10,10]];

    const polygon1 = new ParsePolygon(p1);
    const polygon2 = new ParsePolygon(p2);
    const polygon3 = new ParsePolygon(p3);
    const obj1 = new ParseObject('Bounds');
    const obj2 = new ParseObject('Bounds');
    const obj3 = new ParseObject('Bounds');
    obj1.set('polygon', polygon1);
    obj2.set('polygon', polygon2);
    obj3.set('polygon', polygon3);

    const point = new ParseGeoPoint(0.5, 0.5);
    const q = new ParseQuery('Bounds');
    q.polygonContains('polygon', point);

    expect(matchesQuery(q.className, obj1, [], q)).toBe(true);
    expect(matchesQuery(q.className, obj2, [], q)).toBe(true);
    expect(matchesQuery(q.className, obj3, [], q)).toBe(false);
  });

  it('should validate query', () => {
    let query = new ParseQuery('TestObject');
    query.equalTo('foo', 'bar');
    try {
      validateQuery(query);
      validateQuery(query.toJSON());

      query.matches('myString', 'football', 'm');
      validateQuery(query);

      expect(true).toBe(true);
    } catch (e) {
      // Should not reach here
      expect(false).toEqual(true);
    }

    query = new ParseQuery('TestObject');
    query.matches('myString', 'football', 'some invalid thing');
    try {
      validateQuery(query);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.code).toEqual(ParseError.INVALID_QUERY);
    }

    query = new ParseQuery('TestObject');
    query.equalTo('$foo', 'bar');
    try {
      validateQuery(query);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.code).toEqual(ParseError.INVALID_KEY_NAME);
    }
  });
});
