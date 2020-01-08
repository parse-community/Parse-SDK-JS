/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();
const mockObject = function(className, id) {
  this.className = className;
  this.id = id;
  this.attributes = {};
  this.toPointer = function() {
    return {
      className: this.className,
      __type: 'Pointer',
      objectId: this.id,
    }
  };
};
jest.setMock('../ParseObject', mockObject);

const ParseObject = require('../ParseObject');
const ParseSchema = require('../ParseSchema').default;
const CoreManager = require('../CoreManager');

const defaultController = CoreManager.getSchemaController();

describe('ParseSchema', () => {
  it('can create schema', (done) => {
    const schema = new ParseSchema('SchemaTest');
    expect(schema.className).toEqual('SchemaTest');
    done();
  });

  it('can create schema with User Class', (done) => {
    const schema = new ParseSchema('User');
    expect(schema.className).toEqual('_User');
    done();
  });

  it('cannot use schema without class', (done) => {
    try {
      const schema = new ParseSchema();
      schema.assertClassName();
    } catch (e) {
      done();
    }
  });

  it('can create schema fields', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema
      .addField('defaultFieldString')
      .addString('stringField')
      .addNumber('numberField')
      .addBoolean('booleanField')
      .addDate('dateField')
      .addFile('fileField')
      .addGeoPoint('geoPointField')
      .addPolygon('polygonField')
      .addArray('arrayField')
      .addObject('objectField')
      .addPointer('pointerField', '_User')
      .addRelation('relationField', '_User');

    expect(schema._fields.defaultFieldString.type).toEqual('String');
    expect(schema._fields.stringField.type).toEqual('String');
    expect(schema._fields.numberField.type).toEqual('Number');
    expect(schema._fields.booleanField.type).toEqual('Boolean');
    expect(schema._fields.dateField.type).toEqual('Date');
    expect(schema._fields.fileField.type).toEqual('File');
    expect(schema._fields.geoPointField.type).toEqual('GeoPoint');
    expect(schema._fields.polygonField.type).toEqual('Polygon');
    expect(schema._fields.arrayField.type).toEqual('Array');
    expect(schema._fields.objectField.type).toEqual('Object');
    expect(schema._fields.pointerField.type).toEqual('Pointer');
    expect(schema._fields.relationField.type).toEqual('Relation');
    expect(schema._fields.pointerField.targetClass).toEqual('_User');
    expect(schema._fields.relationField.targetClass).toEqual('_User');
    done();
  });

  it('can create schema fields required and default values', () => {
    const object = new ParseObject('TestObject', '1234');
    const schema = new ParseSchema('SchemaTest');
    schema
      .addField('defaultFieldString', 'String', { required: true, defaultValue: 'hello' })
      .addDate('dateField', { required: true, defaultValue: '2000-01-01T00:00:00.000Z' })
      .addPointer('pointerField', 'TestObject', { required: true, defaultValue: object })
      .addPointer('pointerJSONField', 'TestObject', { required: true, defaultValue: object.toPointer() });

    expect(schema._fields.defaultFieldString.type).toEqual('String');
    expect(schema._fields.defaultFieldString.required).toEqual(true);
    expect(schema._fields.defaultFieldString.defaultValue).toEqual('hello');
    expect(schema._fields.pointerField.type).toEqual('Pointer');
    expect(schema._fields.pointerField.targetClass).toEqual('TestObject');
    expect(schema._fields.pointerField.required).toEqual(true);
    expect(schema._fields.pointerField.defaultValue).toEqual(object.toPointer());
    expect(schema._fields.dateField).toEqual({
      type: 'Date',
      required: true,
      defaultValue: { __type: 'Date', iso: new Date('2000-01-01T00:00:00.000Z') }
    });
  });

  it('can create schema indexes', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.addIndex('testIndex', { name: 1 });

    expect(schema._indexes.testIndex.name).toBe(1);
    done();
  });

  it('can set schema class level permissions', (done) => {
    const schema = new ParseSchema('SchemaTest');
    expect(schema._clp).toBeUndefined();
    schema.setCLP(undefined);
    expect(schema._clp).toBeUndefined();
    schema.setCLP({});
    expect(schema._clp).toEqual({});
    const clp = {
      get: { requiresAuthentication: true },
      find: {},
      count: {},
      create: { '*': true },
      update: { requiresAuthentication: true },
      delete: {},
      addField: {},
      protectedFields: {}
    };
    schema.setCLP(clp);
    expect(schema._clp).toEqual(clp);
    done();
  });

  it('cannot add field with null name', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addField(null, 'string');
    } catch (e) {
      done();
    }
  });

  it('cannot add field with invalid type', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addField('testField', 'unknown');
    } catch (e) {
      done();
    }
  });

  it('cannot add index with null name', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addIndex(null, {'name': 1});
    } catch (e) {
      done();
    }
  });

  it('cannot add index with null index', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addIndex('testIndex', null);
    } catch (e) {
      done();
    }
  });

  it('cannot add pointer with null name', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addPointer(null, 'targetClass');
    } catch (e) {
      done();
    }
  });

  it('cannot add pointer with null targetClass', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addPointer('pointerField', null);
    } catch (e) {
      done();
    }
  });

  it('cannot add relation with null name', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addRelation(null, 'targetClass');
    } catch (e) {
      done();
    }
  });

  it('cannot add relation with null targetClass', (done) => {
    try {
      const schema = new ParseSchema('SchemaTest');
      schema.addRelation('relationField', null);
    } catch (e) {
      done();
    }
  });

  it('can delete schema field', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.deleteField('testField');
    expect(schema._fields.testField).toEqual({ __op: 'Delete'});
    done();
  });

  it('can delete schema index', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.deleteIndex('testIndex');
    expect(schema._indexes.testIndex).toEqual({ __op: 'Delete'});
    done();
  });

  it('can save schema', (done) => {
    CoreManager.setSchemaController({
      send() {},
      get() {},
      update() {},
      delete() {},
      purge() {},
      create(className, params) {
        expect(className).toBe('SchemaTest');
        expect(params).toEqual({
          className: 'SchemaTest',
          fields: { name: { type: 'String'} },
          indexes: { testIndex: { name: 1 } }
        });
        return Promise.resolve([]);
      },
    });

    const schema = new ParseSchema('SchemaTest');
    schema.addField('name');
    schema.addIndex('testIndex', {'name': 1});
    schema.save().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('can update schema', (done) => {
    CoreManager.setSchemaController({
      send() {},
      get() {},
      create() {},
      delete() {},
      purge() {},
      update(className, params) {
        expect(className).toBe('SchemaTest');
        expect(params).toEqual({
          className: 'SchemaTest',
          fields: { name: { type: 'String'} },
          indexes: { testIndex: { name: 1 } }
        });
        return Promise.resolve([]);
      },
    });

    const schema = new ParseSchema('SchemaTest');
    schema.addField('name');
    schema.addIndex('testIndex', {'name': 1});
    schema.update().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('can delete schema', (done) => {
    CoreManager.setSchemaController({
      send() {},
      create() {},
      update() {},
      get() {},
      purge() {},
      delete(className) {
        expect(className).toBe('SchemaTest');
        return Promise.resolve([]);
      },
    });

    const schema = new ParseSchema('SchemaTest');
    schema.delete().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('can purge schema', (done) => {
    CoreManager.setSchemaController({
      send() {},
      create() {},
      update() {},
      get() {},
      delete() {},
      purge(className) {
        expect(className).toBe('SchemaTest');
        return Promise.resolve([]);
      },
    });

    const schema = new ParseSchema('SchemaTest');
    schema.purge().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('can get schema', (done) => {
    CoreManager.setSchemaController({
      send() {},
      create() {},
      update() {},
      delete() {},
      purge() {},
      get(className) {
        expect(className).toBe('SchemaTest');
        return Promise.resolve([]);
      },
    });

    const schema = new ParseSchema('SchemaTest');
    schema.get().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('cannot get empty schema', (done) => {
    CoreManager.setSchemaController({
      send() {},
      create() {},
      update() {},
      delete() {},
      purge() {},
      get(className) {
        expect(className).toBe('SchemaTest');
        return Promise.resolve(null);
      },
    });

    const schema = new ParseSchema('SchemaTest');
    schema.get().then(() => {
      // Should never reach
      expect(true).toBe(false);
      done();
    }, (error) => {
      expect(error.message).toBe('Schema not found.');
      done();
    });
  });

  it('can get all schema', (done) => {
    CoreManager.setSchemaController({
      send() {},
      create() {},
      update() {},
      delete() {},
      purge() {},
      get(className) {
        expect(className).toBe('');
        return Promise.resolve({
          results: ['all']
        });
      },
    });

    ParseSchema.all().then((results) => {
      expect(results[0]).toEqual('all');
      done();
    });
  });

  it('cannot get all schema when empty', (done) => {
    CoreManager.setSchemaController({
      send() {},
      create() {},
      update() {},
      delete() {},
      purge() {},
      get(className) {
        expect(className).toBe('');
        return Promise.resolve({
          results: []
        });
      },
    });

    ParseSchema.all().then(() => {
      // Should never reach
      expect(true).toBe(false);
      done();
    }, (error) => {
      expect(error.message).toBe('Schema not found.');
      done();
    });
  });
});

describe('SchemaController', () => {
  beforeEach(() => {
    CoreManager.setSchemaController(defaultController);
    const request = function() {
      return Promise.resolve([]);
    };
    const ajax = function() {
      return Promise.resolve([]);
    };
    CoreManager.setRESTController({ request: request, ajax: ajax });
  });

  it('save schema', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.save().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('get schema', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.get().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('update schema', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.update().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('delete schema', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.delete().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('purge schema', (done) => {
    const schema = new ParseSchema('SchemaTest');
    schema.purge().then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });
});
