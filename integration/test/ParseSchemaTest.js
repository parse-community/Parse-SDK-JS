const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const emptyCLPS = {
  find: {},
  count: {},
  get: {},
  create: {},
  update: {},
  delete: {},
  addField: {},
  protectedFields: {},
};

const defaultCLPS = {
  find: { '*': true },
  count: { '*': true },
  get: { '*': true },
  create: { '*': true },
  update: { '*': true },
  delete: { '*': true },
  addField: { '*': true },
  protectedFields: { '*': [] },
};

const TestObject = Parse.Object.extend('TestObject');

describe('Schema', () => {
  beforeAll(() => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.CoreManager.set('MASTER_KEY', 'notsosecret');
    Parse.Storage._clear();
  });

  beforeEach((done) => {
    clear().then(done);
  });

  it('invalid get all no schema', (done) => {
    Parse.Schema.all().then(() => {}).catch(() => {
      done();
    });
  });

  it('invalid get no schema', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.get().then(() => {}).catch(() => {
      done();
    });
  });

  it('save', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.save().then((result) => {
      assert.equal(result.className, 'SchemaTest');
      done();
    });
  });

  it('get', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema
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

    testSchema.save().then(() => {
      return testSchema.get();
    }).then((result) => {
      assert.equal(result.fields.defaultFieldString.type, 'String');
      assert.equal(result.fields.stringField.type, 'String');
      assert.equal(result.fields.numberField.type, 'Number');
      assert.equal(result.fields.booleanField.type, 'Boolean');
      assert.equal(result.fields.dateField.type, 'Date');
      assert.equal(result.fields.fileField.type, 'File');
      assert.equal(result.fields.geoPointField.type, 'GeoPoint');
      assert.equal(result.fields.polygonField.type, 'Polygon');
      assert.equal(result.fields.arrayField.type, 'Array');
      assert.equal(result.fields.objectField.type, 'Object');
      assert.equal(result.fields.pointerField.type, 'Pointer');
      assert.equal(result.fields.relationField.type, 'Relation');
      assert.equal(result.fields.pointerField.targetClass, '_User');
      assert.equal(result.fields.relationField.targetClass, '_User');
      done();
    });
  });

  it('all', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.save().then(() => {
      return Parse.Schema.all();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('save required and default values', async () => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.addField('fieldString', 'String', { required: true, defaultValue: 'Hello World' });
    const schema = await testSchema.save();
    assert.deepEqual(schema.fields.fieldString, {
      type: 'String', required: true, defaultValue: 'Hello World'
    })
    const object = new Parse.Object('SchemaTest');
    await object.save();
    assert.equal(object.get('fieldString'), 'Hello World');
  });

  it('save required and default pointer values', async () => {
    const pointer = new TestObject();
    await pointer.save();
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema
      .addPointer('pointerField', 'TestObject', { required: true, defaultValue: pointer })
      .addPointer('pointerJSONField', 'TestObject', { required: true, defaultValue: pointer.toPointer() })
    const schema = await testSchema.save();
    assert.deepEqual(schema.fields.pointerField, schema.fields.pointerJSONField);
    assert.deepEqual(schema.fields.pointerField.defaultValue, pointer.toPointer());
    assert.equal(schema.fields.pointerField.required, true);
  });

  it('set multiple required and default values', async () => {
    const point = new Parse.GeoPoint(44.0, -11.0);
    const polygon = new Parse.Polygon([[0,0], [0,1], [1,1], [1,0]]);
    const file = new Parse.File('parse-server-logo', { base64: 'ParseA==' });
    await file.save();
    const testSchema = new Parse.Schema('SchemaFieldTest');

    testSchema
      .addField('defaultFieldString', 'String', { required: true, defaultValue: 'hello' })
      .addString('stringField', { required: true, defaultValue: 'world' })
      .addNumber('numberField', { required: true, defaultValue: 10 })
      .addBoolean('booleanField', { required: true, defaultValue: false })
      .addDate('dateField', { required: true, defaultValue: new Date('2000-01-01T00:00:00.000Z') })
      .addDate('dateStringField', { required: true, defaultValue: '2000-01-01T00:00:00.000Z' })
      .addFile('fileField', { required: true, defaultValue: file })
      .addGeoPoint('geoPointField', { required: true, defaultValue: point })
      .addPolygon('polygonField', { required: true, defaultValue: polygon })
      .addArray('arrayField', { required: true, defaultValue: [1, 2, 3] })
      .addObject('objectField', { required: true, defaultValue: { foo: 'bar' } })

    const schema = await testSchema.save();
    assert.deepEqual(schema.fields, {
      objectId: { type: 'String' },
      updatedAt: { type: 'Date' },
      createdAt: { type: 'Date' },
      defaultFieldString: { type: 'String', required: true, defaultValue: 'hello' },
      stringField: { type: 'String', required: true, defaultValue: 'world' },
      numberField: { type: 'Number', required: true, defaultValue: 10 },
      booleanField: { type: 'Boolean', required: true, defaultValue: false },
      dateField: { type: 'Date', required: true, defaultValue: { __type: 'Date', iso: '2000-01-01T00:00:00.000Z' } },
      dateStringField: { type: 'Date', required: true, defaultValue: { __type: 'Date', iso: '2000-01-01T00:00:00.000Z' } },
      fileField: { type: 'File', required: true, defaultValue: file.toJSON() },
      geoPointField: { type: 'GeoPoint', required: true, defaultValue: point.toJSON() },
      polygonField: { type: 'Polygon', required: true, defaultValue: polygon.toJSON() },
      arrayField: { type: 'Array', required: true, defaultValue: [1, 2, 3] },
      objectField: { type: 'Object', required: true, defaultValue: { foo: 'bar' } },
      ACL: { type: 'ACL' }
    });
    const object = new Parse.Object('SchemaFieldTest');
    await object.save();
    const json = object.toJSON();
    delete json.createdAt;
    delete json.updatedAt;
    delete json.objectId;

    const expected = {
      defaultFieldString: 'hello',
      stringField: 'world',
      numberField: 10,
      booleanField: false,
      dateField: { __type: 'Date', iso: '2000-01-01T00:00:00.000Z' },
      dateStringField: { __type: 'Date', iso: '2000-01-01T00:00:00.000Z' },
      fileField: file.toJSON(),
      geoPointField: point.toJSON(),
      polygonField: {
        __type: 'Polygon',
        coordinates: [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ] ]
      },
      arrayField: [ 1, 2, 3 ],
      objectField: { foo: 'bar' },
    };
    assert.deepEqual(json, expected);
  });

  it('save class level permissions', async () => {
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
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.setCLP(clp);
    const schema = await testSchema.save();
    assert.deepEqual(schema.classLevelPermissions, clp);
  });

  it('update class level permissions', async () => {
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
    const testSchema = new Parse.Schema('SchemaTest');
    let schema = await testSchema.save();
    assert.deepEqual(schema.classLevelPermissions, defaultCLPS);

    testSchema.setCLP(1234);
    schema = await testSchema.update();
    assert.deepEqual(schema.classLevelPermissions, emptyCLPS);

    testSchema.setCLP(clp);
    schema = await testSchema.update();
    assert.deepEqual(schema.classLevelPermissions, clp);

    testSchema.setCLP({});
    schema = await testSchema.update();
    assert.deepEqual(schema.classLevelPermissions, emptyCLPS);
  });

  it('update class level permissions multiple', async () => {
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
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.setCLP(clp);
    let schema = await testSchema.save();
    assert.deepEqual(schema.classLevelPermissions, clp);

    schema = await testSchema.update();
    assert.deepEqual(schema.classLevelPermissions, clp);

    schema = await testSchema.update();
    assert.deepEqual(schema.classLevelPermissions, clp);
  });

  it('update', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.addString('name');
    testSchema.save().then(() => {
      testSchema.deleteField('name');
      testSchema.addNumber('quantity');
      testSchema.addBoolean('status');
      return testSchema.update();
    }).then((result) => {
      assert.equal(result.fields.status.type, 'Boolean');
      assert.equal(result.fields.quantity.type, 'Number');
      assert.equal(result.fields.name, undefined);
      done();
    });
  });

  it('multiple update', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.save().then(() => {
      testSchema.addString('name');
      return testSchema.update();
    }).then(() => {
      return testSchema.update();
    }).then(() => {
      return testSchema.get();
    }).then((result) => {
      assert.equal(Object.keys(result.fields).length, 5);
      done();
    });
  });

  it('delete', (done) => {
    const testSchema1 = new Parse.Schema('SchemaTest1');
    const testSchema2 = new Parse.Schema('SchemaTest2');
    testSchema1.save().then(() => {
      return testSchema2.save();
    }).then(() => {
      return Parse.Schema.all();
    }).then((results) => {
      assert.equal(results.length, 2);
      return testSchema1.delete();
    }).then(() => {
      return Parse.Schema.all();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0].className, 'SchemaTest2');
      done();
    });
  });

  it('purge', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    const obj = new Parse.Object('SchemaTest');
    obj.save().then(() => {
      return testSchema.delete().then(() => {
        // Should never reach here
        assert.equal(true, false);
      }).catch((error) => {
        assert.equal(error.code, Parse.Error.INVALID_SCHEMA_OPERATION);
        assert.equal(error.message, 'Class SchemaTest is not empty, contains 1 objects, cannot drop schema.');
        return Promise.resolve();
      });
    }).then(() => {
      return testSchema.purge();
    }).then(() => {
      const query = new Parse.Query('SchemaTest');
      return query.count();
    }).then((count) => {
      assert.equal(count, 0);
      // Delete only works on empty schema, extra check
      return testSchema.delete();
    }).then(() => {
      done();
    });
  });

  it('save index', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    const index = {
      name: 1
    };
    testSchema.addString('name');
    testSchema.addIndex('test_index', index);
    testSchema.save().then((result) => {
      assert.notEqual(result.indexes.test_index, undefined);
      done();
    });
  });

  it('update index', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.save().then(() => {
      const index = {
        name: 1
      };
      testSchema.addString('name');
      testSchema.addIndex('test_index', index);
      return testSchema.update();
    }).then((result) => {
      assert.notEqual(result.indexes.test_index, undefined);
      done();
    });
  });

  it('delete index', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    testSchema.save().then(() => {
      const index = {
        name: 1
      };
      testSchema.addString('name');
      testSchema.addIndex('test_index', index);
      return testSchema.update();
    }).then((result) => {
      assert.notEqual(result.indexes.test_index, undefined);
      testSchema.deleteIndex('test_index');
      return testSchema.update();
    }).then((result) => {
      assert.equal(result.indexes.test_index, undefined);
      done();
    });
  });

  it('invalid field name', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addField(null);
    } catch (e) {
      done();
    }
  });

  it('invalid field type', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addField('name', 'UnknownType');
    } catch (e) {
      done();
    }
  });

  it('invalid index name', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addIndex(null);
    } catch (e) {
      done();
    }
  });

  it('invalid index', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addIndex('name', null);
    } catch (e) {
      done();
    }
  });

  it('invalid pointer name', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addPointer(null);
    } catch (e) {
      done();
    }
  });

  it('invalid pointer class', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addPointer('name', null);
    } catch (e) {
      done();
    }
  });

  it('invalid relation name', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addRelation(null);
    } catch (e) {
      done();
    }
  });

  it('invalid relation class', (done) => {
    const testSchema = new Parse.Schema('SchemaTest');
    try {
      testSchema.addRelation('name', null);
    } catch (e) {
      done();
    }
  });

  it('assert class name', (done) => {
    const testSchema = new Parse.Schema();
    try {
      testSchema.assertClassName();
    } catch (e) {
      done();
    }
  });
});
