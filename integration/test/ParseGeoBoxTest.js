'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const southwestOfSF = new Parse.GeoPoint(37.708813, -122.526398);
const northeastOfSF = new Parse.GeoPoint(37.822802, -122.373962);

describe('Geo Box', () => {
  beforeAll(() => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
  });

  beforeEach((done) => {
    clear().then(done).catch(done);
  });

  it('can query geo boxes', (done) => {
    const caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    const caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    const santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    const santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      const query = new Parse.Query('Location');
      query.withinGeoBox('location', southwestOfSF, northeastOfSF);
      return query.find();
    }).then((objectsInSF) => {
      assert.equal(objectsInSF.length, 1);
      assert.equal(objectsInSF[0].get('name'), 'caltrain');
      done();
    }).catch(done.fail);
  });

  it('can swap geo box corners', (done) => {
    const caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    const caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    const santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    const santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    const southwestOfSF = new Parse.GeoPoint(37.708813, -122.526398);
    const northeastOfSF = new Parse.GeoPoint(37.822802, -122.373962);

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      const query = new Parse.Query('Location');
      query.withinGeoBox('location', northeastOfSF, southwestOfSF);
      return query.find();
    }).then((objectsInSF) => {
      assert.equal(objectsInSF.length, 1);
      assert.equal(objectsInSF[0].get('name'), 'caltrain');
      done();
    }).catch(done.fail);
  });

  it('can swap longitude', (done) => {
    const caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    const caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    const santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    const santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      const query = new Parse.Query('Location');
      query.withinGeoBox('location', southwestOfSF, northeastOfSF);
      return query.find();
    }).then((objectsInSF) => {
      assert.equal(objectsInSF.length, 1);
      assert.equal(objectsInSF[0].get('name'), 'caltrain');
      done();
    }).catch(done.fail);
  });

  it('can swap latitude', (done) => {
    const caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    const caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    const santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    const santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      const query = new Parse.Query('Location');
      query.withinGeoBox('location', southwestOfSF, northeastOfSF);
      return query.find();
    }).then((objectsInSF) => {
      assert.equal(objectsInSF.length, 1);
      assert.equal(objectsInSF[0].get('name'), 'caltrain');
      done();
    }).catch(done.fail);
  });
});
