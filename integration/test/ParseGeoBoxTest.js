'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

describe('Geo Box', () => {
  before(() => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
  });

  beforeEach((done) => {
    clear().then(() => {
      done();
    });
  });

  it('can query geo boxes', () => {
    let caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    let caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    let santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    let santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    let southwestOfSF = new Parse.GeoPoint(37.708813, -122.526398);
    let northeastOfSF = new Parse.GeoPoint(37.822802, -122.373962);

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      let query = new Parse.Query('Location');
      query.withinGeoBox('location', southwestOfSF, northeastOfSF);
      return query.find();
    }).then((objectsInSF) => {
      assert.equal(objectsInSF, 1);
      assert.equal(objectsInSF[0].get('name'), 'caltrain');
      done();
    });
  });

  it('can swap geo box corners', () => {
    let caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    let caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    let santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    let santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    let southwestOfSF = new Parse.GeoPoint(37.708813, -122.526398);
    let northeastOfSF = new Parse.GeoPoint(37.822802, -122.373962);

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      let query = new Parse.Query('Location');
      query.withinGeoBox('location', northeastOfSF, southwestOfSF);
      return query.find();
    }).fail(() => {
      // Query should fail for crossing the date line
      done();
    });
  });

  it('can swap longitude', () => {
    let caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    let caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    let santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    let santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    let northwestOfSF = new Parse.GeoPoint(37.822802, -122.526398);
    let southeastOfSF = new Parse.GeoPoint(37.708813, -122.373962);

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      let query = new Parse.Query('Location');
      query.withinGeoBox('location', southwestOfSF, northeastOfSF);
      return query.find();
    }).then((objectsInSF) => {
      assert.equal(objectsInSF, 1);
      assert.equal(objectsInSF[0].get('name'), 'caltrain');
      done();
    });
  });

  it('can swap latitude', () => {
    let caltrainStationLocation = new Parse.GeoPoint(37.776346, -122.394218);
    let caltrainStation = new Parse.Object('Location');
    caltrainStation.set('location', caltrainStationLocation);
    caltrainStation.set('name', 'caltrain');

    let santaClaraLocation = new Parse.GeoPoint(37.325635, -121.945753);
    let santaClara = new Parse.Object('Location');
    santaClara.set('location', santaClaraLocation);
    santaClara.set('name', 'santa clara');

    let northwestOfSF = new Parse.GeoPoint(37.822802, -122.526398);
    let southeastOfSF = new Parse.GeoPoint(37.708813, -122.373962);

    Parse.Object.saveAll([caltrainStation, santaClara]).then(() => {
      let query = new Parse.Query('Location');
      query.withinGeoBox('location', southwestOfSF, northeastOfSF);
      return query.find();
    }).then((objectsInSF) => {
      assert.equal(objectsInSF, 1);
      assert.equal(objectsInSF[0].get('name'), 'caltrain');
      done();
    });
  });
});