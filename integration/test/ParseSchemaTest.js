const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

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
