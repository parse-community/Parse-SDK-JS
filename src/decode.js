/**
 * @flow
 */
import ParseACL from './ParseACL'; // eslint-disable-line no-unused-vars
import ParseFile from './ParseFile';
import ParseGeoPoint from './ParseGeoPoint';
import ParsePolygon from './ParsePolygon';
import ParseObject from './ParseObject';
import { opFromJSON } from './ParseOp';
import ParseRelation from './ParseRelation';

export default function decode(value: any): any {
  if (value === null || typeof value !== 'object' || value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    const dup = [];
    value.forEach((v, i) => {
      dup[i] = decode(v);
    });
    return dup;
  }
  if (typeof value.__op === 'string') {
    return opFromJSON(value);
  }
  if (value.__type === 'Pointer' && value.className) {
    return ParseObject.fromJSON(value);
  }
  if (value.__type === 'Object' && value.className) {
    return ParseObject.fromJSON(value, true);
  }
  if (value.__type === 'Relation') {
    // The parent and key fields will be populated by the parent
    const relation = new ParseRelation(null, null);
    relation.targetClassName = value.className;
    return relation;
  }
  if (value.__type === 'Date') {
    return new Date(value.iso);
  }
  if (value.__type === 'File') {
    return ParseFile.fromJSON(value);
  }
  if (value.__type === 'GeoPoint') {
    return new ParseGeoPoint({
      latitude: value.latitude,
      longitude: value.longitude,
    });
  }
  if (value.__type === 'Polygon') {
    return new ParsePolygon(value.coordinates);
  }
  const copy = {};
  for (const k in value) {
    copy[k] = decode(value[k]);
  }
  return copy;
}
