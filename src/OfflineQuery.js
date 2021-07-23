const equalObjects = require('./equals').default;
const decode = require('./decode').default;
const ParseError = require('./ParseError').default;
const ParsePolygon = require('./ParsePolygon').default;
const ParseGeoPoint = require('./ParseGeoPoint').default;
/**
 * contains -- Determines if an object is contained in a list with special handling for Parse pointers.
 *
 * @param haystack
 * @param needle
 * @private
 * @returns {boolean}
 */
function contains(haystack, needle) {
  if (needle && needle.__type && (needle.__type === 'Pointer' || needle.__type === 'Object')) {
    for (const i in haystack) {
      const ptr = haystack[i];
      if (typeof ptr === 'string' && ptr === needle.objectId) {
        return true;
      }
      if (ptr.className === needle.className && ptr.objectId === needle.objectId) {
        return true;
      }
    }
    return false;
  }
  return haystack.indexOf(needle) > -1;
}

function transformObject(object) {
  if (object._toFullJSON) {
    return object._toFullJSON();
  }
  return object;
}

/**
 * matchesQuery -- Determines if an object would be returned by a Parse Query
 * It's a lightweight, where-clause only implementation of a full query engine.
 * Since we find queries that match objects, rather than objects that match
 * queries, we can avoid building a full-blown query tool.
 *
 * @param className
 * @param object
 * @param objects
 * @param query
 * @private
 * @returns {boolean}
 */
function matchesQuery(className, object, objects, query) {
  if (object.className !== className) {
    return false;
  }
  let obj = object;
  let q = query;
  if (object.toJSON) {
    obj = object.toJSON();
  }
  if (query.toJSON) {
    q = query.toJSON().where;
  }
  obj.className = className;
  for (const field in q) {
    if (!matchesKeyConstraints(className, obj, objects, field, q[field])) {
      return false;
    }
  }
  return true;
}

function equalObjectsGeneric(obj, compareTo, eqlFn) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (eqlFn(obj[i], compareTo)) {
        return true;
      }
    }
    return false;
  }
  return eqlFn(obj, compareTo);
}

/**
 * @typedef RelativeTimeToDateResult
 * @property {string} status The conversion status, `error` if conversion failed or
 * `success` if conversion succeeded.
 * @property {string} info The error message if conversion failed, or the relative
 * time indication (`past`, `present`, `future`) if conversion succeeded.
 * @property {Date|undefined} result The converted date, or `undefined` if conversion
 * failed.
 */
/**
 * Converts human readable relative date string, for example, 'in 10 days' to a date
 * relative to now.
 *
 * @param {string} text The text to convert.
 * @param {Date} [now=new Date()] The date from which add or subtract. Default is now.
 * @returns {RelativeTimeToDateResult}
 */
