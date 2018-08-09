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
const ParseObject = require('../ParseObject').default;
const ParseQuery = require('../ParseQuery').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParseUser = require('../ParseUser').default;

describe('OfflineQuery', () => {
  it('matches blanket queries', () => {
    const obj = new ParseObject('Item');
    const q = new ParseQuery('Item');
    expect(matchesQuery(obj, q)).toBe(true);
    expect(matchesQuery(obj.toJSON(), q.toJSON().where)).toBe(true);
  });

  it('matches existence queries', () => {
    const obj = new ParseObject('Item');
    obj.set('count', 100);
    const q = new ParseQuery('Item');
    q.exists('count');
    expect(matchesQuery(obj, q)).toBe(true);
    q.exists('name');
    expect(matchesQuery(obj, q)).toBe(false);
  });

  it('matches queries with doesNotExist constraint', () => {
    const obj = new ParseObject('Item');
    obj.set('count', 100);

    let q = new ParseQuery('Item');
    q.doesNotExist('name');
    expect(matchesQuery(obj, q)).toBe(true);

    q = new ParseQuery('Item');
    q.doesNotExist('count');
    expect(matchesQuery(obj, q)).toBe(false);
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
    expect(matchesQuery(obj, q)).toBe(true);

    q = new ParseQuery('Person');
    q.equalTo('name', 'Bill');
    expect(matchesQuery(obj, q)).toBe(true);
    q.equalTo('name', 'Jeff');
    expect(matchesQuery(obj, q)).toBe(false);

    q = new ParseQuery('Person');
    q.containedIn('name', ['Adam', 'Ben', 'Charles']);
    expect(matchesQuery(obj, q)).toBe(false);
    q.containedIn('name', ['Adam', 'Bill', 'Charles']);
    expect(matchesQuery(obj, q)).toBe(true);

    q = new ParseQuery('Person');
    q.notContainedIn('name', ['Adam', 'Bill', 'Charles']);
    expect(matchesQuery(obj, q)).toBe(false);
    q.notContainedIn('name', ['Adam', 'Ben', 'Charles']);
    expect(matchesQuery(obj, q)).toBe(true);

    q = new ParseQuery('Person');
    q.equalTo('birthday', day);
    expect(matchesQuery(obj, q)).toBe(true);
    q.equalTo('birthday', new Date(1990, 1));
    expect(matchesQuery(obj, q)).toBe(false);

    q = new ParseQuery('Person');
    q.equalTo('lastLocation', location);
    expect(matchesQuery(obj, q)).toBe(true);
    q.equalTo('lastLocation', new ParseGeoPoint({
      latitude: 37.4848,
      longitude: -122.1483,
    }));
    expect(matchesQuery(obj, q)).toBe(false);

    q.equalTo('lastLocation', new ParseGeoPoint({
      latitude: 37.484815,
      longitude: -122.148377,
    }));
    q.equalTo('score', 12);
    q.equalTo('name', 'Bill');
    q.equalTo('birthday', day);
    expect(matchesQuery(obj, q)).toBe(true);

    q.equalTo('name', 'bill');
    expect(matchesQuery(obj, q)).toBe(false);

    let img = new ParseObject('Image');
    img.set('tags', ['nofilter', 'latergram', 'tbt']);

    q = new ParseQuery('Image');
    q.equalTo('tags', 'selfie');
    expect(matchesQuery(img, q)).toBe(false);
    q.equalTo('tags', 'tbt');
    expect(matchesQuery(img, q)).toBe(true);

    const q2 = new ParseQuery('Image');
    q2.containsAll('tags', ['latergram', 'nofilter']);
    expect(matchesQuery(img, q2)).toBe(true);
    q2.containsAll('tags', ['latergram', 'selfie']);
    expect(matchesQuery(img, q2)).toBe(false);

    const u = new ParseUser();
    u.id = 'U2';
    q = new ParseQuery('Image');
    q.equalTo('owner', u);

    img = new ParseObject('Image');
    img.set('owner', u);

    expect(matchesQuery(img, q)).toBe(true);

    let json = img.toJSON();
    json.owner.objectId = 'U3';
    expect(matchesQuery(json, q)).toBe(false);

    // pointers in arrays
    q = new ParseQuery('Image');
    q.equalTo('owners', u);

    img = new ParseObject('Image');
    img.set('owners', [u]);
    expect(matchesQuery(img, q)).toBe(true);

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
    expect(matchesQuery(player, q)).toBe(true);
    q.lessThan('score', 10);
    expect(matchesQuery(player, q)).toBe(false);

    q = new ParseQuery('Person');
    q.lessThanOrEqualTo('score', 15);
    expect(matchesQuery(player, q)).toBe(true);
    q.lessThanOrEqualTo('score', 12);
    expect(matchesQuery(player, q)).toBe(true);
    q.lessThanOrEqualTo('score', 10);
    expect(matchesQuery(player, q)).toBe(false);

    q = new ParseQuery('Person');
    q.greaterThan('score', 15);
    expect(matchesQuery(player, q)).toBe(false);
    q.greaterThan('score', 10);
    expect(matchesQuery(player, q)).toBe(true);

    q = new ParseQuery('Person');
    q.greaterThanOrEqualTo('score', 15);
    expect(matchesQuery(player, q)).toBe(false);
    q.greaterThanOrEqualTo('score', 12);
    expect(matchesQuery(player, q)).toBe(true);
    q.greaterThanOrEqualTo('score', 10);
    expect(matchesQuery(player, q)).toBe(true);

    q = new ParseQuery('Person');
    q.notEqualTo('score', 12);
    expect(matchesQuery(player, q)).toBe(false);
    q.notEqualTo('score', 40);
    expect(matchesQuery(player, q)).toBe(true);
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
    const orQuery = ParseQuery.or(q, q2);
    expect(matchesQuery(player, q)).toBe(true);
    expect(matchesQuery(player, q2)).toBe(false);
    expect(matchesQuery(player, orQuery)).toBe(true);
  });

  it('matches $regex queries', () => {
    const player = new ParseObject('Player');
    player
      .set('score', 12)
      .set('name', 'Player 1');

    let q = new ParseQuery('Player');
    q.startsWith('name', 'Play');
    expect(matchesQuery(player, q)).toBe(true);
    q.startsWith('name', 'Ploy');
    expect(matchesQuery(player, q)).toBe(false);

    q = new ParseQuery('Player');
    q.endsWith('name', ' 1');
    expect(matchesQuery(player, q)).toBe(true);
    q.endsWith('name', ' 2');
    expect(matchesQuery(player, q)).toBe(false);

    // Check that special characters are escaped
    player.set('name', 'Android-7');
    q = new ParseQuery('Player');
    q.contains('name', 'd-7');
    expect(matchesQuery(player, q)).toBe(true);

    q = new ParseQuery('Player');
    q.matches('name', /A.d/);
    expect(matchesQuery(player, q)).toBe(true);

    q.matches('name', /A[^n]d/);
    expect(matchesQuery(player, q)).toBe(false);

    // Check that the string \\E is returned to normal
    player.set('name', 'Slash \\E');
    q = new ParseQuery('Player');
    q.endsWith('name', 'h \\E');
    expect(matchesQuery(player, q)).toBe(true);

    q.endsWith('name', 'h \\Ee');
    expect(matchesQuery(player, q)).toBe(false);

    player.set('name', 'Slash \\Q and more');
    q = new ParseQuery('Player');
    q.contains('name', 'h \\Q and');
    expect(matchesQuery(player, q)).toBe(true);
    q.contains('name', 'h \\Q or');
    expect(matchesQuery(player, q)).toBe(false);
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

    expect(matchesQuery(pt, q)).toBe(true);
    expect(matchesQuery(ptUndefined, q)).toBe(false);
    expect(matchesQuery(ptNull, q)).toBe(false);

    q = new ParseQuery('Checkin');
    pt.set('location', new ParseGeoPoint(40, 40));

    q.withinRadians('location', new ParseGeoPoint(30, 30), 0.3);
    expect(matchesQuery(pt, q)).toBe(true);

    q.withinRadians('location', new ParseGeoPoint(30, 30), 0.2);
    expect(matchesQuery(pt, q)).toBe(false);
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

    expect(matchesQuery(caltrainStation, q)).toBe(true);
    expect(matchesQuery(santaClara, q)).toBe(false);
    expect(matchesQuery(noLocation, q)).toBe(false);
    expect(matchesQuery(nullLocation, q)).toBe(false);
    // Invalid rectangles
    q = new ParseQuery('Checkin').withinGeoBox(
      'location',
      new ParseGeoPoint(37.822802, -122.373962),
      new ParseGeoPoint(37.708813, -122.526398),
    );

    expect(matchesQuery(caltrainStation, q)).toBe(false);
    expect(matchesQuery(santaClara, q)).toBe(false);

    q = new ParseQuery('Checkin').withinGeoBox(
      'location',
      new ParseGeoPoint(37.708813, -122.373962),
      new ParseGeoPoint(37.822802, -122.526398),
    );

    expect(matchesQuery(caltrainStation, q)).toBe(false);
    expect(matchesQuery(santaClara, q)).toBe(false);
  });

  it('matches on subobjects with dot notation', () => {
    const message = new ParseObject('Message');
    message
      .set('test', 'content')
      .set('status', { x: 'read', y: 'delivered' });

    let q = new ParseQuery('Message');
    q.equalTo('status.x', 'read');
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.equalTo('status.z', 'read');
    expect(matchesQuery(message, q)).toBe(false);

    q = new ParseQuery('Message');
    q.equalTo('status.x', 'delivered');
    expect(matchesQuery(message, q)).toBe(false);

    q = new ParseQuery('Message');
    q.notEqualTo('status.x', 'read');
    expect(matchesQuery(message, q)).toBe(false);

    q = new ParseQuery('Message');
    q.notEqualTo('status.z', 'read');
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.notEqualTo('status.x', 'delivered');
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.exists('status.x');
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.exists('status.z');
    expect(matchesQuery(message, q)).toBe(false);

    q = new ParseQuery('Message');
    q.exists('nonexistent.x');
    expect(matchesQuery(message, q)).toBe(false);

    q = new ParseQuery('Message');
    q.doesNotExist('status.x');
    expect(matchesQuery(message, q)).toBe(false);

    q = new ParseQuery('Message');
    q.doesNotExist('status.z');
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.doesNotExist('nonexistent.z');
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.equalTo('status.x', 'read');
    q.doesNotExist('status.y');
    expect(matchesQuery(message, q)).toBe(false);
  });

  it('should support containedIn with pointers', () => {
    const profile = new ParseObject('Profile');
    profile.id = 'abc';
    const message = new ParseObject('Message');
    message.set('profile', profile);

    let q = new ParseQuery('Message');
    q.containedIn('profile', [ParseObject.fromJSON({ className: 'Profile', objectId: 'abc' }),
      ParseObject.fromJSON({ className: 'Profile', objectId: 'def' })]);
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.containedIn('profile', [ParseObject.fromJSON({ className: 'Profile', objectId: 'ghi' }),
      ParseObject.fromJSON({ className: 'Profile', objectId: 'def' })]);
    expect(matchesQuery(message, q)).toBe(false);
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
    expect(matchesQuery(message, q)).toBe(true);

    profile.id = 'def';
    message = new ParseObject('Message');
    message.set('profile', profile);
    q = new ParseQuery('Message');
    q.notContainedIn('profile', [ParseObject.fromJSON({ className: 'Profile', objectId: 'ghi' }),
      ParseObject.fromJSON({ className: 'Profile', objectId: 'def' })]);
    expect(matchesQuery(message, q)).toBe(false);
  });

  it('should support containedIn queries with [objectId]', () => {
    const profile = new ParseObject('Profile');
    profile.id = 'abc';
    let message = new ParseObject('Message');
    message.set('profile', profile);

    let q = new ParseQuery('Message');
    q.containedIn('profile', ['abc', 'def']);
    expect(matchesQuery(message, q)).toBe(true);

    profile.id = 'ghi';
    message = new ParseObject('Message');
    message.set('profile', profile);

    q = new ParseQuery('Message');
    q.containedIn('profile', ['abc', 'def']);
    expect(matchesQuery(message, q)).toBe(false);
  });

  it('should support notContainedIn queries with [objectId]', () => {
    const profile = new ParseObject('Profile');
    profile.id = 'ghi';
    const message = new ParseObject('Message');
    message.set('profile', profile);

    let q = new ParseQuery('Message');
    q.notContainedIn('profile', ['abc', 'def']);
    expect(matchesQuery(message, q)).toBe(true);

    q = new ParseQuery('Message');
    q.notContainedIn('profile', ['abc', 'def', 'ghi']);
    expect(matchesQuery(message, q)).toBe(false);
  });
});
