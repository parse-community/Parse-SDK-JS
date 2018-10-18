"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.opFromJSON = opFromJSON;
exports.RelationOp = exports.RemoveOp = exports.AddUniqueOp = exports.AddOp = exports.IncrementOp = exports.UnsetOp = exports.SetOp = exports.Op = void 0;

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _arrayContainsObject = _interopRequireDefault(require("./arrayContainsObject"));

var _decode = _interopRequireDefault(require("./decode"));

var _encode = _interopRequireDefault(require("./encode"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

var _ParseRelation = _interopRequireDefault(require("./ParseRelation"));

var _unique = _interopRequireDefault(require("./unique"));
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */


function opFromJSON(json
/*: { [key: string]: any }*/
)
/*: ?Op*/
{
  if (!json || !json.__op) {
    return null;
  }

  switch (json.__op) {
    case 'Delete':
      return new UnsetOp();

    case 'Increment':
      return new IncrementOp(json.amount);

    case 'Add':
      return new AddOp((0, _decode.default)(json.objects));

    case 'AddUnique':
      return new AddUniqueOp((0, _decode.default)(json.objects));

    case 'Remove':
      return new RemoveOp((0, _decode.default)(json.objects));

    case 'AddRelation':
      {
        var toAdd = (0, _decode.default)(json.objects);

        if (!Array.isArray(toAdd)) {
          return new RelationOp([], []);
        }

        return new RelationOp(toAdd, []);
      }

    case 'RemoveRelation':
      {
        var toRemove = (0, _decode.default)(json.objects);

        if (!Array.isArray(toRemove)) {
          return new RelationOp([], []);
        }

        return new RelationOp([], toRemove);
      }

    case 'Batch':
      {
        var _toAdd = [];
        var _toRemove = [];

        for (var i = 0; i < json.ops.length; i++) {
          if (json.ops[i].__op === 'AddRelation') {
            _toAdd = _toAdd.concat((0, _decode.default)(json.ops[i].objects));
          } else if (json.ops[i].__op === 'RemoveRelation') {
            _toRemove = _toRemove.concat((0, _decode.default)(json.ops[i].objects));
          }
        }

        return new RelationOp(_toAdd, _toRemove);
      }
  }

  return null;
}

var Op =
/*#__PURE__*/
function () {
  function Op() {
    (0, _classCallCheck2.default)(this, Op);
  }

  (0, _createClass2.default)(Op, [{
    key: "applyTo",
    // Empty parent class
    value: function ()
    /*: mixed*/

    /*: mixed*/
    {}
    /* eslint-disable-line no-unused-vars */

  }, {
    key: "mergeWith",
    value: function ()
    /*: Op*/

    /*: ?Op*/
    {}
    /* eslint-disable-line no-unused-vars */

  }, {
    key: "toJSON",
    value: function ()
    /*: mixed*/
    {}
  }]);
  return Op;
}();

exports.Op = Op;

var SetOp =
/*#__PURE__*/
function (_Op) {
  (0, _inherits2.default)(SetOp, _Op);

  function SetOp(value
  /*: mixed*/
  ) {
    var _this;

    (0, _classCallCheck2.default)(this, SetOp);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(SetOp).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_value", void 0);
    _this._value = value;
    return _this;
  }

  (0, _createClass2.default)(SetOp, [{
    key: "applyTo",
    value: function ()
    /*: mixed*/
    {
      return this._value;
    }
  }, {
    key: "mergeWith",
    value: function ()
    /*: SetOp*/
    {
      return new SetOp(this._value);
    }
  }, {
    key: "toJSON",
    value: function () {
      return (0, _encode.default)(this._value, false, true);
    }
  }]);
  return SetOp;
}(Op);

exports.SetOp = SetOp;

var UnsetOp =
/*#__PURE__*/
function (_Op2) {
  (0, _inherits2.default)(UnsetOp, _Op2);

  function UnsetOp() {
    (0, _classCallCheck2.default)(this, UnsetOp);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(UnsetOp).apply(this, arguments));
  }

  (0, _createClass2.default)(UnsetOp, [{
    key: "applyTo",
    value: function () {
      return undefined;
    }
  }, {
    key: "mergeWith",
    value: function ()
    /*: UnsetOp*/
    {
      return new UnsetOp();
    }
  }, {
    key: "toJSON",
    value: function ()
    /*: { __op: string }*/
    {
      return {
        __op: 'Delete'
      };
    }
  }]);
  return UnsetOp;
}(Op);

exports.UnsetOp = UnsetOp;

var IncrementOp =
/*#__PURE__*/
function (_Op3) {
  (0, _inherits2.default)(IncrementOp, _Op3);

  function IncrementOp(amount
  /*: number*/
  ) {
    var _this2;

    (0, _classCallCheck2.default)(this, IncrementOp);
    _this2 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(IncrementOp).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this2)), "_amount", void 0);

    if (typeof amount !== 'number') {
      throw new TypeError('Increment Op must be initialized with a numeric amount.');
    }

    _this2._amount = amount;
    return _this2;
  }

  (0, _createClass2.default)(IncrementOp, [{
    key: "applyTo",
    value: function (value
    /*: ?mixed*/
    )
    /*: number*/
    {
      if (typeof value === 'undefined') {
        return this._amount;
      }

      if (typeof value !== 'number') {
        throw new TypeError('Cannot increment a non-numeric value.');
      }

      return this._amount + value;
    }
  }, {
    key: "mergeWith",
    value: function (previous
    /*: Op*/
    )
    /*: Op*/
    {
      if (!previous) {
        return this;
      }

      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }

      if (previous instanceof UnsetOp) {
        return new SetOp(this._amount);
      }

      if (previous instanceof IncrementOp) {
        return new IncrementOp(this.applyTo(previous._amount));
      }

      throw new Error('Cannot merge Increment Op with the previous Op');
    }
  }, {
    key: "toJSON",
    value: function ()
    /*: { __op: string; amount: number }*/
    {
      return {
        __op: 'Increment',
        amount: this._amount
      };
    }
  }]);
  return IncrementOp;
}(Op);