function relativeTimeToDate(text, now = new Date()) {
  text = text.toLowerCase();

  let parts = text.split(' ');

  // Filter out whitespace
  parts = parts.filter(part => part !== '');

  const future = parts[0] === 'in';
  const past = parts[parts.length - 1] === 'ago';

  if (!future && !past && text !== 'now') {
    return {
      status: 'error',
      info: "Time should either start with 'in' or end with 'ago'",
    };
  }

  if (future && past) {
    return {
      status: 'error',
      info: "Time cannot have both 'in' and 'ago'",
    };
  }

  // strip the 'ago' or 'in'
  if (future) {
    parts = parts.slice(1);
  } else {
    // past
    parts = parts.slice(0, parts.length - 1);
  }

  if (parts.length % 2 !== 0 && text !== 'now') {
    return {
      status: 'error',
      info: 'Invalid time string. Dangling unit or number.',
    };
  }

  const pairs = [];
  while (parts.length) {
    pairs.push([parts.shift(), parts.shift()]);
  }

  let seconds = 0;
  for (const [num, interval] of pairs) {
    const val = Number(num);
    if (!Number.isInteger(val)) {
      return {
        status: 'error',
        info: `'${num}' is not an integer.`,
      };
    }

    switch (interval) {
    case 'yr':
    case 'yrs':
    case 'year':
    case 'years':
      seconds += val * 31536000; // 365 * 24 * 60 * 60
      break;

    case 'wk':
    case 'wks':
    case 'week':
    case 'weeks':
      seconds += val * 604800; // 7 * 24 * 60 * 60
      break;

    case 'd':
    case 'day':
    case 'days':
      seconds += val * 86400; // 24 * 60 * 60
      break;

    case 'hr':
    case 'hrs':
    case 'hour':
    case 'hours':
      seconds += val * 3600; // 60 * 60
      break;

    case 'min':
    case 'mins':
    case 'minute':
    case 'minutes':
      seconds += val * 60;
      break;

    case 'sec':
    case 'secs':
    case 'second':
    case 'seconds':
      seconds += val;
      break;

    default:
      return {
        status: 'error',
        info: `Invalid interval: '${interval}'`,
      };
    }
  }

  const milliseconds = seconds * 1000;
  if (future) {
    return {
      status: 'success',
      info: 'future',
      result: new Date(now.valueOf() + milliseconds),
    };
  } else if (past) {
    return {
      status: 'success',
      info: 'past',
      result: new Date(now.valueOf() - milliseconds),
    };
  } else {
    return {
      status: 'success',
      info: 'present',
      result: new Date(now.valueOf()),
    };
  }
}

/**
 * Determines whether an object matches a single key's constraints
 *
 * @param className
 * @param object
 * @param objects
 * @param key
 * @param constraints
 * @private
 * @returns {boolean}
 */
