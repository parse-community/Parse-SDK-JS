/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');
jest.dontMock('../encode');
jest.dontMock('../decode');
jest.dontMock('../ParseError');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParsePromise');
jest.dontMock('../ParseQuery');
jest.dontMock('../SingleInstanceStateController');
jest.dontMock('../UniqueInstanceStateController');
jest.dontMock('../ObjectStateMutations');

var mockObject = function(className) {
  this.className = className;
  this.attributes = {};
};
mockObject.registerSubclass = function() {};
mockObject.fromJSON = function(json) {
  var o = new mockObject(json.className);
  o.id = json.objectId;
  for (var attr in json) {
    if (attr !== 'className' && attr !== '__type' && attr !== 'objectId') {
      o.attributes[attr] = json[attr];
    }
  }
  return o;
};
jest.setMock('../ParseObject', mockObject);

var CoreManager = require('../CoreManager');
var ParseError = require('../ParseError').default;
var ParseGeoPoint = require('../ParseGeoPoint').default;
var ParseObject = require('../ParseObject');
var ParsePromise = require('../ParsePromise').default;
var ParseQuery = require('../ParseQuery').default;

describe('ParseQuery', () => {
  it('can be constructed from a class name', () => {
    var q = new ParseQuery('Item');
    expect(q.className).toBe('Item');
    expect(q.toJSON()).toEqual({
      where: {}
    });
  });

  it('can be constructed from a ParseObject', () => {
    var item = new ParseObject('Item');
    var q2 = new ParseQuery(item);
    expect(q2.className).toBe('Item');
    expect(q2.toJSON()).toEqual({
      where: {}
    });
  });

  it('throws when created with invalid data', () => {
    expect(function() {
      new ParseQuery();
    }).toThrow(
      'A ParseQuery must be constructed with a ParseObject or class name.'
    );
  });

  it('can generate equality queries', () => {
    var q = new ParseQuery('Item');
    q.equalTo('size', 'medium');
    expect(q.toJSON()).toEqual({
      where: {
        size: 'medium'
      }
    });

    // Overrides old constraint
    q.equalTo('size', 'small');
    expect(q.toJSON()).toEqual({
      where: {
        size: 'small'
      }
    });

    // equalTo('key', undefined) resolves to 'does not exist'
    q.equalTo('size');
    expect(q.toJSON()).toEqual({
      where: {
        size: {
          $exists: false
        }
      }
    });
  });

  it('can generate inequality queries', () => {
    var q = new ParseQuery('Item');
    q.notEqualTo('size', 'small');
    expect(q.toJSON()).toEqual({
      where: {
        size: {
          $ne: 'small'
        }
      }
    });

    q.notEqualTo('size', 'medium');
    expect(q.toJSON()).toEqual({
      where: {
        size: {
          $ne: 'medium'
        }
      }
    });
  });

  it('can generate less-than queries', () => {
    var q = new ParseQuery('Item');
    q.lessThan('inStock', 10);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $lt: 10
        }
      }
    });

    q.lessThan('inStock', 4);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $lt: 4
        }
      }
    });
  });

  it('can generate less-than-or-equal-to queries', () => {
    var q = new ParseQuery('Item');
    q.lessThanOrEqualTo('inStock', 10);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $lte: 10
        }
      }
    });

    q.lessThanOrEqualTo('inStock', 4);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $lte: 4
        }
      }
    });
  });

  it('can generate greater-than queries', () => {
    var q = new ParseQuery('Item');
    q.greaterThan('inStock', 0);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      }
    });

    q.greaterThan('inStock', 100);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 100
        }
      }
    });
  });

  it('can generate greater-than-or-equal-to queries', () => {
    var q = new ParseQuery('Item');
    q.greaterThanOrEqualTo('inStock', 0);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gte: 0
        }
      }
    });

    q.greaterThanOrEqualTo('inStock', 100);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gte: 100
        }
      }
    });
  });

  it('can generate contained-in queries', () => {
    var q = new ParseQuery('Item');
    q.containedIn('size', ['small', 'medium']);
    expect(q.toJSON()).toEqual({
      where: {
        size: {
          $in: ['small', 'medium']
        }
      }
    });

    q.containedIn('size', ['small', 'medium', 'large']);
    expect(q.toJSON()).toEqual({
      where: {
        size: {
          $in: ['small', 'medium', 'large']
        }
      }
    });
  });

  it('can generate not-contained-in queries', () => {
    var q = new ParseQuery('Item');
    q.notContainedIn('size', ['small', 'medium']);
    expect(q.toJSON()).toEqual({
      where: {
        size: {
          $nin: ['small', 'medium']
        }
      }
    });

    q.notContainedIn('size', ['small', 'large']);
    expect(q.toJSON()).toEqual({
      where: {
        size: {
          $nin: ['small', 'large']
        }
      }
    });
  });

  it('can generate contains-all queries', () => {
    var q = new ParseQuery('Item');
    q.containsAll('tags', ['hot', 'sold-out']);
    expect(q.toJSON()).toEqual({
      where: {
        tags: {
          $all: ['hot', 'sold-out']
        }
      }
    });

    q.containsAll('tags', ['sale', 'new']);
    expect(q.toJSON()).toEqual({
      where: {
        tags: {
          $all: ['sale', 'new']
        }
      }
    });
  });

  it('can generate contains-all-starting-with queries', () => {
    var q = new ParseQuery('Item');
    q.containsAllStartingWith('tags', ['ho', 'out']);
    expect(q.toJSON()).toEqual({
      where: {
        tags: {
          $all: [
            {$regex: '^\\Qho\\E'},
            {$regex: '^\\Qout\\E'}
          ]
        }
      }
    });

    q.containsAllStartingWith('tags', ['sal', 'ne']);
    expect(q.toJSON()).toEqual({
      where: {
        tags: {
          $all: [
            {$regex: '^\\Qsal\\E'},
            {$regex: '^\\Qne\\E'}
          ]
        }
      }
    });
  });

  it('can generate exists queries', () => {
    var q = new ParseQuery('Item');
    q.exists('name');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $exists: true
        }
      }
    });
  });

  it('can generate does-not-exist queries', () => {
    var q = new ParseQuery('Item');
    q.doesNotExist('name');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $exists: false
        }
      }
    });
  });

  it('can generate RegExp queries', () => {
    var q = new ParseQuery('Item');
    q.matches('name', /ing$/);
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: 'ing$'
        }
      }
    });

    q.matches('name', /\bor\b/, 'i');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\bor\\b',
          $options: 'i'
        }
      }
    });

    q.matches('name', /\bor\b/i);
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\bor\\b',
          $options: 'i'
        }
      }
    });

    q.matches('name', /\bor\b/im);
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\bor\\b',
          $options: 'im'
        }
      }
    });
  });

  it('can generate queries that match results from other queries', () => {
    var q1 = new ParseQuery('Item');
    q1.equalTo('inStock', 0);

    var q2 = new ParseQuery('Purchase');
    q2.matchesQuery('item', q1);
    expect(q2.toJSON()).toEqual({
      where: {
        item: {
          $inQuery: {
            className: 'Item',
            where: {
              inStock: 0
            }
          }
        }
      }
    });
  });

  it('can generate queries that don\'t match results from other queries', () => {
    var q1 = new ParseQuery('Item');
    q1.equalTo('inStock', 0);

    var q2 = new ParseQuery('Purchase');
    q2.doesNotMatchQuery('item', q1);
    expect(q2.toJSON()).toEqual({
      where: {
        item: {
          $notInQuery: {
            className: 'Item',
            where: {
              inStock: 0
            }
          }
        }
      }
    });
  });

  it('can generate queries that match keys from other queries', () => {
    var q1 = new ParseQuery('Item');
    q1.equalTo('inStock', 0);

    var q2 = new ParseQuery('Review');
    q2.matchesKeyInQuery('itemName', 'name', q1);
    expect(q2.toJSON()).toEqual({
      where: {
        itemName: {
          $select: {
            key: 'name',
            query: {
              className: 'Item',
              where: {
                inStock: 0
              }
            }
          }
        }
      }
    });
  });

  it('can generate queries that don\'t match keys from other queries', () => {
    var q1 = new ParseQuery('Item');
    q1.equalTo('inStock', 0);

    var q2 = new ParseQuery('Review');
    q2.doesNotMatchKeyInQuery('itemName', 'name', q1);
    expect(q2.toJSON()).toEqual({
      where: {
        itemName: {
          $dontSelect: {
            key: 'name',
            query: {
              className: 'Item',
              where: {
                inStock: 0
              }
            }
          }
        }
      }
    });
  });

  it('can generate string-contains queries', () => {
    var q = new ParseQuery('Item');
    expect(q.contains.bind(q, 'name', 12)).toThrow(
      'The value being searched for must be a string.'
    );

    q.contains('name', ' or ');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\Q or \\E'
        }
      }
    });

    // Test escaping in quote()
    q.contains('name', 'slash-E \\E');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\Qslash-E \\E\\\\E\\Q\\E'
        }
      }
    });

    q.contains('name', 'slash-Q \\Q');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\Qslash-Q \\Q\\E'
        }
      }
    });
  });

  it('can generate string-starts-with queries', () => {
    var q = new ParseQuery('Item');
    expect(q.startsWith.bind(q, 'name', 12)).toThrow(
      'The value being searched for must be a string.'
    );

    q.startsWith('name', 'Abc');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '^\\QAbc\\E'
        }
      }
    });

    q.startsWith('name', 'Def');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '^\\QDef\\E'
        }
      }
    });
  });

  it('can generate string-ends-with queries', () => {
    var q = new ParseQuery('Item');
    expect(q.endsWith.bind(q, 'name', 12)).toThrow(
      'The value being searched for must be a string.'
    );

    q.endsWith('name', 'XYZ');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\QXYZ\\E$'
        }
      }
    });

    q.endsWith('name', 'xyz');
    expect(q.toJSON()).toEqual({
      where: {
        name: {
          $regex: '\\Qxyz\\E$'
        }
      }
    });
  });

  it('can generate near-geopoint queries', () => {
    var q = new ParseQuery('Shipment');
    q.near('shippedTo', new ParseGeoPoint(10, 20));
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $nearSphere: {
            __type: 'GeoPoint',
            latitude: 10,
            longitude: 20
          }
        }
      }
    });

    q.near('shippedTo', [30, 40]);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $nearSphere: {
            __type: 'GeoPoint',
            latitude: 30,
            longitude: 40
          }
        }
      }
    });

    // GeoPoint's internal fallback
    q.near('shippedTo', 'string');
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $nearSphere: {
            __type: 'GeoPoint',
            latitude: 0,
            longitude: 0
          }
        }
      }
    });
  });

  it('can generate near-geopoint queries with ranges', () => {
    var q = new ParseQuery('Shipment');
    q.withinRadians('shippedTo', [20, 40], 2, true);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $nearSphere: {
            __type: 'GeoPoint',
            latitude: 20,
            longitude: 40
          },
          $maxDistance: 2
        }
      }
    });

    q.withinMiles('shippedTo', [20, 30], 3958.8, true);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $nearSphere: {
            __type: 'GeoPoint',
            latitude: 20,
            longitude: 30
          },
          $maxDistance: 1
        }
      }
    });

    q.withinKilometers('shippedTo', [30, 30], 6371.0, true);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $nearSphere: {
            __type: 'GeoPoint',
            latitude: 30,
            longitude: 30
          },
          $maxDistance: 1
        }
      }
    });
  });

  it('can generate near-geopoint queries without sorting', () => {
    var q = new ParseQuery('Shipment');
    q.withinRadians('shippedTo', new ParseGeoPoint(20, 40), 2, false);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $geoWithin: {
            $centerSphere: [
              [40, 20], // This takes [lng, lat] vs. ParseGeoPoint [lat, lng].
              2
            ]
          }
        }
      }
    });

    q.withinMiles('shippedTo', new ParseGeoPoint(20, 30), 3958.8, false);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $geoWithin: {
            $centerSphere: [
              [30, 20], // This takes [lng, lat] vs. ParseGeoPoint [lat, lng].
              1
            ]
          }
        }
      }
    });

    q.withinKilometers('shippedTo', new ParseGeoPoint(30, 30), 6371.0, false);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $geoWithin: {
            $centerSphere: [
              [30, 30], // This takes [lng, lat] vs. ParseGeoPoint [lat, lng].
              1
            ]
          }
        }
      }
    });
  });

  it('can generate geobox queries', () => {
    var q = new ParseQuery('Shipment');
    q.withinGeoBox('shippedTo', [20, 20], [10, 30]);
    expect(q.toJSON()).toEqual({
      where: {
        shippedTo: {
          $within: {
            $box: [{
              __type: 'GeoPoint',
              latitude: 20,
              longitude: 20
            }, {
              __type: 'GeoPoint',
              latitude: 10,
              longitude: 30
            }]
          }
        }
      }
    });
  });

  it('can combine multiple clauses', () => {
    var q = new ParseQuery('Item');
    q.lessThan('inStock', 10);
    q.greaterThan('inStock', 0);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $lt: 10,
          $gt: 0
        }
      }
    });

    q.containedIn('size', ['small', 'medium']);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $lt: 10,
          $gt: 0
        },
        size: {
          $in: ['small', 'medium']
        }
      }
    });
  });

  it('can specify ordering', () => {
    var q = new ParseQuery('Item');
    q.greaterThan('inStock', 0).ascending('createdAt');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: 'createdAt'
    });

    // overrides
    q.ascending('name');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: 'name'
    });

    q.ascending('name');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: 'name'
    });

    // removes whitespace
    q.ascending('  createdAt')
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: 'createdAt'
    });

    // add additional ordering
    q.addAscending('name');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: 'createdAt,name'
    });

    q.ascending(['a', 'b', 'c']);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: 'a,b,c'
    });

    q.ascending('name', 'createdAt');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: 'name,createdAt'
    });

    q.descending('createdAt');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: '-createdAt'
    });

    q.addAscending('name');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: '-createdAt,name'
    });

    q.addDescending('a', 'b', 'c');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: '-createdAt,name,-a,-b,-c'
    });

    q.descending(['a', 'b']);
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      order: '-a,-b'
    });
  });

  it('can establish skip counts', () => {
    var q = new ParseQuery('Item');
    expect(q.skip.bind(q, 'string')).toThrow(
      'You can only skip by a positive number'
    );
    expect(q.skip.bind(q, -5)).toThrow(
      'You can only skip by a positive number'
    );

    q.skip(4);
    expect(q.toJSON()).toEqual({
      where: {},
      skip: 4
    });
    q.equalTo('name', 'Product 5');
    expect(q.toJSON()).toEqual({
      where: {
        name: 'Product 5'
      },
      skip: 4
    });
  });

  it('can establish result limits', () => {
    var q = new ParseQuery('Item');
    expect(q.limit.bind(q, 'string')).toThrow(
      'You can only set the limit to a numeric value'
    );

    q.limit(10);
    expect(q.toJSON()).toEqual({
      where: {},
      limit: 10
    });
    q.limit(-1);
    expect(q.toJSON()).toEqual({
      where: {}
    });
  });

  it('can generate queries that include full data for pointers', () => {
    var q = new ParseQuery('Item');
    q.greaterThan('inStock', 0);
    q.include('manufacturer');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      include: 'manufacturer'
    });

    q.include('previousModel', 'nextModel');
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      include: 'manufacturer,previousModel,nextModel'
    });

    q.include(['lastPurchaser', 'lastPurchase'])
    expect(q.toJSON()).toEqual({
      where: {
        inStock: {
          $gt: 0
        }
      },
      include: 'manufacturer,previousModel,nextModel,lastPurchaser,lastPurchase'
    });
  });

  it('can specify certain fields to send back', () => {
    var q = new ParseQuery('Item');
    q.select('size');
    expect(q.toJSON()).toEqual({
      where: {},
      keys: 'size'
    });

    q.select('inStock', 'lastPurchase');
    expect(q.toJSON()).toEqual({
      where: {},
      keys: 'size,inStock,lastPurchase'
    });

    q.select(['weight', 'color'])
    expect(q.toJSON()).toEqual({
      where: {},
      keys: 'size,inStock,lastPurchase,weight,color'
    });
  });

  it('can combine queries with an OR clause', () => {
    var q = new ParseQuery('Item');
    var q2 = new ParseQuery('Purchase');
    expect(ParseQuery.or.bind(null, q, q2)).toThrow(
      'All queries must be for the same class.'
    );

    q2 = new ParseQuery('Item');
    q.equalTo('size', 'medium');
    q2.equalTo('size', 'large');

    var mediumOrLarge = ParseQuery.or(q, q2);
    expect(mediumOrLarge.toJSON()).toEqual({
      where: {
        $or: [
          { size: 'medium' },
          { size: 'large' }
        ]
      }
    });

    // It removes limits, skips, etc
    q.skip(10);
    mediumOrLarge = ParseQuery.or(q, q2);
    expect(mediumOrLarge.toJSON()).toEqual({
      where: {
        $or: [
          { size: 'medium' },
          { size: 'large' }
        ]
      }
    });
  });

  it('can combine queries with an AND clause', () => {
    var q = new ParseQuery('Item');
    var q2 = new ParseQuery('Purchase');
    expect(ParseQuery.and.bind(null, q, q2)).toThrow(
      'All queries must be for the same class.'
    );

    q2 = new ParseQuery('Item');
    q.equalTo('size', 'medium');
    q2.equalTo('size', 'large');

    var mediumOrLarge = ParseQuery.and(q, q2);
    expect(mediumOrLarge.toJSON()).toEqual({
      where: {
        $and: [
          { size: 'medium' },
          { size: 'large' }
        ]
      }
    });

    // It removes limits, skips, etc
    q.limit(10);
    mediumOrLarge = ParseQuery.and(q, q2);
    expect(mediumOrLarge.toJSON()).toEqual({
      where: {
        $and: [
          { size: 'medium' },
          { size: 'large' }
        ]
      }
    });
  });

  it('can get the first object of a query', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 1,
          where: {
            size: 'small'
          }
        });
        expect(options).toEqual({});
        return ParsePromise.as({
          results: [
            { objectId: 'I1', size: 'small', name: 'Product 3' }
          ]
        });
      }
    });

    var q = new ParseQuery('Item');
    q.equalTo('size', 'small').first().then((obj) => {
      expect(obj instanceof ParseObject).toBe(true);
      expect(obj.className).toBe('Item');
      expect(obj.id).toBe('I1');
      expect(obj.attributes).toEqual({
        size: 'small',
        name: 'Product 3'
      });
      done();
    });
  });

  it('can pass options to a first() query', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 1,
          where: {
            size: 'small'
          }
        });
        expect(options).toEqual({
          useMasterKey: true,
          sessionToken: '1234'
        });
        return ParsePromise.as({
          results: []
        });
      }
    });

    var q = new ParseQuery('Item');
    q.equalTo('size', 'small').first({
      useMasterKey: true,
      sessionToken: '1234'
    }).then((obj) => {
      expect(obj).toBe(undefined);
      done();
    });
  });

  it('can get a single object by id', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 1,
          where: {
            objectId: 'I27'
          }
        });
        expect(options).toEqual({});
        return ParsePromise.as({
          results: [
            { objectId: 'I27', size: 'large', name: 'Product 27' }
          ]
        });
      }
    });

    var q = new ParseQuery('Item');
    q.get('I27').then((obj) => {
      expect(obj instanceof ParseObject).toBe(true);
      expect(obj.className).toBe('Item');
      expect(obj.id).toBe('I27');
      expect(obj.attributes).toEqual({
        size: 'large',
        name: 'Product 27'
      });
      done();
    });
  });

  it('will error when getting a nonexistent object', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 1,
          where: {
            objectId: 'I28'
          }
        });
        expect(options).toEqual({});
        return ParsePromise.as({
          results: []
        });
      }
    });

    var q = new ParseQuery('Item');
    q.get('I28').then(() => {
      // Should not be reached
      expect(true).toBe(false);
      done();
    }, (err) => {
      expect(err.code).toBe(ParseError.OBJECT_NOT_FOUND);
      expect(err.message).toBe('Object not found.');
      done();
    });
  });

  it('can pass options to a get() query', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 1,
          where: {
            objectId: 'I27'
          }
        });
        expect(options).toEqual({
          useMasterKey: true,
          sessionToken: '1234'
        });
        return ParsePromise.as({
          results: [
            { objectId: 'I27', size: 'large', name: 'Product 27' }
          ]
        });
      }
    });

    var q = new ParseQuery('Item');
    q.get('I27', {
      useMasterKey: true,
      sessionToken: '1234'
    }).then((obj) => {
      done();
    });
  });

  it('can issue a count query', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 0,
          count: 1,
          where: {
            size: 'small'
          }
        });
        expect(options).toEqual({});
        return ParsePromise.as({
          results: [],
          count: 145
        });
      }
    });

    var q = new ParseQuery('Item');
    q.equalTo('size', 'small').count().then((count) => {
      expect(count).toBe(145);
      done();
    });
  });

  it('can pass options to a count query', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 0,
          count: 1,
          where: {
            size: 'small'
          }
        });
        expect(options).toEqual({
          useMasterKey: true,
          sessionToken: '1234'
        });
        return ParsePromise.as({
          results: [],
          count: 145
        });
      }
    });


    var q = new ParseQuery('Item');
    q.equalTo('size', 'small').count({
      useMasterKey: true,
      sessionToken: '1234'
    }).then((count) => {
      expect(count).toBe(145);
      done();
    });
  });

  it('can issue a query to the controller', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 2,
          skip: 8,
          keys: 'size,name',
          order: 'createdAt',
          where: {
            size: {
              $in: ['small', 'medium']
            }
          }
        });
        expect(options).toEqual({});
        return ParsePromise.as({
          results: [
            { objectId: 'I55', size: 'medium', name: 'Product 55' },
            { objectId: 'I89', size: 'small', name: 'Product 89' },
          ]
        });
      }
    });

    var q = new ParseQuery('Item');
    q.containedIn('size', ['small', 'medium'])
      .limit(2)
      .skip(8)
      .ascending('createdAt')
      .select('size', 'name')
      .find()
      .then((objs) => {
        expect(objs.length).toBe(2);
        expect(objs[0] instanceof ParseObject).toBe(true);
        expect(objs[0].attributes).toEqual({
          size: 'medium',
          name: 'Product 55'
        });
        expect(objs[1] instanceof ParseObject).toBe(true);
        expect(objs[1].attributes).toEqual({
          size: 'small',
          name: 'Product 89'
        });
        done();
      });
  });

  it('can pass options to find()', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          where: {
            size: {
              $in: ['small', 'medium']
            }
          }
        });
        expect(options).toEqual({
          useMasterKey: true,
          sessionToken: '1234'
        });
        return ParsePromise.as({
          results: []
        });
      }
    });

    var q = new ParseQuery('Item');
    q.containedIn('size', ['small', 'medium'])
      .find({
        useMasterKey: true,
        sessionToken: '1234'
      })
      .then((objs) => {
        expect(objs).toEqual([]);
        done();
      });
  });

  it('can iterate over results with each()', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 100,
          order: 'objectId',
          keys: 'size,name',
          where: {
            size: {
              $in: ['small', 'medium']
            },
            name: {
              $select: {
                key: 'productName',
                query: {
                  className: 'Review',
                  where: {
                    stars: 5
                  }
                }
              }
            },
            valid: true
          }
        });
        expect(options).toEqual({});
        return ParsePromise.as({
          results: [
            { objectId: 'I55', size: 'medium', name: 'Product 55' },
            { objectId: 'I89', size: 'small', name: 'Product 89' },
            { objectId: 'I91', size: 'small', name: 'Product 91' },
          ]
        });
      }
    });

    var q = new ParseQuery('Item');
    q.containedIn('size', ['small', 'medium']);
    q.matchesKeyInQuery(
      'name',
      'productName',
      new ParseQuery('Review').equalTo('stars', 5)
    );
    q.equalTo('valid', true);
    q.select('size', 'name');
    var calls = 0;

    q.each((o) => {
      calls++;
    }).then(() => {
      expect(calls).toBe(3);
      done();
    });
  });

  it('can pass options to each()', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          limit: 100,
          order: 'objectId',
          keys: 'size,name',
          where: {
            size: {
              $in: ['small', 'medium']
            },
            valid: true
          }
        });
        expect(options).toEqual({
          useMasterKey: true,
          sessionToken: '1234'
        });
        return ParsePromise.as({
          results: [
            { objectId: 'I55', size: 'medium', name: 'Product 55' },
            { objectId: 'I89', size: 'small', name: 'Product 89' },
            { objectId: 'I91', size: 'small', name: 'Product 91' },
          ]
        });
      }
    });

    var q = new ParseQuery('Item');
    q.containedIn('size', ['small', 'medium']);
    q.equalTo('valid', true);
    q.select('size', 'name');
    var calls = 0;

    q.each((o) => {
      calls++;
    }, {
      useMasterKey: true,
      sessionToken: '1234'
    }).then(() => {
      expect(calls).toBe(3);
      done();
    });
  });

  it('returns an error when iterating over an invalid query', (done) => {
    var q = new ParseQuery('Item');
    q.limit(10);
    q.each(() => {}).then(() => {
      // this should not be reached
      expect(true).toBe(false);
      done();
    }, (err) => {
      expect(err).toBe('Cannot iterate on a query with sort, skip, or limit.');
      done();
    });
  });

  it('rewrites User queries when the rewrite is enabled', () => {
    CoreManager.set('PERFORM_USER_REWRITE', true);
    var q = new ParseQuery('User');
    expect(q.className).toBe('_User');
    CoreManager.set('PERFORM_USER_REWRITE', false);
    q = new ParseQuery('User');
    expect(q.className).toBe('User');
  });

  it('does not override the className if it comes from the server', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [
            { className: 'Product', objectId: 'P40', name: 'Product 40' },
          ]
        });
      }
    });

    var q = new ParseQuery('Item');
    q.find().then((results) => {
      expect(results[0].className).toBe('Product');
      done();
    });
  });

  it('can override the className with a name from the server', (done) => {
    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [
            { objectId: 'P41', name: 'Product 41' },
          ],
          className: 'Product'
        });
      }
    });

    var q = new ParseQuery('Item');
    q.find().then((results) => {
      expect(results[0].className).toBe('Product');
      done();
    });
  });



  it('overrides cached object with query results', (done) => {
    jest.dontMock("../ParseObject");
    jest.resetModules();
    ParseObject = require('../ParseObject').default;
    CoreManager = require('../CoreManager');
    ParseQuery = require('../ParseQuery').default;

    ParseObject.enableSingleInstance();

    var objectToReturn = {
      objectId: 'T01',
      name: 'Name',
      other: 'other',
      className:"Thing",
      createdAt: '2017-01-10T10:00:00Z'
    };

    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [objectToReturn]
        });
      }
    });

    var q = new ParseQuery("Thing");
    var testObject;
    q.find().then((results) => {
      testObject = results[0];

      expect(testObject.get("name")).toBe("Name");
      expect(testObject.get("other")).toBe("other");

      objectToReturn = { objectId: 'T01', name: 'Name2'};
      var q2 = new ParseQuery("Thing");
      return q2.find();
    }).then((results) => {
      expect(results[0].get("name")).toBe("Name2");
      expect(results[0].has("other")).toBe(false);
    }).then(() => {
      expect(testObject.get("name")).toBe("Name2");
      expect(testObject.has("other")).toBe(false);
      done();
     });
  });

  it('does not override unselected fields with select query results', (done) => {
    jest.dontMock("../ParseObject");
    jest.resetModules();
    ParseObject = require('../ParseObject').default;
    CoreManager = require('../CoreManager');
    ParseQuery = require('../ParseQuery').default;

    ParseObject.enableSingleInstance();

    var objectToReturn = {
      objectId: 'T01',
      name: 'Name',
      other: 'other',
      tbd: 'exists',
      className:"Thing",
      createdAt: '2017-01-10T10:00:00Z',
      subObject: {key1:"value", key2:"value2", key3:"thisWillGoAway"}
    };

    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [objectToReturn]
        });
      }
    });

    var q = new ParseQuery("Thing");
    var testObject;
    return q.find().then((results) => {
      testObject = results[0];

      expect(testObject.get("name")).toBe("Name");
      expect(testObject.get("other")).toBe("other");
      expect(testObject.has("tbd")).toBe(true);
      expect(testObject.get("subObject").key1).toBe("value");
      expect(testObject.get("subObject").key2).toBe("value2");
      expect(testObject.get("subObject").key3).toBe("thisWillGoAway");

      var q2 = new ParseQuery("Thing");
      q2.select("other", "tbd", "subObject.key1", "subObject.key3");
      objectToReturn = { objectId: 'T01', other: 'other2', subObject:{key1:"updatedValue"}};
      return q2.find();
    }).then((results) => {
      expect(results[0].get("name")).toBe("Name");    //query didn't select this
      expect(results[0].get("other")).toBe("other2"); //query selected and updated this
      expect(results[0].has("tbd")).toBe(false);      //query selected this and it wasn't returned
      //sub-objects should work similarly
      expect(results[0].get("subObject").key1).toBe("updatedValue");
      expect(results[0].get("subObject").key2).toBe("value2");
      expect(results[0].get("subObject").key3).toBeUndefined();
    }).then(() => {
      expect(testObject.get("name")).toBe("Name");
      expect(testObject.get("other")).toBe("other2");
      expect(testObject.has("tbd")).toBe(false);
      expect(testObject.get("subObject").key1).toBe("updatedValue");
      expect(testObject.get("subObject").key2).toBe("value2");
      expect(testObject.get("subObject").key3).toBeUndefined();
      done();
    }, (error) => {
      done.fail(error);
    });
  });

  it('overrides cached object with first() results', (done) => {
    jest.dontMock("../ParseObject");
    jest.resetModules();
    ParseObject = require('../ParseObject').default;
    CoreManager = require('../CoreManager');
    ParseQuery = require('../ParseQuery').default;

    ParseObject.enableSingleInstance();

    var objectToReturn = {
      objectId: 'T01',
      name: 'Name',
      other: 'other',
      className:"Thing",
      createdAt: '2017-01-10T10:00:00Z'
    };

    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [objectToReturn]
        });
      }
    });

    var q = new ParseQuery("Thing");
    var testObject;
    q.first().then((result) => {
      testObject = result;

      expect(testObject.get("name")).toBe("Name");
      expect(testObject.get("other")).toBe("other");

      objectToReturn = { objectId: 'T01', name: 'Name2'};
      var q2 = new ParseQuery("Thing");
      return q2.first();
    }).then((result) => {
      expect(result.get("name")).toBe("Name2");
      expect(result.has("other")).toBe(false);
    }).then(() => {
      expect(testObject.get("name")).toBe("Name2");
      expect(testObject.has("other")).toBe(false);
      done();
     });
  });

  it('does not override unselected fields for first() on select query', (done) => {
    jest.dontMock("../ParseObject");
    jest.resetModules();
    ParseObject = require('../ParseObject').default;
    CoreManager = require('../CoreManager');
    ParseQuery = require('../ParseQuery').default;

    ParseObject.enableSingleInstance();

    var objectToReturn = {
      objectId: 'T01',
      name: 'Name',
      other: 'other',
      tbd: 'exists',
      className:"Thing",
      subObject: {key1:"value", key2:"value2", key3:"thisWillGoAway"},
      createdAt: '2017-01-10T10:00:00Z',
    };

    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [objectToReturn]
        });
      }
    });

    var q = new ParseQuery("Thing");
    var testObject;
    return q.first().then((result) => {
      testObject = result;

      expect(testObject.get("name")).toBe("Name");
      expect(testObject.get("other")).toBe("other");
      expect(testObject.has("tbd")).toBe(true);

      var q2 = new ParseQuery("Thing");
      q2.select("other", "tbd", "subObject.key1", "subObject.key3");
      objectToReturn = { objectId: 'T01', other: 'other2', subObject:{key1:"updatedValue"}};
      return q2.first();
    }).then((result) => {
      expect(result.get("name")).toBe("Name");    //query didn't select this
      expect(result.get("other")).toBe("other2"); //query selected and updated this
      expect(result.has("tbd")).toBe(false);      //query selected this and it wasn't returned
      //sub-objects should work similarly
      expect(result.get("subObject").key1).toBe("updatedValue");
      expect(result.get("subObject").key2).toBe("value2");
      expect(result.get("subObject").key3).toBeUndefined();
    }).then(() => {
      expect(testObject.get("name")).toBe("Name");
      expect(testObject.get("other")).toBe("other2");
      expect(testObject.has("tbd")).toBe(false);
      expect(testObject.get("subObject").key1).toBe("updatedValue");
      expect(testObject.get("subObject").key2).toBe("value2");
      expect(testObject.get("subObject").key3).toBeUndefined();
      done();
    }, (error) => {
      done.fail(error);
    });
  });

  it('restores queries from json representation', () => {
    const q = new ParseQuery('Item');

    q.include('manufacturer');
    q.select('inStock', 'lastPurchase');
    q.limit(10);
    q.ascending(['a', 'b', 'c']);
    q.skip(4);
    q.equalTo('size', 'medium');

    const json = q.toJSON();

    const newQuery = ParseQuery.fromJSON('Item', json);

    expect(newQuery.className).toBe('Item');

    expect(newQuery.toJSON()).toEqual({
      include: 'manufacturer',
      keys: 'inStock,lastPurchase',
      limit: 10,
      order: 'a,b,c',
      skip: 4,
      where: {
        size: 'medium'
      }
    });
  });

  it('can issue a distinct query', (done) => {
    CoreManager.setQueryController({
      find() {},
      aggregate(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          distinct: 'size',
          where: {
            size: 'small'
          }
        });
        expect(options).toEqual({ useMasterKey: true });
        return ParsePromise.as({
          results: ['L'],
        });
      }
    });

    var q = new ParseQuery('Item');
    q.equalTo('size', 'small').distinct('size').then((results) => {
      expect(results[0]).toBe('L');
      done();
    });
  });

  it('can pass options to a distinct query', (done) => {
    CoreManager.setQueryController({
      find() {},
      aggregate(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          distinct: 'size',
          where: {
            size: 'small'
          }
        });
        expect(options).toEqual({
          useMasterKey: true,
          sessionToken: '1234'
        });
        return ParsePromise.as({
          results: ['L']
        });
      }
    });


    var q = new ParseQuery('Item');
    q.equalTo('size', 'small').distinct('size', {
      sessionToken: '1234'
    }).then((results) => {
      expect(results[0]).toBe('L');
      done();
    });
  });

  it('can issue an aggregate query with array pipeline', (done) => {
    const pipeline = [
      { group: { objectId: '$name' } }
    ];
    CoreManager.setQueryController({
      find() {},
      aggregate(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          group: { objectId: '$name' }
        });
        expect(options).toEqual({ useMasterKey: true });
        return ParsePromise.as({
          results: [],
        });
      }
    });

    var q = new ParseQuery('Item');
    q.aggregate(pipeline).then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('can issue an aggregate query with object pipeline', (done) => {
    const pipeline = {
      group: { objectId: '$name' }
    };
    CoreManager.setQueryController({
      find() {},
      aggregate(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          group: { objectId: '$name' }
        });
        expect(options).toEqual({ useMasterKey: true });
        return ParsePromise.as({
          results: [],
        });
      }
    });

    var q = new ParseQuery('Item');
    q.aggregate(pipeline).then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('cannot issue an aggregate query with invalid pipeline', (done) => {
    const pipeline = 1234;
    CoreManager.setQueryController({
      find() {},
      aggregate(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          group: { objectId: '$name' }
        });
        expect(options).toEqual({ useMasterKey: true });
        return ParsePromise.as({
          results: [],
        });
      }
    });

    try {
      var q = new ParseQuery('Item');
      q.aggregate(pipeline).then(() => {});
    } catch (e) {
      done();
    }
  });

  it('can pass options to an aggregate query', (done) => {
    const pipeline = [
      { group: { objectId: '$name' } }
    ];
    CoreManager.setQueryController({
      find() {},
      aggregate(className, params, options) {
        expect(className).toBe('Item');
        expect(params).toEqual({
          group: { objectId: '$name' }
        });
        expect(options).toEqual({
          useMasterKey: true,
          sessionToken: '1234'
        });
        return ParsePromise.as({
          results: []
        });
      }
    });

    var q = new ParseQuery('Item');
    q.aggregate(pipeline, {
      sessionToken: '1234'
    }).then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('selecting sub-objects does not inject objects when sub-object does not exist', (done) => {
    jest.dontMock("../ParseObject");
    jest.resetModules();
    ParseObject = require('../ParseObject').default;
    CoreManager = require('../CoreManager');
    ParseQuery = require('../ParseQuery').default;

    ParseObject.enableSingleInstance();

    var objectToReturn = {
      objectId: 'T01',
      name: 'Name',
      tbd: 'exists',
      className:"Thing",
      createdAt: '2017-01-10T10:00:00Z'
    };

    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [objectToReturn]
        });
      }
    });

    var q = new ParseQuery("Thing");
    q.select("other", "tbd", "subObject.key1")
    var testObject;
    return q.find().then((results) => {
      testObject = results[0];

      expect(testObject.get("name")).toBe("Name");
      expect(testObject.has("other")).toBe(false);
      expect(testObject.has("subObject")).toBe(false);

    }).then(() => {
      done();
    }, (error) => {
      done.fail(error);
    });
  });

  it('removes missing sub objects from the cached object when they are selected', (done) => {
    jest.dontMock("../ParseObject");
    jest.resetModules();
    ParseObject = require('../ParseObject').default;
    CoreManager = require('../CoreManager');
    ParseQuery = require('../ParseQuery').default;

    ParseObject.enableSingleInstance();

    var objectToReturn = {
      objectId: 'T01',
      name: 'Name',
      tbd: 'exists',
      className:"Thing",
      subObject1: {foo:"bar"},
      subObject2: {foo:"bar"},
      subObject3: {foo:"bar"},
      subObject5: {subSubObject:{foo:"foo", bar:"bar"}},
      createdAt: '2017-01-10T10:00:00Z'
    };

    CoreManager.setQueryController({
      aggregate() {},
      find(className, params, options) {
        return ParsePromise.as({
          results: [objectToReturn]
        });
      }
    });

    var q = new ParseQuery("Thing");
    var testObject;
    return q.find().then((results) => {
      testObject = results[0];

      expect(testObject.has("subObject1")).toBe(true);
      expect(testObject.has("subObject2")).toBe(true);
      expect(testObject.has("subObject3")).toBe(true);
      expect(testObject.has("subObject4")).toBe(false);

      var q2 = new ParseQuery("Thing");
      q.select("name","subObject1", "subObject2.foo", "subObject4.foo", "subObject5.subSubObject.foo");
      objectToReturn = { objectId: 'T01', name:"Name", subObject4: {foo:"bar"}, subObject5: {subSubObject:{}}};
      return q.find();
    }).then((results)=>{
      expect(testObject.has("subObject1")).toBe(false); //selected and not returned
      expect(testObject.has("subObject2")).toBe(false); //selected and not returned
      expect(testObject.has("subObject3")).toBe(true); //not selected, so should still be there
      expect(testObject.has("subObject4")).toBe(true); //selected and just added
      expect(testObject.has("subObject5")).toBe(true);
      expect(testObject.get("subObject5").subSubObject).toBeDefined();
      expect(testObject.get("subObject5").subSubObject.bar).toBeDefined(); //not selected but a sibiling was, so should still be there
    }).then(() => {
      done();
    }, (error) => {
      done.fail(error);
    });
  });

  it('full text search', () => {
    const query = new ParseQuery('Item');
    query.fullText('size', 'small');

    expect(query.toJSON()).toEqual({
      where: {
        size: {
          $text: {
            $search: {
              $term: "small"
            }
          }
        }
      }
    });
  });

  it('full text search sort', () => {
    const query = new ParseQuery('Item');
    query.fullText('size', 'medium');
    query.ascending('$score');
    query.select('$score');

    expect(query.toJSON()).toEqual({
      where: {
        size: {
          $text: {
            $search: {
              $term: "medium",
            }
          }
        }
      },
      keys : "$score",
      order : "$score"
    });
  });

  it('full text search key required', (done) => {
    const query = new ParseQuery('Item');
    expect(() => query.fullText()).toThrow('A key is required.');
    done();
  });

  it('full text search value required', (done) => {
    const query = new ParseQuery('Item');
    expect(() => query.fullText('key')).toThrow('A search term is required');
    done();
  });

  it('full text search value must be string', (done) => {
    const query = new ParseQuery('Item');
    expect(() => query.fullText('key', [])).toThrow('The value being searched for must be a string.');
    done();
  });

  it('full text search with all parameters', () => {
    let query = new ParseQuery('Item');

    query.fullText('size', 'medium', { language: 'en', caseSensitive: false, diacriticSensitive: true });

    expect(query.toJSON()).toEqual({
      where: {
        size: {
          $text: {
            $search: {
              $term: 'medium',
              $language: 'en',
              $caseSensitive: false,
              $diacriticSensitive: true,
            },
          },
        },
      },
    });
  });

  it('add the score for the full text search', () => {
    const query = new ParseQuery('Item');

    query.fullText('size', 'medium', { language: 'fr' });
    query.sortByTextScore();

    expect(query.toJSON()).toEqual({
      where: {
        size: {
          $text: {
            $search: {
              $term: 'medium',
              $language: 'fr',
            },
          },
        },
      },
      keys: '$score',
      order: '$score',
    });
  });
});