exports.IncrementOp = IncrementOp;

var AddOp =
/*#__PURE__*/
function (_Op4) {
  (0, _inherits2.default)(AddOp, _Op4);

  function AddOp(value
  /*: mixed | Array<mixed>*/
  ) {
    var _this3;

    (0, _classCallCheck2.default)(this, AddOp);
    _this3 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AddOp).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this3)), "_value", void 0);
    _this3._value = Array.isArray(value) ? value : [value];
    return _this3;
  }

  (0, _createClass2.default)(AddOp, [{
    key: "applyTo",
    value: function (value
    /*: mixed*/
    )
    /*: Array<mixed>*/
    {
      if (value == null) {
        return this._value;
      }

      if (Array.isArray(value)) {
        return value.concat(this._value);
      }

      throw new Error('Cannot add elements to a non-array value');
    }
  }, {
    key: "mergeWith",
    value: function (previous
    /*: Op*/
    )
    /*: Op*/
    {
      if (!previous) {
        return this;
      }

      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }

      if (previous instanceof UnsetOp) {
        return new SetOp(this._value);
      }

      if (previous instanceof AddOp) {
        return new AddOp(this.applyTo(previous._value));
      }

      throw new Error('Cannot merge Add Op with the previous Op');
    }
  }, {
    key: "toJSON",
    value: function ()
    /*: { __op: string; objects: mixed }*/
    {
      return {
        __op: 'Add',
        objects: (0, _encode.default)(this._value, false, true)
      };
    }
  }]);
  return AddOp;
}(Op);

exports.AddOp = AddOp;

var AddUniqueOp =
/*#__PURE__*/
function (_Op5) {
  (0, _inherits2.default)(AddUniqueOp, _Op5);

  function AddUniqueOp(value
  /*: mixed | Array<mixed>*/
  ) {
    var _this4;

    (0, _classCallCheck2.default)(this, AddUniqueOp);
    _this4 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AddUniqueOp).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this4)), "_value", void 0);
    _this4._value = (0, _unique.default)(Array.isArray(value) ? value : [value]);
    return _this4;
  }

  (0, _createClass2.default)(AddUniqueOp, [{
    key: "applyTo",
    value: function (value
    /*: mixed | Array<mixed>*/
    )
    /*: Array<mixed>*/
    {
      if (value == null) {
        return this._value || [];
      }

      if (Array.isArray(value)) {
        // copying value lets Flow guarantee the pointer isn't modified elsewhere
        var valueCopy = value;
        var toAdd = [];

        this._value.forEach(function (v) {
          if (v instanceof _ParseObject.default) {
            if (!(0, _arrayContainsObject.default)(valueCopy, v)) {
              toAdd.push(v);
            }
          } else {
            if (valueCopy.indexOf(v) < 0) {
              toAdd.push(v);
            }
          }
        });

        return value.concat(toAdd);
      }

      throw new Error('Cannot add elements to a non-array value');
    }
  }, {
    key: "mergeWith",
    value: function (previous
    /*: Op*/
    )
    /*: Op*/
    {
      if (!previous) {
        return this;
      }

      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }

      if (previous instanceof UnsetOp) {
        return new SetOp(this._value);
      }

      if (previous instanceof AddUniqueOp) {
        return new AddUniqueOp(this.applyTo(previous._value));
      }

      throw new Error('Cannot merge AddUnique Op with the previous Op');
    }
  }, {
    key: "toJSON",
    value: function ()
    /*: { __op: string; objects: mixed }*/
    {
      return {
        __op: 'AddUnique',
        objects: (0, _encode.default)(this._value, false, true)
      };
    }
  }]);
  return AddUniqueOp;
}(Op);