function matchesKeyConstraints(className, object, objects, key, constraints) {
  if (constraints === null) {
    return false;
  }
  if (key.indexOf('.') >= 0) {
    // Key references a subobject
    const keyComponents = key.split('.');
    const subObjectKey = keyComponents[0];
    const keyRemainder = keyComponents.slice(1).join('.');
    return matchesKeyConstraints(
      className,
      object[subObjectKey] || {},
      objects,
      keyRemainder,
      constraints
    );
  }
  let i;
  if (key === '$or') {
    for (i = 0; i < constraints.length; i++) {
      if (matchesQuery(className, object, objects, constraints[i])) {
        return true;
      }
    }
    return false;
  }
  if (key === '$and') {
    for (i = 0; i < constraints.length; i++) {
      if (!matchesQuery(className, object, objects, constraints[i])) {
        return false;
      }
    }
    return true;
  }
  if (key === '$nor') {
    for (i = 0; i < constraints.length; i++) {
      if (matchesQuery(className, object, objects, constraints[i])) {
        return false;
      }
    }
    return true;
  }
  if (key === '$relatedTo') {
    // Bail! We can't handle relational queries locally
    return false;
  }
  if (!/^[A-Za-z][0-9A-Za-z_]*$/.test(key)) {
    throw new ParseError(ParseError.INVALID_KEY_NAME, `Invalid Key: ${key}`);
  }
  // Equality (or Array contains) cases
  if (typeof constraints !== 'object') {
    if (Array.isArray(object[key])) {
      return object[key].indexOf(constraints) > -1;
    }
    return object[key] === constraints;
  }
  let compareTo;
  if (constraints.__type) {
    if (constraints.__type === 'Pointer') {
      return equalObjectsGeneric(object[key], constraints, function (obj, ptr) {
        return (
          typeof obj !== 'undefined' &&
          ptr.className === obj.className &&
          ptr.objectId === obj.objectId
        );
      });
    }
    return equalObjectsGeneric(decode(object[key]), decode(constraints), equalObjects);
  }
  // More complex cases
  for (const condition in constraints) {
    compareTo = constraints[condition];

    if (compareTo.__type) {
      compareTo = decode(compareTo);
    }
    // is it a $relativeTime? convert to date
    if (compareTo['$relativeTime']) {
      const parserResult = relativeTimeToDate(compareTo['$relativeTime']);
      if (parserResult.status !== 'success') {
        throw new ParseError(
          ParseError.INVALID_JSON,
          `bad $relativeTime (${key}) value. ${parserResult.info}`
        );
      }
      compareTo = parserResult.result;
    }
    // Compare Date Object or Date String
    if (
      toString.call(compareTo) === '[object Date]' ||
      (typeof compareTo === 'string' &&
        new Date(compareTo) !== 'Invalid Date' &&
        !isNaN(new Date(compareTo)))
    ) {
      object[key] = new Date(object[key].iso ? object[key].iso : object[key]);
    }

    switch (condition) {
    case '$lt':
      if (object[key] >= compareTo) {
        return false;
      }
      break;
    case '$lte':
      if (object[key] > compareTo) {
        return false;
      }
      break;
    case '$gt':
      if (object[key] <= compareTo) {
        return false;
      }
      break;
    case '$gte':
      if (object[key] < compareTo) {
        return false;
      }
      break;
    case '$ne':
      if (equalObjects(object[key], compareTo)) {
        return false;
      }
      break;
    case '$in':
      if (!contains(compareTo, object[key])) {
        return false;
      }
      break;
    case '$nin':
      if (contains(compareTo, object[key])) {
        return false;
      }
      break;
    case '$all':
      for (i = 0; i < compareTo.length; i++) {
        if (object[key].indexOf(compareTo[i]) < 0) {
          return false;
        }
      }
      break;
    case '$exists': {
      const propertyExists = typeof object[key] !== 'undefined';
      const existenceIsRequired = constraints['$exists'];
      if (typeof constraints['$exists'] !== 'boolean') {
        // The SDK will never submit a non-boolean for $exists, but if someone
        // tries to submit a non-boolean for $exits outside the SDKs, just ignore it.
        break;
      }
      if ((!propertyExists && existenceIsRequired) || (propertyExists && !existenceIsRequired)) {
        return false;
      }
      break;
    }
    case '$regex': {
      if (typeof compareTo === 'object') {
        return compareTo.test(object[key]);
      }
      // JS doesn't support perl-style escaping
      let expString = '';
      let escapeEnd = -2;
      let escapeStart = compareTo.indexOf('\\Q');
      while (escapeStart > -1) {
        // Add the unescaped portion
        expString += compareTo.substring(escapeEnd + 2, escapeStart);
        escapeEnd = compareTo.indexOf('\\E', escapeStart);
        if (escapeEnd > -1) {
          expString += compareTo
            .substring(escapeStart + 2, escapeEnd)
            .replace(/\\\\\\\\E/g, '\\E')
            .replace(/\W/g, '\\$&');
        }

        escapeStart = compareTo.indexOf('\\Q', escapeEnd);
      }
      expString += compareTo.substring(Math.max(escapeStart, escapeEnd + 2));
      let modifiers = constraints.$options || '';
      modifiers = modifiers.replace('x', '').replace('s', '');
      // Parse Server / Mongo support x and s modifiers but JS RegExp doesn't
      const exp = new RegExp(expString, modifiers);
      if (!exp.test(object[key])) {
        return false;
      }
      break;
    }
    case '$nearSphere': {
      if (!compareTo || !object[key]) {
        return false;
      }
      const distance = compareTo.radiansTo(object[key]);
      const max = constraints.$maxDistance || Infinity;
      return distance <= max;
    }
    case '$within': {
      if (!compareTo || !object[key]) {
        return false;
      }
      const southWest = compareTo.$box[0];
      const northEast = compareTo.$box[1];
      if (southWest.latitude > northEast.latitude || southWest.longitude > northEast.longitude) {
        // Invalid box, crosses the date line
        return false;
      }
      return (
        object[key].latitude > southWest.latitude &&
          object[key].latitude < northEast.latitude &&
          object[key].longitude > southWest.longitude &&
          object[key].longitude < northEast.longitude
      );
    }
    case '$options':
      // Not a query type, but a way to add options to $regex. Ignore and
      // avoid the default
      break;
    case '$maxDistance':
      // Not a query type, but a way to add a cap to $nearSphere. Ignore and
      // avoid the default
      break;
    case '$select': {
      const subQueryObjects = objects.filter((obj, index, arr) => {
        return matchesQuery(compareTo.query.className, obj, arr, compareTo.query.where);
      });
      for (let i = 0; i < subQueryObjects.length; i += 1) {
        const subObject = transformObject(subQueryObjects[i]);
        return equalObjects(object[key], subObject[compareTo.key]);
      }
      return false;
    }
    case '$dontSelect': {
      const subQueryObjects = objects.filter((obj, index, arr) => {
        return matchesQuery(compareTo.query.className, obj, arr, compareTo.query.where);
      });
      for (let i = 0; i < subQueryObjects.length; i += 1) {
        const subObject = transformObject(subQueryObjects[i]);
        return !equalObjects(object[key], subObject[compareTo.key]);
      }
      return false;
    }
    case '$inQuery': {
      const subQueryObjects = objects.filter((obj, index, arr) => {
        return matchesQuery(compareTo.className, obj, arr, compareTo.where);
      });

      for (let i = 0; i < subQueryObjects.length; i += 1) {
        const subObject = transformObject(subQueryObjects[i]);
        if (
          object[key].className === subObject.className &&
            object[key].objectId === subObject.objectId
        ) {
          return true;
        }
      }
      return false;
    }
    case '$notInQuery': {
      const subQueryObjects = objects.filter((obj, index, arr) => {
        return matchesQuery(compareTo.className, obj, arr, compareTo.where);
      });

      for (let i = 0; i < subQueryObjects.length; i += 1) {
        const subObject = transformObject(subQueryObjects[i]);
        if (
          object[key].className === subObject.className &&
            object[key].objectId === subObject.objectId
        ) {
          return false;
        }
      }
      return true;
    }
    case '$containedBy': {
      for (const value of object[key]) {
        if (!contains(compareTo, value)) {
          return false;
        }
      }
      return true;
    }
    case '$geoWithin': {
      const points = compareTo.$polygon.map(geoPoint => [geoPoint.latitude, geoPoint.longitude]);
      const polygon = new ParsePolygon(points);
      return polygon.containsPoint(object[key]);
    }
    case '$geoIntersects': {
      const polygon = new ParsePolygon(object[key].coordinates);
      const point = new ParseGeoPoint(compareTo.$point);
      return polygon.containsPoint(point);
    }
    default:
      return false;
    }
  }
  return true;
}

function validateQuery(query: any) {
  let q = query;

  if (query.toJSON) {
    q = query.toJSON().where;
  }
  const specialQuerykeys = [
    '$and',
    '$or',
    '$nor',
    '_rperm',
    '_wperm',
    '_perishable_token',
    '_email_verify_token',
    '_email_verify_token_expires_at',
    '_account_lockout_expires_at',
    '_failed_login_count',
  ];

  Object.keys(q).forEach(key => {
    if (q && q[key] && q[key].$regex) {
      if (typeof q[key].$options === 'string') {
        if (!q[key].$options.match(/^[imxs]+$/)) {
          throw new ParseError(
            ParseError.INVALID_QUERY,
            `Bad $options value for query: ${q[key].$options}`
          );
        }
      }
    }
    if (specialQuerykeys.indexOf(key) < 0 && !key.match(/^[a-zA-Z][a-zA-Z0-9_\.]*$/)) {
      throw new ParseError(ParseError.INVALID_KEY_NAME, `Invalid key name: ${key}`);
    }
  });
}

const OfflineQuery = {
  matchesQuery: matchesQuery,
  validateQuery: validateQuery,
};

module.exports = OfflineQuery;