exports.AddUniqueOp = AddUniqueOp;

var RemoveOp =
/*#__PURE__*/
function (_Op6) {
  (0, _inherits2.default)(RemoveOp, _Op6);

  function RemoveOp(value
  /*: mixed | Array<mixed>*/
  ) {
    var _this5;

    (0, _classCallCheck2.default)(this, RemoveOp);
    _this5 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(RemoveOp).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this5)), "_value", void 0);
    _this5._value = (0, _unique.default)(Array.isArray(value) ? value : [value]);
    return _this5;
  }

  (0, _createClass2.default)(RemoveOp, [{
    key: "applyTo",
    value: function (value
    /*: mixed | Array<mixed>*/
    )
    /*: Array<mixed>*/
    {
      if (value == null) {
        return [];
      }

      if (Array.isArray(value)) {
        // var i = value.indexOf(this._value);
        var removed = value.concat([]);

        for (var i = 0; i < this._value.length; i++) {
          var index = removed.indexOf(this._value[i]);

          while (index > -1) {
            removed.splice(index, 1);
            index = removed.indexOf(this._value[i]);
          }

          if (this._value[i] instanceof _ParseObject.default && this._value[i].id) {
            for (var j = 0; j < removed.length; j++) {
              if (removed[j] instanceof _ParseObject.default && this._value[i].id === removed[j].id) {
                removed.splice(j, 1);
                j--;
              }
            }
          }
        }

        return removed;
      }

      throw new Error('Cannot remove elements from a non-array value');
    }
  }, {
    key: "mergeWith",
    value: function (previous
    /*: Op*/
    )
    /*: Op*/
    {
      if (!previous) {
        return this;
      }

      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }

      if (previous instanceof UnsetOp) {
        return new UnsetOp();
      }

      if (previous instanceof RemoveOp) {
        var uniques = previous._value.concat([]);

        for (var i = 0; i < this._value.length; i++) {
          if (this._value[i] instanceof _ParseObject.default) {
            if (!(0, _arrayContainsObject.default)(uniques, this._value[i])) {
              uniques.push(this._value[i]);
            }
          } else {
            if (uniques.indexOf(this._value[i]) < 0) {
              uniques.push(this._value[i]);
            }
          }
        }

        return new RemoveOp(uniques);
      }

      throw new Error('Cannot merge Remove Op with the previous Op');
    }
  }, {
    key: "toJSON",
    value: function ()
    /*: { __op: string; objects: mixed }*/
    {
      return {
        __op: 'Remove',
        objects: (0, _encode.default)(this._value, false, true)
      };
    }
  }]);
  return RemoveOp;
}(Op);

exports.RemoveOp = RemoveOp;

var RelationOp =
/*#__PURE__*/
function (_Op7) {
  (0, _inherits2.default)(RelationOp, _Op7);

  function RelationOp(adds
  /*: Array<ParseObject | string>*/
  , removes
  /*: Array<ParseObject | string>*/
  ) {
    var _this6;

    (0, _classCallCheck2.default)(this, RelationOp);
    _this6 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(RelationOp).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this6)), "_targetClassName", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this6)), "relationsToAdd", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this6)), "relationsToRemove", void 0);
    _this6._targetClassName = null;

    if (Array.isArray(adds)) {
      _this6.relationsToAdd = (0, _unique.default)(adds.map(_this6._extractId, (0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this6))));
    }

    if (Array.isArray(removes)) {
      _this6.relationsToRemove = (0, _unique.default)(removes.map(_this6._extractId, (0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this6))));
    }

    return _this6;
  }

  (0, _createClass2.default)(RelationOp, [{
    key: "_extractId",
    value: function (obj
    /*: string | ParseObject*/
    )
    /*: string*/
    {
      if (typeof obj === 'string') {
        return obj;
      }

      if (!obj.id) {
        throw new Error('You cannot add or remove an unsaved Parse Object from a relation');
      }

      if (!this._targetClassName) {
        this._targetClassName = obj.className;
      }

      if (this._targetClassName !== obj.className) {
        throw new Error('Tried to create a Relation with 2 different object types: ' + this._targetClassName + ' and ' + obj.className + '.');
      }

      return obj.id;
    }
  }, {
    key: "applyTo",
    value: function (value
    /*: mixed*/
    , object
    /*:: ?: { className: string, id: ?string }*/
    , key
    /*:: ?: string*/
    )
    /*: ?ParseRelation*/
    {
      if (!value) {
        if (!object || !key) {
          throw new Error('Cannot apply a RelationOp without either a previous value, or an object and a key');
        }

        var parent = new _ParseObject.default(object.className);

        if (object.id && object.id.indexOf('local') === 0) {
          parent._localId = object.id;
        } else if (object.id) {
          parent.id = object.id;
        }

        var relation = new _ParseRelation.default(parent, key);
        relation.targetClassName = this._targetClassName;
        return relation;
      }

      if (value instanceof _ParseRelation.default) {
        if (this._targetClassName) {
          if (value.targetClassName) {
            if (this._targetClassName !== value.targetClassName) {
              throw new Error('Related object must be a ' + value.targetClassName + ', but a ' + this._targetClassName + ' was passed in.');
            }
          } else {
            value.targetClassName = this._targetClassName;
          }
        }

        return value;
      } else {
        throw new Error('Relation cannot be applied to a non-relation field');
      }
    }
  }, {
    key: "mergeWith",
    value: function (previous
    /*: Op*/
    )
    /*: Op*/
    {
      if (!previous) {
        return this;
      } else if (previous instanceof UnsetOp) {
        throw new Error('You cannot modify a relation after deleting it.');
      } else if (previous instanceof RelationOp) {
        if (previous._targetClassName && previous._targetClassName !== this._targetClassName) {
          throw new Error('Related object must be of class ' + previous._targetClassName + ', but ' + (this._targetClassName || 'null') + ' was passed in.');
        }

        var newAdd = previous.relationsToAdd.concat([]);
        this.relationsToRemove.forEach(function (r) {
          var index = newAdd.indexOf(r);

          if (index > -1) {
            newAdd.splice(index, 1);
          }
        });
        this.relationsToAdd.forEach(function (r) {
          var index = newAdd.indexOf(r);

          if (index < 0) {
            newAdd.push(r);
          }
        });
        var newRemove = previous.relationsToRemove.concat([]);
        this.relationsToAdd.forEach(function (r) {
          var index = newRemove.indexOf(r);

          if (index > -1) {
            newRemove.splice(index, 1);
          }
        });
        this.relationsToRemove.forEach(function (r) {
          var index = newRemove.indexOf(r);

          if (index < 0) {
            newRemove.push(r);
          }
        });
        var newRelation = new RelationOp(newAdd, newRemove);
        newRelation._targetClassName = this._targetClassName;
        return newRelation;
      }

      throw new Error('Cannot merge Relation Op with the previous Op');
    }
  }, {
    key: "toJSON",
    value: function ()
    /*: { __op?: string; objects?: mixed; ops?: mixed }*/
    {
      var _this7 = this;

      var idToPointer = function (id) {
        return {
          __type: 'Pointer',
          className: _this7._targetClassName,
          objectId: id
        };
      };

      var adds = null;
      var removes = null;
      var pointers = null;

      if (this.relationsToAdd.length > 0) {
        pointers = this.relationsToAdd.map(idToPointer);
        adds = {
          __op: 'AddRelation',
          objects: pointers
        };
      }

      if (this.relationsToRemove.length > 0) {
        pointers = this.relationsToRemove.map(idToPointer);
        removes = {
          __op: 'RemoveRelation',
          objects: pointers
        };
      }

      if (adds && removes) {
        return {
          __op: 'Batch',
          ops: [adds, removes]
        };
      }

      return adds || removes || {};
    }
  }]);
  return RelationOp;
}(Op);

exports.RelationOp = RelationOp;