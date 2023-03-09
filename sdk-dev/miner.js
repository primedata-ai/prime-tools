(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.follower = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var type = require('component-type');

/**
 * Deeply clone an object.
 *
 * @param {*} obj Any object.
 */

var clone = function clone(obj) {
  var t = type(obj);

  if (t === 'object') {
    var copy = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = clone(obj[key]);
      }
    }
    return copy;
  }

  if (t === 'array') {
    var copy = new Array(obj.length);
    for (var i = 0, l = obj.length; i < l; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  if (t === 'regexp') {
    // from millermedeiros/amd-utils - MIT
    var flags = '';
    flags += obj.multiline ? 'm' : '';
    flags += obj.global ? 'g' : '';
    flags += obj.ignoreCase ? 'i' : '';
    return new RegExp(obj.source, flags);
  }

  if (t === 'date') {
    return new Date(obj.getTime());
  }

  // string, number, boolean, etc.
  return obj;
};

/*
 * Exports.
 */

module.exports = clone;

},{"component-type":55}],2:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var drop = require('@ndhoule/drop');
var rest = require('@ndhoule/rest');

var has = Object.prototype.hasOwnProperty;
var objToString = Object.prototype.toString;

/**
 * Returns `true` if a value is an object, otherwise `false`.
 *
 * @name isObject
 * @api private
 * @param {*} val The value to test.
 * @return {boolean}
 */
// TODO: Move to a library
var isObject = function isObject(value) {
  return Boolean(value) && typeof value === 'object';
};

/**
 * Returns `true` if a value is a plain object, otherwise `false`.
 *
 * @name isPlainObject
 * @api private
 * @param {*} val The value to test.
 * @return {boolean}
 */
// TODO: Move to a library
var isPlainObject = function isPlainObject(value) {
  return Boolean(value) && objToString.call(value) === '[object Object]';
};

/**
 * Assigns a key-value pair to a target object when the value assigned is owned,
 * and where target[key] is undefined.
 *
 * @name shallowCombiner
 * @api private
 * @param {Object} target
 * @param {Object} source
 * @param {*} value
 * @param {string} key
 */
var shallowCombiner = function shallowCombiner(target, source, value, key) {
  if (has.call(source, key) && target[key] === undefined) {
    target[key] = value;
  }
  return source;
};

/**
 * Assigns a key-value pair to a target object when the value assigned is owned,
 * and where target[key] is undefined; also merges objects recursively.
 *
 * @name deepCombiner
 * @api private
 * @param {Object} target
 * @param {Object} source
 * @param {*} value
 * @param {string} key
 * @return {Object}
 */
var deepCombiner = function(target, source, value, key) {
  if (has.call(source, key)) {
    if (isPlainObject(target[key]) && isPlainObject(value)) {
        target[key] = defaultsDeep(target[key], value);
    } else if (target[key] === undefined) {
        target[key] = value;
    }
  }

  return source;
};

/**
 * TODO: Document
 *
 * @name defaultsWith
 * @api private
 * @param {Function} combiner
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object} Return the input `target`.
 */
var defaultsWith = function(combiner, target /*, ...sources */) {
  if (!isObject(target)) {
    return target;
  }

  combiner = combiner || shallowCombiner;
  var sources = drop(2, arguments);

  for (var i = 0; i < sources.length; i += 1) {
    for (var key in sources[i]) {
      combiner(target, sources[i], sources[i][key], key);
    }
  }

  return target;
};

/**
 * Copies owned, enumerable properties from a source object(s) to a target
 * object when the value of that property on the source object is `undefined`.
 * Recurses on objects.
 *
 * @name defaultsDeep
 * @api public
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object} The input `target`.
 */
var defaultsDeep = function defaultsDeep(target /*, sources */) {
  // TODO: Replace with `partial` call?
  return defaultsWith.apply(null, [deepCombiner, target].concat(rest(arguments)));
};

/**
 * Copies owned, enumerable properties from a source object(s) to a target
 * object when the value of that property on the source object is `undefined`.
 *
 * @name defaults
 * @api public
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object}
 * @example
 * var a = { a: 1 };
 * var b = { a: 2, b: 2 };
 *
 * defaults(a, b);
 * console.log(a); //=> { a: 1, b: 2 }
 */
var defaults = function(target /*, ...sources */) {
  // TODO: Replace with `partial` call?
  return defaultsWith.apply(null, [null, target].concat(rest(arguments)));
};

/*
 * Exports.
 */

module.exports = defaults;
module.exports.deep = defaultsDeep;

},{"@ndhoule/drop":3,"@ndhoule/rest":12}],3:[function(require,module,exports){
'use strict';

var max = Math.max;

/**
 * Produce a new array composed of all but the first `n` elements of an input `collection`.
 *
 * @name drop
 * @api public
 * @param {number} count The number of elements to drop.
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing all but the first element from `collection`.
 * @example
 * drop(0, [1, 2, 3]); // => [1, 2, 3]
 * drop(1, [1, 2, 3]); // => [2, 3]
 * drop(2, [1, 2, 3]); // => [3]
 * drop(3, [1, 2, 3]); // => []
 * drop(4, [1, 2, 3]); // => []
 */
var drop = function drop(count, collection) {
  var length = collection ? collection.length : 0;

  if (!length) {
    return [];
  }

  // Preallocating an array *significantly* boosts performance when dealing with
  // `arguments` objects on v8. For a summary, see:
  // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
  var toDrop = max(Number(count) || 0, 0);
  var resultsLength = max(length - toDrop, 0);
  var results = new Array(resultsLength);

  for (var i = 0; i < resultsLength; i += 1) {
    results[i] = collection[i + toDrop];
  }

  return results;
};

/*
 * Exports.
 */

module.exports = drop;

},{}],4:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var keys = require('@ndhoule/keys');

var objToString = Object.prototype.toString;

/**
 * Tests if a value is a number.
 *
 * @name isNumber
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if `val` is a number, otherwise `false`.
 */
// TODO: Move to library
var isNumber = function isNumber(val) {
  var type = typeof val;
  return type === 'number' || (type === 'object' && objToString.call(val) === '[object Number]');
};

/**
 * Tests if a value is an array.
 *
 * @name isArray
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if the value is an array, otherwise `false`.
 */
// TODO: Move to library
var isArray = typeof Array.isArray === 'function' ? Array.isArray : function isArray(val) {
  return objToString.call(val) === '[object Array]';
};

/**
 * Tests if a value is array-like. Array-like means the value is not a function and has a numeric
 * `.length` property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to library
var isArrayLike = function isArrayLike(val) {
  return val != null && (isArray(val) || (val !== 'function' && isNumber(val.length)));
};

/**
 * Internal implementation of `each`. Works on arrays and array-like data structures.
 *
 * @name arrayEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array} array The array(-like) structure to iterate over.
 * @return {undefined}
 */
var arrayEach = function arrayEach(iterator, array) {
  for (var i = 0; i < array.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(array[i], i, array) === false) {
      break;
    }
  }
};

/**
 * Internal implementation of `each`. Works on objects.
 *
 * @name baseEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Object} object The object to iterate over.
 * @return {undefined}
 */
var baseEach = function baseEach(iterator, object) {
  var ks = keys(object);

  for (var i = 0; i < ks.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(object[ks[i]], ks[i], object) === false) {
      break;
    }
  }
};

/**
 * Iterate over an input collection, invoking an `iterator` function for each element in the
 * collection and passing to it three arguments: `(value, index, collection)`. The `iterator`
 * function can end iteration early by returning `false`.
 *
 * @name each
 * @api public
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array|Object|string} collection The collection to iterate over.
 * @return {undefined} Because `each` is run only for side effects, always returns `undefined`.
 * @example
 * var log = console.log.bind(console);
 *
 * each(log, ['a', 'b', 'c']);
 * //-> 'a', 0, ['a', 'b', 'c']
 * //-> 'b', 1, ['a', 'b', 'c']
 * //-> 'c', 2, ['a', 'b', 'c']
 * //=> undefined
 *
 * each(log, 'tim');
 * //-> 't', 2, 'tim'
 * //-> 'i', 1, 'tim'
 * //-> 'm', 0, 'tim'
 * //=> undefined
 *
 * // Note: Iteration order not guaranteed across environments
 * each(log, { name: 'tim', occupation: 'enchanter' });
 * //-> 'tim', 'name', { name: 'tim', occupation: 'enchanter' }
 * //-> 'enchanter', 'occupation', { name: 'tim', occupation: 'enchanter' }
 * //=> undefined
 */
var each = function each(iterator, collection) {
  return (isArrayLike(collection) ? arrayEach : baseEach).call(this, iterator, collection);
};

/*
 * Exports.
 */

module.exports = each;

},{"@ndhoule/keys":9}],5:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

/**
 * Check if a predicate function returns `true` for all values in a `collection`.
 * Checks owned, enumerable values and exits early when `predicate` returns
 * `false`.
 *
 * @name every
 * @param {Function} predicate The function used to test values.
 * @param {Array|Object|string} collection The collection to search.
 * @return {boolean} True if all values passes the predicate test, otherwise false.
 * @example
 * var isEven = function(num) { return num % 2 === 0; };
 *
 * every(isEven, []); // => true
 * every(isEven, [1, 2]); // => false
 * every(isEven, [2, 4, 6]); // => true
 */
var every = function every(predicate, collection) {
  if (typeof predicate !== 'function') {
    throw new TypeError('`predicate` must be a function but was a ' + typeof predicate);
  }

  var result = true;

  each(function(val, key, collection) {
    result = !!predicate(val, key, collection);

    // Exit early
    if (!result) {
      return false;
    }
  }, collection);

  return result;
};

/*
 * Exports.
 */

module.exports = every;

},{"@ndhoule/each":4}],6:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * Copy the properties of one or more `objects` onto a destination object. Input objects are iterated over
 * in left-to-right order, so duplicate properties on later objects will overwrite those from
 * erevious ones. Only enumerable and own properties of the input objects are copied onto the
 * resulting object.
 *
 * @name extend
 * @api public
 * @category Object
 * @param {Object} dest The destination object.
 * @param {...Object} sources The source objects.
 * @return {Object} `dest`, extended with the properties of all `sources`.
 * @example
 * var a = { a: 'a' };
 * var b = { b: 'b' };
 * var c = { c: 'c' };
 *
 * extend(a, b, c);
 * //=> { a: 'a', b: 'b', c: 'c' };
 */
var extend = function extend(dest /*, sources */) {
  var sources = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < sources.length; i += 1) {
    for (var key in sources[i]) {
      if (has.call(sources[i], key)) {
        dest[key] = sources[i][key];
      }
    }
  }

  return dest;
};

/*
 * Exports.
 */

module.exports = extend;

},{}],7:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

/**
 * Reduces all the values in a collection down into a single value. Does so by iterating through the
 * collection from left to right, repeatedly calling an `iterator` function and passing to it four
 * arguments: `(accumulator, value, index, collection)`.
 *
 * Returns the final return value of the `iterator` function.
 *
 * @name foldl
 * @api public
 * @param {Function} iterator The function to invoke per iteration.
 * @param {*} accumulator The initial accumulator value, passed to the first invocation of `iterator`.
 * @param {Array|Object} collection The collection to iterate over.
 * @return {*} The return value of the final call to `iterator`.
 * @example
 * foldl(function(total, n) {
 *   return total + n;
 * }, 0, [1, 2, 3]);
 * //=> 6
 *
 * var phonebook = { bob: '555-111-2345', tim: '655-222-6789', sheila: '655-333-1298' };
 *
 * foldl(function(results, phoneNumber) {
 *  if (phoneNumber[0] === '6') {
 *    return results.concat(phoneNumber);
 *  }
 *  return results;
 * }, [], phonebook);
 * // => ['655-222-6789', '655-333-1298']
 */
var foldl = function foldl(iterator, accumulator, collection) {
  if (typeof iterator !== 'function') {
    throw new TypeError('Expected a function but received a ' + typeof iterator);
  }

  each(function(val, i, collection) {
    accumulator = iterator(accumulator, val, i, collection);
  }, collection);

  return accumulator;
};

/*
 * Exports.
 */

module.exports = foldl;

},{"@ndhoule/each":4}],8:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

var strIndexOf = String.prototype.indexOf;

/**
 * Object.is/sameValueZero polyfill.
 *
 * @api private
 * @param {*} value1
 * @param {*} value2
 * @return {boolean}
 */
// TODO: Move to library
var sameValueZero = function sameValueZero(value1, value2) {
  // Normal values and check for 0 / -0
  if (value1 === value2) {
    return value1 !== 0 || 1 / value1 === 1 / value2;
  }
  // NaN
  return value1 !== value1 && value2 !== value2;
};

/**
 * Searches a given `collection` for a value, returning true if the collection
 * contains the value and false otherwise. Can search strings, arrays, and
 * objects.
 *
 * @name includes
 * @api public
 * @param {*} searchElement The element to search for.
 * @param {Object|Array|string} collection The collection to search.
 * @return {boolean}
 * @example
 * includes(2, [1, 2, 3]);
 * //=> true
 *
 * includes(4, [1, 2, 3]);
 * //=> false
 *
 * includes(2, { a: 1, b: 2, c: 3 });
 * //=> true
 *
 * includes('a', { a: 1, b: 2, c: 3 });
 * //=> false
 *
 * includes('abc', 'xyzabc opq');
 * //=> true
 *
 * includes('nope', 'xyzabc opq');
 * //=> false
 */
var includes = function includes(searchElement, collection) {
  var found = false;

  // Delegate to String.prototype.indexOf when `collection` is a string
  if (typeof collection === 'string') {
    return strIndexOf.call(collection, searchElement) !== -1;
  }

  // Iterate through enumerable/own array elements and object properties.
  each(function(value) {
    if (sameValueZero(value, searchElement)) {
      found = true;
      // Exit iteration early when found
      return false;
    }
  }, collection);

  return found;
};

/*
 * Exports.
 */

module.exports = includes;

},{"@ndhoule/each":4}],9:[function(require,module,exports){
'use strict';

var hop = Object.prototype.hasOwnProperty;
var strCharAt = String.prototype.charAt;
var toStr = Object.prototype.toString;

/**
 * Returns the character at a given index.
 *
 * @param {string} str
 * @param {number} index
 * @return {string|undefined}
 */
// TODO: Move to a library
var charAt = function(str, index) {
  return strCharAt.call(str, index);
};

/**
 * hasOwnProperty, wrapped as a function.
 *
 * @name has
 * @api private
 * @param {*} context
 * @param {string|number} prop
 * @return {boolean}
 */

// TODO: Move to a library
var has = function has(context, prop) {
  return hop.call(context, prop);
};

/**
 * Returns true if a value is a string, otherwise false.
 *
 * @name isString
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to a library
var isString = function isString(val) {
  return toStr.call(val) === '[object String]';
};

/**
 * Returns true if a value is array-like, otherwise false. Array-like means a
 * value is not null, undefined, or a function, and has a numeric `length`
 * property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to a library
var isArrayLike = function isArrayLike(val) {
  return val != null && (typeof val !== 'function' && typeof val.length === 'number');
};


/**
 * indexKeys
 *
 * @name indexKeys
 * @api private
 * @param {} target
 * @param {Function} pred
 * @return {Array}
 */
var indexKeys = function indexKeys(target, pred) {
  pred = pred || has;

  var results = [];

  for (var i = 0, len = target.length; i < len; i += 1) {
    if (pred(target, i)) {
      results.push(String(i));
    }
  }

  return results;
};

/**
 * Returns an array of an object's owned keys.
 *
 * @name objectKeys
 * @api private
 * @param {*} target
 * @param {Function} pred Predicate function used to include/exclude values from
 * the resulting array.
 * @return {Array}
 */
var objectKeys = function objectKeys(target, pred) {
  pred = pred || has;

  var results = [];

  for (var key in target) {
    if (pred(target, key)) {
      results.push(String(key));
    }
  }

  return results;
};

/**
 * Creates an array composed of all keys on the input object. Ignores any non-enumerable properties.
 * More permissive than the native `Object.keys` function (non-objects will not throw errors).
 *
 * @name keys
 * @api public
 * @category Object
 * @param {Object} source The value to retrieve keys from.
 * @return {Array} An array containing all the input `source`'s keys.
 * @example
 * keys({ likes: 'avocado', hates: 'pineapple' });
 * //=> ['likes', 'pineapple'];
 *
 * // Ignores non-enumerable properties
 * var hasHiddenKey = { name: 'Tim' };
 * Object.defineProperty(hasHiddenKey, 'hidden', {
 *   value: 'i am not enumerable!',
 *   enumerable: false
 * })
 * keys(hasHiddenKey);
 * //=> ['name'];
 *
 * // Works on arrays
 * keys(['a', 'b', 'c']);
 * //=> ['0', '1', '2']
 *
 * // Skips unpopulated indices in sparse arrays
 * var arr = [1];
 * arr[4] = 4;
 * keys(arr);
 * //=> ['0', '4']
 */
var keys = function keys(source) {
  if (source == null) {
    return [];
  }

  // IE6-8 compatibility (string)
  if (isString(source)) {
    return indexKeys(source, charAt);
  }

  // IE6-8 compatibility (arguments)
  if (isArrayLike(source)) {
    return indexKeys(source, has);
  }

  return objectKeys(source);
};

/*
 * Exports.
 */

module.exports = keys;

},{}],10:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

/**
 * Produce a new array by passing each value in the input `collection` through a transformative
 * `iterator` function. The `iterator` function is passed three arguments:
 * `(value, index, collection)`.
 *
 * @name map
 * @api public
 * @param {Function} iterator The transformer function to invoke per iteration.
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing the results of each `iterator` invocation.
 * @example
 * var square = function(x) { return x * x; };
 *
 * map(square, [1, 2, 3]);
 * //=> [1, 4, 9]
 */
var map = function map(iterator, collection) {
  if (typeof iterator !== 'function') {
    throw new TypeError('Expected a function but received a ' + typeof iterator);
  }

  var result = [];

  each(function(val, i, collection) {
    result.push(iterator(val, i, collection));
  }, collection);

  return result;
};

/*
 * Exports.
 */

module.exports = map;

},{"@ndhoule/each":4}],11:[function(require,module,exports){
'use strict';

var objToString = Object.prototype.toString;

// TODO: Move to lib
var existy = function(val) {
  return val != null;
};

// TODO: Move to lib
var isArray = function(val) {
  return objToString.call(val) === '[object Array]';
};

// TODO: Move to lib
var isString = function(val) {
   return typeof val === 'string' || objToString.call(val) === '[object String]';
};

// TODO: Move to lib
var isObject = function(val) {
  return val != null && typeof val === 'object';
};

/**
 * Returns a copy of the new `object` containing only the specified properties.
 *
 * @name pick
 * @api public
 * @param {string|string[]} props The property or properties to keep.
 * @param {Object} object The object to iterate over.
 * @return {Object} A new object containing only the specified properties from `object`.
 * @example
 * var person = { name: 'Tim', occupation: 'enchanter', fears: 'rabbits' };
 *
 * pick('name', person);
 * //=> { name: 'Tim' }
 *
 * pick(['name', 'fears'], person);
 * //=> { name: 'Tim', fears: 'rabbits' }
 */
var pick = function pick(props, object) {
  if (!existy(object) || !isObject(object)) {
    return {};
  }

  if (isString(props)) {
    props = [props];
  }

  if (!isArray(props)) {
    props = [];
  }

  var result = {};

  for (var i = 0; i < props.length; i += 1) {
    if (isString(props[i]) && props[i] in object) {
      result[props[i]] = object[props[i]];
    }
  }

  return result;
};

/*
 * Exports.
 */

module.exports = pick;

},{}],12:[function(require,module,exports){
'use strict';

var max = Math.max;

/**
 * Produce a new array by passing each value in the input `collection` through a transformative
 * `iterator` function. The `iterator` function is passed three arguments:
 * `(value, index, collection)`.
 *
 * @name rest
 * @api public
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing all but the first element from `collection`.
 * @example
 * rest([1, 2, 3]); // => [2, 3]
 */
var rest = function rest(collection) {
  if (collection == null || !collection.length) {
    return [];
  }

  // Preallocating an array *significantly* boosts performance when dealing with
  // `arguments` objects on v8. For a summary, see:
  // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
  var results = new Array(max(collection.length - 2, 0));

  for (var i = 1; i < collection.length; i += 1) {
    results[i - 1] = collection[i];
  }

  return results;
};

/*
 * Exports.
 */

module.exports = rest;

},{}],13:[function(require,module,exports){
(function (global){(function (){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var _analytics = global.analytics;
/*
 * Module dependencies.
 */
var Alias = require('segmentio-facade').Alias;
var Emitter = require('component-emitter');
var Facade = require('segmentio-facade');
var Group = require('segmentio-facade').Group;
var Identify = require('segmentio-facade').Identify;
var SourceMiddlewareChain = require('./middleware').SourceMiddlewareChain;
var IntegrationMiddlewareChain = require('./middleware')
    .IntegrationMiddlewareChain;
var DestinationMiddlewareChain = require('./middleware')
    .DestinationMiddlewareChain;
var Page = require('segmentio-facade').Page;
var Track = require('segmentio-facade').Track;
var bindAll = require('bind-all');
var clone = require('./utils/clone');
var extend = require('extend');
var cookie = require('./cookie');
var metrics = require('./metrics');
var debug = require('debug');
var defaults = require('@ndhoule/defaults');
var each = require('./utils/each');
var group = require('./group');
var is = require('is');
var isMeta = require('@segment/is-meta');
var keys = require('@ndhoule/keys');
var memory = require('./memory');
var nextTick = require('next-tick');
var normalize = require('./normalize');
var on = require('component-event').bind;
var pageDefaults = require('./pageDefaults');
var pick = require('@ndhoule/pick');
var prevent = require('@segment/prevent-default');
var url = require('component-url');
var store = require('./store');
var user = require('./user');
var type = require('component-type');
/**
 * Initialize a new `Analytics` instance.
 */
function Analytics() {
    this._options({});
    this.Integrations = {};
    this._sourceMiddlewares = new SourceMiddlewareChain();
    this._integrationMiddlewares = new IntegrationMiddlewareChain();
    this._destinationMiddlewares = {};
    this._integrations = {};
    this._readied = false;
    this._timeout = 300;
    // XXX: BACKWARDS COMPATIBILITY
    this._user = user;
    this.log = debug('analytics.js');
    bindAll(this);
    var self = this;
    this.on('initialize', function (settings, options) {
        if (options.initialPageview)
            self.page();
        self._parseQuery(window.location.search);
    });
}
/**
 * Mix in event emitter.
 */
Emitter(Analytics.prototype);
/**
 * Use a `plugin`.
 */
Analytics.prototype.use = function (plugin) {
    plugin(this);
    return this;
};
/**
 * Define a new `Integration`.
 */
Analytics.prototype.addIntegration = function (Integration) {
    var name = Integration.prototype.name;
    if (!name)
        throw new TypeError('attempted to add an invalid integration');
    this.Integrations[name] = Integration;
    return this;
};
/**
 * Define a new `SourceMiddleware`
 */
Analytics.prototype.addSourceMiddleware = function (middleware) {
    this._sourceMiddlewares.add(middleware);
    return this;
};
/**
 * Define a new `IntegrationMiddleware`
 * @deprecated
 */
Analytics.prototype.addIntegrationMiddleware = function (middleware) {
    this._integrationMiddlewares.add(middleware);
    return this;
};
/**
 * Define a new `DestinationMiddleware`
 * Destination Middleware is chained after integration middleware
 */
Analytics.prototype.addDestinationMiddleware = function (integrationName, middlewares) {
    var self = this;
    middlewares.forEach(function (middleware) {
        if (!self._destinationMiddlewares[integrationName]) {
            self._destinationMiddlewares[integrationName] = new DestinationMiddlewareChain();
        }
        self._destinationMiddlewares[integrationName].add(middleware);
    });
    return self;
};
/**
 * Initialize with the given integration `settings` and `options`.
 *
 * Aliased to `init` for convenience.
 */
Analytics.prototype.init = Analytics.prototype.initialize = function (settings, options) {
    settings = settings || {};
    options = options || {};
    this._options(options);
    this._readied = false;
    // clean unknown integrations from settings
    var self = this;
    each(function (_opts, name) {
        var Integration = self.Integrations[name];
        if (!Integration)
            delete settings[name];
    }, settings);
    // add integrations
    each(function (opts, name) {
        // Don't load disabled integrations
        if (options.integrations) {
            if (options.integrations[name] === false ||
                (options.integrations.All === false && !options.integrations[name])) {
                return;
            }
        }
        var Integration = self.Integrations[name];
        var clonedOpts = {};
        extend(true, clonedOpts, opts); // deep clone opts
        var integration = new Integration(clonedOpts);
        self.log('initialize %o - %o', name, opts);
        self.add(integration);
    }, settings);
    var integrations = this._integrations;
    // load user now that options are set
    user.load();
    group.load();
    // make ready callback
    var readyCallCount = 0;
    var integrationCount = keys(integrations).length;
    var ready = function () {
        readyCallCount++;
        if (readyCallCount >= integrationCount) {
            self._readied = true;
            self.emit('ready');
        }
    };
    // init if no integrations
    if (integrationCount <= 0) {
        ready();
    }
    // initialize integrations, passing ready
    // create a list of any integrations that did not initialize - this will be passed with all events for replay support:
    this.failedInitializations = [];
    var initialPageSkipped = false;
    each(function (integration) {
        if (options.initialPageview &&
            integration.options.initialPageview === false) {
            // We've assumed one initial pageview, so make sure we don't count the first page call.
            var page = integration.page;
            integration.page = function () {
                if (initialPageSkipped) {
                    return page.apply(this, arguments);
                }
                initialPageSkipped = true;
                return;
            };
        }
        integration.analytics = self;
        integration.once('ready', ready);
        try {
            metrics.increment('analytics_js.integration.invoke', {
                method: 'initialize',
                integration_name: integration.name
            });
            integration.initialize();
        }
        catch (e) {
            var integrationName = integration.name;
            metrics.increment('analytics_js.integration.invoke.error', {
                method: 'initialize',
                integration_name: integration.name
            });
            self.failedInitializations.push(integrationName);
            self.log('Error initializing %s integration: %o', integrationName, e);
            // Mark integration as ready to prevent blocking of anyone listening to analytics.ready()
            integration.ready();
        }
    }, integrations);
    // backwards compat with angular plugin and used for init logic checks
    this.initialized = true;
    this.emit('initialize', settings, options);
    return this;
};
/**
 * Set the user's `id`.
 */
Analytics.prototype.setAnonymousId = function (id) {
    this.user().anonymousId(id);
    return this;
};
/**
 * Add an integration.
 */
Analytics.prototype.add = function (integration) {
    this._integrations[integration.name] = integration;
    return this;
};
/**
 * Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.identify = function (id, traits, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(traits))
        (fn = traits), (options = null), (traits = null);
    if (is.object(id))
        (options = traits), (traits = id), (id = user.id());
    /* eslint-enable no-unused-expressions, no-sequences */
    // clone traits before we manipulate so we don't do anything uncouth, and take
    // from `user` so that we carryover anonymous traits
    user.identify(id, traits);
    var msg = this.normalize({
        options: options,
        traits: user.traits(),
        userId: user.id()
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('identify', new Identify(msg));
    // emit
    this.emit('identify', id, traits, options);
    this._callback(fn);
    return this;
};
/**
 * Return the current user.
 *
 * @return {Object}
 */
Analytics.prototype.user = function () {
    return user;
};
/**
 * Identify a group by optional `id` and `traits`. Or, if no arguments are
 * supplied, return the current group.
 *
 * @param {string} [id=group.id()] Group ID.
 * @param {Object} [traits=null] Group traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics|Object}
 */
Analytics.prototype.group = function (id, traits, options, fn) {
    /* eslint-disable no-unused-expressions, no-sequences */
    if (!arguments.length)
        return group;
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(traits))
        (fn = traits), (options = null), (traits = null);
    if (is.object(id))
        (options = traits), (traits = id), (id = group.id());
    /* eslint-enable no-unused-expressions, no-sequences */
    // grab from group again to make sure we're taking from the source
    group.identify(id, traits);
    var msg = this.normalize({
        options: options,
        traits: group.traits(),
        groupId: group.id()
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('group', new Group(msg));
    this.emit('group', id, traits, options);
    this._callback(fn);
    return this;
};
/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {string} event
 * @param {Object} [properties=null]
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.track = function (event, properties, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(properties))
        (fn = properties), (options = null), (properties = null);
    /* eslint-enable no-unused-expressions, no-sequences */
    // figure out if the event is archived.
    var plan = this.options.plan || {};
    var events = plan.track || {};
    var planIntegrationOptions = {};
    // normalize
    var msg = this.normalize({
        properties: properties,
        options: options,
        event: event
    });
    // plan.
    plan = events[event];
    if (plan) {
        this.log('plan %o - %o', event, plan);
        if (plan.enabled === false) {
            // Disabled events should always be sent to Segment.
            planIntegrationOptions = { All: false, 'Segment.io': true };
        }
        else {
            planIntegrationOptions = plan.integrations || {};
        }
    }
    else {
        var defaultPlan = events.__default || { enabled: true };
        if (!defaultPlan.enabled) {
            // Disabled events should always be sent to Segment.
            planIntegrationOptions = { All: false, 'Segment.io': true };
        }
    }
    // Add the initialize integrations so the server-side ones can be disabled too
    defaults(msg.integrations, this._mergeInitializeAndPlanIntegrations(planIntegrationOptions));
    this._invoke('track', new Track(msg));
    this.emit('track', event, properties, options);
    this._callback(fn);
    return this;
};
/**
 * Helper method to track an outbound link that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackClick`.
 *
 * @param {Element|Array} links
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */
Analytics.prototype.trackClick = Analytics.prototype.trackLink = function (links, event, properties) {
    if (!links)
        return this;
    // always arrays, handles jquery
    if (type(links) === 'element')
        links = [links];
    var self = this;
    each(function (el) {
        if (type(el) !== 'element') {
            throw new TypeError('Must pass HTMLElement to `analytics.trackLink`.');
        }
        on(el, 'click', function (e) {
            var ev = is.fn(event) ? event(el) : event;
            var props = is.fn(properties) ? properties(el) : properties;
            var href = el.getAttribute('href') ||
                el.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
                el.getAttribute('xlink:href');
            self.track(ev, props);
            if (href && el.target !== '_blank' && !isMeta(e)) {
                prevent(e);
                self._callback(function () {
                    window.location.href = href;
                });
            }
        });
    }, links);
    return this;
};
/**
 * Helper method to track an outbound form that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackSubmit`.
 *
 * @param {Element|Array} forms
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */
Analytics.prototype.trackSubmit = Analytics.prototype.trackForm = function (forms, event, properties) {
    if (!forms)
        return this;
    // always arrays, handles jquery
    if (type(forms) === 'element')
        forms = [forms];
    var self = this;
    each(function (el) {
        if (type(el) !== 'element')
            throw new TypeError('Must pass HTMLElement to `analytics.trackForm`.');
        function handler(e) {
            prevent(e);
            var ev = is.fn(event) ? event(el) : event;
            var props = is.fn(properties) ? properties(el) : properties;
            self.track(ev, props);
            self._callback(function () {
                el.submit();
            });
        }
        // Support the events happening through jQuery or Zepto instead of through
        // the normal DOM API, because `el.submit` doesn't bubble up events...
        var $ = window.jQuery || window.Zepto;
        if ($) {
            $(el).submit(handler);
        }
        else {
            on(el, 'submit', handler);
        }
    }, forms);
    return this;
};
/**
 * Trigger a pageview, labeling the current page with an optional `category`,
 * `name` and `properties`.
 *
 * @param {string} [category]
 * @param {string} [name]
 * @param {Object|string} [properties] (or path)
 * @param {Object} [options]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.page = function (category, name, properties, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(properties))
        (fn = properties), (options = properties = null);
    if (is.fn(name))
        (fn = name), (options = properties = name = null);
    if (type(category) === 'object')
        (options = name), (properties = category), (name = category = null);
    if (type(name) === 'object')
        (options = properties), (properties = name), (name = null);
    if (type(category) === 'string' && type(name) !== 'string')
        (name = category), (category = null);
    /* eslint-enable no-unused-expressions, no-sequences */
    properties = clone(properties) || {};
    if (name)
        properties.name = name;
    if (category)
        properties.category = category;
    // Ensure properties has baseline spec properties.
    // TODO: Eventually move these entirely to `options.context.page`
    var defs = pageDefaults();
    defaults(properties, defs);
    // Mirror user overrides to `options.context.page` (but exclude custom properties)
    // (Any page defaults get applied in `this.normalize` for consistency.)
    // Weird, yeah--moving special props to `context.page` will fix this in the long term.
    var overrides = pick(keys(defs), properties);
    if (!is.empty(overrides)) {
        options = options || {};
        options.context = options.context || {};
        options.context.page = overrides;
    }
    var msg = this.normalize({
        properties: properties,
        category: category,
        options: options,
        name: name
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('page', new Page(msg));
    this.emit('page', category, name, properties, options);
    this._callback(fn);
    return this;
};
/**
 * FIXME: BACKWARDS COMPATIBILITY: convert an old `pageview` to a `page` call.
 * @api private
 */
Analytics.prototype.pageview = function (url) {
    var properties = {};
    if (url)
        properties.path = url;
    this.page(properties);
    return this;
};
/**
 * Merge two previously unassociated user identities.
 *
 * @param {string} to
 * @param {string} from (optional)
 * @param {Object} options (optional)
 * @param {Function} fn (optional)
 * @return {Analytics}
 */
Analytics.prototype.alias = function (to, from, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(from))
        (fn = from), (options = null), (from = null);
    if (is.object(from))
        (options = from), (from = null);
    /* eslint-enable no-unused-expressions, no-sequences */
    var msg = this.normalize({
        options: options,
        previousId: from,
        userId: to
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('alias', new Alias(msg));
    this.emit('alias', to, from, options);
    this._callback(fn);
    return this;
};
/**
 * Register a `fn` to be fired when all the analytics services are ready.
 */
Analytics.prototype.ready = function (fn) {
    if (is.fn(fn)) {
        if (this._readied) {
            nextTick(fn);
        }
        else {
            this.once('ready', fn);
        }
    }
    return this;
};
/**
 * Set the `timeout` (in milliseconds) used for callbacks.
 */
Analytics.prototype.timeout = function (timeout) {
    this._timeout = timeout;
};
/**
 * Enable or disable debug.
 */
Analytics.prototype.debug = function (str) {
    if (!arguments.length || str) {
        debug.enable('analytics:' + (str || '*'));
    }
    else {
        debug.disable();
    }
};
/**
 * Apply options.
 * @api private
 */
Analytics.prototype._options = function (options) {
    options = options || {};
    this.options = options;
    cookie.options(options.cookie);
    metrics.options(options.metrics);
    store.options(options.localStorage);
    user.options(options.user);
    group.options(options.group);
    return this;
};
/**
 * Callback a `fn` after our defined timeout period.
 * @api private
 */
Analytics.prototype._callback = function (fn) {
    if (is.fn(fn)) {
        this._timeout ? setTimeout(fn, this._timeout) : nextTick(fn);
    }
    return this;
};
/**
 * Call `method` with `facade` on all enabled integrations.
 *
 * @param {string} method
 * @param {Facade} facade
 * @return {Analytics}
 * @api private
 */
Analytics.prototype._invoke = function (method, facade) {
    var self = this;
    try {
        this._sourceMiddlewares.applyMiddlewares(extend(true, new Facade({}), facade), this._integrations, function (result) {
            // A nullified payload should not be sent.
            if (result === null) {
                self.log('Payload with method "%s" was null and dropped by source a middleware.', method);
                return;
            }
            // Check if the payload is still a Facade. If not, convert it to one.
            if (!(result instanceof Facade)) {
                result = new Facade(result);
            }
            self.emit('invoke', result);
            metrics.increment('analytics_js.invoke', {
                method: method
            });
            applyIntegrationMiddlewares(result);
        });
    }
    catch (e) {
        metrics.increment('analytics_js.invoke.error', {
            method: method
        });
        self.log('Error invoking .%s method of %s integration: %o', method, name, e);
    }
    return this;
    function applyIntegrationMiddlewares(facade) {
        var failedInitializations = self.failedInitializations || [];
        each(function (integration, name) {
            var facadeCopy = extend(true, new Facade({}), facade);
            if (!facadeCopy.enabled(name))
                return;
            // Check if an integration failed to initialize.
            // If so, do not process the message as the integration is in an unstable state.
            if (failedInitializations.indexOf(name) >= 0) {
                self.log('Skipping invocation of .%s method of %s integration. Integration failed to initialize properly.', method, name);
            }
            else {
                try {
                    // Apply any integration middlewares that exist, then invoke the integration with the result.
                    self._integrationMiddlewares.applyMiddlewares(facadeCopy, integration.name, function (result) {
                        // A nullified payload should not be sent to an integration.
                        if (result === null) {
                            self.log('Payload to integration "%s" was null and dropped by a middleware.', name);
                            return;
                        }
                        // Check if the payload is still a Facade. If not, convert it to one.
                        if (!(result instanceof Facade)) {
                            result = new Facade(result);
                        }
                        // apply destination middlewares
                        // Apply any integration middlewares that exist, then invoke the integration with the result.
                        if (self._destinationMiddlewares[integration.name]) {
                            self._destinationMiddlewares[integration.name].applyMiddlewares(facadeCopy, integration.name, function (result) {
                                // A nullified payload should not be sent to an integration.
                                if (result === null) {
                                    self.log('Payload to destination "%s" was null and dropped by a middleware.', name);
                                    return;
                                }
                                // Check if the payload is still a Facade. If not, convert it to one.
                                if (!(result instanceof Facade)) {
                                    result = new Facade(result);
                                }
                                metrics.increment('analytics_js.integration.invoke', {
                                    method: method,
                                    integration_name: integration.name
                                });
                                integration.invoke.call(integration, method, result);
                            });
                        }
                        else {
                            metrics.increment('analytics_js.integration.invoke', {
                                method: method,
                                integration_name: integration.name
                            });
                            integration.invoke.call(integration, method, result);
                        }
                    });
                }
                catch (e) {
                    metrics.increment('analytics_js.integration.invoke.error', {
                        method: method,
                        integration_name: integration.name
                    });
                    self.log('Error invoking .%s method of %s integration: %o', method, name, e);
                }
            }
        }, self._integrations);
    }
};
/**
 * Push `args`.
 *
 * @param {Array} args
 * @api private
 */
Analytics.prototype.push = function (args) {
    var method = args.shift();
    if (!this[method])
        return;
    this[method].apply(this, args);
};
/**
 * Reset group and user traits and id's.
 *
 * @api public
 */
Analytics.prototype.reset = function () {
    this.user().logout();
    this.group().logout();
};
/**
 * Parse the query string for callable methods.
 *
 * @api private
 */
Analytics.prototype._parseQuery = function (query) {
    // Parse querystring to an object
    var parsed = url.parse(query);
    var q = parsed.query.split('&').reduce(function (acc, str) {
        var _a = str.split('='), k = _a[0], v = _a[1];
        acc[k] = decodeURI(v).replace('+', ' ');
        return acc;
    }, {});
    // Create traits and properties objects, populate from querysting params
    var traits = pickPrefix('ajs_trait_', q);
    var props = pickPrefix('ajs_prop_', q);
    // Trigger based on callable parameters in the URL
    if (q.ajs_uid)
        this.identify(q.ajs_uid, traits);
    if (q.ajs_event)
        this.track(q.ajs_event, props);
    if (q.ajs_aid)
        user.anonymousId(q.ajs_aid);
    return this;
    /**
     * Create a shallow copy of an input object containing only the properties
     * whose keys are specified by a prefix, stripped of that prefix
     *
     * @return {Object}
     * @api private
     */
    function pickPrefix(prefix, object) {
        var length = prefix.length;
        var sub;
        return Object.keys(object).reduce(function (acc, key) {
            if (key.substr(0, length) === prefix) {
                sub = key.substr(length);
                acc[sub] = object[key];
            }
            return acc;
        }, {});
    }
};
/**
 * Normalize the given `msg`.
 */
Analytics.prototype.normalize = function (msg) {
    msg = normalize(msg, keys(this._integrations));
    if (msg.anonymousId)
        user.anonymousId(msg.anonymousId);
    msg.anonymousId = user.anonymousId();
    // Ensure all outgoing requests include page data in their contexts.
    msg.context.page = defaults(msg.context.page || {}, pageDefaults());
    return msg;
};
/**
 * Merges the tracking plan and initialization integration options.
 *
 * @param  {Object} planIntegrations Tracking plan integrations.
 * @return {Object}                  The merged integrations.
 */
Analytics.prototype._mergeInitializeAndPlanIntegrations = function (planIntegrations) {
    // Do nothing if there are no initialization integrations
    if (!this.options.integrations) {
        return planIntegrations;
    }
    // Clone the initialization integrations
    var integrations = extend({}, this.options.integrations);
    var integrationName;
    // Allow the tracking plan to disable integrations that were explicitly
    // enabled on initialization
    if (planIntegrations.All === false) {
        integrations = { All: false };
    }
    for (integrationName in planIntegrations) {
        if (planIntegrations.hasOwnProperty(integrationName)) {
            // Don't allow the tracking plan to re-enable disabled integrations
            if (this.options.integrations[integrationName] !== false) {
                integrations[integrationName] = planIntegrations[integrationName];
            }
        }
    }
    return integrations;
};
/**
 * No conflict support.
 */
Analytics.prototype.noConflict = function () {
    window.analytics = _analytics;
    return this;
};
/*
 * Exports.
 */
module.exports = Analytics;
module.exports.cookie = cookie;
module.exports.memory = memory;
module.exports.store = store;
module.exports.metrics = metrics;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cookie":14,"./group":16,"./memory":17,"./metrics":18,"./middleware":19,"./normalize":20,"./pageDefaults":21,"./store":22,"./user":23,"./utils/clone":24,"./utils/each":25,"@ndhoule/defaults":2,"@ndhoule/keys":9,"@ndhoule/pick":11,"@segment/is-meta":39,"@segment/prevent-default":43,"bind-all":49,"component-emitter":27,"component-event":52,"component-type":55,"component-url":56,"debug":57,"extend":60,"is":29,"next-tick":70,"segmentio-facade":80}],14:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
var bindAll = require('bind-all');
var clone = require('./utils/clone');
var cookie = require('@segment/cookie');
var debug = require('debug')('analytics.js:cookie');
var defaults = require('@ndhoule/defaults');
var topDomain = require('@segment/top-domain');
/**
 * Initialize a new `Cookie` with `options`.
 *
 * @param {Object} options
 */
function Cookie(options) {
    this.options(options);
}
/**
 * Get or set the cookie options.
 */
Cookie.prototype.options = function (options) {
    if (arguments.length === 0)
        return this._options;
    options = options || {};
    var domain = '.' + topDomain(window.location.href);
    if (domain === '.')
        domain = null;
    this._options = defaults(options, {
        // default to a year
        maxage: 31536000000,
        path: '/',
        domain: domain,
        sameSite: 'Lax'
    });
    // http://curl.haxx.se/rfc/cookie_spec.html
    // https://publicsuffix.org/list/effective_tld_names.dat
    //
    // try setting a dummy cookie with the options
    // if the cookie isn't set, it probably means
    // that the domain is on the public suffix list
    // like myapp.herokuapp.com or localhost / ip.
    this.set('ajs:test', true);
    if (!this.get('ajs:test')) {
        debug('fallback to domain=null');
        this._options.domain = null;
    }
    this.remove('ajs:test');
};
/**
 * Set a `key` and `value` in our cookie.
 */
Cookie.prototype.set = function (key, value) {
    try {
        value = window.JSON.stringify(value);
        cookie(key, value === 'null' ? null : value, clone(this._options));
        return true;
    }
    catch (e) {
        return false;
    }
};
/**
 * Get a value from our cookie by `key`.
 */
Cookie.prototype.get = function (key) {
    try {
        var value = cookie(key);
        value = value ? window.JSON.parse(value) : null;
        return value;
    }
    catch (e) {
        return null;
    }
};
/**
 * Remove a value from our cookie by `key`.
 */
Cookie.prototype.remove = function (key) {
    try {
        cookie(key, null, clone(this._options));
        return true;
    }
    catch (e) {
        return false;
    }
};
/**
 * Expose the cookie singleton.
 */
module.exports = bindAll(new Cookie());
/**
 * Expose the `Cookie` constructor.
 */
module.exports.Cookie = Cookie;

},{"./utils/clone":24,"@ndhoule/defaults":2,"@segment/cookie":37,"@segment/top-domain":46,"bind-all":49,"debug":57}],15:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Module dependencies.
 */
var clone = require('./utils/clone');
var cookie = require('./cookie');
var debug = require('debug')('analytics:entity');
var defaults = require('@ndhoule/defaults');
var extend = require('@ndhoule/extend');
var memory = require('./memory');
var store = require('./store');
var isodateTraverse = require('@segment/isodate-traverse');
/**
 * Expose `Entity`
 */
module.exports = Entity;
/**
 * Initialize new `Entity` with `options`.
 */
function Entity(options) {
    this.options(options);
    this.initialize();
}
/**
 * Initialize picks the storage.
 *
 * Checks to see if cookies can be set
 * otherwise fallsback to localStorage.
 */
Entity.prototype.initialize = function () {
    cookie.set('ajs:cookies', true);
    // cookies are enabled.
    if (cookie.get('ajs:cookies')) {
        cookie.remove('ajs:cookies');
        this._storage = cookie;
        return;
    }
    // localStorage is enabled.
    if (store.enabled) {
        this._storage = store;
        return;
    }
    // fallback to memory storage.
    debug('warning using memory store both cookies and localStorage are disabled');
    this._storage = memory;
};
/**
 * Get the storage.
 */
Entity.prototype.storage = function () {
    return this._storage;
};
/**
 * Get or set storage `options`.
 */
Entity.prototype.options = function (options) {
    if (arguments.length === 0)
        return this._options;
    this._options = defaults(options || {}, this.defaults || {});
};
/**
 * Get or set the entity's `id`.
 */
Entity.prototype.id = function (id) {
    switch (arguments.length) {
        case 0:
            return this._getId();
        case 1:
            return this._setId(id);
        default:
        // No default case
    }
};
/**
 * Get the entity's id.
 */
Entity.prototype._getId = function () {
    if (!this._options.persist) {
        return this._id === undefined ? null : this._id;
    }
    // Check cookies.
    var cookieId = this._getIdFromCookie();
    if (cookieId) {
        return cookieId;
    }
    // Check localStorage.
    var lsId = this._getIdFromLocalStorage();
    if (lsId) {
        // Copy the id to cookies so we can read it directly from cookies next time.
        this._setIdInCookies(lsId);
        return lsId;
    }
    return null;
};
/**
 * Get the entity's id from cookies.
 */
// FIXME `options.cookie` is an optional field, so `this._options.cookie.key`
// can thrown an exception.
Entity.prototype._getIdFromCookie = function () {
    return this.storage().get(this._options.cookie.key);
};
/**
 * Get the entity's id from cookies.
 */
Entity.prototype._getIdFromLocalStorage = function () {
    if (!this._options.localStorageFallbackDisabled) {
        return store.get(this._options.cookie.key);
    }
    return null;
};
/**
 * Set the entity's `id`.
 */
Entity.prototype._setId = function (id) {
    if (this._options.persist) {
        this._setIdInCookies(id);
        this._setIdInLocalStorage(id);
    }
    else {
        this._id = id;
    }
};
/**
 * Set the entity's `id` in cookies.
 */
Entity.prototype._setIdInCookies = function (id) {
    this.storage().set(this._options.cookie.key, id);
};
/**
 * Set the entity's `id` in local storage.
 */
Entity.prototype._setIdInLocalStorage = function (id) {
    if (!this._options.localStorageFallbackDisabled) {
        store.set(this._options.cookie.key, id);
    }
};
/**
 * Get or set the entity's `traits`.
 *
 * BACKWARDS COMPATIBILITY: aliased to `properties`
 */
Entity.prototype.properties = Entity.prototype.traits = function (traits) {
    switch (arguments.length) {
        case 0:
            return this._getTraits();
        case 1:
            return this._setTraits(traits);
        default:
        // No default case
    }
};
/**
 * Get the entity's traits. Always convert ISO date strings into real dates,
 * since they aren't parsed back from local storage.
 */
Entity.prototype._getTraits = function () {
    var ret = this._options.persist
        ? store.get(this._options.localStorage.key)
        : this._traits;
    return ret ? isodateTraverse(clone(ret)) : {};
};
/**
 * Set the entity's `traits`.
 */
Entity.prototype._setTraits = function (traits) {
    traits = traits || {};
    if (this._options.persist) {
        store.set(this._options.localStorage.key, traits);
    }
    else {
        this._traits = traits;
    }
};
/**
 * Identify the entity with an `id` and `traits`. If we it's the same entity,
 * extend the existing `traits` instead of overwriting.
 */
Entity.prototype.identify = function (id, traits) {
    traits = traits || {};
    var current = this.id();
    if (current === null || current === id)
        traits = extend(this.traits(), traits);
    if (id)
        this.id(id);
    this.debug('identify %o, %o', id, traits);
    this.traits(traits);
    this.save();
};
/**
 * Save the entity to local storage and the cookie.
 */
Entity.prototype.save = function () {
    if (!this._options.persist)
        return false;
    this._setId(this.id());
    this._setTraits(this.traits());
    return true;
};
/**
 * Log the entity out, reseting `id` and `traits` to defaults.
 */
Entity.prototype.logout = function () {
    this.id(null);
    this.traits({});
    this.storage().remove(this._options.cookie.key);
    store.remove(this._options.cookie.key);
    store.remove(this._options.localStorage.key);
};
/**
 * Reset all entity state, logging out and returning options to defaults.
 */
Entity.prototype.reset = function () {
    this.logout();
    this.options({});
};
/**
 * Load saved entity `id` or `traits` from storage.
 */
Entity.prototype.load = function () {
    this.id(this.id());
    this.traits(this.traits());
};

},{"./cookie":14,"./memory":17,"./store":22,"./utils/clone":24,"@ndhoule/defaults":2,"@ndhoule/extend":6,"@segment/isodate-traverse":40,"debug":57}],16:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Module dependencies.
 */
var Entity = require('./entity');
var bindAll = require('bind-all');
var debug = require('debug')('analytics:group');
var inherit = require('inherits');
/**
 * Group defaults
 */
Group.defaults = {
    persist: true,
    cookie: {
        key: 'ajs_group_id'
    },
    localStorage: {
        key: 'ajs_group_properties'
    }
};
/**
 * Initialize a new `Group` with `options`.
 */
function Group(options) {
    this.defaults = Group.defaults;
    this.debug = debug;
    Entity.call(this, options);
}
/**
 * Inherit `Entity`
 */
inherit(Group, Entity);
/**
 * Expose the group singleton.
 */
module.exports = bindAll(new Group());
/**
 * Expose the `Group` constructor.
 */
module.exports.Group = Group;

},{"./entity":15,"bind-all":49,"debug":57,"inherits":28}],17:[function(require,module,exports){
'use strict';
/*
 * Module Dependencies.
 */
var bindAll = require('bind-all');
var clone = require('./utils/clone');
/**
 * HOP.
 */
var has = Object.prototype.hasOwnProperty;
/**
 * Expose `Memory`
 */
module.exports = bindAll(new Memory());
/**
 * Initialize `Memory` store
 */
function Memory() {
    this.store = {};
}
/**
 * Set a `key` and `value`.
 */
Memory.prototype.set = function (key, value) {
    this.store[key] = clone(value);
    return true;
};
/**
 * Get a `key`.
 */
Memory.prototype.get = function (key) {
    if (!has.call(this.store, key))
        return;
    return clone(this.store[key]);
};
/**
 * Remove a `key`.
 */
Memory.prototype.remove = function (key) {
    delete this.store[key];
    return true;
};

},{"./utils/clone":24,"bind-all":49}],18:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bindAll = require('bind-all');
var send = require('@segment/send-json');
var debug = require('debug')('analytics.js:metrics');
function Metrics(options) {
    this.options(options);
}
/**
 * Set the metrics options.
 */
Metrics.prototype.options = function (options) {
    options = options || {};
    this.host = options.host || 'api.segment.io/v1';
    this.sampleRate = options.sampleRate || 0; // disable metrics by default.
    this.flushTimer = options.flushTimer || 30 * 1000 /* 30s */;
    this.maxQueueSize = options.maxQueueSize || 20;
    this.queue = [];
    if (this.sampleRate > 0) {
        var self = this;
        setInterval(function () {
            self._flush();
        }, this.flushTimer);
    }
};
/**
 * Increments the counter identified by name and tags by one.
 */
Metrics.prototype.increment = function (metric, tags) {
    if (Math.random() > this.sampleRate) {
        return;
    }
    if (this.queue.length >= this.maxQueueSize) {
        return;
    }
    this.queue.push({ type: 'Counter', metric: metric, value: 1, tags: tags });
    // Trigger a flush if this is an error metric.
    if (metric.indexOf('error') > 0) {
        this._flush();
    }
};
/**
 * Flush all queued metrics.
 */
Metrics.prototype._flush = function () {
    var self = this;
    if (self.queue.length <= 0) {
        return;
    }
    var payload = { series: this.queue };
    var headers = { 'Content-Type': 'text/plain' };
    self.queue = [];
    // This endpoint does not support jsonp, so only proceed if the browser
    // supports xhr.
    if (send.type !== 'xhr')
        return;
    send('https://' + this.host + '/m', payload, headers, function (err, res) {
        debug('sent %O, received %O', payload, [err, res]);
    });
};
/**
 * Expose the metrics singleton.
 */
module.exports = bindAll(new Metrics());
/**
 * Expose the `Metrics` constructor.
 */
module.exports.Metrics = Metrics;

},{"@segment/send-json":44,"bind-all":49,"debug":57}],19:[function(require,module,exports){
'use strict';
var Facade = require('segmentio-facade');
module.exports.SourceMiddlewareChain = function SourceMiddlewareChain() {
    var apply = middlewareChain(this);
    this.applyMiddlewares = function (facade, integrations, callback) {
        return apply(function (mw, payload, next) {
            mw({
                integrations: integrations,
                next: next,
                payload: payload
            });
        }, facade, callback);
    };
};
module.exports.IntegrationMiddlewareChain = function IntegrationMiddlewareChain() {
    var apply = middlewareChain(this);
    this.applyMiddlewares = function (facade, integration, callback) {
        return apply(function (mw, payload, next) {
            mw(payload, integration, next);
        }, facade, callback);
    };
};
module.exports.DestinationMiddlewareChain = function DestinationMiddlewareChain() {
    var apply = middlewareChain(this);
    this.applyMiddlewares = function (facade, integration, callback) {
        return apply(function (mw, payload, next) {
            mw({ payload: payload, integration: integration, next: next });
        }, facade, callback);
    };
};
// Chain is essentially a linked list of middlewares to run in order.
function middlewareChain(dest) {
    var middlewares = [];
    // Return a copy to prevent external mutations.
    dest.getMiddlewares = function () {
        return middlewares.slice();
    };
    dest.add = function (middleware) {
        if (typeof middleware !== 'function')
            throw new Error('attempted to add non-function middleware');
        // Check for identical object references - bug check.
        if (middlewares.indexOf(middleware) !== -1)
            throw new Error('middleware is already registered');
        middlewares.push(middleware);
    };
    // fn is the callback to be run once all middlewares have been applied.
    return function applyMiddlewares(run, facade, callback) {
        if (typeof facade !== 'object')
            throw new Error('applyMiddlewares requires a payload object');
        if (typeof callback !== 'function')
            throw new Error('applyMiddlewares requires a function callback');
        // Attach callback to the end of the chain.
        var middlewaresToApply = middlewares.slice();
        middlewaresToApply.push(callback);
        executeChain(run, facade, middlewaresToApply, 0);
    };
}
// Go over all middlewares until all have been applied.
function executeChain(run, payload, middlewares, index) {
    // If the facade has been nullified, immediately skip to the final middleware.
    if (payload === null) {
        middlewares[middlewares.length - 1](null);
        return;
    }
    // Check if the payload is still a Facade. If not, convert it to one.
    if (!(payload instanceof Facade)) {
        payload = new Facade(payload);
    }
    var mw = middlewares[index];
    if (mw) {
        // If there's another middleware, continue down the chain. Otherwise, call the final function.
        if (middlewares[index + 1]) {
            run(mw, payload, function (result) {
                executeChain(run, result, middlewares, ++index);
            });
        }
        else {
            mw(payload);
        }
    }
}
module.exports.middlewareChain = middlewareChain;

},{"segmentio-facade":80}],20:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module Dependencies.
 */
var debug = require('debug')('analytics.js:normalize');
var defaults = require('@ndhoule/defaults');
var each = require('./utils/each');
var includes = require('@ndhoule/includes');
var map = require('./utils/map');
var type = require('component-type');
var uuid = require('uuid/v4');
var md5 = require('spark-md5').hash;
/**
 * HOP.
 */
var has = Object.prototype.hasOwnProperty;
/**
 * Expose `normalize`
 */
module.exports = normalize;
/**
 * Toplevel properties.
 */
var toplevel = ['integrations', 'anonymousId', 'timestamp', 'context'];
function normalize(msg, list) {
    var lower = map(function (s) {
        return s.toLowerCase();
    }, list);
    var opts = msg.options || {};
    var integrations = opts.integrations || {};
    var providers = opts.providers || {};
    var context = opts.context || {};
    var ret = {};
    debug('<-', msg);
    // integrations.
    each(function (value, key) {
        if (!integration(key))
            return;
        if (!has.call(integrations, key))
            integrations[key] = value;
        delete opts[key];
    }, opts);
    // providers.
    delete opts.providers;
    each(function (value, key) {
        if (!integration(key))
            return;
        if (type(integrations[key]) === 'object')
            return;
        if (has.call(integrations, key) && typeof providers[key] === 'boolean')
            return;
        integrations[key] = value;
    }, providers);
    // move all toplevel options to msg
    // and the rest to context.
    each(function (_value, key) {
        if (includes(key, toplevel)) {
            ret[key] = opts[key];
        }
        else {
            context[key] = opts[key];
        }
    }, opts);
    // generate and attach a messageId to msg
    msg.messageId = 'ajs-' + md5(window.JSON.stringify(msg) + uuid());
    // cleanup
    delete msg.options;
    ret.integrations = integrations;
    ret.context = context;
    ret = defaults(ret, msg);
    debug('->', ret);
    return ret;
    function integration(name) {
        return !!(includes(name, list) ||
            name.toLowerCase() === 'all' ||
            includes(name.toLowerCase(), lower));
    }
}

},{"./utils/each":25,"./utils/map":26,"@ndhoule/defaults":2,"@ndhoule/includes":8,"component-type":55,"debug":57,"spark-md5":91,"uuid/v4":101}],21:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Module dependencies.
 */
var canonical = require('@segment/canonical');
var includes = require('@ndhoule/includes');
var url = require('component-url');
/**
 * Return a default `options.context.page` object.
 *
 * https://segment.com/docs/spec/page/#properties
 */
function pageDefaults() {
    return {
        path: canonicalPath(),
        referrer: document.referrer,
        search: location.search,
        title: document.title,
        url: canonicalUrl(location.search)
    };
}
/**
 * Return the canonical path for the page.
 */
function canonicalPath() {
    var canon = canonical();
    if (!canon)
        return window.location.pathname;
    var parsed = url.parse(canon);
    return parsed.pathname;
}
/**
 * Return the canonical URL for the page concat the given `search`
 * and strip the hash.
 */
function canonicalUrl(search) {
    var canon = canonical();
    if (canon)
        return includes('?', canon) ? canon : canon + search;
    var url = window.location.href;
    var i = url.indexOf('#');
    return i === -1 ? url : url.slice(0, i);
}
/*
 * Exports.
 */
module.exports = pageDefaults;

},{"@ndhoule/includes":8,"@segment/canonical":36,"component-url":56}],22:[function(require,module,exports){
'use strict';
/*
 * Module dependencies.
 */
var bindAll = require('bind-all');
var defaults = require('@ndhoule/defaults');
var store = require('@segment/store');
/**
 * Initialize a new `Store` with `options`.
 *
 * @param {Object} options
 */
function Store(options) {
    this.options(options);
}
/**
 * Set the `options` for the store.
 */
Store.prototype.options = function (options) {
    if (arguments.length === 0)
        return this._options;
    options = options || {};
    defaults(options, { enabled: true });
    this.enabled = options.enabled && store.enabled;
    this._options = options;
};
/**
 * Set a `key` and `value` in local storage.
 */
Store.prototype.set = function (key, value) {
    if (!this.enabled)
        return false;
    return store.set(key, value);
};
/**
 * Get a value from local storage by `key`.
 */
Store.prototype.get = function (key) {
    if (!this.enabled)
        return null;
    return store.get(key);
};
/**
 * Remove a value from local storage by `key`.
 */
Store.prototype.remove = function (key) {
    if (!this.enabled)
        return false;
    return store.remove(key);
};
/**
 * Expose the store singleton.
 */
module.exports = bindAll(new Store());
/**
 * Expose the `Store` constructor.
 */
module.exports.Store = Store;

},{"@ndhoule/defaults":2,"@segment/store":45,"bind-all":49}],23:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Entity = require('./entity');
var bindAll = require('bind-all');
var cookie = require('./cookie');
var debug = require('debug')('analytics:user');
var inherit = require('inherits');
var rawCookie = require('@segment/cookie');
var uuid = require('uuid');
var localStorage = require('./store');
User.defaults = {
    persist: true,
    cookie: {
        key: 'ajs_user_id',
        oldKey: 'ajs_user'
    },
    localStorage: {
        key: 'ajs_user_traits'
    }
};
/**
 * Initialize a new `User` with `options`.
 */
function User(options) {
    this.defaults = User.defaults;
    this.debug = debug;
    Entity.call(this, options);
}
/**
 * Inherit `Entity`
 */
inherit(User, Entity);
/**
 * Set/get the user id.
 *
 * When the user id changes, the method will reset his anonymousId to a new one.
 *
 * @example
 * // didn't change because the user didn't have previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // didn't change because the user id changed to null.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id(null);
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // change because the user had previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id('baz'); // triggers change
 * user.id('baz'); // no change
 * assert.notEqual(anonymousId, user.anonymousId());
 */
User.prototype.id = function (id) {
    var prev = this._getId();
    var ret = Entity.prototype.id.apply(this, arguments);
    if (prev == null)
        return ret;
    // FIXME: We're relying on coercion here (1 == "1"), but our API treats these
    // two values differently. Figure out what will break if we remove this and
    // change to strict equality
    /* eslint-disable eqeqeq */
    if (prev != id && id)
        this.anonymousId(null);
    /* eslint-enable eqeqeq */
    return ret;
};
/**
 * Set / get / remove anonymousId.
 *
 * @param {String} anonymousId
 * @return {String|User}
 */
User.prototype.anonymousId = function (anonymousId) {
    var store = this.storage();
    // set / remove
    if (arguments.length) {
        store.set('ajs_anonymous_id', anonymousId);
        this._setAnonymousIdInLocalStorage(anonymousId);
        return this;
    }
    // new
    anonymousId = store.get('ajs_anonymous_id');
    if (anonymousId) {
        // value exists in cookie, copy it to localStorage
        this._setAnonymousIdInLocalStorage(anonymousId);
        // refresh cookie to extend expiry
        store.set('ajs_anonymous_id', anonymousId);
        return anonymousId;
    }
    if (!this._options.localStorageFallbackDisabled) {
        // if anonymousId doesn't exist in cookies, check localStorage
        anonymousId = localStorage.get('ajs_anonymous_id');
        if (anonymousId) {
            // Write to cookies if available in localStorage but not cookies
            store.set('ajs_anonymous_id', anonymousId);
            return anonymousId;
        }
    }
    // old - it is not stringified so we use the raw cookie.
    anonymousId = rawCookie('_sio');
    if (anonymousId) {
        anonymousId = anonymousId.split('----')[0];
        store.set('ajs_anonymous_id', anonymousId);
        this._setAnonymousIdInLocalStorage(anonymousId);
        store.remove('_sio');
        return anonymousId;
    }
    // empty
    anonymousId = uuid.v4();
    store.set('ajs_anonymous_id', anonymousId);
    this._setAnonymousIdInLocalStorage(anonymousId);
    return store.get('ajs_anonymous_id');
};
/**
 * Set the user's `anonymousid` in local storage.
 */
User.prototype._setAnonymousIdInLocalStorage = function (id) {
    if (!this._options.localStorageFallbackDisabled) {
        localStorage.set('ajs_anonymous_id', id);
    }
};
/**
 * Remove anonymous id on logout too.
 */
User.prototype.logout = function () {
    Entity.prototype.logout.call(this);
    this.anonymousId(null);
};
/**
 * Load saved user `id` or `traits` from storage.
 */
User.prototype.load = function () {
    if (this._loadOldCookie())
        return;
    Entity.prototype.load.call(this);
};
/**
 * BACKWARDS COMPATIBILITY: Load the old user from the cookie.
 *
 * @api private
 */
User.prototype._loadOldCookie = function () {
    var user = cookie.get(this._options.cookie.oldKey);
    if (!user)
        return false;
    this.id(user.id);
    this.traits(user.traits);
    cookie.remove(this._options.cookie.oldKey);
    return true;
};
/**
 * Expose the user singleton.
 */
module.exports = bindAll(new User());
/**
 * Expose the `User` constructor.
 */
module.exports.User = User;

},{"./cookie":14,"./entity":15,"./store":22,"@segment/cookie":37,"bind-all":49,"debug":57,"inherits":28,"uuid":97}],24:[function(require,module,exports){
'use strict';
var type = require('component-type');
/**
 * Deeply clone an object.
 *
 * @param {*} obj Any object.
 *
 * COPYRIGHT: https://github.com/ndhoule/clone/blob/master/LICENSE.md
 * The MIT License (MIT)
 * Copyright (c) 2015 Nathan Houle
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var clone = function clone(obj) {
    var t = type(obj);
    var copy;
    if (t === 'object') {
        copy = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = clone(obj[key]);
            }
        }
        return copy;
    }
    if (t === 'array') {
        copy = new Array(obj.length);
        for (var i = 0, l = obj.length; i < l; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
    if (t === 'regexp') {
        // from millermedeiros/amd-utils - MIT
        var flags = '';
        flags += obj.multiline ? 'm' : '';
        flags += obj.global ? 'g' : '';
        flags += obj.ignoreCase ? 'i' : '';
        return new RegExp(obj.source, flags);
    }
    if (t === 'date') {
        return new Date(obj.getTime());
    }
    // string, number, boolean, etc.
    return obj;
};
module.exports = clone;

},{"component-type":55}],25:[function(require,module,exports){
'use strict';
/*
 * The MIT License (MIT)
 * Copyright (c) 2015 Nathan Houle
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*
 * Module dependencies.
 */
var keys = require('@ndhoule/keys');
var objToString = Object.prototype.toString;
/**
 * Tests if a value is a number.
 *
 * @name isNumber
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if `val` is a number, otherwise `false`.
 */
var isNumber = function isNumber(val) {
    var type = typeof val;
    return (type === 'number' ||
        (type === 'object' && objToString.call(val) === '[object Number]'));
};
/**
 * Tests if a value is an array.
 *
 * @name isArray
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if the value is an array, otherwise `false`.
 */
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function isArray(val) {
        return objToString.call(val) === '[object Array]';
    };
/**
 * Tests if a value is array-like. Array-like means the value is not a function and has a numeric
 * `.length` property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */
var isArrayLike = function isArrayLike(val) {
    return (val != null &&
        (isArray(val) || (val !== 'function' && isNumber(val.length))));
};
/**
 * Internal implementation of `each`. Works on arrays and array-like data structures.
 *
 * @name arrayEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array} array The array(-like) structure to iterate over.
 * @return {undefined}
 */
var arrayEach = function arrayEach(iterator, array) {
    for (var i = 0; i < array.length; i += 1) {
        // Break iteration early if `iterator` returns `false`
        if (iterator(array[i], i, array) === false) {
            break;
        }
    }
};
/**
 * Internal implementation of `each`. Works on objects.
 *
 * @name baseEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Object} object The object to iterate over.
 * @return {undefined}
 */
var baseEach = function baseEach(iterator, object) {
    var ks = keys(object);
    for (var i = 0; i < ks.length; i += 1) {
        // Break iteration early if `iterator` returns `false`
        if (iterator(object[ks[i]], ks[i], object) === false) {
            break;
        }
    }
};
/**
 * Iterate over an input collection, invoking an `iterator` function for each element in the
 * collection and passing to it three arguments: `(value, index, collection)`. The `iterator`
 * function can end iteration early by returning `false`.
 *
 * @name each
 * @api public
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array|Object|string} collection The collection to iterate over.
 * @return {undefined} Because `each` is run only for side effects, always returns `undefined`.
 * @example
 * var log = console.log.bind(console);
 *
 * each(log, ['a', 'b', 'c']);
 * //-> 'a', 0, ['a', 'b', 'c']
 * //-> 'b', 1, ['a', 'b', 'c']
 * //-> 'c', 2, ['a', 'b', 'c']
 * //=> undefined
 *
 * each(log, 'tim');
 * //-> 't', 2, 'tim'
 * //-> 'i', 1, 'tim'
 * //-> 'm', 0, 'tim'
 * //=> undefined
 *
 * // Note: Iteration order not guaranteed across environments
 * each(log, { name: 'tim', occupation: 'enchanter' });
 * //-> 'tim', 'name', { name: 'tim', occupation: 'enchanter' }
 * //-> 'enchanter', 'occupation', { name: 'tim', occupation: 'enchanter' }
 * //=> undefined
 */
var each = function each(iterator, collection) {
    return (isArrayLike(collection) ? arrayEach : baseEach).call(this, iterator, collection);
};
/*
 * Exports.
 */
module.exports = each;

},{"@ndhoule/keys":9}],26:[function(require,module,exports){
'use strict';
/*
 * The MIT License (MIT)
 * Copyright (c) 2015 Nathan Houle
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*
 * Module dependencies.
 */
var each = require('./each');
/**
 * Produce a new array by passing each value in the input `collection` through a transformative
 * `iterator` function. The `iterator` function is passed three arguments:
 * `(value, index, collection)`.
 *
 * @name map
 * @api public
 * @param {Function} iterator The transformer function to invoke per iteration.
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing the results of each `iterator` invocation.
 * @example
 * var square = function(x) { return x * x; };
 *
 * map(square, [1, 2, 3]);
 * //=> [1, 4, 9]
 */
var map = function map(iterator, collection) {
    if (typeof iterator !== 'function') {
        throw new TypeError('Expected a function but received a ' + typeof iterator);
    }
    var result = [];
    each(function (val, i, collection) {
        result.push(iterator(val, i, collection));
    }, collection);
    return result;
};
/*
 * Exports.
 */
module.exports = map;

},{"./each":25}],27:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],28:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],29:[function(require,module,exports){
/* globals window, HTMLElement */

'use strict';

/**!
 * is
 * the definitive JavaScript type testing library
 *
 * @copyright 2013-2014 Enrico Marino / Jordan Harband
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toStr = objProto.toString;
var symbolValueOf;
if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}
var bigIntValueOf;
if (typeof BigInt === 'function') {
  bigIntValueOf = BigInt.prototype.valueOf;
}
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  'boolean': 1,
  number: 1,
  string: 1,
  undefined: 1
};

var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
var hexRegex = /^[A-Fa-f0-9]+$/;

/**
 * Expose `is`
 */

var is = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {*} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a = is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return typeof value !== 'undefined';
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toStr.call(value);
  var key;

  if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
    return value.length === 0;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (owns.call(value, key)) {
        return false;
      }
    }
    return true;
  }

  return !value;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {*} value value to test
 * @param {*} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function equal(value, other) {
  if (value === other) {
    return true;
  }

  var type = toStr.call(value);
  var key;

  if (type !== toStr.call(other)) {
    return false;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (!is.equal(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!is.equal(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }

  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }

  return false;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {*} value to test
 * @param {*} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.nil / is.null
 * Test if `value` is null.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is.nil = is['null'] = function (value) {
  return value === null;
};

/**
 * is.undef / is.undefined
 * Test if `value` is undefined.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undef = is.undefined = function (value) {
  return typeof value === 'undefined';
};

/**
 * Test arguments.
 */

/**
 * is.args
 * Test if `value` is an arguments object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.args = is.arguments = function (value) {
  var isStandardArguments = toStr.call(value) === '[object Arguments]';
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = Array.isArray || function (value) {
  return toStr.call(value) === '[object Array]';
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.args.empty = function (value) {
  return is.args(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.bool(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.bool
 * Test if `value` is a boolean.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.bool = is['boolean'] = function (value) {
  return toStr.call(value) === '[object Boolean]';
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === false;
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === true;
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return toStr.call(value) === '[object Date]';
};

/**
 * is.date.valid
 * Test if `value` is a valid date.
 *
 * @param {*} value value to test
 * @returns {Boolean} true if `value` is a valid date, false otherwise
 */
is.date.valid = function (value) {
  return is.date(value) && !isNaN(Number(value));
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return toStr.call(value) === '[object Error]';
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  if (isAlert) {
    return true;
  }
  var str = toStr.call(value);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return toStr.call(value) === '[object Number]';
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.integer
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.integer = is['int'] = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */
is.object = function (value) {
  return toStr.call(value) === '[object Object]';
};

/**
 * is.primitive
 * Test if `value` is a primitive.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a primitive, false otherwise
 * @api public
 */
is.primitive = function isPrimitive(value) {
  if (!value) {
    return true;
  }
  if (typeof value === 'object' || is.object(value) || is.fn(value) || is.array(value)) {
    return false;
  }
  return true;
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return toStr.call(value) === '[object RegExp]';
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return toStr.call(value) === '[object String]';
};

/**
 * Test base64 string.
 */

/**
 * is.base64
 * Test if `value` is a valid base64 encoded string.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
 * @api public
 */

is.base64 = function (value) {
  return is.string(value) && (!value.length || base64Regex.test(value));
};

/**
 * Test base64 string.
 */

/**
 * is.hex
 * Test if `value` is a valid hex encoded string.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
 * @api public
 */

is.hex = function (value) {
  return is.string(value) && (!value.length || hexRegex.test(value));
};

/**
 * is.symbol
 * Test if `value` is an ES6 Symbol
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a Symbol, false otherise
 * @api public
 */

is.symbol = function (value) {
  return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol';
};

/**
 * is.bigint
 * Test if `value` is an ES-proposed BigInt
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a BigInt, false otherise
 * @api public
 */

is.bigint = function (value) {
  // eslint-disable-next-line valid-typeof
  return typeof BigInt === 'function' && toStr.call(value) === '[object BigInt]' && typeof bigIntValueOf.call(value) === 'bigint';
};

module.exports = is;

},{}],30:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var bind = require('component-bind');
var debug = require('debug');
var defaults = require('@ndhoule/defaults');
var extend = require('extend');
var slug = require('slug-component');
var protos = require('./protos');
var statics = require('./statics');

/**
 * Create a new `Integration` constructor.
 *
 * @constructs Integration
 * @param {string} name
 * @return {Function} Integration
 */

function createIntegration(name) {
  /**
   * Initialize a new `Integration`.
   *
   * @class
   * @param {Object} options
   */

  function Integration(options) {
    if (options && options.addIntegration) {
      // plugin
      return options.addIntegration(Integration);
    }
    this.debug = debug('analytics:integration:' + slug(name));
    var clonedOpts = {};
    extend(true, clonedOpts, options); // deep clone options
    this.options = defaults(clonedOpts || {}, this.defaults);
    this._queue = [];
    this.once('ready', bind(this, this.flush));

    Integration.emit('construct', this);
    this.ready = bind(this, this.ready);
    this._wrapInitialize();
    this._wrapPage();
    this._wrapTrack();
  }

  Integration.prototype.defaults = {};
  Integration.prototype.globals = [];
  Integration.prototype.templates = {};
  Integration.prototype.name = name;
  extend(Integration, statics);
  extend(Integration.prototype, protos);

  return Integration;
}

/**
 * Exports.
 */

module.exports = createIntegration;

},{"./protos":31,"./statics":32,"@ndhoule/defaults":2,"component-bind":50,"debug":57,"extend":60,"slug-component":90}],31:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var each = require('@ndhoule/each');
var events = require('analytics-events');
var every = require('@ndhoule/every');
var fmt = require('@segment/fmt');
var foldl = require('@ndhoule/foldl');
var is = require('is');
var loadIframe = require('load-iframe');
var loadScript = require('@segment/load-script');
var nextTick = require('next-tick');
var normalize = require('to-no-case');

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * No operation.
 */

var noop = function noop() {};

/**
 * Window defaults.
 */

var onerror = window.onerror;
var onload = null;

/**
 * Mixin emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Initialize.
 */

exports.initialize = function() {
  var ready = this.ready;
  nextTick(ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

exports.loaded = function() {
  return false;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

/* eslint-disable no-unused-vars */
exports.page = function(page) {};
/* eslint-enable no-unused-vars */

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

/* eslint-disable no-unused-vars */
exports.track = function(track) {};
/* eslint-enable no-unused-vars */

/**
 * Get values from items in `options` that are mapped to `key`.
 * `options` is an integration setting which is a collection
 * of type 'map', 'array', or 'mixed'
 *
 * Use cases include mapping events to pixelIds (map), sending generic
 * conversion pixels only for specific events (array), or configuring dynamic
 * mappings of event properties to query string parameters based on event (mixed)
 *
 * @api public
 * @param {Object|Object[]|String[]} options An object, array of objects, or
 * array of strings pulled from settings.mapping.
 * @param {string} key The name of the item in options whose metadata
 * we're looking for.
 * @return {Array} An array of settings that match the input `key` name.
 * @example
 *
 * // 'Map'
 * var events = { my_event: 'a4991b88' };
 * .map(events, 'My Event');
 * // => ["a4991b88"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Array'
 * * var events = ['Completed Order', 'My Event'];
 * .map(events, 'My Event');
 * // => ["My Event"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Mixed'
 * var events = [{ key: 'my event', value: '9b5eb1fa' }];
 * .map(events, 'my_event');
 * // => ["9b5eb1fa"]
 * .map(events, 'whatever');
 * // => []
 */

exports.map = function(options, key) {
  var normalizedComparator = normalize(key);
  var mappingType = getMappingType(options);

  if (mappingType === 'unknown') {
    return [];
  }

  return foldl(function(matchingValues, val, key) {
    var compare;
    var result;

    if (mappingType === 'map') {
      compare = key;
      result = val;
    }

    if (mappingType === 'array') {
      compare = val;
      result = val;
    }

    if (mappingType === 'mixed') {
      compare = val.key;
      result = val.value;
    }

    if (normalize(compare) === normalizedComparator) {
      matchingValues.push(result);
    }

    return matchingValues;
  }, [], options);
};

/**
 * Invoke a `method` that may or may not exist on the prototype with `args`,
 * queueing or not depending on whether the integration is "ready". Don't
 * trust the method call, since it contains integration party code.
 *
 * @api private
 * @param {string} method
 * @param {...*} args
 */

exports.invoke = function(method) {
  if (!this[method]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  if (!this._ready) return this.queue(method, args);

  this.debug('%s with %o', method, args);
  return this[method].apply(this, args);
};

/**
 * Queue a `method` with `args`.
 *
 * @api private
 * @param {string} method
 * @param {Array} args
 */

exports.queue = function(method, args) {
  this._queue.push({ method: method, args: args });
};

/**
 * Flush the internal queue.
 *
 * @api private
 */

exports.flush = function() {
  this._ready = true;
  var self = this;

  each(function(call) {
    self[call.method].apply(self, call.args);
  }, this._queue);

  // Empty the queue.
  this._queue.length = 0;
};

/**
 * Reset the integration, removing its global variables.
 *
 * @api private
 */

exports.reset = function() {
  for (var i = 0; i < this.globals.length; i++) {
    window[this.globals[i]] = undefined;
  }

  window.onerror = onerror;
  window.onload = onload;
};

/**
 * Load a tag by `name`.
 *
 * @param {string} name The name of the tag.
 * @param {Object} locals Locals used to populate the tag's template variables
 * (e.g. `userId` in '<img src="https://whatever.com/{{ userId }}">').
 * @param {Function} [callback=noop] A callback, invoked when the tag finishes
 * loading.
 */

exports.load = function(name, locals, callback) {
  // Argument shuffling
  if (typeof name === 'function') { callback = name; locals = null; name = null; }
  if (name && typeof name === 'object') { callback = locals; locals = name; name = null; }
  if (typeof locals === 'function') { callback = locals; locals = null; }

  // Default arguments
  name = name || 'library';
  locals = locals || {};

  locals = this.locals(locals);
  var template = this.templates[name];
  if (!template) throw new Error(fmt('template "%s" not defined.', name));
  var attrs = render(template, locals);
  callback = callback || noop;
  var self = this;
  var el;

  switch (template.type) {
  case 'img':
    attrs.width = 1;
    attrs.height = 1;
    el = loadImage(attrs, callback);
    break;
  case 'script':
    el = loadScript(attrs, function(err) {
      if (!err) return callback();
      self.debug('error loading "%s" error="%s"', self.name, err);
    });
      // TODO: hack until refactoring load-script
    delete attrs.src;
    each(function(val, key) {
      el.setAttribute(key, val);
    }, attrs);
    break;
  case 'iframe':
    el = loadIframe(attrs, callback);
    break;
  default:
      // No default case
  }

  return el;
};

/**
 * Locals for tag templates.
 *
 * By default it includes a cache buster and all of the options.
 *
 * @param {Object} [locals]
 * @return {Object}
 */

exports.locals = function(locals) {
  locals = locals || {};
  var cache = Math.floor(new Date().getTime() / 3600000);
  if (!locals.hasOwnProperty('cache')) locals.cache = cache;
  each(function(val, key) {
    if (!locals.hasOwnProperty(key)) locals[key] = val;
  }, this.options);
  return locals;
};

/**
 * Simple way to emit ready.
 *
 * @api public
 */

exports.ready = function() {
  this.emit('ready');
};

/**
 * Wrap the initialize method in an exists check, so we don't have to do it for
 * every single integration.
 *
 * @api private
 */

exports._wrapInitialize = function() {
  var initialize = this.initialize;
  this.initialize = function() {
    this.debug('initialize');
    this._initialized = true;
    var ret = initialize.apply(this, arguments);
    this.emit('initialize');
    return ret;
  };
};

/**
 * Wrap the page method to call to noop the first page call if the integration assumes
 * a pageview.
 *
 * @api private
 */

exports._wrapPage = function() {
  var page = this.page;
  var initialPageSkipped = false;
  this.page = function() {
    if (this._assumesPageview && !initialPageSkipped) {
      initialPageSkipped = true;
      return;
    }
    return page.apply(this, arguments);
  };
};

/**
 * Wrap the track method to call other ecommerce methods if available depending
 * on the `track.event()`.
 *
 * @api private
 */

exports._wrapTrack = function() {
  var t = this.track;
  this.track = function(track) {
    var event = track.event();
    var called;
    var ret;

    for (var method in events) {
      if (has.call(events, method)) {
        var regexp = events[method];
        if (!this[method]) continue;
        if (!regexp.test(event)) continue;
        ret = this[method].apply(this, arguments);
        called = true;
        break;
      }
    }

    if (!called) ret = t.apply(this, arguments);
    return ret;
  };
};

/**
 * Determine the type of the option passed to `#map`
 *
 * @api private
 * @param {Object|Object[]} mapping
 * @return {String} mappingType
 */

function getMappingType(mapping) {
  if (is.array(mapping)) {
    return every(isMixed, mapping) ? 'mixed' : 'array';
  }
  if (is.object(mapping)) return 'map';
  return 'unknown';
}

/**
 * Determine if item in mapping array is a valid "mixed" type value
 *
 * Must be an object with properties "key" (of type string)
 * and "value" (of any type)
 *
 * @api private
 * @param {*} item
 * @return {Boolean}
 */

function isMixed(item) {
  if (!is.object(item)) return false;
  if (!is.string(item.key)) return false;
  if (!has.call(item, 'value')) return false;
  return true;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Object} attrs
 * @param {Function} fn
 * @return {Image}
 */

function loadImage(attrs, fn) {
  fn = fn || function() {};
  var img = new Image();
  img.onerror = error(fn, 'failed to load pixel', img);
  img.onload = function() { fn(); };
  img.src = attrs.src;
  img.width = 1;
  img.height = 1;
  return img;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Function} fn
 * @param {string} message
 * @param {Element} img
 * @return {Function}
 */

function error(fn, message, img) {
  return function(e) {
    e = e || window.event;
    var err = new Error(message);
    err.event = e;
    err.source = img;
    fn(err);
  };
}

/**
 * Render template + locals into an `attrs` object.
 *
 * @api private
 * @param {Object} template
 * @param {Object} locals
 * @return {Object}
 */

function render(template, locals) {
  return foldl(function(attrs, val, key) {
    attrs[key] = val.replace(/\{\{\ *(\w+)\ *\}\}/g, function(_, $1) {
      return locals[$1];
    });
    return attrs;
  }, {}, template.attrs);
}

},{"@ndhoule/each":4,"@ndhoule/every":5,"@ndhoule/foldl":7,"@segment/fmt":38,"@segment/load-script":42,"analytics-events":48,"component-emitter":33,"is":34,"load-iframe":66,"next-tick":70,"to-no-case":93}],32:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var domify = require('domify');
var each = require('@ndhoule/each');
var includes = require('@ndhoule/includes');

/**
 * Mix in emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Add a new option to the integration by `key` with default `value`.
 *
 * @api public
 * @param {string} key
 * @param {*} value
 * @return {Integration}
 */

exports.option = function(key, value) {
  this.prototype.defaults[key] = value;
  return this;
};

/**
 * Add a new mapping option.
 *
 * This will create a method `name` that will return a mapping for you to use.
 *
 * @api public
 * @param {string} name
 * @return {Integration}
 * @example
 * Integration('My Integration')
 *   .mapping('events');
 *
 * new MyIntegration().track('My Event');
 *
 * .track = function(track){
 *   var events = this.events(track.event());
 *   each(send, events);
 *  };
 */

exports.mapping = function(name) {
  this.option(name, []);
  this.prototype[name] = function(key) {
    return this.map(this.options[name], key);
  };
  return this;
};

/**
 * Register a new global variable `key` owned by the integration, which will be
 * used to test whether the integration is already on the page.
 *
 * @api public
 * @param {string} key
 * @return {Integration}
 */

exports.global = function(key) {
  this.prototype.globals.push(key);
  return this;
};

/**
 * Mark the integration as assuming an initial pageview, so to defer the first page call, keep track of
 * whether we already nooped the first page call.
 *
 * @api public
 * @return {Integration}
 */

exports.assumesPageview = function() {
  this.prototype._assumesPageview = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `load` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnLoad = function() {
  this.prototype._readyOnLoad = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `initialize` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnInitialize = function() {
  this.prototype._readyOnInitialize = true;
  return this;
};

/**
 * Define a tag to be loaded.
 *
 * @api public
 * @param {string} [name='library'] A nicename for the tag, commonly used in
 * #load. Helpful when the integration has multiple tags and you need a way to
 * specify which of the tags you want to load at a given time.
 * @param {String} str DOM tag as string or URL.
 * @return {Integration}
 */

exports.tag = function(name, tag) {
  if (tag == null) {
    tag = name;
    name = 'library';
  }
  this.prototype.templates[name] = objectify(tag);
  return this;
};

/**
 * Given a string, give back DOM attributes.
 *
 * Do it in a way where the browser doesn't load images or iframes. It turns
 * out domify will load images/iframes because whenever you construct those
 * DOM elements, the browser immediately loads them.
 *
 * @api private
 * @param {string} str
 * @return {Object}
 */

function objectify(str) {
  // replace `src` with `data-src` to prevent image loading
  str = str.replace(' src="', ' data-src="');

  var el = domify(str);
  var attrs = {};

  each(function(attr) {
    // then replace it back
    var name = attr.name === 'data-src' ? 'src' : attr.name;
    if (!includes(attr.name + '=', str)) return;
    attrs[name] = attr.value;
  }, el.attributes);

  return {
    type: el.tagName.toLowerCase(),
    attrs: attrs
  };
}

},{"@ndhoule/each":4,"@ndhoule/includes":8,"component-emitter":33,"domify":59}],33:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],34:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"dup":29}],35:[function(require,module,exports){
var utf8Encode = require('utf8-encode');
var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = encode;
function encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = utf8Encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);

    }

    return output;
}
},{"utf8-encode":96}],36:[function(require,module,exports){
'use strict';

/**
 * Get the current page's canonical URL.
 *
 * @return {string|undefined}
 */
function canonical() {
  var tags = document.getElementsByTagName('link');
  // eslint-disable-next-line no-cond-assign
  for (var i = 0, tag; tag = tags[i]; i++) {
    if (tag.getAttribute('rel') === 'canonical') {
      return tag.getAttribute('href');
    }
  }
}

/*
 * Exports.
 */

module.exports = canonical;

},{}],37:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options) {
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (value == null) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date() + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.sameSite) str += '; SameSite=' + options.sameSite;
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  var str;
  try {
    str = document.cookie;
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(err.stack || err);
    }
    return {};
  }
  return parse(str);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if (pairs[0] == '') return obj; // eslint-disable-line eqeqeq
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value) {
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e);
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e);
  }
}

},{"debug":57}],38:[function(require,module,exports){
(function (global){(function (){
'use strict';

// Stringifier
var toString = global.JSON && typeof JSON.stringify === 'function' ? JSON.stringify : String;

/**
 * Format the given `str`.
 *
 * @param {string} str
 * @param {...*} [args]
 * @return {string}
 */
function fmt(str) {
  var args = Array.prototype.slice.call(arguments, 1);
  var j = 0;

  return str.replace(/%([a-z])/gi, function(match, f) {
    return fmt[f] ? fmt[f](args[j++]) : match + f;
  });
}

// Formatters
fmt.o = toString;
fmt.s = String;
fmt.d = parseInt;

/*
 * Exports.
 */

module.exports = fmt;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
'use strict';

function isMeta(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
    return true;
  }

  // Logic that handles checks for the middle mouse button, based
  // on [jQuery](https://github.com/jquery/jquery/blob/master/src/event.js#L466).
  var which = e.which;
  var button = e.button;
  if (!which && button !== undefined) {
    // eslint-disable-next-line no-bitwise, no-extra-parens
    return (!button & 1) && (!button & 2) && (button & 4);
  } else if (which === 2) {
    return true;
  }

  return false;
}

/*
 * Exports.
 */

module.exports = isMeta;

},{}],40:[function(require,module,exports){
'use strict';

var isodate = require('@segment/isodate');

/**
 * Expose `traverse`.
 */
module.exports = traverse;

/**
 * Recursively traverse an object or array, and convert
 * all ISO date strings parse into Date objects.
 *
 * @param {Object} input - object, array, or string to convert
 * @param {Boolean} strict - only convert strings with year, month, and date
 * @return {Object}
 */
function traverse(input, strict) {
  if (strict === undefined) strict = true;
  if (input && typeof input === 'object') {
    return traverseObject(input, strict);
  } else if (Array.isArray(input)) {
    return traverseArray(input, strict);
  } else if (isodate.is(input, strict)) {
    return isodate.parse(input);
  }
  return input;
}

/**
 * Object traverser helper function.
 *
 * @param {Object} obj - object to traverse
 * @param {Boolean} strict - only convert strings with year, month, and date
 * @return {Object}
 */
function traverseObject(obj, strict) {
  Object.keys(obj).forEach(function(key) {
    obj[key] = traverse(obj[key], strict);
  });
  return obj;
}

/**
 * Array traverser helper function
 *
 * @param {Array} arr - array to traverse
 * @param {Boolean} strict - only convert strings with year, month, and date
 * @return {Array}
 */
function traverseArray(arr, strict) {
  arr.forEach(function(value, index) {
    arr[index] = traverse(value, strict);
  });
  return arr;
}

},{"@segment/isodate":41}],41:[function(require,module,exports){
'use strict';

/**
 * Matcher, slightly modified from:
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 */

var matcher = /^(\d{4})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:([ T])(\d{2}):?(\d{2})(?::?(\d{2})(?:[,\.](\d{1,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?)?$/;

/**
 * Convert an ISO date string to a date. Fallback to native `Date.parse`.
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 *
 * @param {String} iso
 * @return {Date}
 */

exports.parse = function(iso) {
  var numericKeys = [1, 5, 6, 7, 11, 12];
  var arr = matcher.exec(iso);
  var offset = 0;

  // fallback to native parsing
  if (!arr) {
    return new Date(iso);
  }

  /* eslint-disable no-cond-assign */
  // remove undefined values
  for (var i = 0, val; val = numericKeys[i]; i++) {
    arr[val] = parseInt(arr[val], 10) || 0;
  }
  /* eslint-enable no-cond-assign */

  // allow undefined days and months
  arr[2] = parseInt(arr[2], 10) || 1;
  arr[3] = parseInt(arr[3], 10) || 1;

  // month is 0-11
  arr[2]--;

  // allow abitrary sub-second precision
  arr[8] = arr[8] ? (arr[8] + '00').substring(0, 3) : 0;

  // apply timezone if one exists
  if (arr[4] === ' ') {
    offset = new Date().getTimezoneOffset();
  } else if (arr[9] !== 'Z' && arr[10]) {
    offset = arr[11] * 60 + arr[12];
    if (arr[10] === '+') {
      offset = 0 - offset;
    }
  }

  var millis = Date.UTC(arr[1], arr[2], arr[3], arr[5], arr[6] + offset, arr[7], arr[8]);
  return new Date(millis);
};


/**
 * Checks whether a `string` is an ISO date string. `strict` mode requires that
 * the date string at least have a year, month and date.
 *
 * @param {String} string
 * @param {Boolean} strict
 * @return {Boolean}
 */

exports.is = function(string, strict) {
  if (typeof string !== 'string') {
    return false;
  }
  if (strict && (/^\d{4}-\d{2}-\d{2}/).test(string) === false) {
    return false;
  }
  return matcher.test(string);
};

},{}],42:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var onload = require('script-onload');
var tick = require('next-tick');
var type = require('component-type');

/**
 * Loads a script asynchronously.
 *
 * @param {Object} options
 * @param {Function} cb
 */
function loadScript(options, cb) {
  if (!options) {
    throw new Error('Can\'t load nothing...');
  }

  // Allow for the simplest case, just passing a `src` string.
  if (type(options) === 'string') {
    options = { src : options };
  }

  var https = document.location.protocol === 'https:' || document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = (https ? 'https:' : 'http:') + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) {
    options.src = options.https;
  } else if (!https && options.http) {
    options.src = options.http;
  }

  // Make the `<script>` element and insert it before the first script on the
  // page, which is guaranteed to exist since this Javascript is running.
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = options.src;

  // If we have a cb, attach event handlers. Does not work on < IE9 because
  // older browser versions don't register element.onerror
  if (type(cb) === 'function') {
    onload(script, cb);
  }

  tick(function() {
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  });

  // Return the script element in case they want to do anything special, like
  // give it an ID or attributes.
  return script;
}

/*
 * Exports.
 */

module.exports = loadScript;

},{"component-type":55,"next-tick":70,"script-onload":73}],43:[function(require,module,exports){
'use strict';

/**
 * Prevent default on a given event.
 *
 * @param {Event} e
 * @example
 * anchor.onclick = prevent;
 * anchor.onclick = function(e){
 *   if (something) return prevent(e);
 * };
 */

function preventDefault(e) {
  e = e || window.event;
  return e.preventDefault ? e.preventDefault() : e.returnValue = false;
}

/*
 * Exports.
 */

module.exports = preventDefault;

},{}],44:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var JSON = require('json3');
var base64encode = require('@segment/base64-encode');
var cors = require('has-cors');
var jsonp = require('jsonp');

/*
 * Exports.
 */

exports = module.exports = cors ? json : base64;

/**
 * Expose `callback`
 */

exports.callback = 'callback';

/**
 * Expose `prefix`
 */

exports.prefix = 'data';

/**
 * Expose `json`.
 */

exports.json = json;

/**
 * Expose `base64`.
 */

exports.base64 = base64;

/**
 * Expose `type`
 */

exports.type = cors ? 'xhr' : 'jsonp';

/**
 * Send the given `obj` to `url` with `fn(err, req)`.
 *
 * @param {String} url
 * @param {Object} obj
 * @param {Object} headers
 * @param {Function} fn
 * @api private
 */

function json(url, obj, headers, fn) {
  if (arguments.length === 3) fn = headers, headers = {};

  var req = new XMLHttpRequest;
  req.onerror = fn;
  req.onreadystatechange = done;
  req.open('POST', url, true);

  // TODO: Remove this eslint disable
  // eslint-disable-next-line guard-for-in
  for (var k in headers) {
    req.setRequestHeader(k, headers[k]);
  }
  req.send(JSON.stringify(obj));

  function done() {
    if (req.readyState === 4) {
      return fn(null, req);
    }
  }
}

/**
 * Send the given `obj` to `url` with `fn(err, req)`.
 *
 * @param {String} url
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function base64(url, obj, _, fn) {
  if (arguments.length === 3) fn = _;

  var prefix = exports.prefix;
  var data = encode(obj);
  url += '?' + prefix + '=' + data;
  jsonp(url, { param: exports.callback }, function(err, obj) {
    if (err) return fn(err);
    fn(null, {
      url: url,
      body: obj
    });
  });
}

/**
 * Encodes `obj`.
 *
 * @param {Object} obj
 */

function encode(obj) {
  var str = '';
  str = JSON.stringify(obj);
  str = base64encode(str);
  str = str.replace(/\+/g, '-').replace(/\//g, '_');
  return encodeURIComponent(str);
}

},{"@segment/base64-encode":35,"has-cors":61,"json3":64,"jsonp":65}],45:[function(require,module,exports){
(function (global){(function (){
"use strict"

var JSON = require('json3');

module.exports = (function() {
	// Store.js
	var store = {},
		win = (typeof window != 'undefined' ? window : global),
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage

	store.disabled = false
	store.version = '1.3.20'
	store.set = function(key, value) {}
	store.get = function(key, defaultVal) {}
	store.has = function(key) { return store.get(key) !== undefined }
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (defaultVal == null) {
			defaultVal = {}
		}
		var val = store.get(key, defaultVal)
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {
		var ret = {}
		store.forEach(function(key, val) {
			ret[key] = val
		})
		return ret
	}
	store.forEach = function() {}
	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key))
			return (val === undefined ? defaultVal : val)
		}
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i)
				callback(key, store.get(key))
			}
		}
	} else if (doc && doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		var ieKeyFix = function(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key)
			var val = store.deserialize(storage.getAttribute(key))
			return (val === undefined ? defaultVal : val)
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=attributes.length-1; i>=0; i--) {
				storage.removeAttribute(attributes[i].name)
			}
			storage.save(localStorageName)
		})
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
			}
		})
	}

	try {
		var testKey = '__storejs__'
		store.set(testKey, testKey)
		if (store.get(testKey) != testKey) { store.disabled = true }
		store.remove(testKey)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled
	
	return store
}())

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"json3":64}],46:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var parse = require('component-url').parse;
var cookie = require('component-cookie');

/**
 * Get the top domain.
 *
 * The function constructs the levels of domain and attempts to set a global
 * cookie on each one when it succeeds it returns the top level domain.
 *
 * The method returns an empty string when the hostname is an ip or `localhost`.
 *
 * Example levels:
 *
 *      domain.levels('http://www.google.co.uk');
 *      // => ["co.uk", "google.co.uk", "www.google.co.uk"]
 *
 * Example:
 *
 *      domain('http://localhost:3000/baz');
 *      // => ''
 *      domain('http://dev:3000/baz');
 *      // => ''
 *      domain('http://127.0.0.1:3000/baz');
 *      // => ''
 *      domain('http://segment.io/baz');
 *      // => 'segment.io'
 *
 * @param {string} url
 * @return {string}
 * @api public
 */
function domain(url) {
  var cookie = exports.cookie;
  var levels = exports.levels(url);

  // Lookup the real top level one.
  for (var i = 0; i < levels.length; ++i) {
    var cname = '__tld__';
    var domain = levels[i];
    var opts = { domain: '.' + domain };

    cookie(cname, 1, opts);
    if (cookie(cname)) {
      cookie(cname, null, opts);
      return domain;
    }
  }

  return '';
}

/**
 * Levels returns all levels of the given url.
 *
 * @param {string} url
 * @return {Array}
 * @api public
 */
domain.levels = function(url) {
  var host = parse(url).hostname;
  var parts = host.split('.');
  var last = parts[parts.length - 1];
  var levels = [];

  // Ip address.
  if (parts.length === 4 && last === parseInt(last, 10)) {
    return levels;
  }

  // Localhost.
  if (parts.length <= 1) {
    return levels;
  }

  // Create levels.
  for (var i = parts.length - 2; i >= 0; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  return levels;
};

/**
 * Expose cookie on domain.
 */
domain.cookie = cookie;

/*
 * Exports.
 */

exports = module.exports = domain;

},{"component-cookie":51,"component-url":56}],47:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var foldl = require('@ndhoule/foldl');
var parse = require('component-querystring').parse;

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Get all utm params from the given `querystring`
 *
 * @param {String} query
 * @return {Object}
 * @api private
 */

function utm(query) {
  // Remove leading ? if present
  if (query.charAt(0) === '?') {
    query = query.substring(1);
  }

  query = query.replace(/\?/g, '&');

  var param;
  var params = parse(query);
  var results = {};

  for (var key in params) {
    if (has.call(params, key)) {
      if (key.substr(0, 4) === 'utm_') {
        param = key.substr(4);
        if (param === 'campaign') param = 'name';
        results[param] = params[key];
      }
    }
  }

  return results;
}

var allowedKeys = {
  name: true,
  term: true,
  source: true,
  medium: true,
  content: true
};

/**
 * Get strict utm params - from the given `querystring`
 *
 * @param {String} query
 * @return {Object}
 * @api private
 */

function strict(query) {
  return foldl(function(acc, val, key) {
    if (has.call(allowedKeys, key)) acc[key] = val;
    return acc;
  }, {}, utm(query));
}

/*
 * Exports.
 */

module.exports = utm;
module.exports.strict = strict;

},{"@ndhoule/foldl":7,"component-querystring":53}],48:[function(require,module,exports){
'use strict';

/**
 * Module Dependencies
 */

var map = require('@ndhoule/map');
var foldl = require('@ndhoule/foldl');

var eventMap = {
  // Videos
  videoPlaybackStarted: [{
    object: 'video playback',
    action: 'started'
  }],
  videoPlaybackPaused: [{
    object: 'video playback',
    action: 'paused'
  }],
  videoPlaybackInterrupted: [{
    object: 'video playback',
    action: 'interrupted'
  }],
  videoPlaybackResumed: [{
    object: 'video playback',
    action: 'resumed'
  }],
  videoPlaybackCompleted: [{
    object: 'video playback',
    action: 'completed'
  }],
  videoPlaybackExited: [{
    object: 'video playback',
    action: 'exited'
  }],
  videoPlaybackBufferStarted: [{
    object: 'video playback buffer',
    action: 'started'
  }],
  videoPlaybackBufferCompleted: [{
    object: 'video playback buffer',
    action: 'completed'
  }],
  videoPlaybackSeekStarted: [{
    object: 'video playback seek',
    action: 'started'
  }],
  videoPlaybackSeekCompleted: [{
    object: 'video playback seek',
    action: 'completed'
  }],
  videoContentStarted: [{
    object: 'video content',
    action: 'started'
  }],
  videoContentPlaying: [{
    object: 'video content',
    action: 'playing'
  }],
  videoContentCompleted: [{
    object: 'video content',
    action: 'completed'
  }],
  videoAdStarted: [{
    object: 'video ad',
    action: 'started'
  }],
  videoAdPlaying: [{
    object: 'video ad',
    action: 'playing'
  }],
  videoAdCompleted: [{
    object: 'video ad',
    action: 'completed'
  }],
  videoAdClicked: [{
    object: 'video ad',
    action: 'clicked'
  }],
  videoAdSkipped: [{
    object: 'video ad',
    action: 'skipped'
  }],

  // Promotions
  promotionViewed: [{
    object: 'promotion',
    action: 'viewed'
  }],
  promotionClicked: [{
    object: 'promotion',
    action: 'clicked'
  }],

  // Browsing
  productsSearched: [{
    object: 'products',
    action: 'searched'
  }],
  productListViewed: [{
    object: 'product list',
    action: 'viewed'
  }, {
    object: 'product category',
    action: 'viewed'
  }],
  productListFiltered: [{
    object: 'product list',
    action: 'filtered'
  }],

  // Core Ordering
  productClicked: [{
    object: 'product',
    action: 'clicked'
  }],
  productViewed: [{
    object: 'product',
    action: 'viewed'
  }],
  productAdded: [{
    object: 'product',
    action: 'added'
  }],
  productRemoved: [{
    object: 'product',
    action: 'removed'
  }],
  cartViewed: [{
    object: 'cart',
    action: 'viewed'
  }],
  orderUpdated: [{
    object: 'order',
    action: 'updated'
  }],
  orderCompleted: [{
    object: 'order',
    action: 'completed'
  }],
  orderRefunded: [{
    object: 'order',
    action: 'refunded'
  }],
  orderCancelled: [{
    object: 'order',
    action: 'cancelled'
  }],
  paymentInfoEntered: [{
    object: 'payment info',
    action: 'entered'
  }],
  checkoutStarted: [{
    object: 'checkout',
    action: 'started'
  }],
  checkoutStepViewed: [{
    object: 'checkout step',
    action: 'viewed'
  }],
  checkoutStepCompleted: [{
    object: 'checkout step',
    action: 'completed'
  }],

  // Coupons
  couponEntered: [{
    object: 'coupon',
    action: 'entered'
  }],
  couponApplied: [{
    object: 'coupon',
    action: 'applied'
  }],
  couponDenied: [{
    object: 'coupon',
    action: 'denied'
  }],
  couponRemoved: [{
    object: 'coupon',
    action: 'removed'
  }],

  // Wishlisting
  productAddedToWishlist: [{
    object: 'product',
    action: 'added to wishlist'
  }],
  productRemovedFromWishlist: [{
    object: 'product',
    action: 'removed from wishlist'
  }],
  productAddedFromWishlistToCart: [{
    object: 'product',
    action: 'added to cart from wishlist'
  }, {
    object: 'product',
    action: 'added from wishlist to cart'
  }],
  wishlistProductAddedToCart: [{
    object: 'wishlist product',
    action: 'added to cart'
  }],

  // Sharing
  productShared: [{
    object: 'product',
    action: 'shared'
  }],
  cartShared: [{
    object: 'cart',
    action: 'shared'
  }],

  // Reviewing
  productReviewed: [{
    object: 'product',
    action: 'reviewed'
  }],

  // App Lifecycle
  applicationInstalled: [{
    object: 'application',
    action: 'installed'
  }],
  applicationUpdated: [{
    object: 'application',
    action: 'updated'
  }],
  applicationOpened: [{
    object: 'application',
    action: 'opened'
  }],
  applicationBackgrounded: [{
    object: 'application',
    action: 'backgrounded'
  }],
  applicationUninstalled: [{
    object: 'application',
    action: 'uninstalled'
  }],
  applicationCrashed: [{
    object: 'application',
    action: 'crashed'
  }],

  // App Campaign and Referral Events
  installAttributed: [{
    object: 'install',
    action: 'attributed'
  }],
  deepLinkOpened: [{
    object: 'deep link',
    action: 'opened'
  }],
  deepLinkClicked: [{
    object: 'deep link',
    action: 'clicked'
  }],
  pushNotificationReceived: [{
    object: 'push notification',
    action: 'received'
  }],
  pushNotificationTapped: [{
    object: 'push notification',
    action: 'tapped'
  }],
  pushNotificationBounced: [{
    object: 'push notification',
    action: 'bounced'
  }],

  // Email
  emailBounced: [{
    object: 'email',
    action: 'bounced'
  }],
  emailDelivered: [{
    object: 'email',
    action: 'delivered'
  }],
  emailLinkClicked: [{
    object: 'email link',
    action: 'clicked'
  }],
  emailMarkedAsSpam: [{
    object: 'email',
    action: 'marked as spam'
  }],
  emailOpened: [{
    object: 'email',
    action: 'opened'
  }],
  unsubscribed: [{
    object: '',
    action: 'unsubscribed'
  }],

  // Live Chat
  liveChatConversationEnded: [{
    object: 'live chat conversation',
    action: 'ended'
  }],
  liveChatConversationStarted: [{
    object: 'live chat conversation',
    action: 'started'
  }],
  liveChatMessageReceived: [{
    object: 'live chat message',
    action: 'received'
  }],
  liveChatMessageSent: [{
    object: 'live chat message',
    action: 'sent'
  }]
};

/**
 * Export the event map
 *
 * For each method
 *   - For each of its object:action alias pairs
 *     - For each permutation of that pair
 *       - Create a regex string
 *   - Join them and assign it to its respective method value
 *
 *  [{
 *    object: 'product list',
 *    action: 'viewed'
 *  },{
 *    object: 'product category',
 *    action: 'viewed'
 *  }] => /
 *    ^[ _]?product[ _]?list[ _]?viewed[ _]?
 *   |^[ _]?viewed[ _]?product[ _]?list[ _]?
 *   |^[ _]?product[ _]?category[ _]?viewed[ _]?
 *   |^[ _]?viewed[ _]?product[ _]?category[ _]?
 *   $/i
 *
 *  todo(cs/wj/nh): memoization strategy / build step?
 */

module.exports = foldl(function transform(ret, pairs, method) {
  var values = map(function(pair) {
    return map(function(permutation) {
      var flattened = [].concat.apply([], map(function(words) {
        return words.split(' ');
      }, permutation));
      return '^[ _]?' + flattened.join('[ _]?') + '[ _]?';
    }, [
      [pair.action, pair.object],
      [pair.object, pair.action]
    ]).join('|');
  }, pairs);
  var conjoined = values.join('|') + '$';
  ret[method] = new RegExp(conjoined, 'i');
  return ret;
}, {}, eventMap);

},{"@ndhoule/foldl":7,"@ndhoule/map":10}],49:[function(require,module,exports){
'use strict';

var bind = require('component-bind');

function bindAll(obj) {
  // eslint-disable-next-line guard-for-in
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'function') {
      obj[key] = bind(obj, obj[key]);
    }
  }
  return obj;
}

module.exports = bindAll;

},{"component-bind":50}],50:[function(require,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],51:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  var str;
  try {
    str = document.cookie;
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(err.stack || err);
    }
    return {};
  }
  return parse(str);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value){
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e)
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e)
  }
}

},{"debug":57}],52:[function(require,module,exports){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
},{}],53:[function(require,module,exports){

/**
 * Module dependencies.
 */

var trim = require('trim');
var type = require('type');

var pattern = /(\w+)\[(\d+)\]/;

/**
 * Safely encode the given string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var encode = function(str) {
  try {
    return encodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

/**
 * Safely decode the string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var decode = function(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (e) {
    return str;
  }
}

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    var key = decode(parts[0]);
    var m;

    if (m = pattern.exec(key)) {
      obj[m[1]] = obj[m[1]] || [];
      obj[m[1]][m[2]] = decode(parts[1]);
      continue;
    }

    obj[parts[0]] = null == parts[1]
      ? ''
      : decode(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];

  for (var key in obj) {
    var value = obj[key];

    if ('array' == type(value)) {
      for (var i = 0; i < value.length; ++i) {
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
      }
      continue;
    }

    pairs.push(encode(key) + '=' + encode(obj[key]));
  }

  return pairs.join('&');
};

},{"trim":94,"type":54}],54:[function(require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

},{}],55:[function(require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  if (isBuffer(val)) return 'buffer';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val);

  return typeof val;
};

// code borrowed from https://github.com/feross/is-buffer/blob/master/index.js
function isBuffer(obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],56:[function(require,module,exports){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  var location = exports.parse(window.location.href);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

},{}],57:[function(require,module,exports){
(function (process){(function (){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this)}).call(this,require('_process'))
},{"./debug":58,"_process":72}],58:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":69}],59:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = Object.prototype.hasOwnProperty.call(map, tag) ? map[tag] : map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],60:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],61:[function(require,module,exports){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{}],62:[function(require,module,exports){

module.exports = function isEmail (string) {
    return (/.+\@.+\..+/).test(string);
};
},{}],63:[function(require,module,exports){
/* globals window, HTMLElement */
/**!
 * is
 * the definitive JavaScript type testing library
 *
 * @copyright 2013-2014 Enrico Marino / Jordan Harband
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toStr = objProto.toString;
var symbolValueOf;
if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  'boolean': 1,
  number: 1,
  string: 1,
  undefined: 1
};

var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
var hexRegex = /^[A-Fa-f0-9]+$/;

/**
 * Expose `is`
 */

var is = module.exports = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a = is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return typeof value !== 'undefined';
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toStr.call(value);
  var key;

  if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
    return value.length === 0;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (owns.call(value, key)) { return false; }
    }
    return true;
  }

  return !value;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function equal(value, other) {
  if (value === other) {
    return true;
  }

  var type = toStr.call(value);
  var key;

  if (type !== toStr.call(other)) {
    return false;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (!is.equal(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!is.equal(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (--key) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }

  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }

  return false;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.nil / is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is.nil = is['null'] = function (value) {
  return value === null;
};

/**
 * is.undef / is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undef = is.undefined = function (value) {
  return typeof value === 'undefined';
};

/**
 * Test arguments.
 */

/**
 * is.args
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.args = is.arguments = function (value) {
  var isStandardArguments = toStr.call(value) === '[object Arguments]';
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = Array.isArray || function (value) {
  return toStr.call(value) === '[object Array]';
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.args.empty = function (value) {
  return is.args(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.bool(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.bool
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.bool = is['boolean'] = function (value) {
  return toStr.call(value) === '[object Boolean]';
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === false;
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === true;
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return toStr.call(value) === '[object Date]';
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return toStr.call(value) === '[object Error]';
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  return isAlert || toStr.call(value) === '[object Function]';
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return toStr.call(value) === '[object Number]';
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.integer
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.integer = is['int'] = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */

is.object = function (value) {
  return toStr.call(value) === '[object Object]';
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return toStr.call(value) === '[object RegExp]';
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return toStr.call(value) === '[object String]';
};

/**
 * Test base64 string.
 */

/**
 * is.base64
 * Test if `value` is a valid base64 encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
 * @api public
 */

is.base64 = function (value) {
  return is.string(value) && (!value.length || base64Regex.test(value));
};

/**
 * Test base64 string.
 */

/**
 * is.hex
 * Test if `value` is a valid hex encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
 * @api public
 */

is.hex = function (value) {
  return is.string(value) && (!value.length || hexRegex.test(value));
};

/**
 * is.symbol
 * Test if `value` is an ES6 Symbol
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a Symbol, false otherise
 * @api public
 */

is.symbol = function (value) {
  return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol';
};

},{}],64:[function(require,module,exports){
(function (global){(function (){
/*! JSON v3.3.2 | https://bestiejs.github.io/json3 | Copyright 2012-2015, Kit Cambridge, Benjamin Tan | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root.Object());
    exports || (exports = root.Object());

    // Native constructor aliases.
    var Number = context.Number || root.Number,
        String = context.String || root.String,
        Object = context.Object || root.Object,
        Date = context.Date || root.Date,
        SyntaxError = context.SyntaxError || root.SyntaxError,
        TypeError = context.TypeError || root.TypeError,
        Math = context.Math || root.Math,
        nativeJSON = context.JSON || root.JSON;

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty = objectProto.hasOwnProperty,
        undefined;

    // Internal: Contains `try...catch` logic used by other functions.
    // This prevents other functions from being deoptimized.
    function attempt(func, errorFunc) {
      try {
        func();
      } catch (exception) {
        if (errorFunc) {
          errorFunc();
        }
      }
    }

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    attempt(function () {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    });

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] != null) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("date-serialization") && has("json-parse");
      } else if (name == "date-serialization") {
        // Indicates whether `Date`s can be serialized accurately by `JSON.stringify`.
        isSupported = has("json-stringify") && isExtended;
        if (isSupported) {
          var stringify = exports.stringify;
          attempt(function () {
            isSupported =
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          });
        }
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function";
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            attempt(function () {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undefined &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undefined) === undefined &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undefined &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undefined]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undefined, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]";
            }, function () {
              stringifySupported = false;
            });
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse, parseSupported;
          if (typeof parse == "function") {
            attempt(function () {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  attempt(function () {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  });
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    });
                  }
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    });
                  }
                }
              }
            }, function () {
              parseSupported = false;
            });
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }
    has["bug-string-char-index"] = has["date-serialization"] = has["json"] = has["json-stringify"] = has["json-parse"] = null;

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      var forOwn = function (object, callback) {
        var size = 0, Properties, dontEnums, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        dontEnums = new Properties();
        for (property in dontEnums) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(dontEnums, property)) {
            size++;
          }
        }
        Properties = dontEnums = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          dontEnums = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = dontEnums.length; property = dontEnums[--length];) {
              if (hasProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forOwn(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify") && !has("date-serialization")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Serializes a date object.
        var serializeDate = function (value) {
          var getData, year, month, date, time, hours, minutes, seconds, milliseconds;
          // Define additional utility methods if the `Date` methods are buggy.
          if (!isExtended) {
            var floor = Math.floor;
            // A mapping between the months of the year and the number of days between
            // January 1st and the first of the respective month.
            var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            // Internal: Calculates the number of days between the Unix epoch and the
            // first day of the given month.
            var getDay = function (year, month) {
              return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
            };
            getData = function (value) {
              // Manually compute the year, month, date, hours, minutes,
              // seconds, and milliseconds if the `getUTC*` methods are
              // buggy. Adapted from @Yaffle's `date-shim` project.
              date = floor(value / 864e5);
              for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
              for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
              date = 1 + date - getDay(year, month);
              // The `time` value specifies the time within the day (see ES
              // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
              // to compute `A modulo B`, as the `%` operator does not
              // correspond to the `modulo` operation for negative numbers.
              time = (value % 864e5 + 864e5) % 864e5;
              // The hours, minutes, seconds, and milliseconds are obtained by
              // decomposing the time within the day. See section 15.9.1.10.
              hours = floor(time / 36e5) % 24;
              minutes = floor(time / 6e4) % 60;
              seconds = floor(time / 1e3) % 60;
              milliseconds = time % 1e3;
            };
          } else {
            getData = function (value) {
              year = value.getUTCFullYear();
              month = value.getUTCMonth();
              date = value.getUTCDate();
              hours = value.getUTCHours();
              minutes = value.getUTCMinutes();
              seconds = value.getUTCSeconds();
              milliseconds = value.getUTCMilliseconds();
            };
          }
          serializeDate = function (value) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              getData(value);
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
              "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
              // Months, dates, hours, minutes, and seconds should have two
              // digits; milliseconds should have three.
              "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
              // Milliseconds are optional in ES 5.0, but required in 5.1.
              "." + toPaddedString(3, milliseconds) + "Z";
              year = month = date = hours = minutes = seconds = milliseconds = null;
            } else {
              value = null;
            }
            return value;
          };
          return serializeDate(value);
        };

        // For environments with `JSON.stringify` but buggy date serialization,
        // we override the native `Date#toJSON` implementation with a
        // spec-compliant one.
        if (has("json-stringify") && !has("date-serialization")) {
          // Internal: the `Date#toJSON` implementation used to override the native one.
          function dateToJSON (key) {
            return serializeDate(this);
          }

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          var nativeStringify = exports.stringify;
          exports.stringify = function (source, filter, width) {
            var nativeToJSON = Date.prototype.toJSON;
            Date.prototype.toJSON = dateToJSON;
            var result = nativeStringify(source, filter, width);
            Date.prototype.toJSON = nativeToJSON;
            return result;
          }
        } else {
          // Internal: Double-quotes a string `value`, replacing all ASCII control
          // characters (characters with code unit values between 0 and 31) with
          // their escaped equivalents. This is an implementation of the
          // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
          var unicodePrefix = "\\u00";
          var escapeChar = function (character) {
            var charCode = character.charCodeAt(0), escaped = Escapes[charCode];
            if (escaped) {
              return escaped;
            }
            return unicodePrefix + toPaddedString(2, charCode.toString(16));
          };
          var reEscape = /[\x00-\x1f\x22\x5c]/g;
          var quote = function (value) {
            reEscape.lastIndex = 0;
            return '"' +
              (
                reEscape.test(value)
                  ? value.replace(reEscape, escapeChar)
                  : value
              ) +
              '"';
          };

          // Internal: Recursively serializes an object. Implements the
          // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
          var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
            var value, type, className, results, element, index, length, prefix, result;
            attempt(function () {
              // Necessary for host object support.
              value = object[property];
            });
            if (typeof value == "object" && value) {
              if (value.getUTCFullYear && getClass.call(value) == dateClass && value.toJSON === Date.prototype.toJSON) {
                value = serializeDate(value);
              } else if (typeof value.toJSON == "function") {
                value = value.toJSON(property);
              }
            }
            if (callback) {
              // If a replacement function was provided, call it to obtain the value
              // for serialization.
              value = callback.call(object, property, value);
            }
            // Exit early if value is `undefined` or `null`.
            if (value == undefined) {
              return value === undefined ? value : "null";
            }
            type = typeof value;
            // Only call `getClass` if the value is an object.
            if (type == "object") {
              className = getClass.call(value);
            }
            switch (className || type) {
              case "boolean":
              case booleanClass:
                // Booleans are represented literally.
                return "" + value;
              case "number":
              case numberClass:
                // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
                // `"null"`.
                return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
              case "string":
              case stringClass:
                // Strings are double-quoted and escaped.
                return quote("" + value);
            }
            // Recursively serialize objects and arrays.
            if (typeof value == "object") {
              // Check for cyclic structures. This is a linear search; performance
              // is inversely proportional to the number of unique nested objects.
              for (length = stack.length; length--;) {
                if (stack[length] === value) {
                  // Cyclic structures cannot be serialized by `JSON.stringify`.
                  throw TypeError();
                }
              }
              // Add the object to the stack of traversed objects.
              stack.push(value);
              results = [];
              // Save the current indentation level and indent one additional level.
              prefix = indentation;
              indentation += whitespace;
              if (className == arrayClass) {
                // Recursively serialize array elements.
                for (index = 0, length = value.length; index < length; index++) {
                  element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                  results.push(element === undefined ? "null" : element);
                }
                result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
              } else {
                // Recursively serialize object members. Members are selected from
                // either a user-specified list of property names, or the object
                // itself.
                forOwn(properties || value, function (property) {
                  var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                  if (element !== undefined) {
                    // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                    // is not the empty string, let `member` {quote(property) + ":"}
                    // be the concatenation of `member` and the `space` character."
                    // The "`space` character" refers to the literal space
                    // character, not the `space` {width} argument provided to
                    // `JSON.stringify`.
                    results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                  }
                });
                result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
              }
              // Remove the object from the traversed object stack.
              stack.pop();
              return result;
            }
          };

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          exports.stringify = function (source, filter, width) {
            var whitespace, callback, properties, className;
            if (objectTypes[typeof filter] && filter) {
              className = getClass.call(filter);
              if (className == functionClass) {
                callback = filter;
              } else if (className == arrayClass) {
                // Convert the property names array into a makeshift set.
                properties = {};
                for (var index = 0, length = filter.length, value; index < length;) {
                  value = filter[index++];
                  className = getClass.call(value);
                  if (className == "[object String]" || className == "[object Number]") {
                    properties[value] = 1;
                  }
                }
              }
            }
            if (width) {
              className = getClass.call(width);
              if (className == numberClass) {
                // Convert the `width` to an integer and create a string containing
                // `width` number of space characters.
                if ((width -= width % 1) > 0) {
                  if (width > 10) {
                    width = 10;
                  }
                  for (whitespace = ""; whitespace.length < width;) {
                    whitespace += " ";
                  }
                }
              } else if (className == stringClass) {
                whitespace = width.length <= 10 ? width : width.slice(0, 10);
              }
            }
            // Opera <= 7.54u2 discards the values associated with empty string keys
            // (`""`) only if they are used directly within an object member list
            // (e.g., `!("" in { "": 1})`).
            return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
          };
        }
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                var temp = source.slice(Index, Index + 4);
                if (temp == "true") {
                  Index += 4;
                  return true;
                } else if (temp == "fals" && source.charCodeAt(Index + 4 ) == 101) {
                  Index += 5;
                  return false;
                } else if (temp == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;;) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;;) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undefined) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forOwn` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(getClass, forOwn, value, length, callback);
              }
            } else {
              forOwn(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports.runInContext = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root.JSON3,
        isRestored = false;

    var JSON3 = runInContext(root, (root.JSON3 = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root.JSON3 = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],65:[function(require,module,exports){
/**
 * Module dependencies
 */

var debug = require('debug')('jsonp');

/**
 * Module exports.
 */

module.exports = jsonp;

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop(){}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) opts = {};

  var prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  var id = opts.name || (prefix + (count++));

  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;


  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup(){
    if (script.parentNode) script.parentNode.removeChild(script);
    window[id] = noop;
    if (timer) clearTimeout(timer);
  }

  function cancel(){
    if (window[id]) {
      cleanup();
    }
  }

  window[id] = function(data){
    debug('jsonp got', data);
    cleanup();
    if (fn) fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  debug('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);

  return cancel;
}

},{"debug":57}],66:[function(require,module,exports){
/**
 * Module dependencies.
 */

var is = require('is');
var onload = require('script-onload');
var tick = require('next-tick');

/**
 * Expose `loadScript`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

module.exports = function loadIframe(options, fn){
  if (!options) throw new Error('Cant load nothing...');

  // Allow for the simplest case, just passing a `src` string.
  if (is.string(options)) options = { src : options };

  var https = document.location.protocol === 'https:' ||
              document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = https ? 'https:' + options.src : 'http:' + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) options.src = options.https;
  else if (!https && options.http) options.src = options.http;

  // Make the `<iframe>` element and insert it before the first iframe on the
  // page, which is guaranteed to exist since this Javaiframe is running.
  var iframe = document.createElement('iframe');
  iframe.src = options.src;
  iframe.width = options.width || 1;
  iframe.height = options.height || 1;
  iframe.style.display = 'none';

  // If we have a fn, attach event handlers, even in IE. Based off of
  // the Third-Party Javascript script loading example:
  // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
  if (is.fn(fn)) {
    onload(iframe, fn);
  }

  tick(function(){
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(iframe, firstScript);
  });

  // Return the iframe element in case they want to do anything special, like
  // give it an ID or attributes.
  return iframe;
};

},{"is":67,"next-tick":70,"script-onload":73}],67:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"dup":29}],68:[function(require,module,exports){
(function (global){(function (){
/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
'use strict';
var immediate = _dereq_(1);

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"1":1}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
if (typeof global.Promise !== 'function') {
  global.Promise = _dereq_(2);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"2":2}],4:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getIDB() {
    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
    try {
        if (typeof indexedDB !== 'undefined') {
            return indexedDB;
        }
        if (typeof webkitIndexedDB !== 'undefined') {
            return webkitIndexedDB;
        }
        if (typeof mozIndexedDB !== 'undefined') {
            return mozIndexedDB;
        }
        if (typeof OIndexedDB !== 'undefined') {
            return OIndexedDB;
        }
        if (typeof msIndexedDB !== 'undefined') {
            return msIndexedDB;
        }
    } catch (e) {
        return;
    }
}

var idb = getIDB();

function isIndexedDBValid() {
    try {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.
        if (!idb || !idb.open) {
            return false;
        }
        // We mimic PouchDB here;
        //
        // We test for openDatabase because IE Mobile identifies itself
        // as Safari. Oh the lulz...
        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

        // Safari <10.1 does not meet our requirements for IDB support
        // (see: https://github.com/pouchdb/pouchdb/issues/5572).
        // Safari 10.1 shipped with fetch, we can use that to detect it.
        // Note: this creates issues with `window.fetch` polyfills and
        // overrides; see:
        // https://github.com/localForage/localForage/issues/856
        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
        // some outdated implementations of IDB that appear on Samsung
        // and HTC Android devices <4.4 are missing IDBKeyRange
        // See: https://github.com/mozilla/localForage/issues/128
        // See: https://github.com/mozilla/localForage/issues/272
        typeof IDBKeyRange !== 'undefined';
    } catch (e) {
        return false;
    }
}

// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
function createBlob(parts, properties) {
    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
    parts = parts || [];
    properties = properties || {};
    try {
        return new Blob(parts, properties);
    } catch (e) {
        if (e.name !== 'TypeError') {
            throw e;
        }
        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
        var builder = new Builder();
        for (var i = 0; i < parts.length; i += 1) {
            builder.append(parts[i]);
        }
        return builder.getBlob(properties.type);
    }
}

// This is CommonJS because lie is an external dependency, so Rollup
// can just ignore it.
if (typeof Promise === 'undefined') {
    // In the "nopromises" build this will just throw if you don't have
    // a global promise object, but it would throw anyway later.
    _dereq_(3);
}
var Promise$1 = Promise;

function executeCallback(promise, callback) {
    if (callback) {
        promise.then(function (result) {
            callback(null, result);
        }, function (error) {
            callback(error);
        });
    }
}

function executeTwoCallbacks(promise, callback, errorCallback) {
    if (typeof callback === 'function') {
        promise.then(callback);
    }

    if (typeof errorCallback === 'function') {
        promise["catch"](errorCallback);
    }
}

function normalizeKey(key) {
    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    return key;
}

function getCallback() {
    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
        return arguments[arguments.length - 1];
    }
}

// Some code originally from async_storage.js in
// [Gaia](https://github.com/mozilla-b2g/gaia).

var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
var supportsBlobs = void 0;
var dbContexts = {};
var toString = Object.prototype.toString;

// Transaction Modes
var READ_ONLY = 'readonly';
var READ_WRITE = 'readwrite';

// Transform a binary string to an array buffer, because otherwise
// weird stuff happens when you try to work with the binary string directly.
// It is known.
// From http://stackoverflow.com/questions/14967647/ (continues on next line)
// encode-decode-image-with-base64-breaks-image (2013-04-21)
function _binStringToArrayBuffer(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

//
// Blobs are not supported in all versions of IndexedDB, notably
// Chrome <37 and Android <5. In those versions, storing a blob will throw.
//
// Various other blob bugs exist in Chrome v37-42 (inclusive).
// Detecting them is expensive and confusing to users, and Chrome 37-42
// is at very low usage worldwide, so we do a hacky userAgent check instead.
//
// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
//
// Code borrowed from PouchDB. See:
// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
//
function _checkBlobSupportWithoutCaching(idb) {
    return new Promise$1(function (resolve) {
        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
        var blob = createBlob(['']);
        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

        txn.onabort = function (e) {
            // If the transaction aborts now its due to not being able to
            // write to the database, likely due to the disk being full
            e.preventDefault();
            e.stopPropagation();
            resolve(false);
        };

        txn.oncomplete = function () {
            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
            var matchedEdge = navigator.userAgent.match(/Edge\//);
            // MS Edge pretends to be Chrome 42:
            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
        };
    })["catch"](function () {
        return false; // error, so assume unsupported
    });
}

function _checkBlobSupport(idb) {
    if (typeof supportsBlobs === 'boolean') {
        return Promise$1.resolve(supportsBlobs);
    }
    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
        supportsBlobs = value;
        return supportsBlobs;
    });
}

function _deferReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Create a deferred object representing the current database operation.
    var deferredOperation = {};

    deferredOperation.promise = new Promise$1(function (resolve, reject) {
        deferredOperation.resolve = resolve;
        deferredOperation.reject = reject;
    });

    // Enqueue the deferred operation.
    dbContext.deferredOperations.push(deferredOperation);

    // Chain its promise to the database readiness.
    if (!dbContext.dbReady) {
        dbContext.dbReady = deferredOperation.promise;
    } else {
        dbContext.dbReady = dbContext.dbReady.then(function () {
            return deferredOperation.promise;
        });
    }
}

function _advanceReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Resolve its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.resolve();
        return deferredOperation.promise;
    }
}

function _rejectReadiness(dbInfo, err) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Reject its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.reject(err);
        return deferredOperation.promise;
    }
}

function _getConnection(dbInfo, upgradeNeeded) {
    return new Promise$1(function (resolve, reject) {
        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

        if (dbInfo.db) {
            if (upgradeNeeded) {
                _deferReadiness(dbInfo);
                dbInfo.db.close();
            } else {
                return resolve(dbInfo.db);
            }
        }

        var dbArgs = [dbInfo.name];

        if (upgradeNeeded) {
            dbArgs.push(dbInfo.version);
        }

        var openreq = idb.open.apply(idb, dbArgs);

        if (upgradeNeeded) {
            openreq.onupgradeneeded = function (e) {
                var db = openreq.result;
                try {
                    db.createObjectStore(dbInfo.storeName);
                    if (e.oldVersion <= 1) {
                        // Added when support for blob shims was added
                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                    }
                } catch (ex) {
                    if (ex.name === 'ConstraintError') {
                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                    } else {
                        throw ex;
                    }
                }
            };
        }

        openreq.onerror = function (e) {
            e.preventDefault();
            reject(openreq.error);
        };

        openreq.onsuccess = function () {
            var db = openreq.result;
            db.onversionchange = function (e) {
                // Triggered when the database is modified (e.g. adding an objectStore) or
                // deleted (even when initiated by other sessions in different tabs).
                // Closing the connection here prevents those operations from being blocked.
                // If the database is accessed again later by this instance, the connection
                // will be reopened or the database recreated as needed.
                e.target.close();
            };
            resolve(db);
            _advanceReadiness(dbInfo);
        };
    });
}

function _getOriginalConnection(dbInfo) {
    return _getConnection(dbInfo, false);
}

function _getUpgradedConnection(dbInfo) {
    return _getConnection(dbInfo, true);
}

function _isUpgradeNeeded(dbInfo, defaultVersion) {
    if (!dbInfo.db) {
        return true;
    }

    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
    var isDowngrade = dbInfo.version < dbInfo.db.version;
    var isUpgrade = dbInfo.version > dbInfo.db.version;

    if (isDowngrade) {
        // If the version is not the default one
        // then warn for impossible downgrade.
        if (dbInfo.version !== defaultVersion) {
            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
        }
        // Align the versions to prevent errors.
        dbInfo.version = dbInfo.db.version;
    }

    if (isUpgrade || isNewStore) {
        // If the store is new then increment the version (if needed).
        // This will trigger an "upgradeneeded" event which is required
        // for creating a store.
        if (isNewStore) {
            var incVersion = dbInfo.db.version + 1;
            if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
            }
        }

        return true;
    }

    return false;
}

// encode a blob for indexeddb engines that don't support blobs
function _encodeBlob(blob) {
    return new Promise$1(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = function (e) {
            var base64 = btoa(e.target.result || '');
            resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
            });
        };
        reader.readAsBinaryString(blob);
    });
}

// decode an encoded blob
function _decodeBlob(encodedBlob) {
    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
    return createBlob([arrayBuff], { type: encodedBlob.type });
}

// is this one of our fancy encoded blobs?
function _isEncodedBlob(value) {
    return value && value.__local_forage_encoded_blob;
}

// Specialize the default `ready()` function by making it dependent
// on the current database operations. Thus, the driver will be actually
// ready when it's been initialized (default) *and* there are no pending
// operations on the database (initiated by some other instances).
function _fullyReady(callback) {
    var self = this;

    var promise = self._initReady().then(function () {
        var dbContext = dbContexts[self._dbInfo.name];

        if (dbContext && dbContext.dbReady) {
            return dbContext.dbReady;
        }
    });

    executeTwoCallbacks(promise, callback, callback);
    return promise;
}

// Try to establish a new db connection to replace the
// current one which is broken (i.e. experiencing
// InvalidStateError while creating a transaction).
function _tryReconnect(dbInfo) {
    _deferReadiness(dbInfo);

    var dbContext = dbContexts[dbInfo.name];
    var forages = dbContext.forages;

    for (var i = 0; i < forages.length; i++) {
        var forage = forages[i];
        if (forage._dbInfo.db) {
            forage._dbInfo.db.close();
            forage._dbInfo.db = null;
        }
    }
    dbInfo.db = null;

    return _getOriginalConnection(dbInfo).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        // store the latest db reference
        // in case the db was upgraded
        dbInfo.db = dbContext.db = db;
        for (var i = 0; i < forages.length; i++) {
            forages[i]._dbInfo.db = db;
        }
    })["catch"](function (err) {
        _rejectReadiness(dbInfo, err);
        throw err;
    });
}

// FF doesn't like Promises (micro-tasks) and IDDB store operations,
// so we have to do it with callbacks
function createTransaction(dbInfo, mode, callback, retries) {
    if (retries === undefined) {
        retries = 1;
    }

    try {
        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
        callback(null, tx);
    } catch (err) {
        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
            return Promise$1.resolve().then(function () {
                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                    // increase the db version, to create the new ObjectStore
                    if (dbInfo.db) {
                        dbInfo.version = dbInfo.db.version + 1;
                    }
                    // Reopen the database for upgrading.
                    return _getUpgradedConnection(dbInfo);
                }
            }).then(function () {
                return _tryReconnect(dbInfo).then(function () {
                    createTransaction(dbInfo, mode, callback, retries - 1);
                });
            })["catch"](callback);
        }

        callback(err);
    }
}

function createDbContext() {
    return {
        // Running localForages sharing a database.
        forages: [],
        // Shared database.
        db: null,
        // Database readiness (promise).
        dbReady: null,
        // Deferred operations on the database.
        deferredOperations: []
    };
}

// Open the IndexedDB database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    // Get the current context of the database;
    var dbContext = dbContexts[dbInfo.name];

    // ...or create a new context.
    if (!dbContext) {
        dbContext = createDbContext();
        // Register the new context in the global container.
        dbContexts[dbInfo.name] = dbContext;
    }

    // Register itself as a running localForage in the current context.
    dbContext.forages.push(self);

    // Replace the default `ready()` function with the specialized one.
    if (!self._initReady) {
        self._initReady = self.ready;
        self.ready = _fullyReady;
    }

    // Create an array of initialization states of the related localForages.
    var initPromises = [];

    function ignoreErrors() {
        // Don't handle errors here,
        // just makes sure related localForages aren't pending.
        return Promise$1.resolve();
    }

    for (var j = 0; j < dbContext.forages.length; j++) {
        var forage = dbContext.forages[j];
        if (forage !== self) {
            // Don't wait for itself...
            initPromises.push(forage._initReady()["catch"](ignoreErrors));
        }
    }

    // Take a snapshot of the related localForages.
    var forages = dbContext.forages.slice(0);

    // Initialize the connection process only when
    // all the related localForages aren't pending.
    return Promise$1.all(initPromises).then(function () {
        dbInfo.db = dbContext.db;
        // Get the connection or open a new one without upgrade.
        return _getOriginalConnection(dbInfo);
    }).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        dbInfo.db = dbContext.db = db;
        self._dbInfo = dbInfo;
        // Share the final connection amongst related localForages.
        for (var k = 0; k < forages.length; k++) {
            var forage = forages[k];
            if (forage !== self) {
                // Self is already up-to-date.
                forage._dbInfo.db = dbInfo.db;
                forage._dbInfo.version = dbInfo.version;
            }
        }
    });
}

function getItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.get(key);

                    req.onsuccess = function () {
                        var value = req.result;
                        if (value === undefined) {
                            value = null;
                        }
                        if (_isEncodedBlob(value)) {
                            value = _decodeBlob(value);
                        }
                        resolve(value);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items stored in database.
function iterate(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openCursor();
                    var iterationNumber = 1;

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (cursor) {
                            var value = cursor.value;
                            if (_isEncodedBlob(value)) {
                                value = _decodeBlob(value);
                            }
                            var result = iterator(value, cursor.key, iterationNumber++);

                            // when the iterator callback returns any
                            // (non-`undefined`) value, then we stop
                            // the iteration immediately
                            if (result !== void 0) {
                                resolve(result);
                            } else {
                                cursor["continue"]();
                            }
                        } else {
                            resolve();
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);

    return promise;
}

function setItem(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        var dbInfo;
        self.ready().then(function () {
            dbInfo = self._dbInfo;
            if (toString.call(value) === '[object Blob]') {
                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
                    if (blobSupport) {
                        return value;
                    }
                    return _encodeBlob(value);
                });
            }
            return value;
        }).then(function (value) {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);

                    // The reason we don't _save_ null is because IE 10 does
                    // not support saving the `null` type in IndexedDB. How
                    // ironic, given the bug below!
                    // See: https://github.com/mozilla/localForage/issues/161
                    if (value === null) {
                        value = undefined;
                    }

                    var req = store.put(value, key);

                    transaction.oncomplete = function () {
                        // Cast to undefined so the value passed to
                        // callback/promise is the same as what one would get out
                        // of `getItem()` later. This leads to some weirdness
                        // (setItem('foo', undefined) will return `null`), but
                        // it's not my fault localStorage is our baseline and that
                        // it's weird.
                        if (value === undefined) {
                            value = null;
                        }

                        resolve(value);
                    };
                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function removeItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    // We use a Grunt task to make this safe for IE and some
                    // versions of Android (including those used by Cordova).
                    // Normally IE won't like `.delete()` and will insist on
                    // using `['delete']()`, but we have a build step that
                    // fixes this for us now.
                    var req = store["delete"](key);
                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onerror = function () {
                        reject(req.error);
                    };

                    // The request will be also be aborted if we've exceeded our storage
                    // space.
                    transaction.onabort = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function clear(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.clear();

                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function length(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.count();

                    req.onsuccess = function () {
                        resolve(req.result);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function key(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        if (n < 0) {
            resolve(null);

            return;
        }

        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var advanced = false;
                    var req = store.openKeyCursor();

                    req.onsuccess = function () {
                        var cursor = req.result;
                        if (!cursor) {
                            // this means there weren't enough keys
                            resolve(null);

                            return;
                        }

                        if (n === 0) {
                            // We have the first key, return it if that's what they
                            // wanted.
                            resolve(cursor.key);
                        } else {
                            if (!advanced) {
                                // Otherwise, ask the cursor to skip ahead n
                                // records.
                                advanced = true;
                                cursor.advance(n);
                            } else {
                                // When we get here, we've got the nth key.
                                resolve(cursor.key);
                            }
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openKeyCursor();
                    var keys = [];

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (!cursor) {
                            resolve(keys);
                            return;
                        }

                        keys.push(cursor.key);
                        cursor["continue"]();
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
            var dbContext = dbContexts[options.name];
            var forages = dbContext.forages;
            dbContext.db = db;
            for (var i = 0; i < forages.length; i++) {
                forages[i]._dbInfo.db = db;
            }
            return db;
        });

        if (!options.storeName) {
            promise = dbPromise.then(function (db) {
                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                }

                var dropDBPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.deleteDatabase(options.name);

                    req.onerror = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        reject(req.error);
                    };

                    req.onblocked = function () {
                        // Closing all open connections in onversionchange handler should prevent this situation, but if
                        // we do get here, it just means the request remains pending - eventually it will succeed or error
                        console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        resolve(db);
                    };
                });

                return dropDBPromise.then(function (db) {
                    dbContext.db = db;
                    for (var i = 0; i < forages.length; i++) {
                        var _forage = forages[i];
                        _advanceReadiness(_forage._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        } else {
            promise = dbPromise.then(function (db) {
                if (!db.objectStoreNames.contains(options.storeName)) {
                    return;
                }

                var newVersion = db.version + 1;

                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                    forage._dbInfo.version = newVersion;
                }

                var dropObjectPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.open(options.name, newVersion);

                    req.onerror = function (err) {
                        var db = req.result;
                        db.close();
                        reject(err);
                    };

                    req.onupgradeneeded = function () {
                        var db = req.result;
                        db.deleteObjectStore(options.storeName);
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        db.close();
                        resolve(db);
                    };
                });

                return dropObjectPromise.then(function (db) {
                    dbContext.db = db;
                    for (var j = 0; j < forages.length; j++) {
                        var _forage2 = forages[j];
                        _forage2._dbInfo.db = db;
                        _advanceReadiness(_forage2._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        }
    }

    executeCallback(promise, callback);
    return promise;
}

var asyncStorage = {
    _driver: 'asyncStorage',
    _initStorage: _initStorage,
    _support: isIndexedDBValid(),
    iterate: iterate,
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    clear: clear,
    length: length,
    key: key,
    keys: keys,
    dropInstance: dropInstance
};

function isWebSQLValid() {
    return typeof openDatabase === 'function';
}

// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
// it to Base64, so this is how we store it to prevent very strange errors with less
// verbose ways of binary <-> string data storage.
var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

var BLOB_TYPE_PREFIX = '~~local_forage_type~';
var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

var SERIALIZED_MARKER = '__lfsc__:';
var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

// OMG the serializations!
var TYPE_ARRAYBUFFER = 'arbf';
var TYPE_BLOB = 'blob';
var TYPE_INT8ARRAY = 'si08';
var TYPE_UINT8ARRAY = 'ui08';
var TYPE_UINT8CLAMPEDARRAY = 'uic8';
var TYPE_INT16ARRAY = 'si16';
var TYPE_INT32ARRAY = 'si32';
var TYPE_UINT16ARRAY = 'ur16';
var TYPE_UINT32ARRAY = 'ui32';
var TYPE_FLOAT32ARRAY = 'fl32';
var TYPE_FLOAT64ARRAY = 'fl64';
var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

var toString$1 = Object.prototype.toString;

function stringToBuffer(serializedString) {
    // Fill the string into a ArrayBuffer.
    var bufferLength = serializedString.length * 0.75;
    var len = serializedString.length;
    var i;
    var p = 0;
    var encoded1, encoded2, encoded3, encoded4;

    if (serializedString[serializedString.length - 1] === '=') {
        bufferLength--;
        if (serializedString[serializedString.length - 2] === '=') {
            bufferLength--;
        }
    }

    var buffer = new ArrayBuffer(bufferLength);
    var bytes = new Uint8Array(buffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

        /*jslint bitwise: true */
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
}

// Converts a buffer to a string to store, serialized, in the backend
// storage library.
function bufferToString(buffer) {
    // base64-arraybuffer
    var bytes = new Uint8Array(buffer);
    var base64String = '';
    var i;

    for (i = 0; i < bytes.length; i += 3) {
        /*jslint bitwise: true */
        base64String += BASE_CHARS[bytes[i] >> 2];
        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64String += BASE_CHARS[bytes[i + 2] & 63];
    }

    if (bytes.length % 3 === 2) {
        base64String = base64String.substring(0, base64String.length - 1) + '=';
    } else if (bytes.length % 3 === 1) {
        base64String = base64String.substring(0, base64String.length - 2) + '==';
    }

    return base64String;
}

// Serialize a value, afterwards executing a callback (which usually
// instructs the `setItem()` callback/promise to be executed). This is how
// we store binary data with localStorage.
function serialize(value, callback) {
    var valueType = '';
    if (value) {
        valueType = toString$1.call(value);
    }

    // Cannot use `value instanceof ArrayBuffer` or such here, as these
    // checks fail when running the tests using casper.js...
    //
    // TODO: See why those tests fail and use a better solution.
    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
        // Convert binary arrays to a string and prefix the string with
        // a special marker.
        var buffer;
        var marker = SERIALIZED_MARKER;

        if (value instanceof ArrayBuffer) {
            buffer = value;
            marker += TYPE_ARRAYBUFFER;
        } else {
            buffer = value.buffer;

            if (valueType === '[object Int8Array]') {
                marker += TYPE_INT8ARRAY;
            } else if (valueType === '[object Uint8Array]') {
                marker += TYPE_UINT8ARRAY;
            } else if (valueType === '[object Uint8ClampedArray]') {
                marker += TYPE_UINT8CLAMPEDARRAY;
            } else if (valueType === '[object Int16Array]') {
                marker += TYPE_INT16ARRAY;
            } else if (valueType === '[object Uint16Array]') {
                marker += TYPE_UINT16ARRAY;
            } else if (valueType === '[object Int32Array]') {
                marker += TYPE_INT32ARRAY;
            } else if (valueType === '[object Uint32Array]') {
                marker += TYPE_UINT32ARRAY;
            } else if (valueType === '[object Float32Array]') {
                marker += TYPE_FLOAT32ARRAY;
            } else if (valueType === '[object Float64Array]') {
                marker += TYPE_FLOAT64ARRAY;
            } else {
                callback(new Error('Failed to get type for BinaryArray'));
            }
        }

        callback(marker + bufferToString(buffer));
    } else if (valueType === '[object Blob]') {
        // Conver the blob to a binaryArray and then to a string.
        var fileReader = new FileReader();

        fileReader.onload = function () {
            // Backwards-compatible prefix for the blob type.
            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
        };

        fileReader.readAsArrayBuffer(value);
    } else {
        try {
            callback(JSON.stringify(value));
        } catch (e) {
            console.error("Couldn't convert value into a JSON string: ", value);

            callback(null, e);
        }
    }
}

// Deserialize data we've inserted into a value column/field. We place
// special markers into our strings to mark them as encoded; this isn't
// as nice as a meta field, but it's the only sane thing we can do whilst
// keeping localStorage support intact.
//
// Oftentimes this will just deserialize JSON content, but if we have a
// special marker (SERIALIZED_MARKER, defined above), we will extract
// some kind of arraybuffer/binary data/typed array out of the string.
function deserialize(value) {
    // If we haven't marked this string as being specially serialized (i.e.
    // something other than serialized JSON), we can just return it and be
    // done with it.
    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
        return JSON.parse(value);
    }

    // The following code deals with deserializing some kind of Blob or
    // TypedArray. First we separate out the type of data we're dealing
    // with from the data itself.
    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

    var blobType;
    // Backwards-compatible blob type serialization strategy.
    // DBs created with older versions of localForage will simply not have the blob type.
    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
        blobType = matcher[1];
        serializedString = serializedString.substring(matcher[0].length);
    }
    var buffer = stringToBuffer(serializedString);

    // Return the right type based on the code/type set during
    // serialization.
    switch (type) {
        case TYPE_ARRAYBUFFER:
            return buffer;
        case TYPE_BLOB:
            return createBlob([buffer], { type: blobType });
        case TYPE_INT8ARRAY:
            return new Int8Array(buffer);
        case TYPE_UINT8ARRAY:
            return new Uint8Array(buffer);
        case TYPE_UINT8CLAMPEDARRAY:
            return new Uint8ClampedArray(buffer);
        case TYPE_INT16ARRAY:
            return new Int16Array(buffer);
        case TYPE_UINT16ARRAY:
            return new Uint16Array(buffer);
        case TYPE_INT32ARRAY:
            return new Int32Array(buffer);
        case TYPE_UINT32ARRAY:
            return new Uint32Array(buffer);
        case TYPE_FLOAT32ARRAY:
            return new Float32Array(buffer);
        case TYPE_FLOAT64ARRAY:
            return new Float64Array(buffer);
        default:
            throw new Error('Unkown type: ' + type);
    }
}

var localforageSerializer = {
    serialize: serialize,
    deserialize: deserialize,
    stringToBuffer: stringToBuffer,
    bufferToString: bufferToString
};

/*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */

function createDbTable(t, dbInfo, callback, errorCallback) {
    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
}

// Open the WebSQL database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage$1(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
        }
    }

    var dbInfoPromise = new Promise$1(function (resolve, reject) {
        // Open the database; the openDatabase API will automatically
        // create it for us if it doesn't exist.
        try {
            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
        } catch (e) {
            return reject(e);
        }

        // Create our key/value table if it doesn't exist.
        dbInfo.db.transaction(function (t) {
            createDbTable(t, dbInfo, function () {
                self._dbInfo = dbInfo;
                resolve();
            }, function (t, error) {
                reject(error);
            });
        }, reject);
    });

    dbInfo.serializer = localforageSerializer;
    return dbInfoPromise;
}

function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
    t.executeSql(sqlStatement, args, callback, function (t, error) {
        if (error.code === error.SYNTAX_ERR) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) {
                if (!results.rows.length) {
                    // if the table is missing (was deleted)
                    // re-create it table and retry
                    createDbTable(t, dbInfo, function () {
                        t.executeSql(sqlStatement, args, callback, errorCallback);
                    }, errorCallback);
                } else {
                    errorCallback(t, error);
                }
            }, errorCallback);
        } else {
            errorCallback(t, error);
        }
    }, errorCallback);
}

function getItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).value : null;

                    // Check to see if this is serialized content we need to
                    // unpack.
                    if (result) {
                        result = dbInfo.serializer.deserialize(result);
                    }

                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function iterate$1(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;

            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
                    var rows = results.rows;
                    var length = rows.length;

                    for (var i = 0; i < length; i++) {
                        var item = rows.item(i);
                        var result = item.value;

                        // Check to see if this is serialized content
                        // we need to unpack.
                        if (result) {
                            result = dbInfo.serializer.deserialize(result);
                        }

                        result = iterator(result, item.key, i + 1);

                        // void(0) prevents problems with redefinition
                        // of `undefined`.
                        if (result !== void 0) {
                            resolve(result);
                            return;
                        }
                    }

                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function _setItem(key, value, callback, retriesLeft) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            // The localStorage API doesn't return undefined values in an
            // "expected" way, so undefined is always cast to null in all
            // drivers. See: https://github.com/mozilla/localForage/pull/42
            if (value === undefined) {
                value = null;
            }

            // Save the original value to pass to the callback.
            var originalValue = value;

            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    dbInfo.db.transaction(function (t) {
                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
                            resolve(originalValue);
                        }, function (t, error) {
                            reject(error);
                        });
                    }, function (sqlError) {
                        // The transaction failed; check
                        // to see if it's a quota error.
                        if (sqlError.code === sqlError.QUOTA_ERR) {
                            // We reject the callback outright for now, but
                            // it's worth trying to re-run the transaction.
                            // Even if the user accepts the prompt to use
                            // more storage on Safari, this error will
                            // be called.
                            //
                            // Try to re-run the transaction.
                            if (retriesLeft > 0) {
                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
                                return;
                            }
                            reject(sqlError);
                        }
                    });
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function setItem$1(key, value, callback) {
    return _setItem.apply(this, [key, value, callback, 1]);
}

function removeItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Deletes every item in the table.
// TODO: Find out if this resets the AUTO_INCREMENT number.
function clear$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Does a simple `COUNT(key)` to get the number of items stored in
// localForage.
function length$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                // Ahhh, SQL makes this one soooooo easy.
                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
                    var result = results.rows.item(0).c;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Return the key located at key index X; essentially gets the key from a
// `WHERE id = ?`. This is the most efficient way I can think to implement
// this rarely-used (in my experience) part of the API, but it can seem
// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
// the ID of each key will change every time it's updated. Perhaps a stored
// procedure for the `setItem()` SQL would solve this problem?
// TODO: Don't change ID on `setItem()`.
function key$1(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).key : null;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
                    var keys = [];

                    for (var i = 0; i < results.rows.length; i++) {
                        keys.push(results.rows.item(i).key);
                    }

                    resolve(keys);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// https://www.w3.org/TR/webdatabase/#databases
// > There is no way to enumerate or delete the databases available for an origin from this API.
function getAllStoreNames(db) {
    return new Promise$1(function (resolve, reject) {
        db.transaction(function (t) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
                var storeNames = [];

                for (var i = 0; i < results.rows.length; i++) {
                    storeNames.push(results.rows.item(i).name);
                }

                resolve({
                    db: db,
                    storeNames: storeNames
                });
            }, function (t, error) {
                reject(error);
            });
        }, function (sqlError) {
            reject(sqlError);
        });
    });
}

function dropInstance$1(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            var db;
            if (options.name === currentConfig.name) {
                // use the db reference of the current instance
                db = self._dbInfo.db;
            } else {
                db = openDatabase(options.name, '', '', 0);
            }

            if (!options.storeName) {
                // drop all database tables
                resolve(getAllStoreNames(db));
            } else {
                resolve({
                    db: db,
                    storeNames: [options.storeName]
                });
            }
        }).then(function (operationInfo) {
            return new Promise$1(function (resolve, reject) {
                operationInfo.db.transaction(function (t) {
                    function dropTable(storeName) {
                        return new Promise$1(function (resolve, reject) {
                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
                                resolve();
                            }, function (t, error) {
                                reject(error);
                            });
                        });
                    }

                    var operations = [];
                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                        operations.push(dropTable(operationInfo.storeNames[i]));
                    }

                    Promise$1.all(operations).then(function () {
                        resolve();
                    })["catch"](function (e) {
                        reject(e);
                    });
                }, function (sqlError) {
                    reject(sqlError);
                });
            });
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var webSQLStorage = {
    _driver: 'webSQLStorage',
    _initStorage: _initStorage$1,
    _support: isWebSQLValid(),
    iterate: iterate$1,
    getItem: getItem$1,
    setItem: setItem$1,
    removeItem: removeItem$1,
    clear: clear$1,
    length: length$1,
    key: key$1,
    keys: keys$1,
    dropInstance: dropInstance$1
};

function isLocalStorageValid() {
    try {
        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
        // in IE8 typeof localStorage.setItem === 'object'
        !!localStorage.setItem;
    } catch (e) {
        return false;
    }
}

function _getKeyPrefix(options, defaultConfig) {
    var keyPrefix = options.name + '/';

    if (options.storeName !== defaultConfig.storeName) {
        keyPrefix += options.storeName + '/';
    }
    return keyPrefix;
}

// Check if localStorage throws when saving an item
function checkIfLocalStorageThrows() {
    var localStorageTestKey = '_localforage_support_test';

    try {
        localStorage.setItem(localStorageTestKey, true);
        localStorage.removeItem(localStorageTestKey);

        return false;
    } catch (e) {
        return true;
    }
}

// Check if localStorage is usable and allows to save an item
// This method checks if localStorage is usable in Safari Private Browsing
// mode, or in any other case where the available quota for localStorage
// is 0 and there wasn't any saved items yet.
function _isLocalStorageUsable() {
    return !checkIfLocalStorageThrows() || localStorage.length > 0;
}

// Config the localStorage backend, using options set in the config.
function _initStorage$2(options) {
    var self = this;
    var dbInfo = {};
    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

    if (!_isLocalStorageUsable()) {
        return Promise$1.reject();
    }

    self._dbInfo = dbInfo;
    dbInfo.serializer = localforageSerializer;

    return Promise$1.resolve();
}

// Remove all keys from the datastore, effectively destroying all data in
// the app's key/value store!
function clear$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var keyPrefix = self._dbInfo.keyPrefix;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);

            if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Retrieve an item from the store. Unlike the original async_storage
// library in Gaia, we don't modify return values at all. If a key's value
// is `undefined`, we pass that value to the callback function.
function getItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result = localStorage.getItem(dbInfo.keyPrefix + key);

        // If a result was found, parse it from the serialized
        // string into a JS object. If result isn't truthy, the key
        // is likely undefined and we'll pass it straight to the
        // callback.
        if (result) {
            result = dbInfo.serializer.deserialize(result);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items in the store.
function iterate$2(iterator, callback) {
    var self = this;

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var keyPrefix = dbInfo.keyPrefix;
        var keyPrefixLength = keyPrefix.length;
        var length = localStorage.length;

        // We use a dedicated iterator instead of the `i` variable below
        // so other keys we fetch in localStorage aren't counted in
        // the `iterationNumber` argument passed to the `iterate()`
        // callback.
        //
        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
        var iterationNumber = 1;

        for (var i = 0; i < length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(keyPrefix) !== 0) {
                continue;
            }
            var value = localStorage.getItem(key);

            // If a result was found, parse it from the serialized
            // string into a JS object. If result isn't truthy, the
            // key is likely undefined and we'll pass it straight
            // to the iterator.
            if (value) {
                value = dbInfo.serializer.deserialize(value);
            }

            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

            if (value !== void 0) {
                return value;
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Same as localStorage's key() method, except takes a callback.
function key$2(n, callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result;
        try {
            result = localStorage.key(n);
        } catch (error) {
            result = null;
        }

        // Remove the prefix from the key, if a key is found.
        if (result) {
            result = result.substring(dbInfo.keyPrefix.length);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var length = localStorage.length;
        var keys = [];

        for (var i = 0; i < length; i++) {
            var itemKey = localStorage.key(i);
            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
            }
        }

        return keys;
    });

    executeCallback(promise, callback);
    return promise;
}

// Supply the number of keys in the datastore to the callback function.
function length$2(callback) {
    var self = this;
    var promise = self.keys().then(function (keys) {
        return keys.length;
    });

    executeCallback(promise, callback);
    return promise;
}

// Remove an item from the store, nice and simple.
function removeItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        localStorage.removeItem(dbInfo.keyPrefix + key);
    });

    executeCallback(promise, callback);
    return promise;
}

// Set a key's value and run an optional callback once the value is set.
// Unlike Gaia's implementation, the callback function is passed the value,
// in case you want to operate on that value only after you're sure it
// saved, or something like that.
function setItem$2(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        // Convert undefined values to null.
        // https://github.com/mozilla/localForage/pull/42
        if (value === undefined) {
            value = null;
        }

        // Save the original value to pass to the callback.
        var originalValue = value;

        return new Promise$1(function (resolve, reject) {
            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    try {
                        localStorage.setItem(dbInfo.keyPrefix + key, value);
                        resolve(originalValue);
                    } catch (e) {
                        // localStorage capacity exceeded.
                        // TODO: Make this a specific error/event.
                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            reject(e);
                        }
                        reject(e);
                    }
                }
            });
        });
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance$2(options, callback) {
    callback = getCallback.apply(this, arguments);

    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        var currentConfig = this.config();
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            if (!options.storeName) {
                resolve(options.name + '/');
            } else {
                resolve(_getKeyPrefix(options, self._defaultConfig));
            }
        }).then(function (keyPrefix) {
            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);

                if (key.indexOf(keyPrefix) === 0) {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var localStorageWrapper = {
    _driver: 'localStorageWrapper',
    _initStorage: _initStorage$2,
    _support: isLocalStorageValid(),
    iterate: iterate$2,
    getItem: getItem$2,
    setItem: setItem$2,
    removeItem: removeItem$2,
    clear: clear$2,
    length: length$2,
    key: key$2,
    keys: keys$2,
    dropInstance: dropInstance$2
};

var sameValue = function sameValue(x, y) {
    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
};

var includes = function includes(array, searchElement) {
    var len = array.length;
    var i = 0;
    while (i < len) {
        if (sameValue(array[i], searchElement)) {
            return true;
        }
        i++;
    }

    return false;
};

var isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

// Drivers are stored here when `defineDriver()` is called.
// They are shared across all instances of localForage.
var DefinedDrivers = {};

var DriverSupport = {};

var DefaultDrivers = {
    INDEXEDDB: asyncStorage,
    WEBSQL: webSQLStorage,
    LOCALSTORAGE: localStorageWrapper
};

var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

var OptionalDriverMethods = ['dropInstance'];

var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

var DefaultConfig = {
    description: '',
    driver: DefaultDriverOrder.slice(),
    name: 'localforage',
    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
    // we can use without a prompt.
    size: 4980736,
    storeName: 'keyvaluepairs',
    version: 1.0
};

function callWhenReady(localForageInstance, libraryMethod) {
    localForageInstance[libraryMethod] = function () {
        var _args = arguments;
        return localForageInstance.ready().then(function () {
            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
        });
    };
}

function extend() {
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];

        if (arg) {
            for (var _key in arg) {
                if (arg.hasOwnProperty(_key)) {
                    if (isArray(arg[_key])) {
                        arguments[0][_key] = arg[_key].slice();
                    } else {
                        arguments[0][_key] = arg[_key];
                    }
                }
            }
        }
    }

    return arguments[0];
}

var LocalForage = function () {
    function LocalForage(options) {
        _classCallCheck(this, LocalForage);

        for (var driverTypeKey in DefaultDrivers) {
            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                var driver = DefaultDrivers[driverTypeKey];
                var driverName = driver._driver;
                this[driverTypeKey] = driverName;

                if (!DefinedDrivers[driverName]) {
                    // we don't need to wait for the promise,
                    // since the default drivers can be defined
                    // in a blocking manner
                    this.defineDriver(driver);
                }
            }
        }

        this._defaultConfig = extend({}, DefaultConfig);
        this._config = extend({}, this._defaultConfig, options);
        this._driverSet = null;
        this._initDriver = null;
        this._ready = false;
        this._dbInfo = null;

        this._wrapLibraryMethodsWithReady();
        this.setDriver(this._config.driver)["catch"](function () {});
    }

    // Set any config values for localForage; can be called anytime before
    // the first API call (e.g. `getItem`, `setItem`).
    // We loop through options so we don't overwrite existing config
    // values.


    LocalForage.prototype.config = function config(options) {
        // If the options argument is an object, we use it to set values.
        // Otherwise, we return either a specified config value or all
        // config values.
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
            // If localforage is ready and fully initialized, we can't set
            // any new configuration values. Instead, we return an error.
            if (this._ready) {
                return new Error("Can't call config() after localforage " + 'has been used.');
            }

            for (var i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }

                if (i === 'version' && typeof options[i] !== 'number') {
                    return new Error('Database version must be a number.');
                }

                this._config[i] = options[i];
            }

            // after all config options are set and
            // the driver option is used, try setting it
            if ('driver' in options && options.driver) {
                return this.setDriver(this._config.driver);
            }

            return true;
        } else if (typeof options === 'string') {
            return this._config[options];
        } else {
            return this._config;
        }
    };

    // Used to define a custom driver, shared across all instances of
    // localForage.


    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
        var promise = new Promise$1(function (resolve, reject) {
            try {
                var driverName = driverObject._driver;
                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

                // A driver name should be defined and not overlap with the
                // library-defined, default drivers.
                if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                }

                var driverMethods = LibraryMethods.concat('_initStorage');
                for (var i = 0, len = driverMethods.length; i < len; i++) {
                    var driverMethodName = driverMethods[i];

                    // when the property is there,
                    // it should be a method even when optional
                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
                        reject(complianceError);
                        return;
                    }
                }

                var configureMissingMethods = function configureMissingMethods() {
                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                        return function () {
                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
                            var promise = Promise$1.reject(error);
                            executeCallback(promise, arguments[arguments.length - 1]);
                            return promise;
                        };
                    };

                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                        var optionalDriverMethod = OptionalDriverMethods[_i];
                        if (!driverObject[optionalDriverMethod]) {
                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                        }
                    }
                };

                configureMissingMethods();

                var setDriverSupport = function setDriverSupport(support) {
                    if (DefinedDrivers[driverName]) {
                        console.info('Redefining LocalForage driver: ' + driverName);
                    }
                    DefinedDrivers[driverName] = driverObject;
                    DriverSupport[driverName] = support;
                    // don't use a then, so that we can define
                    // drivers that have simple _support methods
                    // in a blocking manner
                    resolve();
                };

                if ('_support' in driverObject) {
                    if (driverObject._support && typeof driverObject._support === 'function') {
                        driverObject._support().then(setDriverSupport, reject);
                    } else {
                        setDriverSupport(!!driverObject._support);
                    }
                } else {
                    setDriverSupport(true);
                }
            } catch (e) {
                reject(e);
            }
        });

        executeTwoCallbacks(promise, callback, errorCallback);
        return promise;
    };

    LocalForage.prototype.driver = function driver() {
        return this._driver || null;
    };

    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
        return getDriverPromise;
    };

    LocalForage.prototype.getSerializer = function getSerializer(callback) {
        var serializerPromise = Promise$1.resolve(localforageSerializer);
        executeTwoCallbacks(serializerPromise, callback);
        return serializerPromise;
    };

    LocalForage.prototype.ready = function ready(callback) {
        var self = this;

        var promise = self._driverSet.then(function () {
            if (self._ready === null) {
                self._ready = self._initDriver();
            }

            return self._ready;
        });

        executeTwoCallbacks(promise, callback, callback);
        return promise;
    };

    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
        var self = this;

        if (!isArray(drivers)) {
            drivers = [drivers];
        }

        var supportedDrivers = this._getSupportedDrivers(drivers);

        function setDriverToConfig() {
            self._config.driver = self.driver();
        }

        function extendSelfWithDriver(driver) {
            self._extend(driver);
            setDriverToConfig();

            self._ready = self._initStorage(self._config);
            return self._ready;
        }

        function initDriver(supportedDrivers) {
            return function () {
                var currentDriverIndex = 0;

                function driverPromiseLoop() {
                    while (currentDriverIndex < supportedDrivers.length) {
                        var driverName = supportedDrivers[currentDriverIndex];
                        currentDriverIndex++;

                        self._dbInfo = null;
                        self._ready = null;

                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                    }

                    setDriverToConfig();
                    var error = new Error('No available storage method found.');
                    self._driverSet = Promise$1.reject(error);
                    return self._driverSet;
                }

                return driverPromiseLoop();
            };
        }

        // There might be a driver initialization in progress
        // so wait for it to finish in order to avoid a possible
        // race condition to set _dbInfo
        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
            return Promise$1.resolve();
        }) : Promise$1.resolve();

        this._driverSet = oldDriverSetDone.then(function () {
            var driverName = supportedDrivers[0];
            self._dbInfo = null;
            self._ready = null;

            return self.getDriver(driverName).then(function (driver) {
                self._driver = driver._driver;
                setDriverToConfig();
                self._wrapLibraryMethodsWithReady();
                self._initDriver = initDriver(supportedDrivers);
            });
        })["catch"](function () {
            setDriverToConfig();
            var error = new Error('No available storage method found.');
            self._driverSet = Promise$1.reject(error);
            return self._driverSet;
        });

        executeTwoCallbacks(this._driverSet, callback, errorCallback);
        return this._driverSet;
    };

    LocalForage.prototype.supports = function supports(driverName) {
        return !!DriverSupport[driverName];
    };

    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
    };

    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
        var supportedDrivers = [];
        for (var i = 0, len = drivers.length; i < len; i++) {
            var driverName = drivers[i];
            if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
            }
        }
        return supportedDrivers;
    };

    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
        // Add a stub for each driver API method that delays the call to the
        // corresponding driver method until localForage is ready. These stubs
        // will be replaced by the driver methods as soon as the driver is
        // loaded, so there is no performance impact.
        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
            callWhenReady(this, LibraryMethods[i]);
        }
    };

    LocalForage.prototype.createInstance = function createInstance(options) {
        return new LocalForage(options);
    };

    return LocalForage;
}();

// The actual localForage object that we expose as a module or via a
// global. It's extended by pulling in one of our other libraries.


var localforage_js = new LocalForage();

module.exports = localforage_js;

},{"3":3}]},{},[4])(4)
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],69:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],70:[function(require,module,exports){
(function (process,setImmediate){(function (){
'use strict';

var callable, byObserver;

callable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, i = 0;
	new Observer(function () {
		var data;
		if (!queue) return;
		data = queue;
		queue = null;
		if (typeof data === 'function') {
			data();
			return;
		}
		data.forEach(function (fn) { fn(); });
	}).observe(node, { characterData: true });
	return function (fn) {
		callable(fn);
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn];
			else queue.push(fn);
			return;
		}
		queue = fn;
		node.data = (i = ++i % 2);
	};
};

module.exports = (function () {
	// Node.js
	if ((typeof process !== 'undefined') && process &&
			(typeof process.nextTick === 'function')) {
		return process.nextTick;
	}

	// MutationObserver=
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') {
			return byObserver(MutationObserver);
		}
		if (typeof WebKitMutationObserver === 'function') {
			return byObserver(WebKitMutationObserver);
		}
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(callable(cb)); };
	}

	// Wide available standard
	if (typeof setTimeout === 'function') {
		return function (cb) { setTimeout(callable(cb), 0); };
	}

	return null;
}());

}).call(this)}).call(this,require('_process'),require("timers").setImmediate)
},{"_process":72,"timers":92}],71:[function(require,module,exports){

var identity = function(_){ return _; };


/**
 * Module exports, export
 */

module.exports = multiple(find);
module.exports.find = module.exports;


/**
 * Export the replacement function, return the modified object
 */

module.exports.replace = function (obj, key, val, options) {
  multiple(replace).call(this, obj, key, val, options);
  return obj;
};


/**
 * Export the delete function, return the modified object
 */

module.exports.del = function (obj, key, options) {
  multiple(del).call(this, obj, key, null, options);
  return obj;
};


/**
 * Compose applying the function to a nested key
 */

function multiple (fn) {
  return function (obj, path, val, options) {
    var normalize = options && isFunction(options.normalizer) ? options.normalizer : defaultNormalize;
    path = normalize(path);

    var key;
    var finished = false;

    while (!finished) loop();

    function loop() {
      for (key in obj) {
        var normalizedKey = normalize(key);
        if (0 === path.indexOf(normalizedKey)) {
          var temp = path.substr(normalizedKey.length);
          if (temp.charAt(0) === '.' || temp.length === 0) {
            path = temp.substr(1);
            var child = obj[key];

            // we're at the end and there is nothing.
            if (null == child) {
              finished = true;
              return;
            }

            // we're at the end and there is something.
            if (!path.length) {
              finished = true;
              return;
            }

            // step into child
            obj = child;

            // but we're done here
            return;
          }
        }
      }

      key = undefined;
      // if we found no matching properties
      // on the current object, there's no match.
      finished = true;
    }

    if (!key) return;
    if (null == obj) return obj;

    // the `obj` and `key` is one above the leaf object and key, so
    // start object: { a: { 'b.c': 10 } }
    // end object: { 'b.c': 10 }
    // end key: 'b.c'
    // this way, you can do `obj[key]` and get `10`.
    return fn(obj, key, val);
  };
}


/**
 * Find an object by its key
 *
 * find({ first_name : 'Calvin' }, 'firstName')
 */

function find (obj, key) {
  if (obj.hasOwnProperty(key)) return obj[key];
}


/**
 * Delete a value for a given key
 *
 * del({ a : 'b', x : 'y' }, 'X' }) -> { a : 'b' }
 */

function del (obj, key) {
  if (obj.hasOwnProperty(key)) delete obj[key];
  return obj;
}


/**
 * Replace an objects existing value with a new one
 *
 * replace({ a : 'b' }, 'a', 'c') -> { a : 'c' }
 */

function replace (obj, key, val) {
  if (obj.hasOwnProperty(key)) obj[key] = val;
  return obj;
}

/**
 * Normalize a `dot.separated.path`.
 *
 * A.HELL(!*&#(!)O_WOR   LD.bar => ahelloworldbar
 *
 * @param {String} path
 * @return {String}
 */

function defaultNormalize(path) {
  return path.replace(/[^a-zA-Z0-9\.]+/g, '').toLowerCase();
}

/**
 * Check if a value is a function.
 *
 * @param {*} val
 * @return {boolean} Returns `true` if `val` is a function, otherwise `false`.
 */

function isFunction(val) {
  return typeof val === 'function';
}

},{}],72:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],73:[function(require,module,exports){

// https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html

/**
 * Invoke `fn(err)` when the given `el` script loads.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

module.exports = function(el, fn){
  return el.addEventListener
    ? add(el, fn)
    : attach(el, fn);
};

/**
 * Add event listener to `el`, `fn()`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function add(el, fn){
  el.addEventListener('load', function(_, e){ fn(null, e); }, false);
  el.addEventListener('error', function(e){
    var err = new Error('script error "' + el.src + '"');
    err.event = e;
    fn(err);
  }, false);
}

/**
 * Attach event.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function attach(el, fn){
  el.attachEvent('onreadystatechange', function(e){
    if (!/complete|loaded/.test(el.readyState)) return;
    fn(null, e);
  });
  el.attachEvent('onerror', function(e){
    var err = new Error('failed to load the script "' + el.src + '"');
    err.event = e || window.event;
    fn(err);
  });
}

},{}],74:[function(require,module,exports){
'use strict';

var get = require('obj-case');

/**
 * Add address getters to `proto`.
 *
 * @ignore
 * @param {Function} proto
 */
module.exports = function(proto) {
  proto.zip = trait('postalCode', 'zip');
  proto.country = trait('country');
  proto.street = trait('street');
  proto.state = trait('state');
  proto.city = trait('city');
  proto.region = trait('region');

  function trait(a, b) {
    return function() {
      var traits = this.traits();
      var props = this.properties ? this.properties() : {};

      return get(traits, 'address.' + a)
        || get(traits, a)
        || (b ? get(traits, 'address.' + b) : null)
        || (b ? get(traits, b) : null)
        || get(props, 'address.' + a)
        || get(props, a)
        || (b ? get(props, 'address.' + b) : null)
        || (b ? get(props, b) : null);
    };
  }
};

},{"obj-case":71}],75:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Facade = require('./facade');

/**
 * Initialize a new `Alias` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.from] - The previous ID of the user.
 * @param {string} [dictionary.to] - The new ID of the user.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Alias(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Alias, Facade);

/**
 * Return the type of facade this is. This will always return `"alias"`.
 *
 * @return {string}
 */
Alias.prototype.action = function() {
  return 'alias';
};

/**
 * An alias for {@link Alias#action}.
 *
 * @function
 * @return {string}
 */
Alias.prototype.type = Alias.prototype.action;

/**
 * Get the user's previous ID from `previousId` or `from`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Alias.prototype.previousId = function() {
  return this.field('previousId') || this.field('from');
};

/**
 * An alias for {@link Alias#previousId}.
 *
 * @function
 * @return {string}
 */
Alias.prototype.from = Alias.prototype.previousId;

/**
 * Get the user's new ID from `userId` or `to`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Alias.prototype.userId = function() {
  return this.field('userId') || this.field('to');
};

/**
 * An alias for {@link Alias#userId}.
 *
 * @function
 * @return {string}
 */
Alias.prototype.to = Alias.prototype.userId;

module.exports = Alias;

},{"./facade":77,"./utils":85}],76:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Facade = require('./facade');

/**
 * Initialize a new `Delete` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.category] - The delete category.
 * @param {string} [dictionary.name] - The delete name.
 * @param {string} [dictionary.properties] - The delete properties.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Delete(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Delete, Facade);

/**
 * Return the type of facade this is. This will always return `"delete"`.
 *
 * @return {string}
 */
Delete.prototype.type = function() {
  return 'delete';
};

module.exports = Delete;

},{"./facade":77,"./utils":85}],77:[function(require,module,exports){
'use strict';

var address = require('./address');
var clone = require('./utils').clone;
var isEnabled = require('./is-enabled');
var newDate = require('new-date');
var objCase = require('obj-case');
var traverse = require('@segment/isodate-traverse');
var type = require('./utils').type;

/**
 * A *Facade* is an object meant for creating convience wrappers around
 * objects. When developing integrations, you probably want to look at its
 * subclasses, such as {@link Track} or {@link Identify}, rather than this
 * general-purpose class.
 *
 * This constructor will initialize a new `Facade` with an `obj` of arguments.
 *
 * If the inputted `obj` doesn't have a `timestamp` property, one will be added
 * with the value `new Date()`. Otherwise, the `timestamp` property will be
 * converted to a Date using the `new-date` package.
 *
 * By default, the inputted object will be defensively copied, and all ISO
 * strings present in the string will be converted into Dates.
 *
 * @param {Object} obj - The object to wrap.
 * @param {Object} opts - Options about what kind of Facade to create.
 * @param {boolean} [opts.clone=true] - Whether to make defensive clones. If enabled,
 * the inputted object will be cloned, and any objects derived from this facade
 * will be cloned before being returned.
 * @param {boolean} [opts.traverse=true] - Whether to perform ISODate-Traverse
 * on the inputted object.
 *
 * @see {@link https://github.com/segmentio/new-date|new-date}
 * @see {@link https://github.com/segmentio/isodate-traverse|isodate-traverse}
 */
function Facade(obj, opts) {
  opts = opts || {};
  if (!('clone' in opts)) opts.clone = true;
  if (opts.clone) obj = clone(obj);
  if (!('traverse' in opts)) opts.traverse = true;
  if (!('timestamp' in obj)) obj.timestamp = new Date();
  else obj.timestamp = newDate(obj.timestamp);
  if (opts.traverse) traverse(obj);
  this.opts = opts;
  this.obj = obj;
}

/**
 * Get a potentially-nested field in this facade. `field` should be a
 * period-separated sequence of properties.
 *
 * If the first field passed in points to a function (e.g. the `field` passed
 * in is `a.b.c` and this facade's `obj.a` is a function), then that function
 * will be called, and then the deeper fields will be fetched (using obj-case)
 * from what that function returns. If the first field isn't a function, then
 * this function works just like obj-case.
 *
 * Because this function uses obj-case, the camel- or snake-case of the input
 * is irrelevant.
 *
 * @example
 * YourClass.prototype.height = function() {
 *   return this.proxy('getDimensions.height') ||
 *     this.proxy('props.size.side_length');
 * }
 * @param {string} field - A sequence of properties, joined by periods (`.`).
 * @return {*} - A property of the inputted object.
 * @see {@link https://github.com/segmentio/obj-case|obj-case}
 */
Facade.prototype.proxy = function(field) {
  var fields = field.split('.');
  field = fields.shift();

  // Call a function at the beginning to take advantage of facaded fields
  var obj = this[field] || this.field(field);
  if (!obj) return obj;
  if (typeof obj === 'function') obj = obj.call(this) || {};
  if (fields.length === 0) return this.opts.clone ? transform(obj) : obj;

  obj = objCase(obj, fields.join('.'));
  return this.opts.clone ? transform(obj) : obj;
};

/**
 * Directly access a specific `field` from the underlying object. Only
 * "top-level" fields will work with this function. "Nested" fields *will not
 * work* with this function.
 *
 * @param {string} field
 * @return {*}
 */
Facade.prototype.field = function(field) {
  var obj = this.obj[field];
  return this.opts.clone ? transform(obj) : obj;
};

/**
 * Utility method to always proxy a particular `field`. In other words, it
 * returns a function that will always return `this.proxy(field)`.
 *
 * @example
 * MyClass.prototype.height = Facade.proxy('options.dimensions.height');
 *
 * @param {string} field
 * @return {Function}
 */
Facade.proxy = function(field) {
  return function() {
    return this.proxy(field);
  };
};

/**
 * Utility method to always access a `field`. In other words, it returns a
 * function that will always return `this.field(field)`.
 *
 * @param {string} field
 * @return {Function}
 */
Facade.field = function(field) {
  return function() {
    return this.field(field);
  };
};

/**
 * Create a helper function for fetching a "plural" thing.
 *
 * The generated method will take the inputted `path` and append an "s" to it
 * and calls `this.proxy` with this "pluralized" path. If that produces an
 * array, that will be returned. Otherwise, a one-element array containing
 * `this.proxy(path)` will be returned.
 *
 * @example
 * MyClass.prototype.birds = Facade.multi('animals.bird');
 *
 * @param {string} path
 * @return {Function}
 */
Facade.multi = function(path) {
  return function() {
    var multi = this.proxy(path + 's');
    if (type(multi) === 'array') return multi;
    var one = this.proxy(path);
    if (one) one = [this.opts.clone ? clone(one) : one];
    return one || [];
  };
};

/**
 * Create a helper function for getting a "singular" thing.
 *
 * The generated method will take the inputted path and call
 * `this.proxy(path)`. If a truthy thing is produced, it will be returned.
 * Otherwise, `this.proxy(path + 's')` will be called, and if that produces an
 * array the first element of that array will be returned. Otherwise,
 * `undefined` is returned.
 *
 * @example
 * MyClass.prototype.bird = Facade.one('animals.bird');
 *
 * @param {string} path
 * @return {Function}
 */
Facade.one = function(path) {
  return function() {
    var one = this.proxy(path);
    if (one) return one;
    var multi = this.proxy(path + 's');
    if (type(multi) === 'array') return multi[0];
  };
};

/**
 * Gets the underlying object this facade wraps around.
 *
 * If this facade has a property `type`, it will be invoked as a function and
 * will be assigned as the property `type` of the outputted object.
 *
 * @return {Object}
 */
Facade.prototype.json = function() {
  var ret = this.opts.clone ? clone(this.obj) : this.obj;
  if (this.type) ret.type = this.type();
  return ret;
};

/**
 * Get the options of a call. If an integration is passed, only the options for
 * that integration are included. If the integration is not enabled, then
 * `undefined` is returned.
 *
 * Options are taken from the `options` property of the underlying object,
 * falling back to the object's `context` or simply `{}`.
 *
 * @param {string} integration - The name of the integration to get settings
 * for. Casing does not matter.
 * @return {Object|undefined}
 */
Facade.prototype.options = function(integration) {
  var obj = this.obj.options || this.obj.context || {};
  var options = this.opts.clone ? clone(obj) : obj;
  if (!integration) return options;
  if (!this.enabled(integration)) return;
  var integrations = this.integrations();
  var value = integrations[integration] || objCase(integrations, integration);
  if (typeof value !== 'object') value = objCase(this.options(), integration);
  return typeof value === 'object' ? value : {};
};

/**
 * An alias for {@link Facade#options}.
 */
Facade.prototype.context = Facade.prototype.options;

/**
 * Check whether an integration is enabled.
 *
 * Basically, this method checks whether this integration is explicitly
 * enabled. If it isn'texplicitly mentioned, it checks whether it has been
 * enabled at the global level. Some integrations (e.g. Salesforce), cannot
 * enabled by these global event settings.
 *
 * More concretely, the deciding factors here are:
 *
 * 1. If `this.integrations()` has the integration set to `true`, return `true`.
 * 2. If `this.integrations().providers` has the integration set to `true`, return `true`.
 * 3. If integrations are set to default-disabled via global parameters (i.e.
 * `options.providers.all`, `options.all`, or `integrations.all`), then return
 * false.
 * 4. If the integration is one of the special default-deny integrations
 * (currently, only Salesforce), then return false.
 * 5. Else, return true.
 *
 * @param {string} integration
 * @return {boolean}
 */
Facade.prototype.enabled = function(integration) {
  var allEnabled = this.proxy('options.providers.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('options.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('integrations.all');
  if (typeof allEnabled !== 'boolean') allEnabled = true;

  var enabled = allEnabled && isEnabled(integration);
  var options = this.integrations();

  // If the integration is explicitly enabled or disabled, use that
  // First, check options.providers for backwards compatibility
  if (options.providers && options.providers.hasOwnProperty(integration)) {
    enabled = options.providers[integration];
  }

  // Next, check for the integration's existence in 'options' to enable it.
  // If the settings are a boolean, use that, otherwise it should be enabled.
  if (options.hasOwnProperty(integration)) {
    var settings = options[integration];
    if (typeof settings === 'boolean') {
      enabled = settings;
    } else {
      enabled = true;
    }
  }

  return !!enabled;
};

/**
 * Get all `integration` options.
 *
 * @ignore
 * @param {string} integration
 * @return {Object}
 */
Facade.prototype.integrations = function() {
  return this.obj.integrations || this.proxy('options.providers') || this.options();
};

/**
 * Check whether the user is active.
 *
 * @return {boolean}
 */
Facade.prototype.active = function() {
  var active = this.proxy('options.active');
  if (active === null || active === undefined) active = true;
  return active;
};

/**
 * Get `sessionId / anonymousId`.
 *
 * @return {*}
 */
Facade.prototype.anonymousId = function() {
  return this.field('anonymousId') || this.field('sessionId');
};

/**
 * An alias for {@link Facade#anonymousId}.
 *
 * @function
 * @return {string}
 */
Facade.prototype.sessionId = Facade.prototype.anonymousId;

/**
 * Get `groupId` from `context.groupId`.
 *
 * @function
 * @return {string}
 */
Facade.prototype.groupId = Facade.proxy('options.groupId');

/**
 * Get the call's "traits". All event types can pass in traits, though {@link
 * Identify} and {@link Group} override this implementation.
 *
 * Traits are gotten from `options.traits`, augmented with a property `id` with
 * the event's `userId`.
 *
 * The parameter `aliases` is meant to transform keys in `options.traits` into
 * new keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx`
 * in the traits, and move it to `yyy`. If `xxx` is a method of this facade,
 * it'll be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { options: { traits: { foo: "bar" } }, anonymousId: "xxx" }
 * var facade = new Facade(obj)
 *
 * facade.traits() // { "foo": "bar" }
 * facade.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * facade.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Facade.prototype.traits = function(aliases) {
  var ret = this.proxy('options.traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('options.traits.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * The library and version of the client used to produce the message.
 *
 * If the library name cannot be determined, it is set to `"unknown"`. If the
 * version cannot be determined, it is set to `null`.
 *
 * @return {{name: string, version: string}}
 */
Facade.prototype.library = function() {
  var library = this.proxy('options.library');
  if (!library) return { name: 'unknown', version: null };
  if (typeof library === 'string') return { name: library, version: null };
  return library;
};

/**
 * Return the device information, falling back to an empty object.
 *
 * Interesting values of `type` are `"ios"` and `"android"`, but other values
 * are possible if the client is doing something unusual with `context.device`.
 *
 * @return {{type: string}}
 */
Facade.prototype.device = function() {
  var device = this.proxy('context.device');
  if (type(device) !== 'object') device = {};
  var library = this.library().name;
  if (device.type) return device;

  if (library.indexOf('ios') > -1) device.type = 'ios';
  if (library.indexOf('android') > -1) device.type = 'android';
  return device;
};

/**
 * Get the User-Agent from `context.userAgent`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.userAgent = Facade.proxy('context.userAgent');

/**
 * Get the timezone from `context.timezone`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.timezone = Facade.proxy('context.timezone');

/**
 * Get the timestamp from `context.timestamp`.
 *
 * @function
 * @return string
 */
Facade.prototype.timestamp = Facade.field('timestamp');

/**
 * Get the channel from `channel`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.channel = Facade.field('channel');

/**
 * Get the IP address from `context.ip`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.ip = Facade.proxy('context.ip');

/**
 * Get the user ID from `userId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.userId = Facade.field('userId');

/**
 * Get the ZIP/Postal code from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name zip
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the country from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name country
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the street from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name street
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the state from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name state
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the city from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name city
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the region from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name region
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

address(Facade.prototype);

/**
 * Return the cloned and traversed object
 *
 * @ignore
 * @param {*} obj
 * @return {*}
 */
function transform(obj) {
  return clone(obj);
}

module.exports = Facade;

},{"./address":74,"./is-enabled":81,"./utils":85,"@segment/isodate-traverse":40,"new-date":87,"obj-case":71}],78:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var isEmail = require('is-email');
var newDate = require('new-date');
var Facade = require('./facade');

/**
 * Initialize a new `Group` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.userId] - The user to add to the group.
 * @param {string} [dictionary.groupId] - The ID of the group.
 * @param {Object} [dictionary.traits] - The traits of the group.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Group(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Group, Facade);

/**
 * Return the type of facade this is. This will always return `"group"`.
 *
 * @return {string}
 */
Group.prototype.action = function() {
  return 'group';
};

/**
 * An alias for {@link Group#action}.
 *
 * @function
 * @return {string}
 */
Group.prototype.type = Group.prototype.action;

/**
 * Get the group ID from `groupId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Group.prototype.groupId = Facade.field('groupId');

/**
 * Get the time of creation of the group from `traits.createdAt`,
 * `traits.created`, `properties.createdAt`, or `properties.created`.
 *
 * @return {Date}
 */
Group.prototype.created = function() {
  var created = this.proxy('traits.createdAt')
    || this.proxy('traits.created')
    || this.proxy('properties.createdAt')
    || this.proxy('properties.created');

  if (created) return newDate(created);
};

/**
 * Get the group's email from `traits.email`, falling back to `groupId` only if
 * it looks like a valid email.
 *
 * @return {string}
 */
Group.prototype.email = function() {
  var email = this.proxy('traits.email');
  if (email) return email;
  var groupId = this.groupId();
  if (isEmail(groupId)) return groupId;
};

/**
 * Get the group's traits. This is identical to how {@link Facade#traits}
 * works, except it looks at `traits.*` instead of `options.traits.*`.
 *
 * Traits are gotten from `traits`, augmented with a property `id` with
 * the event's `groupId`.
 *
 * The parameter `aliases` is meant to transform keys in `traits` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { traits: { foo: "bar" }, anonymousId: "xxx" }
 * var group = new Group(obj)
 *
 * group.traits() // { "foo": "bar" }
 * group.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * group.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Group.prototype.traits = function(aliases) {
  var ret = this.properties();
  var id = this.groupId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('traits.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Get the group's name from `traits.name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Group.prototype.name = Facade.proxy('traits.name');

/**
 * Get the group's industry from `traits.industry`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Group.prototype.industry = Facade.proxy('traits.industry');

/**
 * Get the group's employee count from `traits.employees`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Group.prototype.employees = Facade.proxy('traits.employees');

/**
 * Get the group's properties from `traits` or `properties`, falling back to
 * simply an empty object.
 *
 * @return {Object}
 */
Group.prototype.properties = function() {
  // TODO remove this function
  return this.field('traits') || this.field('properties') || {};
};

module.exports = Group;

},{"./facade":77,"./utils":85,"is-email":62,"new-date":87}],79:[function(require,module,exports){
'use strict';

var Facade = require('./facade');
var get = require('obj-case');
var inherit = require('./utils').inherit;
var isEmail = require('is-email');
var newDate = require('new-date');
var trim = require('trim');
var type = require('./utils').type;

/**
 * Initialize a new `Identify` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.userId] - The ID of the user.
 * @param {string} [dictionary.anonymousId] - The anonymous ID of the user.
 * @param {string} [dictionary.traits] - The user's traits.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Identify(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Identify, Facade);

/**
 * Return the type of facade this is. This will always return `"identify"`.
 *
 * @return {string}
 */
Identify.prototype.action = function() {
  return 'identify';
};

/**
 * An alias for {@link Identify#action}.
 *
 * @function
 * @return {string}
 */
Identify.prototype.type = Identify.prototype.action;

/**
 * Get the user's traits. This is identical to how {@link Facade#traits} works,
 * except it looks at `traits.*` instead of `options.traits.*`.
 *
 * Traits are gotten from `traits`, augmented with a property `id` with
 * the event's `userId`.
 *
 * The parameter `aliases` is meant to transform keys in `traits` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { traits: { foo: "bar" }, anonymousId: "xxx" }
 * var identify = new Identify(obj)
 *
 * identify.traits() // { "foo": "bar" }
 * identify.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * identify.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Identify.prototype.traits = function(aliases) {
  var ret = this.field('traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('traits.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete ret[alias];
  }

  return ret;
};

/**
 * Get the user's email from `traits.email`, falling back to `userId` only if
 * it looks like a valid email.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.email = function() {
  var email = this.proxy('traits.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the time of creation of the user from `traits.created` or
 * `traits.createdAt`.
 *
 * @return {Date}
 */
Identify.prototype.created = function() {
  var created = this.proxy('traits.created') || this.proxy('traits.createdAt');
  if (created) return newDate(created);
};

/**
 * Get the time of creation of the user's company from `traits.company.created`
 * or `traits.company.createdAt`.
 *
 * @return {Date}
 */
Identify.prototype.companyCreated = function() {
  var created = this.proxy('traits.company.created') || this.proxy('traits.company.createdAt');

  if (created) {
    return newDate(created);
  }
};

/**
 * Get the user's company name from `traits.company.name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.companyName = function() {
  return this.proxy('traits.company.name');
};

/**
 * Get the user's name `traits.name`, falling back to combining {@link
 * Identify#firstName} and {@link Identify#lastName} if possible.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.name = function() {
  var name = this.proxy('traits.name');
  if (typeof name === 'string') {
    return trim(name);
  }

  var firstName = this.firstName();
  var lastName = this.lastName();
  if (firstName && lastName) {
    return trim(firstName + ' ' + lastName);
  }
};

/**
 * Get the user's first name from `traits.firstName`, optionally splitting it
 * out of a the full name if that's all that was provided.
 *
 * Splitting the full name works on the assumption that the full name is of the
 * form "FirstName LastName"; it will not work for non-Western names.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.firstName = function() {
  var firstName = this.proxy('traits.firstName');
  if (typeof firstName === 'string') {
    return trim(firstName);
  }

  var name = this.proxy('traits.name');
  if (typeof name === 'string') {
    return trim(name).split(' ')[0];
  }
};

/**
 * Get the user's last name from `traits.lastName`, optionally splitting it out
 * of a the full name if that's all that was provided.
 *
 * Splitting the full name works on the assumption that the full name is of the
 * form "FirstName LastName"; it will not work for non-Western names.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.lastName = function() {
  var lastName = this.proxy('traits.lastName');
  if (typeof lastName === 'string') {
    return trim(lastName);
  }

  var name = this.proxy('traits.name');
  if (typeof name !== 'string') {
    return;
  }

  var space = trim(name).indexOf(' ');
  if (space === -1) {
    return;
  }

  return trim(name.substr(space + 1));
};

/**
 * Get the user's "unique id" from `userId`, `traits.username`, or
 * `traits.email`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.uid = function() {
  return this.userId() || this.username() || this.email();
};

/**
 * Get the user's description from `traits.description` or `traits.background`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.description = function() {
  return this.proxy('traits.description') || this.proxy('traits.background');
};

/**
 * Get the user's age from `traits.age`, falling back to computing it from
 * `traits.birthday` and the current time.
 *
 * @return {number}
 */
Identify.prototype.age = function() {
  var date = this.birthday();
  var age = get(this.traits(), 'age');
  if (age != null) return age;
  if (type(date) !== 'date') return;
  var now = new Date();
  return now.getFullYear() - date.getFullYear();
};

/**
 * Get the URL of the user's avatar from `traits.avatar`, `traits.photoUrl`, or
 * `traits.avatarUrl`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.avatar = function() {
  var traits = this.traits();
  return get(traits, 'avatar') || get(traits, 'photoUrl') || get(traits, 'avatarUrl');
};

/**
 * Get the user's job position from `traits.position` or `traits.jobTitle`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.position = function() {
  var traits = this.traits();
  return get(traits, 'position') || get(traits, 'jobTitle');
};

/**
 * Get the user's username from `traits.username`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.username = Facade.proxy('traits.username');

/**
 * Get the user's website from `traits.website`, or if there are multiple in
 * `traits.websites`, return the first one.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.website = Facade.one('traits.website');

/**
 * Get the user's websites from `traits.websites`, or if there is only one in
 * `traits.website`, then wrap it in an array.
 *
 * This *should* be an array of strings, but may not be if the client isn't
 * adhering to the spec.
 *
 * @function
 * @return {array}
 */
Identify.prototype.websites = Facade.multi('traits.website');

/**
 * Get the user's phone number from `traits.phone`, or if there are multiple in
 * `traits.phones`, return the first one.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.phone = Facade.one('traits.phone');

/**
 * Get the user's phone numbers from `traits.phones`, or if there is only one
 * in `traits.phone`, then wrap it in an array.
 *
 * This *should* be an array of strings, but may not be if the client isn't
 * adhering to the spec.
 *
 * @function
 * @return {array}
 */
Identify.prototype.phones = Facade.multi('traits.phone');

/**
 * Get the user's address from `traits.address`.
 *
 * This *should* be an object, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {object}
 */
Identify.prototype.address = Facade.proxy('traits.address');

/**
 * Get the user's gender from `traits.gender`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.gender = Facade.proxy('traits.gender');

/**
 * Get the user's birthday from `traits.birthday`.
 *
 * This *should* be a Date if `opts.traverse` was enabled (it is by default)
 * when constructing this Identify. Otherwise, it should be a string. But it
 * may be neither if the client isn't adhering to the spec.
 * spec.
 *
 * @function
 * @return {object}
 */
Identify.prototype.birthday = Facade.proxy('traits.birthday');

module.exports = Identify;

},{"./facade":77,"./utils":85,"is-email":62,"new-date":87,"obj-case":71,"trim":94}],80:[function(require,module,exports){
'use strict';

var Facade = require('./facade');

Facade.Alias = require('./alias');
Facade.Group = require('./group');
Facade.Identify = require('./identify');
Facade.Track = require('./track');
Facade.Page = require('./page');
Facade.Screen = require('./screen');
Facade.Delete = require('./delete');

module.exports = Facade;

},{"./alias":75,"./delete":76,"./facade":77,"./group":78,"./identify":79,"./page":82,"./screen":83,"./track":84}],81:[function(require,module,exports){
'use strict';

// A few integrations are disabled by default. They must be explicitly enabled
// by setting options[Provider] = true.
var disabled = {
  Salesforce: true
};

/**
 * Check whether an integration should be enabled by default.
 *
 * @ignore
 * @param {string} integration
 * @return {boolean}
 */
module.exports = function(integration) {
  return !disabled[integration];
};

},{}],82:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Facade = require('./facade');
var Track = require('./track');
var isEmail = require('is-email');

/**
 * Initialize a new `Page` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.category] - The page category.
 * @param {string} [dictionary.name] - The page name.
 * @param {string} [dictionary.properties] - The page properties.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Page(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Page, Facade);

/**
 * Return the type of facade this is. This will always return `"page"`.
 *
 * @return {string}
 */
Page.prototype.action = function() {
  return 'page';
};

/**
 * An alias for {@link Page#action}.
 *
 * @function
 * @return {string}
 */
Page.prototype.type = Page.prototype.action;

/**
 * Get the page category from `category`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.category = Facade.field('category');

/**
 * Get the page name from `name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.name = Facade.field('name');

/**
 * Get the page title from `properties.title`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.title = Facade.proxy('properties.title');

/**
 * Get the page path from `properties.path`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.path = Facade.proxy('properties.path');

/**
 * Get the page URL from `properties.url`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.url = Facade.proxy('properties.url');

/**
 * Get the HTTP referrer from `context.referrer.url`, `context.page.referrer`,
 * or `properties.referrer`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.referrer = function() {
  return this.proxy('context.referrer.url')
    || this.proxy('context.page.referrer')
    || this.proxy('properties.referrer');
};

/**
 * Get the page's properties. This is identical to how {@link Facade#traits}
 * works, except it looks at `properties.*` instead of `options.traits.*`.
 *
 * Properties are gotten from `properties`, augmented with the page's `name`
 * and `category`.
 *
 * The parameter `aliases` is meant to transform keys in `properties` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { properties: { foo: "bar" }, anonymousId: "xxx" }
 * var page = new Page(obj)
 *
 * page.traits() // { "foo": "bar" }
 * page.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * page.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Page.prototype.properties = function(aliases) {
  var props = this.field('properties') || {};
  var category = this.category();
  var name = this.name();
  aliases = aliases || {};

  if (category) props.category = category;
  if (name) props.name = name;

  for (var alias in aliases) {
    var value = this[alias] == null
      ? this.proxy('properties.' + alias)
      : this[alias]();
    if (value == null) continue;
    props[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete props[alias];
  }

  return props;
};

/**
 * Get the user's email from `context.traits.email` or `properties.email`,
 * falling back to `userId` if it's a valid email.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.email = function() {
  var email = this.proxy('context.traits.email') || this.proxy('properties.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the page fullName. This is `$category $name` if both are present, and
 * just `name` otherwiser.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.fullName = function() {
  var category = this.category();
  var name = this.name();
  return name && category
    ? category + ' ' + name
    : name;
};

/**
 * Get an event name from this page call. If `name` is present, this will be
 * `Viewed $name Page`; otherwise, it will be `Loaded a Page`.
 *
 * @param {string} name - The name of this page.
 * @return {string}
 */
Page.prototype.event = function(name) {
  return name
    ? 'Viewed ' + name + ' Page'
    : 'Loaded a Page';
};

/**
 * Convert this Page to a {@link Track} facade. The inputted `name` will be
 * converted to the Track's event name via {@link Page#event}.
 *
 * @param {string} name
 * @return {Track}
 */
Page.prototype.track = function(name) {
  var json = this.json();
  json.event = this.event(name);
  json.timestamp = this.timestamp();
  json.properties = this.properties();
  return new Track(json, this.opts);
};

module.exports = Page;

},{"./facade":77,"./track":84,"./utils":85,"is-email":62}],83:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Page = require('./page');
var Track = require('./track');

/**
 * Initialize a new `Screen` facade with a `dictionary` of arguments.
 *
 * Note that this class extends {@link Page}, so its methods are available to
 * instances of this class as well.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.category] - The page category.
 * @param {string} [dictionary.name] - The page name.
 * @param {string} [dictionary.properties] - The page properties.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Page
 */
function Screen(dictionary, opts) {
  Page.call(this, dictionary, opts);
}

inherit(Screen, Page);

/**
 * Return the type of facade this is. This will always return `"screen"`.
 *
 * @return {string}
 */
Screen.prototype.action = function() {
  return 'screen';
};

/**
 * An alias for {@link Screen#action}.
 *
 * @function
 * @return {string}
 */
Screen.prototype.type = Screen.prototype.action;

/**
 * Get an event name from this screen call. If `name` is present, this will be
 * `Viewed $name Screen`; otherwise, it will be `Loaded a Screen`.
 *
 * @param {string} name - The name of this screen.
 * @return {string}
 */
Screen.prototype.event = function(name) {
  return name ? 'Viewed ' + name + ' Screen' : 'Loaded a Screen';
};

/**
 * Convert this Screen to a {@link Track} facade. The inputted `name` will be
 * converted to the Track's event name via {@link Screen#event}.
 *
 * @param {string} name
 * @return {Track}
 */
Screen.prototype.track = function(name) {
  var json = this.json();
  json.event = this.event(name);
  json.timestamp = this.timestamp();
  json.properties = this.properties();
  return new Track(json, this.opts);
};

module.exports = Screen;

},{"./page":82,"./track":84,"./utils":85}],84:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var type = require('./utils').type;
var Facade = require('./facade');
var Identify = require('./identify');
var isEmail = require('is-email');
var get = require('obj-case');

/**
 * Initialize a new `Track` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.event] - The name of the event being tracked.
 * @param {string} [dictionary.userId] - The ID of the user being tracked.
 * @param {string} [dictionary.anonymousId] - The anonymous ID of the user.
 * @param {string} [dictionary.properties] - Properties of the track event.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Track(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Track, Facade);

/**
 * Return the type of facade this is. This will always return `"track"`.
 *
 * @return {string}
 */
Track.prototype.action = function() {
  return 'track';
};

/**
 * An alias for {@link Track#action}.
 *
 * @function
 * @return {string}
 */
Track.prototype.type = Track.prototype.action;

/**
 * Get the event name from `event`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.event = Facade.field('event');

/**
 * Get the event value, usually the monetary value, from `properties.value`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.value = Facade.proxy('properties.value');

/**
 * Get the event cateogry from `properties.category`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.category = Facade.proxy('properties.category');

/**
 * Get the event ID from `properties.id`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.id = Facade.proxy('properties.id');

/**
 * Get the product ID from `properties.productId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.productId = function() {
  return this.proxy('properties.product_id') || this.proxy('properties.productId');
};

/**
 * Get the promotion ID from `properties.promotionId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.promotionId = function() {
  return this.proxy('properties.promotion_id') || this.proxy('properties.promotionId');
};

/**
 * Get the cart ID from `properties.cartId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.cartId = function() {
  return this.proxy('properties.cart_id') || this.proxy('properties.cartId');
};

/**
 * Get the checkout ID from `properties.checkoutId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.checkoutId = function() {
  return this.proxy('properties.checkout_id') || this.proxy('properties.checkoutId');
};

/**
 * Get the payment ID from `properties.paymentId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.paymentId = function() {
  return this.proxy('properties.payment_id') || this.proxy('properties.paymentId');
};

/**
 * Get the coupon ID from `properties.couponId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.couponId = function() {
  return this.proxy('properties.coupon_id') || this.proxy('properties.couponId');
};

/**
 * Get the wishlist ID from `properties.wishlistId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.wishlistId = function() {
  return this.proxy('properties.wishlist_id') || this.proxy('properties.wishlistId');
};

/**
 * Get the review ID from `properties.reviewId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.reviewId = function() {
  return this.proxy('properties.review_id') || this.proxy('properties.reviewId');
};

/**
 * Get the order ID from `properties.id` or `properties.orderId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.orderId = function() {
  // doesn't follow above convention since this fallback order was how it used to be
  return this.proxy('properties.id')
    || this.proxy('properties.order_id')
    || this.proxy('properties.orderId');
};

/**
 * Get the SKU from `properties.sku`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.sku = Facade.proxy('properties.sku');

/**
 * Get the amount of tax for this purchase from `properties.tax`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.tax = Facade.proxy('properties.tax');

/**
 * Get the name of this event from `properties.name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.name = Facade.proxy('properties.name');

/**
 * Get the price of this purchase from `properties.price`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.price = Facade.proxy('properties.price');

/**
 * Get the total for this purchase from `properties.total`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.total = Facade.proxy('properties.total');

/**
 * Whether this is a repeat purchase from `properties.repeat`.
 *
 * This *should* be a boolean, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {boolean}
 */
Track.prototype.repeat = Facade.proxy('properties.repeat');

/**
 * Get the coupon for this purchase from `properties.coupon`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.coupon = Facade.proxy('properties.coupon');

/**
 * Get the shipping for this purchase from `properties.shipping`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.shipping = Facade.proxy('properties.shipping');

/**
 * Get the discount for this purchase from `properties.discount`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.discount = Facade.proxy('properties.discount');

/**
 * Get the shipping method for this purchase from `properties.shippingMethod`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.shippingMethod = function() {
  return this.proxy('properties.shipping_method') || this.proxy('properties.shippingMethod');
};

/**
 * Get the payment method for this purchase from `properties.paymentMethod`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.paymentMethod = function() {
  return this.proxy('properties.payment_method') || this.proxy('properties.paymentMethod');
};

/**
 * Get a description for this event from `properties.description`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.description = Facade.proxy('properties.description');

/**
 * Get a plan, as in the plan the user is on, for this event from
 * `properties.plan`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.plan = Facade.proxy('properties.plan');

/**
 * Get the subtotal for this purchase from `properties.subtotal`.
 *
 * If `properties.subtotal` isn't available, then fall back to computing the
 * total from `properties.total` or `properties.revenue`, and then subtracting
 * tax, shipping, and discounts.
 *
 * If neither subtotal, total, nor revenue are available, then return 0.
 *
 * @return {number}
 */
Track.prototype.subtotal = function() {
  var subtotal = get(this.properties(), 'subtotal');
  var total = this.total() || this.revenue();

  if (subtotal) return subtotal;
  if (!total) return 0;

  if (this.total()) {
    var n = this.tax();
    if (n) total -= n;
    n = this.shipping();
    if (n) total -= n;
    n = this.discount();
    if (n) total += n;
  }

  return total;
};

/**
 * Get the products for this event from `properties.products` if it's an
 * array, falling back to an empty array.
 *
 * @return {Array}
 */
Track.prototype.products = function() {
  var props = this.properties();
  var products = get(props, 'products');
  return type(products) === 'array' ? products : [];
};

/**
 * Get the quantity for this event from `properties.quantity`, falling back to
 * a quantity of one.
 *
 * @return {number}
 */
Track.prototype.quantity = function() {
  var props = this.obj.properties || {};
  return props.quantity || 1;
};

/**
 * Get the currency for this event from `properties.currency`, falling back to
 * "USD".
 *
 * @return {string}
 */
Track.prototype.currency = function() {
  var props = this.obj.properties || {};
  return props.currency || 'USD';
};

/**
 * Get the referrer for this event from `context.referrer.url`,
 * `context.page.referrer`, or `properties.referrer`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.referrer = function() {
  // TODO re-examine whether this function is necessary
  return this.proxy('context.referrer.url')
    || this.proxy('context.page.referrer')
    || this.proxy('properties.referrer');
};

/**
 * Get the query for this event from `options.query`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string|object}
 */
Track.prototype.query = Facade.proxy('options.query');

/**
 * Get the page's properties. This is identical to how {@link Facade#traits}
 * works, except it looks at `properties.*` instead of `options.traits.*`.
 *
 * Properties are gotten from `properties`.
 *
 * The parameter `aliases` is meant to transform keys in `properties` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { properties: { foo: "bar" }, anonymousId: "xxx" }
 * var track = new Track(obj)
 *
 * track.traits() // { "foo": "bar" }
 * track.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * track.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Track.prototype.properties = function(aliases) {
  var ret = this.field('properties') || {};
  aliases = aliases || {};

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('properties.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Get the username of the user for this event from `traits.username`,
 * `properties.username`, `userId`, or `anonymousId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string|undefined}
 */
Track.prototype.username = function() {
  return this.proxy('traits.username')
    || this.proxy('properties.username')
    || this.userId()
    || this.sessionId();
};

/**
 * Get the email of the user for this event from `trais.email`,
 * `properties.email`, or `options.traits.email`, falling back to `userId` if
 * it looks like a valid email.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string|undefined}
 */
Track.prototype.email = function() {
  var email = this.proxy('traits.email')
    || this.proxy('properties.email')
    || this.proxy('options.traits.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the revenue for this event.
 *
 * If this is an "Order Completed" event, this will be the `properties.total`
 * falling back to the `properties.revenue`. For all other events, this is
 * simply taken from `properties.revenue`.
 *
 * If there are dollar signs in these properties, they will be removed. The
 * result will be parsed into a number.
 *
 * @return {number}
 */
Track.prototype.revenue = function() {
  var revenue = this.proxy('properties.revenue');
  var event = this.event();
  var orderCompletedRegExp = /^[ _]?completed[ _]?order[ _]?|^[ _]?order[ _]?completed[ _]?$/i;

  // it's always revenue, unless it's called during an order completion.
  if (!revenue && event && event.match(orderCompletedRegExp)) {
    revenue = this.proxy('properties.total');
  }

  return currency(revenue);
};

/**
 * Get the revenue for this event in "cents" -- in other words, multiply the
 * {@link Track#revenue} by 100, or return 0 if there isn't a numerical revenue
 * for this event.
 *
 * @return {number}
 */
Track.prototype.cents = function() {
  var revenue = this.revenue();
  return typeof revenue !== 'number' ? this.value() || 0 : revenue * 100;
};

/**
 * Convert this event into an {@link Identify} facade.
 *
 * This works by taking this event's underlying object and creating an Identify
 * from it. This event's traits, taken from `options.traits`, will be used as
 * the Identify's traits.
 *
 * @return {Identify}
 */
Track.prototype.identify = function() {
  // TODO: remove me.
  var json = this.json();
  json.traits = this.traits();
  return new Identify(json, this.opts);
};

/**
 * Get float from currency value.
 *
 * @ignore
 * @param {*} val
 * @return {number}
 */
function currency(val) {
  if (!val) return;
  if (typeof val === 'number') {
    return val;
  }
  if (typeof val !== 'string') {
    return;
  }

  val = val.replace(/\$/g, '');
  val = parseFloat(val);

  if (!isNaN(val)) {
    return val;
  }
}

module.exports = Track;

},{"./facade":77,"./identify":79,"./utils":85,"is-email":62,"obj-case":71}],85:[function(require,module,exports){
'use strict';

exports.inherit = require('inherits');
exports.clone = require('@ndhoule/clone');
exports.type = require('type-component');

},{"@ndhoule/clone":1,"inherits":86,"type-component":95}],86:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28}],87:[function(require,module,exports){
"use strict";

var isodate = require("@segment/isodate");
var milliseconds = require("./milliseconds");
var seconds = require("./seconds");

var objProto = Object.prototype;
var toStr = objProto.toString;

function isDate(value) {
  return toStr.call(value) === "[object Date]";
}

function isNumber(value) {
  return toStr.call(value) === "[object Number]";
}

/**
 * Returns a new Javascript Date object, allowing a variety of extra input types
 * over the native Date constructor.
 *
 * @param {Date|string|number} val
 */
module.exports = function newDate(val) {
  if (isDate(val)) return val;
  if (isNumber(val)) return new Date(toMs(val));

  // date strings
  if (isodate.is(val)) {
    return isodate.parse(val);
  }
  if (milliseconds.is(val)) {
    return milliseconds.parse(val);
  }
  if (seconds.is(val)) {
    return seconds.parse(val);
  }

  // fallback to Date.parse
  return new Date(val);
};

/**
 * If the number passed val is seconds from the epoch, turn it into milliseconds.
 * Milliseconds would be greater than 31557600000 (December 31, 1970).
 *
 * @param {number} num
 */
function toMs(num) {
  if (num < 31557600000) return num * 1000;
  return num;
}

},{"./milliseconds":88,"./seconds":89,"@segment/isodate":41}],88:[function(require,module,exports){
"use strict";

/**
 * Matcher.
 */

var matcher = /\d{13}/;

/**
 * Check whether a string is a millisecond date string.
 *
 * @param {string} string
 * @return {boolean}
 */
exports.is = function (string) {
  return matcher.test(string);
};

/**
 * Convert a millisecond string to a date.
 *
 * @param {string} millis
 * @return {Date}
 */
exports.parse = function (millis) {
  millis = parseInt(millis, 10);
  return new Date(millis);
};

},{}],89:[function(require,module,exports){
"use strict";

/**
 * Matcher.
 */

var matcher = /\d{10}/;

/**
 * Check whether a string is a second date string.
 *
 * @param {string} string
 * @return {Boolean}
 */
exports.is = function (string) {
  return matcher.test(string);
};

/**
 * Convert a second string to a date.
 *
 * @param {string} seconds
 * @return {Date}
 */
exports.parse = function (seconds) {
  var millis = parseInt(seconds, 10) * 1000;
  return new Date(millis);
};

},{}],90:[function(require,module,exports){

/**
 * Generate a slug from the given `str`.
 *
 * example:
 *
 *        generate('foo bar');
 *        // > foo-bar
 *
 * @param {String} str
 * @param {Object} options
 * @config {String|RegExp} [replace] characters to replace, defaulted to `/[^a-z0-9]/g`
 * @config {String} [separator] separator to insert, defaulted to `-`
 * @return {String}
 */

module.exports = function (str, options) {
  options || (options = {});
  return str.toLowerCase()
    .replace(options.replace || /[^a-z0-9]/g, ' ')
    .replace(/^ +| +$/g, '')
    .replace(/ +/g, options.separator || '-')
};

},{}],91:[function(require,module,exports){
(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals (with support for web workers)
        var glob;

        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.SparkMD5 = factory();
    }
}(function (undefined) {

    'use strict';

    /*
     * Fastest md5 implementation around (JKM md5).
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */

    /* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */
    var add32 = function (a, b) {
        return (a + b) & 0xFFFFFFFF;
    },
        hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];


    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md5cycle(x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function md5blk(s) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    function md5blk_array(a) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
    }

    function md51(s) {
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);
        return state;
    }

    function md51_array(a) {
        var n = a.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }

        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
        // containing the last element of the parent array if the sub array specified starts
        // beyond the length of the parent array - weird.
        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= a[i] << ((i % 4) << 3);
        }

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);

        return state;
    }

    function rhex(n) {
        var s = '',
            j;
        for (j = 0; j < 4; j += 1) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    }

    function hex(x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    }

    // In some cases the fast add32 function cannot be used..
    if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') {
        add32 = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    }

    // ---------------------------------------------------

    /**
     * ArrayBuffer slice polyfill.
     *
     * @see https://github.com/ttaubert/node-arraybuffer-slice
     */

    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
        (function () {
            function clamp(val, length) {
                val = (val | 0) || 0;

                if (val < 0) {
                    return Math.max(val + length, 0);
                }

                return Math.min(val, length);
            }

            ArrayBuffer.prototype.slice = function (from, to) {
                var length = this.byteLength,
                    begin = clamp(from, length),
                    end = length,
                    num,
                    target,
                    targetArray,
                    sourceArray;

                if (to !== undefined) {
                    end = clamp(to, length);
                }

                if (begin > end) {
                    return new ArrayBuffer(0);
                }

                num = end - begin;
                target = new ArrayBuffer(num);
                targetArray = new Uint8Array(target);

                sourceArray = new Uint8Array(this, begin, num);
                targetArray.set(sourceArray);

                return target;
            };
        })();
    }

    // ---------------------------------------------------

    /**
     * Helpers.
     */

    function toUtf8(str) {
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        return str;
    }

    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
        var length = str.length,
           buff = new ArrayBuffer(length),
           arr = new Uint8Array(buff),
           i;

        for (i = 0; i < length; i += 1) {
            arr[i] = str.charCodeAt(i);
        }

        return returnUInt8Array ? arr : buff;
    }

    function arrayBuffer2Utf8Str(buff) {
        return String.fromCharCode.apply(null, new Uint8Array(buff));
    }

    function concatenateArrayBuffers(first, second, returnUInt8Array) {
        var result = new Uint8Array(first.byteLength + second.byteLength);

        result.set(new Uint8Array(first));
        result.set(new Uint8Array(second), first.byteLength);

        return returnUInt8Array ? result : result.buffer;
    }

    function hexToBinaryString(hex) {
        var bytes = [],
            length = hex.length,
            x;

        for (x = 0; x < length - 1; x += 2) {
            bytes.push(parseInt(hex.substr(x, 2), 16));
        }

        return String.fromCharCode.apply(String, bytes);
    }

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */

    function SparkMD5() {
        // call reset to init the instance
        this.reset();
    }

    /**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.append = function (str) {
        // Converts the string to utf8 bytes if necessary
        // Then append as binary
        this.appendBinary(toUtf8(str));

        return this;
    };

    /**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.appendBinary = function (contents) {
        this._buff += contents;
        this._length += contents.length;

        var length = this._buff.length,
            i;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
        }

        this._buff = this._buff.substring(i - 64);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            i,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = hex(this._hash);

        if (raw) {
            ret = hexToBinaryString(ret);
        }

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.reset = function () {
        this._buff = '';
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.prototype.getState = function () {
        return {
            buff: this._buff,
            length: this._length,
            hash: this._hash
        };
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.setState = function (state) {
        this._buff = state.buff;
        this._length = state.length;
        this._hash = state.hash;

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other additional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.prototype.destroy = function () {
        delete this._hash;
        delete this._buff;
        delete this._length;
    };

    /**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */
    SparkMD5.prototype._finish = function (tail, length) {
        var i = length,
            tmp,
            lo,
            hi;

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(this._hash, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._hash, tail);
    };

    /**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.hash = function (str, raw) {
        // Converts the string to utf8 bytes if necessary
        // Then compute it using the binary function
        return SparkMD5.hashBinary(toUtf8(str), raw);
    };

    /**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} raw     True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.hashBinary = function (content, raw) {
        var hash = md51(content),
            ret = hex(hash);

        return raw ? hexToBinaryString(ret) : ret;
    };

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */
    SparkMD5.ArrayBuffer = function () {
        // call reset to init the instance
        this.reset();
    };

    /**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
            length = buff.length,
            i;

        this._length += arr.byteLength;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
        }

        this._buff = (i - 64) < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            i,
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = hex(this._hash);

        if (raw) {
            ret = hexToBinaryString(ret);
        }

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.reset = function () {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.ArrayBuffer.prototype.getState = function () {
        var state = SparkMD5.prototype.getState.call(this);

        // Convert buffer to a string
        state.buff = arrayBuffer2Utf8Str(state.buff);

        return state;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.setState = function (state) {
        // Convert string to buffer
        state.buff = utf8Str2ArrayBuffer(state.buff, true);

        return SparkMD5.prototype.setState.call(this, state);
    };

    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

    /**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     raw True to get the raw string, false to get the hex one
     *
     * @return {String} The result
     */
    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
        var hash = md51_array(new Uint8Array(arr)),
            ret = hex(hash);

        return raw ? hexToBinaryString(ret) : ret;
    };

    return SparkMD5;
}));

},{}],92:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":72,"timers":92}],93:[function(require,module,exports){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase();
  return uncamelize(string).toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},{}],94:[function(require,module,exports){
exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return exports.right(exports.left(str));
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();

  return str.replace(/^\s\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();

  var whitespace_pattern = /\s/,
      i = str.length;
  while (whitespace_pattern.test(str.charAt(--i)));

  return str.slice(0, i + 1);
};

},{}],95:[function(require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],96:[function(require,module,exports){
module.exports = encode;

function encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
}
},{}],97:[function(require,module,exports){
var v1 = require('./v1');
var v4 = require('./v4');

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;

},{"./v1":100,"./v4":101}],98:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;

},{}],99:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],100:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":98,"./lib/rng":99}],101:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":98,"./lib/rng":99}],102:[function(require,module,exports){
module.exports={
  "name": "@primedata/analytics-js",
  "description": "PrimeData JS SDK",
  "version": "1.0.2",
  "private": false,
  "keywords": [
    "analytics.js",
    "primedata-js-sdk",
    "@primedata/analytics-js",
    "apache"
  ],
  "publishConfig": {
    "access": "public"
  },
  "homepage": "https://primedata.ai",
  "author": "Apache Software Foundation",
  "license": "Apache-2.0",
  "main": "dist/miner.js",
  "module": "dist/miner.js",
  "browser": "dist/miner.js",
  "exports": {
    ".": {
      "require": "./dist/miner.js",
      "import": "./dist/miner.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "yarn browserify && yarn replace && yarn minify",
    "browserify": "browserify src/index.js  -s follower -o dist/miner.js",
    "replace": "replace-in-file '//analytics.require = require' '//analytics.require = require' dist/miner.js",
    "minify": "uglifyjs -c -m --comments '/@license/' -o dist/miner.min.js -- dist/miner.js",
    "snippet:minify": "uglifyjs -c -m -o snippet.min.js --source-map snippet.min.js.map -- snippet.js",
    "clean": "rimraf *.log dist/miner.js dist/miner.min.js",
    "clean:all": "yarn clean && rimraf node_modules",
    "prepublishOnly": "yarn run build",
    "set-up": "npm install"
  },
  "dependencies": {
    "@ndhoule/defaults": "2.0.1",
    "@ndhoule/keys": "2.0.0",
    "@segment/analytics.js-core": "^4.1.11",
    "@segment/analytics.js-integration": "3.3.2",
    "@segment/utm-params": "2.0.0",
    "component-emitter": "1.2.1",
    "extend": "3.0.2",
    "inherits": "2.0.1",
    "install": "0.7.3",
    "is": "3.1.0",
    "localforage": "^1.10.0",
    "new-date": "1.0.0",
    "next-tick": "0.2.2",
    "package-json-versionify": "1.0.4",
    "segmentio-facade": "3.2.7",
    "spark-md5": "2.0.2",
    "uuid": "3.4.0",
    "webpack": "5.72.0"
  },
  "devDependencies": {
    "@segment/eslint-config": "3.1.1",
    "babel-loader": "8.2.4",
    "browserify": "17.0.0",
    "browserify-header": "0.9.4",
    "compression-webpack-plugin": "9.2.0",
    "eslint": "2.9.0",
    "eslint-plugin-mocha": "2.2.0",
    "eslint-plugin-require-path-exists": "1.1.5",
    "replace-in-file": "3.4.2",
    "rimraf": "2.6.2",
    "terser-webpack-plugin": "5.3.1",
    "uglify-js": "3.14.2",
    "webpack-bundle-analyzer": "4.5.0",
    "webpack-cli": "4.9.2",
    "yarn": "1.9.4"
  }
}
},{}],103:[function(require,module,exports){
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var integration = require("@segment/analytics.js-integration");
var extend = require('extend');
var SDKUtils = require("./modules/prime-utils");
var FingerprintJS = require("./modules/fp.umd");
var deviceStorage = require("./modules/prime-storage").deviceStorage;

var Prime = (module.exports = integration("Prime Data")
  .global("cxs")
  .assumesPageview()
  .readyOnLoad()
  .option("scope", "")
  .option("writeKey", "")
  .option("sessionTimeOut", 30 * 60 * 1000)
  .option("url", "http://localhost:8181")
  .option("timeoutInMilliseconds", 3000)
  .option("sessionCookieName", "XSessionId")
  .option("sessionId"));

const DEVICE_ID_STORAGE_KEY = "primedata_device_id"
const DEVICE_INFO_STORAGE_KEY = "primedata_device_info"

/**
 * Initialize.
 *
 * @api public
 */
Prime.prototype.initialize = async function () {

    /**
     * - Khi init context => check storage => có data primedata_device_id không?
     * + Nếu có => đi tiếp đến bước builder / Đồng thời gọi init fingerprintjs để setup luồng track event debugging
     * + Nếu không có => đợi init xong vụ fingerprint => đi tiếp flow init context
     */
    const deviceId = await this.getDeviceIdFromStorage();
    if(!deviceId) await this.setupFingerprintJS();
    else this.setupFingerprintJS();

    var self = this;
    this.analytics.on("invoke", function (msg) {
        var action = msg.action();
        var listener = "on" + msg.action();
        self.debug("%s %o", action, msg);
        if (self[listener]) self[listener](msg);
    });

    this.analytics.personalize = function (personalization, callback) {
        this.emit("invoke", {
            action: function () {
                return "personalize";
            }, personalization: personalization, callback: callback
        });
    };

    // Standard to check if cookies are enabled in this browser
    if (!navigator.cookieEnabled) {
        this.executeFallback();
        return;
    }

    // digitalData come from a standard so we can keep the logic around it which can allow complex website to load more complex data
    window.digitalData = window.digitalData || {
        scope: self.options.scope
    };

    window.digitalData.page = window.digitalData.page || {
        pageInfo: {
            pageName: document.title,
            pagePath: location.pathname + location.hash,
            destinationURL: location.href
        }
    };

    var primePage = window.digitalData.page;
    var context = await this.context();
    if (!primePage) {
        primePage = window.digitalData.page = {pageInfo: {}};
    }
    if (self.options.initialPageProperties) {
        var props = self.options.initialPageProperties;
        this.fillPageData(primePage, props);
    }
    window.digitalData.events = window.digitalData.events || [];
    window.digitalData.events.push(this.buildEvent("view", this.buildPage(primePage), this.buildSource(location.href, "page")));
    self.options.detectAdBlock && self.options.detectAdBlock.enable && SDKUtils.detectAdBlock(self.options);
    this.extendSessionID();
    setTimeout(self.loadContext.bind(self), 0);
};

Prime.prototype.setupFingerprintJS = async function () {
    /**
     * Implement step
     * - Khi init context => check storage => có data primedata_device_id không?
     * + Nếu có => đi tiếp đến bước builder / Đồng thời gọi init fingerprintjs để setup luồng track event debugging
     * + Nếu không có => đợi init xong vụ fingerprint => đi tiếp flow init context
     */

    // Initialize the agent at follower loaded.
    if(!this.fingerprintPromise) this.fingerprintPromise = FingerprintJS.load({storageKey: "fingerprint"})

    // Get the fingerprint object when you need it.
    try {
        const fp = await this.fingerprintPromise
        const fingerprint = await fp.get()
        console.info("This is the visitor identifier:", fingerprint.visitorId);
        const deviceId = await this.getDeviceIdFromStorage();
        if(!deviceId) {
          this.saveDeviceInfoToStorage(fingerprint);
          window._primedata_fingerprint = fingerprint;
          this.fingerprint = fingerprint;
          return fingerprint;
        }

        const deviceInfo = await this.getDeviceInfoFromStorage();
        if(!deviceInfo) return fingerprint;

        const deviceProperty = {
            "existed_device_id": deviceId,
            "existed_device_id_confidence_score": deviceInfo.confidence.score.toString(),
            "existed_device_id_created_at": deviceInfo.created_at.toString(),
            "existed_device_id_ip_address": "",
            "existed_device_id_lib_version": deviceInfo.version,
            "existed_device_id_user_agent": deviceInfo.userAgent.toString(),
            "new_device_id": fingerprint.visitorId,
            "new_device_id_confidence_score": fingerprint.confidence.score.toString(),
            "new_device_id_created_at": new Date().getTime().toString(),
            "new_device_id_ip_address": "",
            "new_device_id_lib_version": fingerprint.version,
            "new_device_id_user_agent": window?.navigator?.userAgent?.toString()
        }

        /**
         * - Trong lúc init fingerprint thành công => check device_id mới và storage current
         * + Nếu match => send event fb_device_id_matched
         * + Nếu không match => send event fb_device_id_not_matched
         */
        if (deviceId === fingerprint.visitorId) {
            delete deviceProperty.new_device_id;
            this.analytics.track("fp_device_id_matched", {
                "properties": deviceProperty
            });
        }

        if (deviceId !== fingerprint.visitorId) {
            this.analytics.track("fp_device_id_not_matched", {
                "properties": deviceProperty
            });
        }

        return fingerprint;
    } catch (error) {
      switch (error.message) {
        case FingerprintJS.ERROR_GENERAL_SERVER_FAILURE:
          console.error("Unknown server error. Request id:", error.requestId);
          break;
        case FingerprintJS.ERROR_CLIENT_TIMEOUT:
          console.error("Identification time limit of 10 seconds is exceeded");
          break;
        default:
          console.error("Other error", error);
      }
    }
};

/**
 * Loaded.
 *
 * @api private
 * @return {boolean}
 */
Prime.prototype.loaded = function () {
    return !!window.cxs;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */
Prime.prototype.page = function (page) {
    var primePage = {};
    this.fillPageData(primePage, page.json().properties);

    this.collectEvent(this.buildEvent("view", this.buildPage(primePage), this.buildSource(location.href, "page")));
};

Prime.prototype.fillPageData = function (primePage, props) {
    primePage.attributes = [];
    primePage.consentTypes = [];
    primePage.interests = props.interests || {};
    primePage.pageInfo = extend({}, primePage.pageInfo, props.pageInfo);
    primePage.pageInfo.pageName = primePage.pageInfo.pageName || props.title;
    primePage.pageInfo.pagePath = primePage.pageInfo.pagePath || props.path;
    primePage.pageInfo.pagePath = primePage.pageInfo.pagePath || props.path;
    primePage.pageInfo.destinationURL = primePage.pageInfo.destinationURL || props.url;
    primePage.pageInfo.referringURL = document.referrer;
    this.processReferrer();
};

Prime.prototype.processReferrer = function () {
    var referrerURL = document.referrer;
    if (referrerURL) {
        // parse referrer URL
        var referrer = document.createElement("a");
        referrer.href = referrerURL;

        // only process referrer if it's not coming from the same site as the current page
        var local = document.createElement("a");
        local.href = document.URL;
        if (referrer.host !== local.host) {
            // get search element if it exists and extract search query if available
            var search = referrer.search;
            var query = undefined;
            if (search && search != "") {
                // parse parameters
                var queryParams = [], param;
                var queryParamPairs = search.slice(1).split("&");
                for (var i = 0; i < queryParamPairs.length; i++) {
                    param = queryParamPairs[i].split("=");
                    queryParams.push(param[0]);
                    queryParams[param[0]] = param[1];
                }

                // try to extract query: q is Google-like (most search engines), p is Yahoo
                query = queryParams.q || queryParams.p;
                query = decodeURIComponent(query).replace(/\+/g, " ");
            }

            // add data to digitalData
            if (window.digitalData && window.digitalData.page && window.digitalData.page.pageInfo) {
                window.digitalData.page.pageInfo.referrerHost = referrer.host;
                window.digitalData.page.pageInfo.referrerQuery = query;
            }
        }
    }
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */
Prime.prototype.identify = function (identify) {
    var self = this;
    window.digitalData.events = [];
    this.registerEvent(this.buildEvent("identify",
      this.buildTarget(identify.userId(), "analyticsUser", identify.traits()),
      this.buildSource(location.href, "page", identify.context())));
    setTimeout(self.loadContext.bind(self), 0);
};


/**
 * Update Identify.
 *
 * @api public
 * @param {Identify} identify
 */
Prime.prototype.updateIdentify = function (identify) {
    var self = this;
    this.registerEvent(this.buildEvent("updateIdentify",
      this.buildTarget(identify.userId(), "analyticsUser", identify.traits()),
      this.buildSource(location.href, "page", identify.context())));
    setTimeout(self.loadContext.bind(self), 0);
};

/**
 * Switch Identify.
 *
 * @api public
 * @param {Identify} oldIdentify
 * @param {Identify} newIdentify
 */
Prime.prototype.switchIdentify = function (oldIdentify, newIdentify) {
    var self = this;
    this.registerEvent(this.buildEvent("switchIdentify",
      this.buildTarget(oldIdentify.userId(), "analyticsUser", oldIdentify.traits()),
      this.buildSource(location.href, "page", oldIdentify.context())));

    setTimeout(self.loadContext.bind(self), 0);
};


Prime.prototype.handleDate = function (obj) {
    if (typeof obj !== "object") return obj;

    // PDT-1875 [FE-SDK] - Handle validate date for date property => remove validate date field in object
    if(true) return obj;

    var regexDateFormat = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})Z$/;
    Object.keys(obj).forEach(function (key) {
        if (key.toLowerCase().includes("date") ||
          key.toLowerCase().includes("dob") ||
          key.toLowerCase().includes("date_of_birth")) {
            var keyValue = obj[key];
            if (typeof keyValue === "string" &&
              (keyValue === "" || !regexDateFormat.test(keyValue))) delete obj[key];
        }
    });
    return obj;
};

/**
 * ontrack.
 *
 * @api private
 * @param {Track} track
 */
Prime.prototype.track = function (track) {
    // we use the track event name to know that we are submitted a form because Analytics.js trackForm method doesn't give
    // us another way of knowing that we are processing a form.
    var arg = track.properties();

    var target = arg.target || this.buildTargetPage();
    var source = arg.source || this.buildSource(location.href, "page", window.digitalData.page);
    var props = arg.properties || arg;

    if (track.event() && track.event().indexOf("form") === 0) {
        var form = document.forms[track.properties().formName];
        var formEvent = this.buildFormEvent(form.name);
        formEvent.properties = this.extractFormData(form);
        this.collectEvent(formEvent);
    } else {
        this.collectEvent(this.buildEvent(track.event(),
          target,
          source,
          props
        ));
    }
};

/**
 * This function is used to load the current context in the page
 *
 * @param {boolean} [skipEvents=false] Should we send the events
 * @param {boolean} [invalidate=false] Should we invalidate the current context
 */
Prime.prototype.loadContext = async function (skipEvents, invalidate) {
    this.extendSessionID();
    this.contextLoaded = true;
    var context = await this.context();
    var jsonData = {
        requiredProfileProperties: ["j:nodename"],
        source: this.buildSource(location.pathname, "page", context)
    };
    var now = new Date();
    jsonData.sendAt = now.toISOString();
    if (!skipEvents) {
        jsonData.events = window.digitalData.events;
    }
    if (window.digitalData.personalizationCallback) {
        jsonData.personalizations = window.digitalData.personalizationCallback.map(function (x) {
            return x.personalization;
        });
    }

    jsonData.sessionId = this.sessionId;

    // PDT-1774 - [FE] - Implement call API context
    var searchQueryContext = SDKUtils.getSearchParamFromUrl(window.location.href) || {};
    if (searchQueryContext.pdid) {
        jsonData.profileId = searchQueryContext.pdid;
    }

    var contextUrl = this.options.url + "/context";
    if (invalidate) {
        contextUrl += "?invalidateSession=true&invalidateProfile=true";
    }

    var self = this;

    var onSuccess = function (xhr) {
        window.cxs = JSON.parse(xhr.responseText);
        // SDKUtils.trackReachedChannel(self.options);
        self.ready();


        if (window.digitalData.loadCallbacks) {
            console.info("[Tracker] Found context server load callbacks, calling now...");
            for (var i = 0; i < window.digitalData.loadCallbacks.length; i++) {
                window.digitalData.loadCallbacks[i](digitalData);
            }
        }
        if (window.digitalData.personalizationCallback) {
            console.info("[Tracker] Found context server personalization, calling now...");
            for (var i = 0; i < window.digitalData.personalizationCallback.length; i++) {
                window.digitalData.personalizationCallback[i].callback(cxs.personalizations[window.digitalData.personalizationCallback[i].personalization.id]);
            }
        }
    };

    this.ajax({
        url: contextUrl,
        type: "POST",
        async: true,
        contentType: "application/json;charset=UTF-8", // Use text/plain to avoid CORS preflight => analytics JS 2.0 using application/json
        jsonData: jsonData,
        dataType: "application/json",
        invalidate: invalidate,
        success: onSuccess,
        error: this.executeFallback
    });

};

Prime.prototype.onpersonalize = function (msg) {
    if (!this.contextLoaded) {
        window.digitalData = window.digitalData || {
            scope: this.options.scope
        };
        window.digitalData.personalizationCallback = window.digitalData.personalizationCallback || [];
        window.digitalData.personalizationCallback.push({
            personalization: msg.personalization,
            callback: msg.callback
        });
    }
    var self = this;
    setTimeout(self.loadContext.bind(self), 0);
};

/**
 * This function return the basic structure for an event, it must be adapted to your need
 *
 * @param {string} eventType The name of your event
 * @param {object} [target] The target object for your event can be build with this.buildTarget(targetId, targetType, targetProperties)
 * @param {object} [source] The source object for your event can be build with this.buildSource(sourceId, sourceType, sourceProperties)
 * @param {object} [properties] a map of properties for the event
 * @returns {{eventType: *, scope}}
 */
Prime.prototype.buildEvent = function (eventType, target, source, properties) {
    properties = this.handleDate(properties);

    var event = {
        eventType: eventType,
        scope: window.digitalData.scope,
        timeStamp: (new Date()).toISOString()
    };

    if (target) {
        target.itemId = target.itemId.toString();
        /* PDT-1004 Don't pass `id` as `target.itemId` from JS SDK's identify() call */
        if (eventType === "identify"
          // These events are obsolete, checking for these is a "just to be sure" thing.
          || eventType === "updateIdentify"
          || eventType === "switchIdentify") {
            // delete target.itemId;
            target.itemId = "_";
        }

        event.target = target;
    }

    if (source) {
        event.source = source;
    }

    if (properties) {
        event.properties = properties;
    }

    return event;
};

/**
 * This function return an event of type form
 *
 * @param {string} formName The HTML name of id of the form to use in the target of the event
 * @returns {*|{eventType: *, scope, source: {scope, itemId: string, itemType: string, properties: {}}, target: {scope, itemId: string, itemType: string, properties: {}}}}
 */
Prime.prototype.buildFormEvent = function (formName) {
    return this.buildEvent("form", this.buildTarget(formName, "form"), this.buildSourcePage());
};

/**
 * This function return the source object for a source of type page
 *
 * @returns {*|{scope, itemId: *, itemType: *}}
 */
Prime.prototype.buildTargetPage = function () {
    return this.buildTarget(window.digitalData.page.pageInfo.pagePath, "page");
};

/**
 * This function return the source object for a source of type page
 *
 * @returns {*|{scope, itemId: *, itemType: *}}
 */
Prime.prototype.buildSourcePage = function () {
    return this.buildSource(window.digitalData.page.pageInfo.pagePath, "page", window.digitalData.page);
};


/**
 * This function return the source object for a source of type page
 *
 * @returns {*|{scope, itemId: *, itemType: *}}
 */
Prime.prototype.buildPage = function (page) {
    return this.buildSource(page.pageInfo.pagePath, "page", page);
};

/**
 * This function return the basic structure for the target of your event
 *
 * @param {string} targetId The ID of the target
 * @param {string} targetType The type of the target
 * @param {object} [targetProperties] The optional properties of the target
 * @returns {{scope, itemId: *, itemType: *}}
 */
Prime.prototype.buildTarget = function (targetId, targetType, targetProperties) {
    targetProperties = this.handleDate(targetProperties);
    return this.buildObject(targetId, targetType, targetProperties);
};

/**
 * This function return the basic structure for the source of your event
 *
 * @param {string} sourceId The ID of the source
 * @param {string} sourceType The type of the source
 * @param {object} [sourceProperties] The optional properties of the source
 * @returns {{scope, itemId: *, itemType: *}}
 */
Prime.prototype.buildSource = function (sourceId, sourceType, sourceProperties) {
    return this.buildObject(sourceId, sourceType, sourceProperties);
};


/**
 * This function will send an event to Prime Data
 * @param {object} event The event object to send, you can build it using this.buildEvent(eventType, target, source)
 * @param {function} successCallback will be executed in case of success
 * @param {function} errorCallback will be executed in case of error
 */
Prime.prototype.collectEvent = function (event, successCallback, errorCallback) {
    this.collectEvents({events: [event]}, successCallback, errorCallback);
};

/**
 * This function will send the events to Prime Data
 *
 * @param {object} events Javascript object { events: [event1, event2] }
 * @param {function} successCallback will be executed in case of success
 * @param {function} errorCallback will be executed in case of error
 */
Prime.prototype.collectEvents = function (events, successCallback, errorCallback) {
    events.sessionId = this.sessionId;

    var data = JSON.stringify(events);
    this.ajax({
        url: this.options.url + "/smile",
        type: "POST",
        async: true,
        contentType: "application/json;charset=UTF-8", // Use text/plain to avoid CORS preflight => analytics JS 2.0 using application/json
        data: data,
        dataType: "application/json",
        success: successCallback,
        error: errorCallback
    });
};

/*******************************/
/* Private Function under this */
/*******************************/
Prime.prototype.registerEvent = function (event) {
    if (window.digitalData) {
        window.digitalData.events = window.digitalData.events || [];
        window.digitalData.events.push(event);
    } else {
        window.digitalData = {};
        window.digitalData.events = window.digitalData.events || [];
        window.digitalData.events.push(event);
    }
};

Prime.prototype.registerCallback = function (onLoadCallback) {
    if (window.digitalData) {
        if (window.cxs) {
            if (onLoadCallback) {
                onLoadCallback(window.digitalData);
            }
        } else {
            if (onLoadCallback) {
                window.digitalData.loadCallbacks = window.digitalData.loadCallbacks || [];
                window.digitalData.loadCallbacks.push(onLoadCallback);
            }
        }
    } else {
        window.digitalData = {};
        if (onLoadCallback) {
            window.digitalData.loadCallbacks = [];
            window.digitalData.loadCallbacks.push(onLoadCallback);
        }
    }
};

/**
 * This is an utility function to generate a new UUID
 *
 * @returns {string}
 */
Prime.prototype.generateGuid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }

    return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
      s4() + "-" + s4() + s4() + s4();
};

Prime.prototype.buildObject = function (itemId, itemType, properties) {
    var object = {
        scope: window.digitalData.scope,
        itemId: `${itemId}`.toString(),
        itemType: itemType
    };

    if (properties) {
        object.properties = properties;
    }

    return object;
};

/**
 * This is an utility function to execute AJAX call
 *
 * @param {object} ajaxOptions
 */
Prime.prototype.ajax = function (ajaxOptions) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(ajaxOptions.type, ajaxOptions.url, ajaxOptions.async);
        xhr.withCredentials = true;
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(ajaxOptions.type, ajaxOptions.url);
    }

    if (ajaxOptions.contentType) {
        xhr.setRequestHeader("Content-Type", ajaxOptions.contentType);
    }
    if (ajaxOptions.dataType) {
        xhr.setRequestHeader("Accept", ajaxOptions.dataType);
    }
    xhr.setRequestHeader("X-Client-Id", this.options.scope);
    xhr.setRequestHeader("X-Client-Access-Token", this.options.writeKey);

    if (ajaxOptions.responseType) {
        xhr.responseType = ajaxOptions.responseType;
    }

    var requestExecuted = false;
    if (this.options.timeoutInMilliseconds !== -1) {
        setTimeout(function () {
            if (!requestExecuted) {
                console.error("[Tracker] XML request timeout, url: " + ajaxOptions.url);
                requestExecuted = true;
                if (ajaxOptions.error) {
                    ajaxOptions.error(xhr);
                }
            }
        }, this.options.timeoutInMilliseconds);
    }

    xhr.onreadystatechange = function () {
        if (!requestExecuted) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 204 || xhr.status === 304) {
                    if (xhr.responseText != null) {
                        requestExecuted = true;
                        if (ajaxOptions.success) {
                            ajaxOptions.success(xhr);
                        }
                    }
                } else {
                    requestExecuted = true;
                    if (ajaxOptions.error) {
                        ajaxOptions.error(xhr);
                    }
                    console.error("[Tracker] XML request error: " + xhr.statusText + " (" + xhr.status + ")");
                }
            }
        }
    };

    if (ajaxOptions.jsonData) {
        xhr.send(JSON.stringify(ajaxOptions.jsonData));
    } else if (ajaxOptions.data) {
        xhr.send(ajaxOptions.data);
    } else {
        xhr.send();
    }
};

Prime.prototype.executeFallback = function () {
    console.warn("[Tracker] execute fallback");
    window.cxs = {};
    for (var index in window.digitalData.loadCallbacks) {
        window.digitalData.loadCallbacks[index]();
    }
    if (window.digitalData.personalizationCallback) {
        for (var i = 0; i < window.digitalData.personalizationCallback.length; i++) {
            window.digitalData.personalizationCallback[i].callback([window.digitalData.personalizationCallback[i].personalization.strategyOptions.fallback]);
        }
    }
};

Prime.prototype.getDeviceIdFromStorage = async function () {
    return await deviceStorage.getItem(DEVICE_ID_STORAGE_KEY);
};


Prime.prototype.getDeviceInfoFromStorage = async function () {
    return await deviceStorage.getItem(DEVICE_INFO_STORAGE_KEY);
};

Prime.prototype.saveDeviceInfoToStorage = function (fingerData) {
    if (!fingerData) return;
    fingerData.created_at = new Date().getTime();
    fingerData.userAgent = window?.navigator?.userAgent;

    deviceStorage.setItem(DEVICE_ID_STORAGE_KEY, fingerData.visitorId);
    deviceStorage.setItem(DEVICE_INFO_STORAGE_KEY, fingerData);
};

Prime.prototype.extendSessionID = function () {
    if (!this.options.sessionId) {
        var cookie = require("component-cookie");

        this.sessionId = cookie(this.options.sessionCookieName);
        // so we should not need to implement our own
        if (!this.sessionId || this.sessionId === "") {
            this.sessionId = this.generateGuid();
        }
    } else {
        this.sessionId = this.options.sessionId;
    }
    cookie(this.options.sessionCookieName, this.sessionId, {maxage: this.options.sessionTimeOut, path: "/"});
};

Prime.prototype.context = async function () {
    var utm = require("@segment/utm-params");
    var width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    var height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;
    var utm_params = utm(location.search);
    var data = {};
    try {
        Object.keys(utm_params).forEach(function (key) {
            data["utm_" + key] = utm_params[key];
        });
    } catch (e) {
        console.log("Can't not get UTM");
    }

    var connectionType = "";
    try {
        connectionType = navigator?.connection?.type || navigator?.connection?.effectiveType;
    } catch (e) {
        connectionType = "unknown-" + navigator.platform;
    }

    data.screen_width = width;
    data.screen_height = height;
    data.connection_type = connectionType;

    // Currently, only using version, visitorId and confidence field from fingerprint object
    let deviceInfo = await this.getDeviceInfoFromStorage();
    if(!deviceInfo) deviceInfo = this.fingerprint
    if (deviceInfo) {
        data.device_id = await this.getDeviceIdFromStorage() || deviceInfo.visitorId;
        data.device_id_meta = {
            version: deviceInfo.version,
            confidence: {
                score: deviceInfo.confidence?.score
            }
        };
    }


    return data;
};

Prime.prototype.extractFormData = function (form) {
    var params = {};
    for (var i = 0; i < form.elements.length; i++) {
        var e = form.elements[i];
        if (typeof (e.name) != "undefined") {
            switch (e.nodeName) {
                case "TEXTAREA":
                case "INPUT":
                    switch (e.type) {
                        case "checkbox":
                            var checkboxes = document.querySelectorAll("input[name=\"" + e.name + "\"]");
                            if (checkboxes.length > 1) {
                                if (!params[e.name]) {
                                    params[e.name] = [];
                                }
                                if (e.checked) {
                                    params[e.name].push(e.value);
                                }

                            }
                            break;
                        case "radio":
                            if (e.checked) {
                                params[e.name] = e.value;
                            }
                            break;
                        default:
                            if (!e.value || e.value === "") {
                                // ignore element if no value is provided
                                break;
                            }
                            params[e.name] = e.value;
                    }
                    break;
                case "SELECT":
                    if (e.options && e.options[e.selectedIndex]) {
                        if (e.multiple) {
                            params[e.name] = [];
                            for (var j = 0; j < e.options.length; j++) {
                                if (e.options[j].selected) {
                                    params[e.name].push(e.options[j].value);
                                }
                            }
                        } else {
                            params[e.name] = e.options[e.selectedIndex].value;
                        }
                    }
                    break;
                default:
                    console.warn("[Tracker] " + e.nodeName + " form element type not implemented and will not be tracked.");
            }
        }
    }
    return params;
};
},{"./modules/fp.umd":107,"./modules/prime-storage":111,"./modules/prime-utils":112,"@segment/analytics.js-integration":30,"@segment/utm-params":47,"component-cookie":51,"extend":60}],104:[function(require,module,exports){
(function (global){(function (){
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Analytics.js
 *
 * (C) 2017 PrimeData.ai Inc.
 */

// var analytics = require('@segment/analytics.js-core');
var analytics = require("./modules/analytics");
var Integrations = require("./integrations");

/**
 * Expose the `analytics` singleton.
 */

module.exports = exports = analytics;

/**
 * Expose require.
 */

analytics.require = require;

/**
 * Expose `VERSION`.
 */

exports.VERSION = require("../package.json").version;

/**
 * Add integrations.
 */

for (const integration in Integrations) {
  analytics.use(Integrations[integration]);
}

var analyticsq = global.follower || [];
var args;
var method;

for (let queueEle of analyticsq) {
  args = queueEle;
  method = args.length && args[0];
  if (typeof analytics[method] === "function") {
    args.shift();
    analytics[method].apply(analytics, args);
  }
}
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../package.json":102,"./integrations":105,"./modules/analytics":106}],105:[function(require,module,exports){
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

module.exports = {
    'prime-data': require('./analytics.js-integration-prime-data')
};
},{"./analytics.js-integration-prime-data":103}],106:[function(require,module,exports){
/**
 * Analytics.js
 *
 * (C) 2013-2016 PrimeData.ai.
 */

// var Analytics = require("./prime-analytics");
var Analytics = require('@segment/analytics.js-core/build/analytics');

// Require Dependencies of PrimeData SDK
var SDKUtils = require("./prime-utils");
var WebOnsitePrimeSDK = require("./prime-onsite");
var WebPushPrimeSDK = require("./prime-web-push");
var OneSignalPrimeSDK = require("./prime-one-signal");
var RecommendationPrimeSDK = require("./prime-recommendation");

// Require Dependencies of Segment.io
var extend = require("extend");
var metrics = require("@segment/analytics.js-core/build/metrics");
var each = require("@segment/analytics.js-core/build/utils/each");
var group = require("@segment/analytics.js-core/build/group");
var keys = require("@ndhoule/keys");
var user = require("@segment/analytics.js-core/build/user");
var is = require("is");
var defaults = require("@ndhoule/defaults");
var Identify = require("segmentio-facade").Identify;
var Track = require("segmentio-facade").Track;

// Update function need overwrite Analytics of segment.io below:
/**
 * Initialize with the given integration `settings` and `options`.
 * Aliased to `init` for convenience.
 */
Analytics.prototype.init = Analytics.prototype.initialize = function (settings, options) {
  settings = settings || {};
  options = options || {};
  this._options(options);
  this._readied = false;
  // clean unknown integrations from settings
  var self = this;
  each(function (_opts, name) {
    var Integration = self.Integrations[name];
    if (!Integration)
      delete settings[name];
  }, settings);
  // add integrations
  each(function (opts, name) {
    // Don't load disabled integrations
    if (options.integrations) {
      if (options.integrations[name] === false ||
        (options.integrations.All === false && !options.integrations[name])) {
        return;
      }
    }
    var Integration = self.Integrations[name];
    var clonedOpts = {};
    extend(true, clonedOpts, opts); // deep clone opts
    var integration = new Integration(clonedOpts);
    self.log("initialize %o - %o", name, opts);
    self.add(integration);
  }, settings);
  var integrations = this._integrations;
  // load user now that options are set
  user.load();
  group.load();
  // make ready callback
  var readyCallCount = 0;
  var integrationCount = keys(integrations).length;
  var ready = function () {
    readyCallCount++;
    if (readyCallCount >= integrationCount) {
      self._readied = true;
      self.emit("ready");
    }
  };
  // init if no integrations
  if (integrationCount <= 0) {
    ready();
  }
  // initialize integrations, passing ready
  // create a list of any integrations that did not initialize - this will be passed with all events for replay support:
  this.failedInitializations = [];
  var initialPageSkipped = false;
  each(function (integration) {
    if (options.initialPageview &&
      integration.options.initialPageview === false) {
      // We've assumed one initial pageview, so make sure we don't count the first page call.
      var page = integration.page;
      integration.page = function () {
        if (initialPageSkipped) {
          return page.apply(this, arguments);
        }
        initialPageSkipped = true;
        return;
      };
    }
    integration.analytics = self;
    integration.once("ready", ready);
    try {
      metrics.increment("analytics_js.integration.invoke", {
        method: "initialize",
        integration_name: integration.name
      });
      integration.initialize();
    } catch (e) {
      var integrationName = integration.name;
      metrics.increment("analytics_js.integration.invoke.error", {
        method: "initialize",
        integration_name: integration.name
      });
      self.failedInitializations.push(integrationName);
      self.log("Error initializing %s integration: %o", integrationName, e);
      // Mark integration as ready to prevent blocking of anyone listening to analytics.ready()
      integration.ready();
    }
  }, integrations);
  // backwards compat with angular plugin and used for init logic checks
  this.initialized = true;
  this.emit("initialize", settings, options);

  // setup sdk work for recommendation spotlight. Demo from https://prime-tools-ghp.primedatacdp.com/testing/embed-sdk
  var originSettings = Object.values(settings)?.[0] || {}
  if(originSettings.recommendation && originSettings.recommendation.enabled) RecommendationPrimeSDK.initWebComponent(originSettings);

  SDKUtils.interceptorNetworkRequests({onSend: function (xhr, args){return SDKUtils.catchupProfile(xhr, args)} });
  return this;
};

/**
 * Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.identify = function (id, traits, options, fn) {
  // refs: PDT-1020 Treat `id` argument as optional in identify() call ===> start
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options))
    (fn = options), (options = null);
  if (is.fn(traits))
    (fn = traits), (options = null), (traits = null);
  if (is.object(id))
    (options = traits), (traits = id), (id = user.id());
  if(!id) id = ""
  /* eslint-enable no-unused-expressions, no-sequences */
  // refs: PDT-1020 Treat `id` argument as optional in identify() call ===> end

  // clone traits before we manipulate so we don't do anything uncouth, and take
  // from `user` so that we carryover anonymous traits
  user.identify(id, traits);
  var msg = this.normalize({
    options: options,
    traits: user.traits(),
    userId: user.id()
  });
  // Add the initialize integrations so the server-side ones can be disabled too
  if (this.options.integrations) {
    defaults(msg.integrations, this.options.integrations);
  }
  this._invoke("identify", new Identify(msg));
  // emit
  this.emit("identify", id, traits, options);
  this._callback(fn);
  SDKUtils.interceptorNetworkRequests({onSend: function (xhr, args) {return SDKUtils.catchupProfile(xhr, args)}});
  return this;
};

/**
 * Update Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.updateIdentify = function (id, traits, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options))
    (fn = options), (options = null);
  if (is.fn(traits))
    (fn = traits), (options = null), (traits = null);
  if (is.object(id))
    (options = traits), (traits = id), (id = user.id());
  /* eslint-enable no-unused-expressions, no-sequences */
  // clone traits before we manipulate so we don't do anything uncouth, and take
  // from `user` so that we carryover anonymous traits
  user.identify(id, traits);
  var msg = this.normalize({
    options: options,
    traits: user.traits(),
    userId: user.id()
  });
  // Add the initialize integrations so the server-side ones can be disabled too
  if (this.options.integrations) {
    defaults(msg.integrations, this.options.integrations);
  }
  this._invoke("updateIdentify", new Identify(msg));
  // emit
  this.emit("identify", id, traits, options);
  this._callback(fn);
  return this;
};

/**
 * Switch Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [oldTraits=null] User traits.
 * @param {Object} [newTraits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.switchIdentify = function (id, oldTraits, newTraits, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options))
    (fn = options), (options = null);
  if (is.fn(oldTraits))
    (fn = oldTraits), (options = null), (oldTraits = null);
  if (is.object(id))
    (options = oldTraits), (oldTraits = id), (id = user.id());
  /* eslint-enable no-unused-expressions, no-sequences */
  // clone traits before we manipulate so we don't do anything uncouth, and take
  // from `user` so that we carryover anonymous traits
  user.updateIdentify(id, newTraits);
  var msg = this.normalize({
    options: options,
    traits: user.traits(),
    userId: user.id()
  });
  // Add the initialize integrations so the server-side ones can be disabled too
  if (this.options.integrations) {
    defaults(msg.integrations, this.options.integrations);
  }
  this._invoke("switchIdentify", new Identify(msg), new Identify(msg));
  // emit
  this.emit("identify", id, oldTraits, options);
  this._callback(fn);
  return this;
};

/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {string} event
 * @param {Object} [properties=null]
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.track = function (event, properties, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options))
    (fn = options), (options = null);
  if (is.fn(properties))
    (fn = properties), (options = null), (properties = null);
  /* eslint-enable no-unused-expressions, no-sequences */
  // figure out if the event is archived.
  var plan = this.options.plan || {};
  var events = plan.track || {};
  var planIntegrationOptions = {};
  // normalize
  var msg = this.normalize({
    properties: properties,
    options: options,
    event: event
  });
  // plan.
  plan = events[event];
  if (plan) {
    this.log("plan %o - %o", event, plan);
    if (plan.enabled === false) {
      // Disabled events should always be sent to Segment.
      planIntegrationOptions = {All: false, "Segment.io": true};
    } else {
      planIntegrationOptions = plan.integrations || {};
    }
  } else {
    var defaultPlan = events.__default || {enabled: true};
    if (!defaultPlan.enabled) {
      // Disabled events should always be sent to Segment.
      planIntegrationOptions = {All: false, "Segment.io": true};
    }
  }
  // Add the initialize integrations so the server-side ones can be disabled too
  defaults(msg.integrations, this._mergeInitializeAndPlanIntegrations(planIntegrationOptions));
  this._invoke("track", new Track(msg));
  this.emit("track", event, properties, options);
  this._callback(fn);
  return this;
};

/**
 * Utils of PrimeData DataSource JS SDK
 * @api private
 */
Analytics.prototype.utils = SDKUtils;

/**
 * Init web popup sdk to show popup onsite
 * @param {Object} configs - configuration your web popup.
 *
 */
Analytics.prototype.initWebPopup = function(configs){
  return WebOnsitePrimeSDK(configs, analytics);
};

/**
 * Init web push sdk to show push notification on browser
 * @param {Object} options - configuration your web popup.
 */
Analytics.prototype.initWebPush = function(configs){
  return WebPushPrimeSDK(configs, analytics);
};

/**
 * Init one signal to using some service web push, ...
 * @param {Object} options - configuration your web popup.
 */
Analytics.prototype.initOneSignal = function(configs){
  return OneSignalPrimeSDK(configs, analytics);
};


// Create a new `analytics` singleton.
var analytics = new Analytics();

// Expose `require`.
analytics.require = require;

// Expose package version.
analytics.VERSION = require("../../package.json").version;


module.exports = analytics;
},{"../../package.json":102,"./prime-one-signal":108,"./prime-onsite":109,"./prime-recommendation":110,"./prime-utils":112,"./prime-web-push":113,"@ndhoule/defaults":2,"@ndhoule/keys":9,"@segment/analytics.js-core/build/analytics":13,"@segment/analytics.js-core/build/group":16,"@segment/analytics.js-core/build/metrics":18,"@segment/analytics.js-core/build/user":23,"@segment/analytics.js-core/build/utils/each":25,"extend":60,"is":63,"segmentio-facade":80}],107:[function(require,module,exports){
/**
 * FingerprintJS v3.3.3 - Copyright (c) FingerprintJS, Inc, 2022 (https://fingerprintjs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 *
 * This software contains code from open-source projects:
 * MurmurHash3 by Karan Lyons (https://github.com/karanlyons/murmurHash3.js)
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FingerprintJS = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var version = "3.3.3";

    function wait(durationMs, resolveWith) {
        return new Promise(function (resolve) { return setTimeout(resolve, durationMs, resolveWith); });
    }
    function requestIdleCallbackIfAvailable(fallbackTimeout, deadlineTimeout) {
        if (deadlineTimeout === void 0) { deadlineTimeout = Infinity; }
        var requestIdleCallback = window.requestIdleCallback;
        if (requestIdleCallback) {
            // The function `requestIdleCallback` loses the binding to `window` here.
            // `globalThis` isn't always equal `window` (see https://github.com/fingerprintjs/fingerprintjs/issues/683).
            // Therefore, an error can occur. `call(window,` prevents the error.
            return new Promise(function (resolve) { return requestIdleCallback.call(window, function () { return resolve(); }, { timeout: deadlineTimeout }); });
        }
        else {
            return wait(Math.min(fallbackTimeout, deadlineTimeout));
        }
    }
    function isPromise(value) {
        return value && typeof value.then === 'function';
    }
    /**
     * Calls a maybe asynchronous function without creating microtasks when the function is synchronous.
     * Catches errors in both cases.
     *
     * If just you run a code like this:
     * ```
     * console.time('Action duration')
     * await action()
     * console.timeEnd('Action duration')
     * ```
     * The synchronous function time can be measured incorrectly because another microtask may run before the `await`
     * returns the control back to the code.
     */
    function awaitIfAsync(action, callback) {
        try {
            var returnedValue = action();
            if (isPromise(returnedValue)) {
                returnedValue.then(function (result) { return callback(true, result); }, function (error) { return callback(false, error); });
            }
            else {
                callback(true, returnedValue);
            }
        }
        catch (error) {
            callback(false, error);
        }
    }
    /**
     * If you run many synchronous tasks without using this function, the JS main loop will be busy and asynchronous tasks
     * (e.g. completing a network request, rendering the page) won't be able to happen.
     * This function allows running many synchronous tasks such way that asynchronous tasks can run too in background.
     */
    function forEachWithBreaks(items, callback, loopReleaseInterval) {
        if (loopReleaseInterval === void 0) { loopReleaseInterval = 16; }
        return __awaiter(this, void 0, void 0, function () {
            var lastLoopReleaseTime, i, now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastLoopReleaseTime = Date.now();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < items.length)) return [3 /*break*/, 4];
                        callback(items[i], i);
                        now = Date.now();
                        if (!(now >= lastLoopReleaseTime + loopReleaseInterval)) return [3 /*break*/, 3];
                        lastLoopReleaseTime = now;
                        // Allows asynchronous actions and microtasks to happen
                        return [4 /*yield*/, wait(0)];
                    case 2:
                        // Allows asynchronous actions and microtasks to happen
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }

    /*
     * Taken from https://github.com/karanlyons/murmurHash3.js/blob/a33d0723127e2e5415056c455f8aed2451ace208/murmurHash3.js
     */
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // added together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Add(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] + n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] + n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] + n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] + n[0];
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    }
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // multiplied together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Multiply(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] * n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] * n[3];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[2] += m[3] * n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] * n[3];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[2] * n[2];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[3] * n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    }
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) rotated left by that number of positions.
    //
    function x64Rotl(m, n) {
        n %= 64;
        if (n === 32) {
            return [m[1], m[0]];
        }
        else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
        }
        else {
            n -= 32;
            return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
        }
    }
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) shifted left by that number of positions.
    //
    function x64LeftShift(m, n) {
        n %= 64;
        if (n === 0) {
            return m;
        }
        else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
        }
        else {
            return [m[1] << (n - 32), 0];
        }
    }
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // xored together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Xor(m, n) {
        return [m[0] ^ n[0], m[1] ^ n[1]];
    }
    //
    // Given a block, returns murmurHash3's final x64 mix of that block.
    // (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
    // only place where we need to right shift 64bit ints.)
    //
    function x64Fmix(h) {
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xff51afd7, 0xed558ccd]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        return h;
    }
    //
    // Given a string and an optional seed as an int, returns a 128 bit
    // hash using the x64 flavor of MurmurHash3, as an unsigned hex.
    //
    function x64hash128(key, seed) {
        key = key || '';
        seed = seed || 0;
        var remainder = key.length % 16;
        var bytes = key.length - remainder;
        var h1 = [0, seed];
        var h2 = [0, seed];
        var k1 = [0, 0];
        var k2 = [0, 0];
        var c1 = [0x87c37b91, 0x114253d5];
        var c2 = [0x4cf5ad43, 0x2745937f];
        var i;
        for (i = 0; i < bytes; i = i + 16) {
            k1 = [
                (key.charCodeAt(i + 4) & 0xff) |
                    ((key.charCodeAt(i + 5) & 0xff) << 8) |
                    ((key.charCodeAt(i + 6) & 0xff) << 16) |
                    ((key.charCodeAt(i + 7) & 0xff) << 24),
                (key.charCodeAt(i) & 0xff) |
                    ((key.charCodeAt(i + 1) & 0xff) << 8) |
                    ((key.charCodeAt(i + 2) & 0xff) << 16) |
                    ((key.charCodeAt(i + 3) & 0xff) << 24),
            ];
            k2 = [
                (key.charCodeAt(i + 12) & 0xff) |
                    ((key.charCodeAt(i + 13) & 0xff) << 8) |
                    ((key.charCodeAt(i + 14) & 0xff) << 16) |
                    ((key.charCodeAt(i + 15) & 0xff) << 24),
                (key.charCodeAt(i + 8) & 0xff) |
                    ((key.charCodeAt(i + 9) & 0xff) << 8) |
                    ((key.charCodeAt(i + 10) & 0xff) << 16) |
                    ((key.charCodeAt(i + 11) & 0xff) << 24),
            ];
            k1 = x64Multiply(k1, c1);
            k1 = x64Rotl(k1, 31);
            k1 = x64Multiply(k1, c2);
            h1 = x64Xor(h1, k1);
            h1 = x64Rotl(h1, 27);
            h1 = x64Add(h1, h2);
            h1 = x64Add(x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
            k2 = x64Multiply(k2, c2);
            k2 = x64Rotl(k2, 33);
            k2 = x64Multiply(k2, c1);
            h2 = x64Xor(h2, k2);
            h2 = x64Rotl(h2, 31);
            h2 = x64Add(h2, h1);
            h2 = x64Add(x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
        }
        k1 = [0, 0];
        k2 = [0, 0];
        switch (remainder) {
            case 15:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 14)], 48));
            // fallthrough
            case 14:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 13)], 40));
            // fallthrough
            case 13:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 12)], 32));
            // fallthrough
            case 12:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 11)], 24));
            // fallthrough
            case 11:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 10)], 16));
            // fallthrough
            case 10:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 9)], 8));
            // fallthrough
            case 9:
                k2 = x64Xor(k2, [0, key.charCodeAt(i + 8)]);
                k2 = x64Multiply(k2, c2);
                k2 = x64Rotl(k2, 33);
                k2 = x64Multiply(k2, c1);
                h2 = x64Xor(h2, k2);
            // fallthrough
            case 8:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 7)], 56));
            // fallthrough
            case 7:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 6)], 48));
            // fallthrough
            case 6:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 5)], 40));
            // fallthrough
            case 5:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 4)], 32));
            // fallthrough
            case 4:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 3)], 24));
            // fallthrough
            case 3:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 2)], 16));
            // fallthrough
            case 2:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 1)], 8));
            // fallthrough
            case 1:
                k1 = x64Xor(k1, [0, key.charCodeAt(i)]);
                k1 = x64Multiply(k1, c1);
                k1 = x64Rotl(k1, 31);
                k1 = x64Multiply(k1, c2);
                h1 = x64Xor(h1, k1);
            // fallthrough
        }
        h1 = x64Xor(h1, [0, key.length]);
        h2 = x64Xor(h2, [0, key.length]);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        h1 = x64Fmix(h1);
        h2 = x64Fmix(h2);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        return (('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8));
    }

    /**
     * Converts an error object to a plain object that can be used with `JSON.stringify`.
     * If you just run `JSON.stringify(error)`, you'll get `'{}'`.
     */
    function errorToObject(error) {
        var _a;
        return __assign({ name: error.name, message: error.message, stack: (_a = error.stack) === null || _a === void 0 ? void 0 : _a.split('\n') }, error);
    }

    /*
     * This file contains functions to work with pure data only (no browser features, DOM, side effects, etc).
     */
    /**
     * Does the same as Array.prototype.includes but has better typing
     */
    function includes(haystack, needle) {
        for (var i = 0, l = haystack.length; i < l; ++i) {
            if (haystack[i] === needle) {
                return true;
            }
        }
        return false;
    }
    /**
     * Like `!includes()` but with proper typing
     */
    function excludes(haystack, needle) {
        return !includes(haystack, needle);
    }
    /**
     * Be careful, NaN can return
     */
    function toInt(value) {
        return parseInt(value);
    }
    /**
     * Be careful, NaN can return
     */
    function toFloat(value) {
        return parseFloat(value);
    }
    function replaceNaN(value, replacement) {
        return typeof value === 'number' && isNaN(value) ? replacement : value;
    }
    function countTruthy(values) {
        return values.reduce(function (sum, value) { return sum + (value ? 1 : 0); }, 0);
    }
    function round(value, base) {
        if (base === void 0) { base = 1; }
        if (Math.abs(base) >= 1) {
            return Math.round(value / base) * base;
        }
        else {
            // Sometimes when a number is multiplied by a small number, precision is lost,
            // for example 1234 * 0.0001 === 0.12340000000000001, and it's more precise divide: 1234 / (1 / 0.0001) === 0.1234.
            var counterBase = 1 / base;
            return Math.round(value * counterBase) / counterBase;
        }
    }
    /**
     * Parses a CSS selector into tag name with HTML attributes.
     * Only single element selector are supported (without operators like space, +, >, etc).
     *
     * Multiple values can be returned for each attribute. You decide how to handle them.
     */
    function parseSimpleCssSelector(selector) {
        var _a, _b;
        var errorMessage = "Unexpected syntax '" + selector + "'";
        var tagMatch = /^\s*([a-z-]*)(.*)$/i.exec(selector);
        var tag = tagMatch[1] || undefined;
        var attributes = {};
        var partsRegex = /([.:#][\w-]+|\[.+?\])/gi;
        var addAttribute = function (name, value) {
            attributes[name] = attributes[name] || [];
            attributes[name].push(value);
        };
        for (;;) {
            var match = partsRegex.exec(tagMatch[2]);
            if (!match) {
                break;
            }
            var part = match[0];
            switch (part[0]) {
                case '.':
                    addAttribute('class', part.slice(1));
                    break;
                case '#':
                    addAttribute('id', part.slice(1));
                    break;
                case '[': {
                    var attributeMatch = /^\[([\w-]+)([~|^$*]?=("(.*?)"|([\w-]+)))?(\s+[is])?\]$/.exec(part);
                    if (attributeMatch) {
                        addAttribute(attributeMatch[1], (_b = (_a = attributeMatch[4]) !== null && _a !== void 0 ? _a : attributeMatch[5]) !== null && _b !== void 0 ? _b : '');
                    }
                    else {
                        throw new Error(errorMessage);
                    }
                    break;
                }
                default:
                    throw new Error(errorMessage);
            }
        }
        return [tag, attributes];
    }

    function ensureErrorWithMessage(error) {
        return error && typeof error === 'object' && 'message' in error ? error : { message: error };
    }
    /**
     * Loads the given entropy source. Returns a function that gets an entropy component from the source.
     *
     * The result is returned synchronously to prevent `loadSources` from
     * waiting for one source to load before getting the components from the other sources.
     */
    function loadSource(source, sourceOptions) {
        var isFinalResultLoaded = function (loadResult) {
            return typeof loadResult !== 'function';
        };
        var sourceLoadPromise = new Promise(function (resolveLoad) {
            var loadStartTime = Date.now();
            // `awaitIfAsync` is used instead of just `await` in order to measure the duration of synchronous sources
            // correctly (other microtasks won't affect the duration).
            awaitIfAsync(source.bind(null, sourceOptions), function () {
                var loadArgs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    loadArgs[_i] = arguments[_i];
                }
                var loadDuration = Date.now() - loadStartTime;
                // Source loading failed
                if (!loadArgs[0]) {
                    return resolveLoad(function () { return ({ error: ensureErrorWithMessage(loadArgs[1]), duration: loadDuration }); });
                }
                var loadResult = loadArgs[1];
                // Source loaded with the final result
                if (isFinalResultLoaded(loadResult)) {
                    return resolveLoad(function () { return ({ value: loadResult, duration: loadDuration }); });
                }
                // Source loaded with "get" stage
                resolveLoad(function () {
                    return new Promise(function (resolveGet) {
                        var getStartTime = Date.now();
                        awaitIfAsync(loadResult, function () {
                            var getArgs = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                getArgs[_i] = arguments[_i];
                            }
                            var duration = loadDuration + Date.now() - getStartTime;
                            // Source getting failed
                            if (!getArgs[0]) {
                                return resolveGet({ error: ensureErrorWithMessage(getArgs[1]), duration: duration });
                            }
                            // Source getting succeeded
                            resolveGet({ value: getArgs[1], duration: duration });
                        });
                    });
                });
            });
        });
        return function getComponent() {
            return sourceLoadPromise.then(function (finalizeSource) { return finalizeSource(); });
        };
    }
    /**
     * Loads the given entropy sources. Returns a function that collects the entropy components.
     *
     * The result is returned synchronously in order to allow start getting the components
     * before the sources are loaded completely.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function loadSources(sources, sourceOptions, excludeSources) {
        var includedSources = Object.keys(sources).filter(function (sourceKey) { return excludes(excludeSources, sourceKey); });
        var sourceGetters = Array(includedSources.length);
        // Using `forEachWithBreaks` allows asynchronous sources to complete between synchronous sources
        // and measure the duration correctly
        forEachWithBreaks(includedSources, function (sourceKey, index) {
            sourceGetters[index] = loadSource(sources[sourceKey], sourceOptions);
        });
        return function getComponents() {
            return __awaiter(this, void 0, void 0, function () {
                var components, _i, includedSources_1, sourceKey, componentPromises, _loop_1, state_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            components = {};
                            for (_i = 0, includedSources_1 = includedSources; _i < includedSources_1.length; _i++) {
                                sourceKey = includedSources_1[_i];
                                components[sourceKey] = undefined;
                            }
                            componentPromises = Array(includedSources.length);
                            _loop_1 = function () {
                                var hasAllComponentPromises;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            hasAllComponentPromises = true;
                                            return [4 /*yield*/, forEachWithBreaks(includedSources, function (sourceKey, index) {
                                                    if (!componentPromises[index]) {
                                                        // `sourceGetters` may be incomplete at this point of execution because `forEachWithBreaks` is asynchronous
                                                        if (sourceGetters[index]) {
                                                            componentPromises[index] = sourceGetters[index]().then(function (component) { return (components[sourceKey] = component); });
                                                        }
                                                        else {
                                                            hasAllComponentPromises = false;
                                                        }
                                                    }
                                                })];
                                        case 1:
                                            _a.sent();
                                            if (hasAllComponentPromises) {
                                                return [2 /*return*/, "break"];
                                            }
                                            return [4 /*yield*/, wait(1)]; // Lets the source load loop continue
                                        case 2:
                                            _a.sent(); // Lets the source load loop continue
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            _a.label = 1;
                        case 1: return [5 /*yield**/, _loop_1()];
                        case 2:
                            state_1 = _a.sent();
                            if (state_1 === "break")
                                return [3 /*break*/, 4];
                            _a.label = 3;
                        case 3: return [3 /*break*/, 1];
                        case 4: return [4 /*yield*/, Promise.all(componentPromises)];
                        case 5:
                            _a.sent();
                            return [2 /*return*/, components];
                    }
                });
            });
        };
    }

    /*
     * Functions to help with features that vary through browsers
     */
    /**
     * Checks whether the browser is based on Trident (the Internet Explorer engine) without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isTrident() {
        var w = window;
        var n = navigator;
        // The properties are checked to be in IE 10, IE 11 and not to be in other browsers in October 2020
        return (countTruthy([
            'MSCSSMatrix' in w,
            'msSetImmediate' in w,
            'msIndexedDB' in w,
            'msMaxTouchPoints' in n,
            'msPointerEnabled' in n,
        ]) >= 4);
    }
    /**
     * Checks whether the browser is based on EdgeHTML (the pre-Chromium Edge engine) without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isEdgeHTML() {
        // Based on research in October 2020
        var w = window;
        var n = navigator;
        return (countTruthy(['msWriteProfilerMark' in w, 'MSStream' in w, 'msLaunchUri' in n, 'msSaveBlob' in n]) >= 3 &&
            !isTrident());
    }
    /**
     * Checks whether the browser is based on Chromium without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isChromium() {
        // Based on research in October 2020. Tested to detect Chromium 42-86.
        var w = window;
        var n = navigator;
        return (countTruthy([
            'webkitPersistentStorage' in n,
            'webkitTemporaryStorage' in n,
            n.vendor.indexOf('Google') === 0,
            'webkitResolveLocalFileSystemURL' in w,
            'BatteryManager' in w,
            'webkitMediaStream' in w,
            'webkitSpeechGrammar' in w,
        ]) >= 5);
    }
    /**
     * Checks whether the browser is based on mobile or desktop Safari without using user-agent.
     * All iOS browsers use WebKit (the Safari engine).
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isWebKit() {
        // Based on research in September 2020
        var w = window;
        var n = navigator;
        return (countTruthy([
            'ApplePayError' in w,
            'CSSPrimitiveValue' in w,
            'Counter' in w,
            n.vendor.indexOf('Apple') === 0,
            'getStorageUpdates' in n,
            'WebKitMediaKeys' in w,
        ]) >= 4);
    }
    /**
     * Checks whether the WebKit browser is a desktop Safari.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isDesktopSafari() {
        var w = window;
        return (countTruthy([
            'safari' in w,
            !('DeviceMotionEvent' in w),
            !('ongestureend' in w),
            !('standalone' in navigator),
        ]) >= 3);
    }
    /**
     * Checks whether the browser is based on Gecko (Firefox engine) without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isGecko() {
        var _a, _b;
        var w = window;
        // Based on research in September 2020
        return (countTruthy([
            'buildID' in navigator,
            'MozAppearance' in ((_b = (_a = document.documentElement) === null || _a === void 0 ? void 0 : _a.style) !== null && _b !== void 0 ? _b : {}),
            'onmozfullscreenchange' in w,
            'mozInnerScreenX' in w,
            'CSSMozDocumentRule' in w,
            'CanvasCaptureMediaStream' in w,
        ]) >= 4);
    }
    /**
     * Checks whether the browser is based on Chromium version ≥86 without using user-agent.
     * It doesn't check that the browser is based on Chromium, there is a separate function for this.
     */
    function isChromium86OrNewer() {
        // Checked in Chrome 85 vs Chrome 86 both on desktop and Android
        var w = window;
        return (countTruthy([
            !('MediaSettingsRange' in w),
            'RTCEncodedAudioFrame' in w,
            '' + w.Intl === '[object Intl]',
            '' + w.Reflect === '[object Reflect]',
        ]) >= 3);
    }
    /**
     * Checks whether the browser is based on WebKit version ≥606 (Safari ≥12) without using user-agent.
     * It doesn't check that the browser is based on WebKit, there is a separate function for this.
     *
     * @link https://en.wikipedia.org/wiki/Safari_version_history#Release_history Safari-WebKit versions map
     */
    function isWebKit606OrNewer() {
        // Checked in Safari 9–14
        var w = window;
        return (countTruthy([
            'DOMRectList' in w,
            'RTCPeerConnectionIceEvent' in w,
            'SVGGeometryElement' in w,
            'ontransitioncancel' in w,
        ]) >= 3);
    }
    /**
     * Checks whether the device is an iPad.
     * It doesn't check that the engine is WebKit and that the WebKit isn't desktop.
     */
    function isIPad() {
        // Checked on:
        // Safari on iPadOS (both mobile and desktop modes): 8, 11, 12, 13, 14
        // Chrome on iPadOS (both mobile and desktop modes): 11, 12, 13, 14
        // Safari on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14
        // Chrome on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14
        // Before iOS 13. Safari tampers the value in "request desktop site" mode since iOS 13.
        if (navigator.platform === 'iPad') {
            return true;
        }
        var s = screen;
        var screenRatio = s.width / s.height;
        return (countTruthy([
            'MediaSource' in window,
            !!Element.prototype.webkitRequestFullscreen,
            // iPhone 4S that runs iOS 9 matches this. But it won't match the criteria above, so it won't be detected as iPad.
            screenRatio > 0.65 && screenRatio < 1.53,
        ]) >= 2);
    }
    /**
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function getFullscreenElement() {
        var d = document;
        return d.fullscreenElement || d.msFullscreenElement || d.mozFullScreenElement || d.webkitFullscreenElement || null;
    }
    function exitFullscreen() {
        var d = document;
        // `call` is required because the function throws an error without a proper "this" context
        return (d.exitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen).call(d);
    }
    /**
     * Checks whether the device runs on Android without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isAndroid() {
        var isItChromium = isChromium();
        var isItGecko = isGecko();
        // Only 2 browser engines are presented on Android.
        // Actually, there is also Android 4.1 browser, but it's not worth detecting it at the moment.
        if (!isItChromium && !isItGecko) {
            return false;
        }
        var w = window;
        // Chrome removes all words "Android" from `navigator` when desktop version is requested
        // Firefox keeps "Android" in `navigator.appVersion` when desktop version is requested
        return (countTruthy([
            'onorientationchange' in w,
            'orientation' in w,
            isItChromium && !('SharedWorker' in w),
            isItGecko && /android/i.test(navigator.appVersion),
        ]) >= 2);
    }

    /**
     * A deep description: https://fingerprintjs.com/blog/audio-fingerprinting/
     * Inspired by and based on https://github.com/cozylife/audio-fingerprint
     */
    function getAudioFingerprint() {
        var w = window;
        var AudioContext = w.OfflineAudioContext || w.webkitOfflineAudioContext;
        if (!AudioContext) {
            return -2 /* NotSupported */;
        }
        // In some browsers, audio context always stays suspended unless the context is started in response to a user action
        // (e.g. a click or a tap). It prevents audio fingerprint from being taken at an arbitrary moment of time.
        // Such browsers are old and unpopular, so the audio fingerprinting is just skipped in them.
        // See a similar case explanation at https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
        if (doesCurrentBrowserSuspendAudioContext()) {
            return -1 /* KnownToSuspend */;
        }
        var hashFromIndex = 4500;
        var hashToIndex = 5000;
        var context = new AudioContext(1, hashToIndex, 44100);
        var oscillator = context.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 10000;
        var compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;
        oscillator.connect(compressor);
        compressor.connect(context.destination);
        oscillator.start(0);
        var _a = startRenderingAudio(context), renderPromise = _a[0], finishRendering = _a[1];
        var fingerprintPromise = renderPromise.then(function (buffer) { return getHash(buffer.getChannelData(0).subarray(hashFromIndex)); }, function (error) {
            if (error.name === "timeout" /* Timeout */ || error.name === "suspended" /* Suspended */) {
                return -3 /* Timeout */;
            }
            throw error;
        });
        // Suppresses the console error message in case when the fingerprint fails before requested
        fingerprintPromise.catch(function () { return undefined; });
        return function () {
            finishRendering();
            return fingerprintPromise;
        };
    }
    /**
     * Checks if the current browser is known to always suspend audio context
     */
    function doesCurrentBrowserSuspendAudioContext() {
        return isWebKit() && !isDesktopSafari() && !isWebKit606OrNewer();
    }
    /**
     * Starts rendering the audio context.
     * When the returned function is called, the render process starts finishing.
     */
    function startRenderingAudio(context) {
        var renderTryMaxCount = 3;
        var renderRetryDelay = 500;
        var runningMaxAwaitTime = 500;
        var runningSufficientTime = 5000;
        var finalize = function () { return undefined; };
        var resultPromise = new Promise(function (resolve, reject) {
            var isFinalized = false;
            var renderTryCount = 0;
            var startedRunningAt = 0;
            context.oncomplete = function (event) { return resolve(event.renderedBuffer); };
            var startRunningTimeout = function () {
                setTimeout(function () { return reject(makeInnerError("timeout" /* Timeout */)); }, Math.min(runningMaxAwaitTime, startedRunningAt + runningSufficientTime - Date.now()));
            };
            var tryRender = function () {
                try {
                    context.startRendering();
                    switch (context.state) {
                        case 'running':
                            startedRunningAt = Date.now();
                            if (isFinalized) {
                                startRunningTimeout();
                            }
                            break;
                        // Sometimes the audio context doesn't start after calling `startRendering` (in addition to the cases where
                        // audio context doesn't start at all). A known case is starting an audio context when the browser tab is in
                        // background on iPhone. Retries usually help in this case.
                        case 'suspended':
                            // The audio context can reject starting until the tab is in foreground. Long fingerprint duration
                            // in background isn't a problem, therefore the retry attempts don't count in background. It can lead to
                            // a situation when a fingerprint takes very long time and finishes successfully. FYI, the audio context
                            // can be suspended when `document.hidden === false` and start running after a retry.
                            if (!document.hidden) {
                                renderTryCount++;
                            }
                            if (isFinalized && renderTryCount >= renderTryMaxCount) {
                                reject(makeInnerError("suspended" /* Suspended */));
                            }
                            else {
                                setTimeout(tryRender, renderRetryDelay);
                            }
                            break;
                    }
                }
                catch (error) {
                    reject(error);
                }
            };
            tryRender();
            finalize = function () {
                if (!isFinalized) {
                    isFinalized = true;
                    if (startedRunningAt > 0) {
                        startRunningTimeout();
                    }
                }
            };
        });
        return [resultPromise, finalize];
    }
    function getHash(signal) {
        var hash = 0;
        for (var i = 0; i < signal.length; ++i) {
            hash += Math.abs(signal[i]);
        }
        return hash;
    }
    function makeInnerError(name) {
        var error = new Error(name);
        error.name = name;
        return error;
    }

    /**
     * Creates and keeps an invisible iframe while the given function runs.
     * The given function is called when the iframe is loaded and has a body.
     * The iframe allows to measure DOM sizes inside itself.
     *
     * Notice: passing an initial HTML code doesn't work in IE.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function withIframe(action, initialHtml, domPollInterval) {
        var _a, _b, _c;
        if (domPollInterval === void 0) { domPollInterval = 50; }
        return __awaiter(this, void 0, void 0, function () {
            var d, iframe;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        d = document;
                        _d.label = 1;
                    case 1:
                        if (!!d.body) return [3 /*break*/, 3];
                        return [4 /*yield*/, wait(domPollInterval)];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        iframe = d.createElement('iframe');
                        _d.label = 4;
                    case 4:
                        _d.trys.push([4, , 10, 11]);
                        return [4 /*yield*/, new Promise(function (_resolve, _reject) {
                                var isComplete = false;
                                var resolve = function () {
                                    isComplete = true;
                                    _resolve();
                                };
                                var reject = function (error) {
                                    isComplete = true;
                                    _reject(error);
                                };
                                iframe.onload = resolve;
                                iframe.onerror = reject;
                                var style = iframe.style;
                                style.setProperty('display', 'block', 'important'); // Required for browsers to calculate the layout
                                style.position = 'absolute';
                                style.top = '0';
                                style.left = '0';
                                style.visibility = 'hidden';
                                if (initialHtml && 'srcdoc' in iframe) {
                                    iframe.srcdoc = initialHtml;
                                }
                                else {
                                    iframe.src = 'about:blank';
                                }
                                d.body.appendChild(iframe);
                                // WebKit in WeChat doesn't fire the iframe's `onload` for some reason.
                                // This code checks for the loading state manually.
                                // See https://github.com/fingerprintjs/fingerprintjs/issues/645
                                var checkReadyState = function () {
                                    var _a, _b;
                                    // The ready state may never become 'complete' in Firefox despite the 'load' event being fired.
                                    // So an infinite setTimeout loop can happen without this check.
                                    // See https://github.com/fingerprintjs/fingerprintjs/pull/716#issuecomment-986898796
                                    if (isComplete) {
                                        return;
                                    }
                                    // Make sure iframe.contentWindow and iframe.contentWindow.document are both loaded
                                    // The contentWindow.document can miss in JSDOM (https://github.com/jsdom/jsdom).
                                    if (((_b = (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.readyState) === 'complete') {
                                        resolve();
                                    }
                                    else {
                                        setTimeout(checkReadyState, 10);
                                    }
                                };
                                checkReadyState();
                            })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        if (!!((_b = (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.body)) return [3 /*break*/, 8];
                        return [4 /*yield*/, wait(domPollInterval)];
                    case 7:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 8: return [4 /*yield*/, action(iframe, iframe.contentWindow)];
                    case 9: return [2 /*return*/, _d.sent()];
                    case 10:
                        (_c = iframe.parentNode) === null || _c === void 0 ? void 0 : _c.removeChild(iframe);
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Creates a DOM element that matches the given selector.
     * Only single element selector are supported (without operators like space, +, >, etc).
     */
    function selectorToElement(selector) {
        var _a = parseSimpleCssSelector(selector), tag = _a[0], attributes = _a[1];
        var element = document.createElement(tag !== null && tag !== void 0 ? tag : 'div');
        for (var _i = 0, _b = Object.keys(attributes); _i < _b.length; _i++) {
            var name_1 = _b[_i];
            var value = attributes[name_1].join(' ');
            // Changing the `style` attribute can cause a CSP error, therefore we change the `style.cssText` property.
            // https://github.com/fingerprintjs/fingerprintjs/issues/733
            if (name_1 === 'style') {
                addStyleString(element.style, value);
            }
            else {
                element.setAttribute(name_1, value);
            }
        }
        return element;
    }
    /**
     * Adds CSS styles from a string in such a way that doesn't trigger a CSP warning (unsafe-inline or unsafe-eval)
     */
    function addStyleString(style, source) {
        // We don't use `style.cssText` because browsers must block it when no `unsafe-eval` CSP is presented: https://csplite.com/csp145/#w3c_note
        // Even though the browsers ignore this standard, we don't use `cssText` just in case.
        for (var _i = 0, _a = source.split(';'); _i < _a.length; _i++) {
            var property = _a[_i];
            var match = /^\s*([\w-]+)\s*:\s*(.+?)(\s*!([\w-]+))?\s*$/.exec(property);
            if (match) {
                var name_2 = match[1], value = match[2], priority = match[4];
                style.setProperty(name_2, value, priority || ''); // The last argument can't be undefined in IE11
            }
        }
    }

    // We use m or w because these two characters take up the maximum width.
    // And we use a LLi so that the same matching fonts can get separated.
    var testString = 'mmMwWLliI0O&1';
    // We test using 48px font size, we may use any size. I guess larger the better.
    var textSize = '48px';
    // A font will be compared against all the three default fonts.
    // And if for any default fonts it doesn't match, then that font is available.
    var baseFonts = ['monospace', 'sans-serif', 'serif'];
    var fontList = [
        // This is android-specific font from "Roboto" family
        'sans-serif-thin',
        'ARNO PRO',
        'Agency FB',
        'Arabic Typesetting',
        'Arial Unicode MS',
        'AvantGarde Bk BT',
        'BankGothic Md BT',
        'Batang',
        'Bitstream Vera Sans Mono',
        'Calibri',
        'Century',
        'Century Gothic',
        'Clarendon',
        'EUROSTILE',
        'Franklin Gothic',
        'Futura Bk BT',
        'Futura Md BT',
        'GOTHAM',
        'Gill Sans',
        'HELV',
        'Haettenschweiler',
        'Helvetica Neue',
        'Humanst521 BT',
        'Leelawadee',
        'Letter Gothic',
        'Levenim MT',
        'Lucida Bright',
        'Lucida Sans',
        'Menlo',
        'MS Mincho',
        'MS Outlook',
        'MS Reference Specialty',
        'MS UI Gothic',
        'MT Extra',
        'MYRIAD PRO',
        'Marlett',
        'Meiryo UI',
        'Microsoft Uighur',
        'Minion Pro',
        'Monotype Corsiva',
        'PMingLiU',
        'Pristina',
        'SCRIPTINA',
        'Segoe UI Light',
        'Serifa',
        'SimHei',
        'Small Fonts',
        'Staccato222 BT',
        'TRAJAN PRO',
        'Univers CE 55 Medium',
        'Vrinda',
        'ZWAdobeF',
    ];
    // kudos to http://www.lalit.org/lab/javascript-css-font-detect/
    function getFonts() {
        // Running the script in an iframe makes it not affect the page look and not be affected by the page CSS. See:
        // https://github.com/fingerprintjs/fingerprintjs/issues/592
        // https://github.com/fingerprintjs/fingerprintjs/issues/628
        return withIframe(function (_, _a) {
            var document = _a.document;
            var holder = document.body;
            holder.style.fontSize = textSize;
            // div to load spans for the default fonts and the fonts to detect
            var spansContainer = document.createElement('div');
            var defaultWidth = {};
            var defaultHeight = {};
            // creates a span where the fonts will be loaded
            var createSpan = function (fontFamily) {
                var span = document.createElement('span');
                var style = span.style;
                style.position = 'absolute';
                style.top = '0';
                style.left = '0';
                style.fontFamily = fontFamily;
                span.textContent = testString;
                spansContainer.appendChild(span);
                return span;
            };
            // creates a span and load the font to detect and a base font for fallback
            var createSpanWithFonts = function (fontToDetect, baseFont) {
                return createSpan("'" + fontToDetect + "'," + baseFont);
            };
            // creates spans for the base fonts and adds them to baseFontsDiv
            var initializeBaseFontsSpans = function () {
                return baseFonts.map(createSpan);
            };
            // creates spans for the fonts to detect and adds them to fontsDiv
            var initializeFontsSpans = function () {
                // Stores {fontName : [spans for that font]}
                var spans = {};
                var _loop_1 = function (font) {
                    spans[font] = baseFonts.map(function (baseFont) { return createSpanWithFonts(font, baseFont); });
                };
                for (var _i = 0, fontList_1 = fontList; _i < fontList_1.length; _i++) {
                    var font = fontList_1[_i];
                    _loop_1(font);
                }
                return spans;
            };
            // checks if a font is available
            var isFontAvailable = function (fontSpans) {
                return baseFonts.some(function (baseFont, baseFontIndex) {
                    return fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] ||
                        fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont];
                });
            };
            // create spans for base fonts
            var baseFontsSpans = initializeBaseFontsSpans();
            // create spans for fonts to detect
            var fontsSpans = initializeFontsSpans();
            // add all the spans to the DOM
            holder.appendChild(spansContainer);
            // get the default width for the three base fonts
            for (var index = 0; index < baseFonts.length; index++) {
                defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth; // width for the default font
                defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight; // height for the default font
            }
            // check available fonts
            return fontList.filter(function (font) { return isFontAvailable(fontsSpans[font]); });
        });
    }

    function getPlugins() {
        var rawPlugins = navigator.plugins;
        if (!rawPlugins) {
            return undefined;
        }
        var plugins = [];
        // Safari 10 doesn't support iterating navigator.plugins with for...of
        for (var i = 0; i < rawPlugins.length; ++i) {
            var plugin = rawPlugins[i];
            if (!plugin) {
                continue;
            }
            var mimeTypes = [];
            for (var j = 0; j < plugin.length; ++j) {
                var mimeType = plugin[j];
                mimeTypes.push({
                    type: mimeType.type,
                    suffixes: mimeType.suffixes,
                });
            }
            plugins.push({
                name: plugin.name,
                description: plugin.description,
                mimeTypes: mimeTypes,
            });
        }
        return plugins;
    }

    // https://www.browserleaks.com/canvas#how-does-it-work
    function getCanvasFingerprint() {
        var _a = makeCanvasContext(), canvas = _a[0], context = _a[1];
        if (!isSupported(canvas, context)) {
            return { winding: false, geometry: '', text: '' };
        }
        return {
            winding: doesSupportWinding(context),
            geometry: makeGeometryImage(canvas, context),
            // Text is unstable:
            // https://github.com/fingerprintjs/fingerprintjs/issues/583
            // https://github.com/fingerprintjs/fingerprintjs/issues/103
            // Therefore it's extracted into a separate image.
            text: makeTextImage(canvas, context),
        };
    }
    function makeCanvasContext() {
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return [canvas, canvas.getContext('2d')];
    }
    function isSupported(canvas, context) {
        // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
        return !!(context && canvas.toDataURL);
    }
    function doesSupportWinding(context) {
        // https://web.archive.org/web/20170825024655/http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
        context.rect(0, 0, 10, 10);
        context.rect(2, 2, 6, 6);
        return !context.isPointInPath(5, 5, 'evenodd');
    }
    function makeTextImage(canvas, context) {
        // Resizing the canvas cleans it
        canvas.width = 240;
        canvas.height = 60;
        context.textBaseline = 'alphabetic';
        context.fillStyle = '#f60';
        context.fillRect(100, 1, 62, 20);
        context.fillStyle = '#069';
        // It's important to use explicit built-in fonts in order to exclude the affect of font preferences
        // (there is a separate entropy source for them).
        context.font = '11pt "Times New Roman"';
        // The choice of emojis has a gigantic impact on rendering performance (especially in FF).
        // Some newer emojis cause it to slow down 50-200 times.
        // There must be no text to the right of the emoji, see https://github.com/fingerprintjs/fingerprintjs/issues/574
        // A bare emoji shouldn't be used because the canvas will change depending on the script encoding:
        // https://github.com/fingerprintjs/fingerprintjs/issues/66
        // Escape sequence shouldn't be used too because Terser will turn it into a bare unicode.
        var printedText = "Cwm fjordbank gly " + String.fromCharCode(55357, 56835) /* 😃 */;
        context.fillText(printedText, 2, 15);
        context.fillStyle = 'rgba(102, 204, 0, 0.2)';
        context.font = '18pt Arial';
        context.fillText(printedText, 4, 45);
        return save(canvas);
    }
    function makeGeometryImage(canvas, context) {
        // Resizing the canvas cleans it
        canvas.width = 122;
        canvas.height = 110;
        // Canvas blending
        // https://web.archive.org/web/20170826194121/http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
        // http://jsfiddle.net/NDYV8/16/
        context.globalCompositeOperation = 'multiply';
        for (var _i = 0, _a = [
            ['#f2f', 40, 40],
            ['#2ff', 80, 40],
            ['#ff2', 60, 80],
        ]; _i < _a.length; _i++) {
            var _b = _a[_i], color = _b[0], x = _b[1], y = _b[2];
            context.fillStyle = color;
            context.beginPath();
            context.arc(x, y, 40, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
        // Canvas winding
        // https://web.archive.org/web/20130913061632/http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // http://jsfiddle.net/NDYV8/19/
        context.fillStyle = '#f9c';
        context.arc(60, 60, 60, 0, Math.PI * 2, true);
        context.arc(60, 60, 20, 0, Math.PI * 2, true);
        context.fill('evenodd');
        return save(canvas);
    }
    function save(canvas) {
        // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
        return canvas.toDataURL();
    }

    /**
     * This is a crude and primitive touch screen detection. It's not possible to currently reliably detect the availability
     * of a touch screen with a JS, without actually subscribing to a touch event.
     *
     * @see http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
     * @see https://github.com/Modernizr/Modernizr/issues/548
     */
    function getTouchSupport() {
        var n = navigator;
        var maxTouchPoints = 0;
        var touchEvent;
        if (n.maxTouchPoints !== undefined) {
            maxTouchPoints = toInt(n.maxTouchPoints);
        }
        else if (n.msMaxTouchPoints !== undefined) {
            maxTouchPoints = n.msMaxTouchPoints;
        }
        try {
            document.createEvent('TouchEvent');
            touchEvent = true;
        }
        catch (_a) {
            touchEvent = false;
        }
        var touchStart = 'ontouchstart' in window;
        return {
            maxTouchPoints: maxTouchPoints,
            touchEvent: touchEvent,
            touchStart: touchStart,
        };
    }

    function getOsCpu() {
        return navigator.oscpu;
    }

    function getLanguages() {
        var n = navigator;
        var result = [];
        var language = n.language || n.userLanguage || n.browserLanguage || n.systemLanguage;
        if (language !== undefined) {
            result.push([language]);
        }
        if (Array.isArray(n.languages)) {
            // Starting from Chromium 86, there is only a single value in `navigator.language` in Incognito mode:
            // the value of `navigator.language`. Therefore the value is ignored in this browser.
            if (!(isChromium() && isChromium86OrNewer())) {
                result.push(n.languages);
            }
        }
        else if (typeof n.languages === 'string') {
            var languages = n.languages;
            if (languages) {
                result.push(languages.split(','));
            }
        }
        return result;
    }

    function getColorDepth() {
        return window.screen.colorDepth;
    }

    function getDeviceMemory() {
        // `navigator.deviceMemory` is a string containing a number in some unidentified cases
        return replaceNaN(toFloat(navigator.deviceMemory), undefined);
    }

    function getScreenResolution() {
        var s = screen;
        // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
        // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
        // Some browsers even return  screen resolution as not numbers.
        var parseDimension = function (value) { return replaceNaN(toInt(value), null); };
        var dimensions = [parseDimension(s.width), parseDimension(s.height)];
        dimensions.sort().reverse();
        return dimensions;
    }

    var screenFrameCheckInterval = 2500;
    var roundingPrecision = 10;
    // The type is readonly to protect from unwanted mutations
    var screenFrameBackup;
    var screenFrameSizeTimeoutId;
    /**
     * Starts watching the screen frame size. When a non-zero size appears, the size is saved and the watch is stopped.
     * Later, when `getScreenFrame` runs, it will return the saved non-zero size if the current size is null.
     *
     * This trick is required to mitigate the fact that the screen frame turns null in some cases.
     * See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
     */
    function watchScreenFrame() {
        if (screenFrameSizeTimeoutId !== undefined) {
            return;
        }
        var checkScreenFrame = function () {
            var frameSize = getCurrentScreenFrame();
            if (isFrameSizeNull(frameSize)) {
                screenFrameSizeTimeoutId = setTimeout(checkScreenFrame, screenFrameCheckInterval);
            }
            else {
                screenFrameBackup = frameSize;
                screenFrameSizeTimeoutId = undefined;
            }
        };
        checkScreenFrame();
    }
    function getScreenFrame() {
        var _this = this;
        watchScreenFrame();
        return function () { return __awaiter(_this, void 0, void 0, function () {
            var frameSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        frameSize = getCurrentScreenFrame();
                        if (!isFrameSizeNull(frameSize)) return [3 /*break*/, 2];
                        if (screenFrameBackup) {
                            return [2 /*return*/, __spreadArrays(screenFrameBackup)];
                        }
                        if (!getFullscreenElement()) return [3 /*break*/, 2];
                        // Some browsers set the screen frame to zero when programmatic fullscreen is on.
                        // There is a chance of getting a non-zero frame after exiting the fullscreen.
                        // See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
                        return [4 /*yield*/, exitFullscreen()];
                    case 1:
                        // Some browsers set the screen frame to zero when programmatic fullscreen is on.
                        // There is a chance of getting a non-zero frame after exiting the fullscreen.
                        // See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
                        _a.sent();
                        frameSize = getCurrentScreenFrame();
                        _a.label = 2;
                    case 2:
                        if (!isFrameSizeNull(frameSize)) {
                            screenFrameBackup = frameSize;
                        }
                        return [2 /*return*/, frameSize];
                }
            });
        }); };
    }
    /**
     * Sometimes the available screen resolution changes a bit, e.g. 1900x1440 → 1900x1439. A possible reason: macOS Dock
     * shrinks to fit more icons when there is too little space. The rounding is used to mitigate the difference.
     */
    function getRoundedScreenFrame() {
        var _this = this;
        var screenFrameGetter = getScreenFrame();
        return function () { return __awaiter(_this, void 0, void 0, function () {
            var frameSize, processSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, screenFrameGetter()];
                    case 1:
                        frameSize = _a.sent();
                        processSize = function (sideSize) { return (sideSize === null ? null : round(sideSize, roundingPrecision)); };
                        // It might look like I don't know about `for` and `map`.
                        // In fact, such code is used to avoid TypeScript issues without using `as`.
                        return [2 /*return*/, [processSize(frameSize[0]), processSize(frameSize[1]), processSize(frameSize[2]), processSize(frameSize[3])]];
                }
            });
        }); };
    }
    function getCurrentScreenFrame() {
        var s = screen;
        // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
        // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
        //
        // Some browsers (IE, Edge ≤18) don't provide `screen.availLeft` and `screen.availTop`. The property values are
        // replaced with 0 in such cases to not lose the entropy from `screen.availWidth` and `screen.availHeight`.
        return [
            replaceNaN(toFloat(s.availTop), null),
            replaceNaN(toFloat(s.width) - toFloat(s.availWidth) - replaceNaN(toFloat(s.availLeft), 0), null),
            replaceNaN(toFloat(s.height) - toFloat(s.availHeight) - replaceNaN(toFloat(s.availTop), 0), null),
            replaceNaN(toFloat(s.availLeft), null),
        ];
    }
    function isFrameSizeNull(frameSize) {
        for (var i = 0; i < 4; ++i) {
            if (frameSize[i]) {
                return false;
            }
        }
        return true;
    }

    function getHardwareConcurrency() {
        // sometimes hardware concurrency is a string
        return replaceNaN(toInt(navigator.hardwareConcurrency), undefined);
    }

    function getTimezone() {
        var _a;
        var DateTimeFormat = (_a = window.Intl) === null || _a === void 0 ? void 0 : _a.DateTimeFormat;
        if (DateTimeFormat) {
            var timezone = new DateTimeFormat().resolvedOptions().timeZone;
            if (timezone) {
                return timezone;
            }
        }
        // For browsers that don't support timezone names
        // The minus is intentional because the JS offset is opposite to the real offset
        var offset = -getTimezoneOffset();
        return "UTC" + (offset >= 0 ? '+' : '') + Math.abs(offset);
    }
    function getTimezoneOffset() {
        var currentYear = new Date().getFullYear();
        // The timezone offset may change over time due to daylight saving time (DST) shifts.
        // The non-DST timezone offset is used as the result timezone offset.
        // Since the DST season differs in the northern and the southern hemispheres,
        // both January and July timezones offsets are considered.
        return Math.max(
        // `getTimezoneOffset` returns a number as a string in some unidentified cases
        toFloat(new Date(currentYear, 0, 1).getTimezoneOffset()), toFloat(new Date(currentYear, 6, 1).getTimezoneOffset()));
    }

    function getSessionStorage() {
        try {
            return !!window.sessionStorage;
        }
        catch (error) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }

    // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    function getLocalStorage() {
        try {
            return !!window.localStorage;
        }
        catch (e) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }

    function getIndexedDB() {
        // IE and Edge don't allow accessing indexedDB in private mode, therefore IE and Edge will have different
        // visitor identifier in normal and private modes.
        if (isTrident() || isEdgeHTML()) {
            return undefined;
        }
        try {
            return !!window.indexedDB;
        }
        catch (e) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }

    function getOpenDatabase() {
        return !!window.openDatabase;
    }

    function getCpuClass() {
        return navigator.cpuClass;
    }

    function getPlatform() {
        // Android Chrome 86 and 87 and Android Firefox 80 and 84 don't mock the platform value when desktop mode is requested
        var platform = navigator.platform;
        // iOS mocks the platform value when desktop version is requested: https://github.com/fingerprintjs/fingerprintjs/issues/514
        // iPad uses desktop mode by default since iOS 13
        // The value is 'MacIntel' on M1 Macs
        // The value is 'iPhone' on iPod Touch
        if (platform === 'MacIntel') {
            if (isWebKit() && !isDesktopSafari()) {
                return isIPad() ? 'iPad' : 'iPhone';
            }
        }
        return platform;
    }

    function getVendor() {
        return navigator.vendor || '';
    }

    /**
     * Checks for browser-specific (not engine specific) global variables to tell browsers with the same engine apart.
     * Only somewhat popular browsers are considered.
     */
    function getVendorFlavors() {
        var flavors = [];
        for (var _i = 0, _a = [
            // Blink and some browsers on iOS
            'chrome',
            // Safari on macOS
            'safari',
            // Chrome on iOS (checked in 85 on 13 and 87 on 14)
            '__crWeb',
            '__gCrWeb',
            // Yandex Browser on iOS, macOS and Android (checked in 21.2 on iOS 14, macOS and Android)
            'yandex',
            // Yandex Browser on iOS (checked in 21.2 on 14)
            '__yb',
            '__ybro',
            // Firefox on iOS (checked in 32 on 14)
            '__firefox__',
            // Edge on iOS (checked in 46 on 14)
            '__edgeTrackingPreventionStatistics',
            'webkit',
            // Opera Touch on iOS (checked in 2.6 on 14)
            'oprt',
            // Samsung Internet on Android (checked in 11.1)
            'samsungAr',
            // UC Browser on Android (checked in 12.10 and 13.0)
            'ucweb',
            'UCShellJava',
            // Puffin on Android (checked in 9.0)
            'puffinDevice',
        ]; _i < _a.length; _i++) {
            var key = _a[_i];
            var value = window[key];
            if (value && typeof value === 'object') {
                flavors.push(key);
            }
        }
        return flavors.sort();
    }

    /**
     * navigator.cookieEnabled cannot detect custom or nuanced cookie blocking configurations. For example, when blocking
     * cookies via the Advanced Privacy Settings in IE9, it always returns true. And there have been issues in the past with
     * site-specific exceptions. Don't rely on it.
     *
     * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js Taken from here
     */
    function areCookiesEnabled() {
        var d = document;
        // Taken from here: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js
        // navigator.cookieEnabled cannot detect custom or nuanced cookie blocking configurations. For example, when blocking
        // cookies via the Advanced Privacy Settings in IE9, it always returns true. And there have been issues in the past
        // with site-specific exceptions. Don't rely on it.
        // try..catch because some in situations `document.cookie` is exposed but throws a
        // SecurityError if you try to access it; e.g. documents created from data URIs
        // or in sandboxed iframes (depending on flags/context)
        try {
            // Create cookie
            d.cookie = 'cookietest=1; SameSite=Strict;';
            var result = d.cookie.indexOf('cookietest=') !== -1;
            // Delete cookie
            d.cookie = 'cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT';
            return result;
        }
        catch (e) {
            return false;
        }
    }

    /**
     * Only single element selector are supported (no operators like space, +, >, etc).
     * `embed` and `position: fixed;` will be considered as blocked anyway because it always has no offsetParent.
     * Avoid `iframe` and anything with `[src=]` because they produce excess HTTP requests.
     *
     * See docs/content_blockers.md to learn how to make the list
     */
    var filters = {
        abpIndo: [
            '#Iklan-Melayang',
            '#Kolom-Iklan-728',
            '#SidebarIklan-wrapper',
            'a[title="7naga poker" i]',
            '[title="ALIENBOLA" i]',
        ],
        abpvn: [
            '#quangcaomb',
            '.iosAdsiosAds-layout',
            '.quangcao',
            '[href^="https://r88.vn/"]',
            '[href^="https://zbet.vn/"]',
        ],
        adBlockFinland: [
            '.mainostila',
            '.sponsorit',
            '.ylamainos',
            'a[href*="/clickthrgh.asp?"]',
            'a[href^="https://app.readpeak.com/ads"]',
        ],
        adBlockPersian: [
            '#navbar_notice_50',
            'a[href^="http://g1.v.fwmrm.net/ad/"]',
            '.kadr',
            'TABLE[width="140px"]',
            '#divAgahi',
        ],
        adBlockWarningRemoval: ['#adblock-honeypot', '.adblocker-root', '.wp_adblock_detect'],
        adGuardAnnoyances: ['amp-embed[type="zen"]', '.hs-sosyal', '#cookieconsentdiv', 'div[class^="app_gdpr"]', '.as-oil'],
        adGuardBase: ['#ad-after', '#ad-p3', '.BetterJsPopOverlay', '#ad_300X250', '#bannerfloat22'],
        adGuardChinese: [
            // Disabled because not reproducible. Will be replaced during the next filter update.
            // '#piao_div_0[style*="width:140px;"]',
            'a[href*=".ttz5.cn"]',
            'a[href*=".yabovip2027.com/"]',
            '.tm3all2h4b',
            '.cc5278_banner_ad',
        ],
        adGuardFrench: [
            '.zonepub',
            '[class*="_adLeaderboard"]',
            '[id^="block-xiti_oas-"]',
            'a[href^="http://ptapjmp.com/"]',
            'a[href^="https://go.alvexo.com/"]',
        ],
        adGuardGerman: [
            '.banneritemwerbung_head_1',
            '.boxstartwerbung',
            '.werbung3',
            'a[href^="http://www.eis.de/index.phtml?refid="]',
            'a[href^="https://www.tipico.com/?affiliateId="]',
        ],
        adGuardJapanese: [
            '#kauli_yad_1',
            '#ad-giftext',
            '#adsSPRBlock',
            'a[href^="http://ad2.trafficgate.net/"]',
            'a[href^="http://www.rssad.jp/"]',
        ],
        adGuardMobile: ['amp-auto-ads', '#mgid_iframe', '.amp_ad', 'amp-embed[type="24smi"]', '#mgid_iframe1'],
        adGuardRussian: [
            'a[href^="https://ya-distrib.ru/r/"]',
            'a[href^="https://ad.letmeads.com/"]',
            '.reclama',
            'div[id^="smi2adblock"]',
            'div[id^="AdFox_banner_"]',
        ],
        adGuardSocial: [
            'a[href^="//www.stumbleupon.com/submit?url="]',
            'a[href^="//telegram.me/share/url?"]',
            '.etsy-tweet',
            '#inlineShare',
            '.popup-social',
        ],
        adGuardSpanishPortuguese: [
            '#barraPublicidade',
            '#Publicidade',
            '#publiEspecial',
            '#queTooltip',
            '[href^="http://ads.glispa.com/"]',
        ],
        adGuardTrackingProtection: [
            'amp-embed[type="taboola"]',
            '#qoo-counter',
            'a[href^="http://click.hotlog.ru/"]',
            'a[href^="http://hitcounter.ru/top/stat.php"]',
            'a[href^="http://top.mail.ru/jump"]',
        ],
        adGuardTurkish: [
            '#backkapat',
            '#reklami',
            'a[href^="http://adserv.ontek.com.tr/"]',
            'a[href^="http://izlenzi.com/campaign/"]',
            'a[href^="http://www.installads.net/"]',
        ],
        bulgarian: ['td#freenet_table_ads', '#adbody', '#ea_intext_div', '.lapni-pop-over', '#xenium_hot_offers'],
        easyList: ['#AD_banner_bottom', '#Ads_google_02', '#N-ad-article-rightRail-1', '#ad-fullbanner2', '#ad-zone-2'],
        easyListChina: [
            'a[href*=".wensixuetang.com/"]',
            'A[href*="/hth107.com/"]',
            '.appguide-wrap[onclick*="bcebos.com"]',
            '.frontpageAdvM',
            '#taotaole',
        ],
        easyListCookie: ['#adtoniq-msg-bar', '#CoockiesPage', '#CookieModal_cookiemodal', '#DO_CC_PANEL', '#ShowCookie'],
        easyListCzechSlovak: ['#onlajny-stickers', '#reklamni-box', '.reklama-megaboard', '.sklik', '[id^="sklikReklama"]'],
        easyListDutch: [
            '#advertentie',
            '#vipAdmarktBannerBlock',
            '.adstekst',
            'a[href^="https://xltube.nl/click/"]',
            '#semilo-lrectangle',
        ],
        easyListGermany: [
            'a[href^="http://www.hw-area.com/?dp="]',
            'a[href^="https://ads.sunmaker.com/tracking.php?"]',
            '.werbung-skyscraper2',
            '.bannergroup_werbung',
            '.ads_rechts',
        ],
        easyListItaly: [
            '.box_adv_annunci',
            '.sb-box-pubbliredazionale',
            'a[href^="http://affiliazioniads.snai.it/"]',
            'a[href^="https://adserver.html.it/"]',
            'a[href^="https://affiliazioniads.snai.it/"]',
        ],
        easyListLithuania: [
            '.reklamos_tarpas',
            '.reklamos_nuorodos',
            'img[alt="Reklaminis skydelis"]',
            'img[alt="Dedikuoti.lt serveriai"]',
            'img[alt="Hostingas Serveriai.lt"]',
        ],
        estonian: ['A[href*="http://pay4results24.eu"]'],
        fanboyAnnoyances: [
            '#feedback-tab',
            '#taboola-below-article',
            '.feedburnerFeedBlock',
            '.widget-feedburner-counter',
            '[title="Subscribe to our blog"]',
        ],
        fanboyAntiFacebook: ['.util-bar-module-firefly-visible'],
        fanboyEnhancedTrackers: [
            '.open.pushModal',
            '#issuem-leaky-paywall-articles-zero-remaining-nag',
            '#sovrn_container',
            'div[class$="-hide"][zoompage-fontsize][style="display: block;"]',
            '.BlockNag__Card',
        ],
        fanboySocial: [
            '.td-tags-and-social-wrapper-box',
            '.twitterContainer',
            '.youtube-social',
            'a[title^="Like us on Facebook"]',
            'img[alt^="Share on Digg"]',
        ],
        frellwitSwedish: [
            'a[href*="casinopro.se"][target="_blank"]',
            'a[href*="doktor-se.onelink.me"]',
            'article.category-samarbete',
            'div.holidAds',
            'ul.adsmodern',
        ],
        greekAdBlock: [
            'A[href*="adman.otenet.gr/click?"]',
            'A[href*="http://axiabanners.exodus.gr/"]',
            'A[href*="http://interactive.forthnet.gr/click?"]',
            'DIV.agores300',
            'TABLE.advright',
        ],
        hungarian: [
            'A[href*="ad.eval.hu"]',
            'A[href*="ad.netmedia.hu"]',
            'A[href*="daserver.ultraweb.hu"]',
            '#cemp_doboz',
            '.optimonk-iframe-container',
        ],
        iDontCareAboutCookies: [
            '.alert-info[data-block-track*="CookieNotice"]',
            '.ModuleTemplateCookieIndicator',
            '.o--cookies--container',
            '.cookie-msg-info-container',
            '#cookies-policy-sticky',
        ],
        icelandicAbp: ['A[href^="/framework/resources/forms/ads.aspx"]'],
        latvian: [
            'a[href="http://www.salidzini.lv/"][style="display: block; width: 120px; height: 40px; overflow: hidden; position: relative;"]',
            'a[href="http://www.salidzini.lv/"][style="display: block; width: 88px; height: 31px; overflow: hidden; position: relative;"]',
        ],
        listKr: [
            'a[href*="//kingtoon.slnk.kr"]',
            'a[href*="//playdsb.com/kr"]',
            'div.logly-lift-adz',
            'div[data-widget_id="ml6EJ074"]',
            'ins.daum_ddn_area',
        ],
        listeAr: [
            '.geminiLB1Ad',
            '.right-and-left-sponsers',
            'a[href*=".aflam.info"]',
            'a[href*="booraq.org"]',
            'a[href*="dubizzle.com/ar/?utm_source="]',
        ],
        listeFr: [
            'a[href^="http://promo.vador.com/"]',
            '#adcontainer_recherche',
            'a[href*="weborama.fr/fcgi-bin/"]',
            '.site-pub-interstitiel',
            'div[id^="crt-"][data-criteo-id]',
        ],
        officialPolish: [
            '#ceneo-placeholder-ceneo-12',
            '[href^="https://aff.sendhub.pl/"]',
            'a[href^="http://advmanager.techfun.pl/redirect/"]',
            'a[href^="http://www.trizer.pl/?utm_source"]',
            'div#skapiec_ad',
        ],
        ro: [
            'a[href^="//afftrk.altex.ro/Counter/Click"]',
            'a[href^="/magazin/"]',
            'a[href^="https://blackfridaysales.ro/trk/shop/"]',
            'a[href^="https://event.2performant.com/events/click"]',
            'a[href^="https://l.profitshare.ro/"]',
        ],
        ruAd: [
            'a[href*="//febrare.ru/"]',
            'a[href*="//utimg.ru/"]',
            'a[href*="://chikidiki.ru"]',
            '#pgeldiz',
            '.yandex-rtb-block',
        ],
        thaiAds: ['a[href*=macau-uta-popup]', '#ads-google-middle_rectangle-group', '.ads300s', '.bumq', '.img-kosana'],
        webAnnoyancesUltralist: [
            '#mod-social-share-2',
            '#social-tools',
            '.ctpl-fullbanner',
            '.zergnet-recommend',
            '.yt.btn-link.btn-md.btn',
        ],
    };
    /**
     * The order of the returned array means nothing (it's always sorted alphabetically).
     *
     * Notice that the source is slightly unstable.
     * Safari provides a 2-taps way to disable all content blockers on a page temporarily.
     * Also content blockers can be disabled permanently for a domain, but it requires 4 taps.
     * So empty array shouldn't be treated as "no blockers", it should be treated as "no signal".
     * If you are a website owner, don't make your visitors want to disable content blockers.
     */
    function getDomBlockers(_a) {
        var debug = (_a === void 0 ? {} : _a).debug;
        return __awaiter(this, void 0, void 0, function () {
            var filterNames, allSelectors, blockedSelectors, activeBlockers;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!isApplicable()) {
                            return [2 /*return*/, undefined];
                        }
                        filterNames = Object.keys(filters);
                        allSelectors = (_b = []).concat.apply(_b, filterNames.map(function (filterName) { return filters[filterName]; }));
                        return [4 /*yield*/, getBlockedSelectors(allSelectors)];
                    case 1:
                        blockedSelectors = _c.sent();
                        if (debug) {
                            printDebug(blockedSelectors);
                        }
                        activeBlockers = filterNames.filter(function (filterName) {
                            var selectors = filters[filterName];
                            var blockedCount = countTruthy(selectors.map(function (selector) { return blockedSelectors[selector]; }));
                            return blockedCount > selectors.length * 0.6;
                        });
                        activeBlockers.sort();
                        return [2 /*return*/, activeBlockers];
                }
            });
        });
    }
    function isApplicable() {
        // Safari (desktop and mobile) and all Android browsers keep content blockers in both regular and private mode
        return isWebKit() || isAndroid();
    }
    function getBlockedSelectors(selectors) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var d, root, elements, blockedSelectors, i, element, holder, i;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        d = document;
                        root = d.createElement('div');
                        elements = new Array(selectors.length);
                        blockedSelectors = {} // Set() isn't used just in case somebody need older browser support
                        ;
                        forceShow(root);
                        // First create all elements that can be blocked. If the DOM steps below are done in a single cycle,
                        // browser will alternate tree modification and layout reading, that is very slow.
                        for (i = 0; i < selectors.length; ++i) {
                            element = selectorToElement(selectors[i]);
                            holder = d.createElement('div') // Protects from unwanted effects of `+` and `~` selectors of filters
                            ;
                            forceShow(holder);
                            holder.appendChild(element);
                            root.appendChild(holder);
                            elements[i] = element;
                        }
                        _b.label = 1;
                    case 1:
                        if (!!d.body) return [3 /*break*/, 3];
                        return [4 /*yield*/, wait(50)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        d.body.appendChild(root);
                        try {
                            // Then check which of the elements are blocked
                            for (i = 0; i < selectors.length; ++i) {
                                if (!elements[i].offsetParent) {
                                    blockedSelectors[selectors[i]] = true;
                                }
                            }
                        }
                        finally {
                            // Then remove the elements
                            (_a = root.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(root);
                        }
                        return [2 /*return*/, blockedSelectors];
                }
            });
        });
    }
    function forceShow(element) {
        element.style.setProperty('display', 'block', 'important');
    }
    function printDebug(blockedSelectors) {
        var message = 'DOM blockers debug:\n```';
        for (var _i = 0, _a = Object.keys(filters); _i < _a.length; _i++) {
            var filterName = _a[_i];
            message += "\n" + filterName + ":";
            for (var _b = 0, _c = filters[filterName]; _b < _c.length; _b++) {
                var selector = _c[_b];
                message += "\n  " + selector + " " + (blockedSelectors[selector] ? '🚫' : '➡️');
            }
        }
        // console.log is ok here because it's under a debug clause
        // eslint-disable-next-line no-console
        console.log(message + "\n```");
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut
     */
    function getColorGamut() {
        // rec2020 includes p3 and p3 includes srgb
        for (var _i = 0, _a = ['rec2020', 'p3', 'srgb']; _i < _a.length; _i++) {
            var gamut = _a[_i];
            if (matchMedia("(color-gamut: " + gamut + ")").matches) {
                return gamut;
            }
        }
        return undefined;
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/inverted-colors
     */
    function areColorsInverted() {
        if (doesMatch('inverted')) {
            return true;
        }
        if (doesMatch('none')) {
            return false;
        }
        return undefined;
    }
    function doesMatch(value) {
        return matchMedia("(inverted-colors: " + value + ")").matches;
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
     */
    function areColorsForced() {
        if (doesMatch$1('active')) {
            return true;
        }
        if (doesMatch$1('none')) {
            return false;
        }
        return undefined;
    }
    function doesMatch$1(value) {
        return matchMedia("(forced-colors: " + value + ")").matches;
    }

    var maxValueToCheck = 100;
    /**
     * If the display is monochrome (e.g. black&white), the value will be ≥0 and will mean the number of bits per pixel.
     * If the display is not monochrome, the returned value will be 0.
     * If the browser doesn't support this feature, the returned value will be undefined.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/monochrome
     */
    function getMonochromeDepth() {
        if (!matchMedia('(min-monochrome: 0)').matches) {
            // The media feature isn't supported by the browser
            return undefined;
        }
        // A variation of binary search algorithm can be used here.
        // But since expected values are very small (≤10), there is no sense in adding the complexity.
        for (var i = 0; i <= maxValueToCheck; ++i) {
            if (matchMedia("(max-monochrome: " + i + ")").matches) {
                return i;
            }
        }
        throw new Error('Too high value');
    }

    /**
     * @see https://www.w3.org/TR/mediaqueries-5/#prefers-contrast
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
     */
    function getContrastPreference() {
        if (doesMatch$2('no-preference')) {
            return 0 /* None */;
        }
        // The sources contradict on the keywords. Probably 'high' and 'low' will never be implemented.
        // Need to check it when all browsers implement the feature.
        if (doesMatch$2('high') || doesMatch$2('more')) {
            return 1 /* More */;
        }
        if (doesMatch$2('low') || doesMatch$2('less')) {
            return -1 /* Less */;
        }
        if (doesMatch$2('forced')) {
            return 10 /* ForcedColors */;
        }
        return undefined;
    }
    function doesMatch$2(value) {
        return matchMedia("(prefers-contrast: " + value + ")").matches;
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
     */
    function isMotionReduced() {
        if (doesMatch$3('reduce')) {
            return true;
        }
        if (doesMatch$3('no-preference')) {
            return false;
        }
        return undefined;
    }
    function doesMatch$3(value) {
        return matchMedia("(prefers-reduced-motion: " + value + ")").matches;
    }

    /**
     * @see https://www.w3.org/TR/mediaqueries-5/#dynamic-range
     */
    function isHDR() {
        if (doesMatch$4('high')) {
            return true;
        }
        if (doesMatch$4('standard')) {
            return false;
        }
        return undefined;
    }
    function doesMatch$4(value) {
        return matchMedia("(dynamic-range: " + value + ")").matches;
    }

    var M = Math; // To reduce the minified code size
    var fallbackFn = function () { return 0; };
    /**
     * @see https://gitlab.torproject.org/legacy/trac/-/issues/13018
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=531915
     */
    function getMathFingerprint() {
        // Native operations
        var acos = M.acos || fallbackFn;
        var acosh = M.acosh || fallbackFn;
        var asin = M.asin || fallbackFn;
        var asinh = M.asinh || fallbackFn;
        var atanh = M.atanh || fallbackFn;
        var atan = M.atan || fallbackFn;
        var sin = M.sin || fallbackFn;
        var sinh = M.sinh || fallbackFn;
        var cos = M.cos || fallbackFn;
        var cosh = M.cosh || fallbackFn;
        var tan = M.tan || fallbackFn;
        var tanh = M.tanh || fallbackFn;
        var exp = M.exp || fallbackFn;
        var expm1 = M.expm1 || fallbackFn;
        var log1p = M.log1p || fallbackFn;
        // Operation polyfills
        var powPI = function (value) { return M.pow(M.PI, value); };
        var acoshPf = function (value) { return M.log(value + M.sqrt(value * value - 1)); };
        var asinhPf = function (value) { return M.log(value + M.sqrt(value * value + 1)); };
        var atanhPf = function (value) { return M.log((1 + value) / (1 - value)) / 2; };
        var sinhPf = function (value) { return M.exp(value) - 1 / M.exp(value) / 2; };
        var coshPf = function (value) { return (M.exp(value) + 1 / M.exp(value)) / 2; };
        var expm1Pf = function (value) { return M.exp(value) - 1; };
        var tanhPf = function (value) { return (M.exp(2 * value) - 1) / (M.exp(2 * value) + 1); };
        var log1pPf = function (value) { return M.log(1 + value); };
        // Note: constant values are empirical
        return {
            acos: acos(0.123124234234234242),
            acosh: acosh(1e308),
            acoshPf: acoshPf(1e154),
            asin: asin(0.123124234234234242),
            asinh: asinh(1),
            asinhPf: asinhPf(1),
            atanh: atanh(0.5),
            atanhPf: atanhPf(0.5),
            atan: atan(0.5),
            sin: sin(-1e300),
            sinh: sinh(1),
            sinhPf: sinhPf(1),
            cos: cos(10.000000000123),
            cosh: cosh(1),
            coshPf: coshPf(1),
            tan: tan(-1e300),
            tanh: tanh(1),
            tanhPf: tanhPf(1),
            exp: exp(1),
            expm1: expm1(1),
            expm1Pf: expm1Pf(1),
            log1p: log1p(10),
            log1pPf: log1pPf(10),
            powPI: powPI(-100),
        };
    }

    /**
     * We use m or w because these two characters take up the maximum width.
     * Also there are a couple of ligatures.
     */
    var defaultText = 'mmMwWLliI0fiflO&1';
    /**
     * Settings of text blocks to measure. The keys are random but persistent words.
     */
    var presets = {
        /**
         * The default font. User can change it in desktop Chrome, desktop Firefox, IE 11,
         * Android Chrome (but only when the size is ≥ than the default) and Android Firefox.
         */
        default: [],
        /** OS font on macOS. User can change its size and weight. Applies after Safari restart. */
        apple: [{ font: '-apple-system-body' }],
        /** User can change it in desktop Chrome and desktop Firefox. */
        serif: [{ fontFamily: 'serif' }],
        /** User can change it in desktop Chrome and desktop Firefox. */
        sans: [{ fontFamily: 'sans-serif' }],
        /** User can change it in desktop Chrome and desktop Firefox. */
        mono: [{ fontFamily: 'monospace' }],
        /**
         * Check the smallest allowed font size. User can change it in desktop Chrome, desktop Firefox and desktop Safari.
         * The height can be 0 in Chrome on a retina display.
         */
        min: [{ fontSize: '1px' }],
        /** Tells one OS from another in desktop Chrome. */
        system: [{ fontFamily: 'system-ui' }],
    };
    /**
     * The result is a dictionary of the width of the text samples.
     * Heights aren't included because they give no extra entropy and are unstable.
     *
     * The result is very stable in IE 11, Edge 18 and Safari 14.
     * The result changes when the OS pixel density changes in Chromium 87. The real pixel density is required to solve,
     * but seems like it's impossible: https://stackoverflow.com/q/1713771/1118709.
     * The "min" and the "mono" (only on Windows) value may change when the page is zoomed in Firefox 87.
     */
    function getFontPreferences() {
        return withNaturalFonts(function (document, container) {
            var elements = {};
            var sizes = {};
            // First create all elements to measure. If the DOM steps below are done in a single cycle,
            // browser will alternate tree modification and layout reading, that is very slow.
            for (var _i = 0, _a = Object.keys(presets); _i < _a.length; _i++) {
                var key = _a[_i];
                var _b = presets[key], _c = _b[0], style = _c === void 0 ? {} : _c, _d = _b[1], text = _d === void 0 ? defaultText : _d;
                var element = document.createElement('span');
                element.textContent = text;
                element.style.whiteSpace = 'nowrap';
                for (var _e = 0, _f = Object.keys(style); _e < _f.length; _e++) {
                    var name_1 = _f[_e];
                    var value = style[name_1];
                    if (value !== undefined) {
                        element.style[name_1] = value;
                    }
                }
                elements[key] = element;
                container.appendChild(document.createElement('br'));
                container.appendChild(element);
            }
            // Then measure the created elements
            for (var _g = 0, _h = Object.keys(presets); _g < _h.length; _g++) {
                var key = _h[_g];
                sizes[key] = elements[key].getBoundingClientRect().width;
            }
            return sizes;
        });
    }
    /**
     * Creates a DOM environment that provides the most natural font available, including Android OS font.
     * Measurements of the elements are zoom-independent.
     * Don't put a content to measure inside an absolutely positioned element.
     */
    function withNaturalFonts(action, containerWidthPx) {
        if (containerWidthPx === void 0) { containerWidthPx = 4000; }
        /*
         * Requirements for Android Chrome to apply the system font size to a text inside an iframe:
         * - The iframe mustn't have a `display: none;` style;
         * - The text mustn't be positioned absolutely;
         * - The text block must be wide enough.
         *   2560px on some devices in portrait orientation for the biggest font size option (32px);
         * - There must be much enough text to form a few lines (I don't know the exact numbers);
         * - The text must have the `text-size-adjust: none` style. Otherwise the text will scale in "Desktop site" mode;
         *
         * Requirements for Android Firefox to apply the system font size to a text inside an iframe:
         * - The iframe document must have a header: `<meta name="viewport" content="width=device-width, initial-scale=1" />`.
         *   The only way to set it is to use the `srcdoc` attribute of the iframe;
         * - The iframe content must get loaded before adding extra content with JavaScript;
         *
         * https://example.com as the iframe target always inherits Android font settings so it can be used as a reference.
         *
         * Observations on how page zoom affects the measurements:
         * - macOS Safari 11.1, 12.1, 13.1, 14.0: zoom reset + offsetWidth = 100% reliable;
         * - macOS Safari 11.1, 12.1, 13.1, 14.0: zoom reset + getBoundingClientRect = 100% reliable;
         * - macOS Safari 14.0: offsetWidth = 5% fluctuation;
         * - macOS Safari 14.0: getBoundingClientRect = 5% fluctuation;
         * - iOS Safari 9, 10, 11.0, 12.0: haven't found a way to zoom a page (pinch doesn't change layout);
         * - iOS Safari 13.1, 14.0: zoom reset + offsetWidth = 100% reliable;
         * - iOS Safari 13.1, 14.0: zoom reset + getBoundingClientRect = 100% reliable;
         * - iOS Safari 14.0: offsetWidth = 100% reliable;
         * - iOS Safari 14.0: getBoundingClientRect = 100% reliable;
         * - Chrome 42, 65, 80, 87: zoom 1/devicePixelRatio + offsetWidth = 1px fluctuation;
         * - Chrome 42, 65, 80, 87: zoom 1/devicePixelRatio + getBoundingClientRect = 100% reliable;
         * - Chrome 87: offsetWidth = 1px fluctuation;
         * - Chrome 87: getBoundingClientRect = 0.7px fluctuation;
         * - Firefox 48, 51: offsetWidth = 10% fluctuation;
         * - Firefox 48, 51: getBoundingClientRect = 10% fluctuation;
         * - Firefox 52, 53, 57, 62, 66, 67, 68, 71, 75, 80, 84: offsetWidth = width 100% reliable, height 10% fluctuation;
         * - Firefox 52, 53, 57, 62, 66, 67, 68, 71, 75, 80, 84: getBoundingClientRect = width 100% reliable, height 10%
         *   fluctuation;
         * - Android Chrome 86: haven't found a way to zoom a page (pinch doesn't change layout);
         * - Android Firefox 84: font size in accessibility settings changes all the CSS sizes, but offsetWidth and
         *   getBoundingClientRect keep measuring with regular units, so the size reflects the font size setting and doesn't
         *   fluctuate;
         * - IE 11, Edge 18: zoom 1/devicePixelRatio + offsetWidth = 100% reliable;
         * - IE 11, Edge 18: zoom 1/devicePixelRatio + getBoundingClientRect = reflects the zoom level;
         * - IE 11, Edge 18: offsetWidth = 100% reliable;
         * - IE 11, Edge 18: getBoundingClientRect = 100% reliable;
         */
        return withIframe(function (_, iframeWindow) {
            var iframeDocument = iframeWindow.document;
            var iframeBody = iframeDocument.body;
            var bodyStyle = iframeBody.style;
            bodyStyle.width = containerWidthPx + "px";
            bodyStyle.webkitTextSizeAdjust = bodyStyle.textSizeAdjust = 'none';
            // See the big comment above
            if (isChromium()) {
                iframeBody.style.zoom = "" + 1 / iframeWindow.devicePixelRatio;
            }
            else if (isWebKit()) {
                iframeBody.style.zoom = 'reset';
            }
            // See the big comment above
            var linesOfText = iframeDocument.createElement('div');
            linesOfText.textContent = __spreadArrays(Array((containerWidthPx / 20) << 0)).map(function () { return 'word'; }).join(' ');
            iframeBody.appendChild(linesOfText);
            return action(iframeDocument, iframeBody);
        }, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">');
    }

    /**
     * The list of entropy sources used to make visitor identifiers.
     *
     * This value isn't restricted by Semantic Versioning, i.e. it may be changed without bumping minor or major version of
     * this package.
     */
    var sources = {
        // READ FIRST:
        // See https://github.com/fingerprintjs/fingerprintjs/blob/master/contributing.md#how-to-make-an-entropy-source
        // to learn how entropy source works and how to make your own.
        // The sources run in this exact order.
        // The asynchronous sources are at the start to run in parallel with other sources.
        fonts: getFonts,
        domBlockers: getDomBlockers,
        fontPreferences: getFontPreferences,
        audio: getAudioFingerprint,
        screenFrame: getRoundedScreenFrame,
        osCpu: getOsCpu,
        languages: getLanguages,
        colorDepth: getColorDepth,
        deviceMemory: getDeviceMemory,
        screenResolution: getScreenResolution,
        hardwareConcurrency: getHardwareConcurrency,
        timezone: getTimezone,
        sessionStorage: getSessionStorage,
        localStorage: getLocalStorage,
        indexedDB: getIndexedDB,
        openDatabase: getOpenDatabase,
        cpuClass: getCpuClass,
        platform: getPlatform,
        plugins: getPlugins,
        canvas: getCanvasFingerprint,
        touchSupport: getTouchSupport,
        vendor: getVendor,
        vendorFlavors: getVendorFlavors,
        cookiesEnabled: areCookiesEnabled,
        colorGamut: getColorGamut,
        invertedColors: areColorsInverted,
        forcedColors: areColorsForced,
        monochrome: getMonochromeDepth,
        contrast: getContrastPreference,
        reducedMotion: isMotionReduced,
        hdr: isHDR,
        math: getMathFingerprint,
    };
    /**
     * Loads the built-in entropy sources.
     * Returns a function that collects the entropy components to make the visitor identifier.
     */
    function loadBuiltinSources(options) {
        return loadSources(sources, options, []);
    }

    var commentTemplate = '$ if upgrade to Pro: https://fpjs.dev/pro';
    function getConfidence(components) {
        var openConfidenceScore = getOpenConfidenceScore(components);
        var proConfidenceScore = deriveProConfidenceScore(openConfidenceScore);
        return { score: openConfidenceScore, comment: commentTemplate.replace(/\$/g, "" + proConfidenceScore) };
    }
    function getOpenConfidenceScore(components) {
        // In order to calculate the true probability of the visitor identifier being correct, we need to know the number of
        // website visitors (the higher the number, the less the probability because the fingerprint entropy is limited).
        // JS agent doesn't know the number of visitors, so we can only do an approximate assessment.
        if (isAndroid()) {
            return 0.4;
        }
        // Safari (mobile and desktop)
        if (isWebKit()) {
            return isDesktopSafari() ? 0.5 : 0.3;
        }
        var platform = components.platform.value || '';
        // Windows
        if (/^Win/.test(platform)) {
            // The score is greater than on macOS because of the higher variety of devices running Windows.
            // Chrome provides more entropy than Firefox according too
            // https://netmarketshare.com/browser-market-share.aspx?options=%7B%22filter%22%3A%7B%22%24and%22%3A%5B%7B%22platform%22%3A%7B%22%24in%22%3A%5B%22Windows%22%5D%7D%7D%5D%7D%2C%22dateLabel%22%3A%22Trend%22%2C%22attributes%22%3A%22share%22%2C%22group%22%3A%22browser%22%2C%22sort%22%3A%7B%22share%22%3A-1%7D%2C%22id%22%3A%22browsersDesktop%22%2C%22dateInterval%22%3A%22Monthly%22%2C%22dateStart%22%3A%222019-11%22%2C%22dateEnd%22%3A%222020-10%22%2C%22segments%22%3A%22-1000%22%7D
            // So we assign the same score to them.
            return 0.6;
        }
        // macOS
        if (/^Mac/.test(platform)) {
            // Chrome provides more entropy than Safari and Safari provides more entropy than Firefox.
            // Chrome is more popular than Safari and Safari is more popular than Firefox according to
            // https://netmarketshare.com/browser-market-share.aspx?options=%7B%22filter%22%3A%7B%22%24and%22%3A%5B%7B%22platform%22%3A%7B%22%24in%22%3A%5B%22Mac%20OS%22%5D%7D%7D%5D%7D%2C%22dateLabel%22%3A%22Trend%22%2C%22attributes%22%3A%22share%22%2C%22group%22%3A%22browser%22%2C%22sort%22%3A%7B%22share%22%3A-1%7D%2C%22id%22%3A%22browsersDesktop%22%2C%22dateInterval%22%3A%22Monthly%22%2C%22dateStart%22%3A%222019-11%22%2C%22dateEnd%22%3A%222020-10%22%2C%22segments%22%3A%22-1000%22%7D
            // So we assign the same score to them.
            return 0.5;
        }
        // Another platform, e.g. a desktop Linux. It's rare, so it should be pretty unique.
        return 0.7;
    }
    function deriveProConfidenceScore(openConfidenceScore) {
        return round(0.99 + 0.01 * openConfidenceScore, 0.0001);
    }

    function componentsToCanonicalString(components) {
        var result = '';
        for (var _i = 0, _a = Object.keys(components).sort(); _i < _a.length; _i++) {
            var componentKey = _a[_i];
            var component = components[componentKey];
            var value = component.error ? 'error' : JSON.stringify(component.value);
            result += "" + (result ? '|' : '') + componentKey.replace(/([:|\\])/g, '\\$1') + ":" + value;
        }
        return result;
    }
    function componentsToDebugString(components) {
        return JSON.stringify(components, function (_key, value) {
            if (value instanceof Error) {
                return errorToObject(value);
            }
            return value;
        }, 2);
    }
    function hashComponents(components) {
        return x64hash128(componentsToCanonicalString(components));
    }
    /**
     * Makes a GetResult implementation that calculates the visitor id hash on demand.
     * Designed for optimisation.
     */
    function makeLazyGetResult(components) {
        var visitorIdCache;
        // This function runs very fast, so there is no need to make it lazy
        var confidence = getConfidence(components);
        // A plain class isn't used because its getters and setters aren't enumerable.
        return {
            get visitorId() {
                if (visitorIdCache === undefined) {
                    visitorIdCache = hashComponents(this.components);
                }
                return visitorIdCache;
            },
            set visitorId(visitorId) {
                visitorIdCache = visitorId;
            },
            confidence: confidence,
            components: components,
            version: version,
        };
    }
    /**
     * A delay is required to ensure consistent entropy components.
     * See https://github.com/fingerprintjs/fingerprintjs/issues/254
     * and https://github.com/fingerprintjs/fingerprintjs/issues/307
     * and https://github.com/fingerprintjs/fingerprintjs/commit/945633e7c5f67ae38eb0fea37349712f0e669b18
     */
    function prepareForSources(delayFallback) {
        if (delayFallback === void 0) { delayFallback = 50; }
        // A proper deadline is unknown. Let it be twice the fallback timeout so that both cases have the same average time.
        return requestIdleCallbackIfAvailable(delayFallback, delayFallback * 2);
    }
    /**
     * The function isn't exported from the index file to not allow to call it without `load()`.
     * The hiding gives more freedom for future non-breaking updates.
     *
     * A factory function is used instead of a class to shorten the attribute names in the minified code.
     * Native private class fields could've been used, but TypeScript doesn't allow them with `"target": "es5"`.
     */
    function makeAgent(getComponents, debug) {
        var creationTime = Date.now();
        return {
            get: function (options) {
                return __awaiter(this, void 0, void 0, function () {
                    var startTime, components, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                startTime = Date.now();
                                return [4 /*yield*/, getComponents()];
                            case 1:
                                components = _a.sent();
                                result = makeLazyGetResult(components);
                                if (debug || (options === null || options === void 0 ? void 0 : options.debug)) {
                                    // console.log is ok here because it's under a debug clause
                                    // eslint-disable-next-line no-console
                                    console.log("Copy the text below to get the debug data:\n\n```\nversion: " + result.version + "\nuserAgent: " + navigator.userAgent + "\ntimeBetweenLoadAndGet: " + (startTime - creationTime) + "\nvisitorId: " + result.visitorId + "\ncomponents: " + componentsToDebugString(components) + "\n```");
                                }
                                return [2 /*return*/, result];
                        }
                    });
                });
            },
        };
    }
    /**
     * Builds an instance of Agent and waits a delay required for a proper operation.
     */
    function load(_a) {
        var _b = _a === void 0 ? {} : _a, delayFallback = _b.delayFallback, debug = _b.debug, _c = _b.monitoring;
        return __awaiter(this, void 0, void 0, function () {
            var getComponents;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        return [4 /*yield*/, prepareForSources(delayFallback)];
                    case 1:
                        _d.sent();
                        getComponents = loadBuiltinSources({ debug: debug });
                        return [2 /*return*/, makeAgent(getComponents, debug)];
                }
            });
        });
    }

    // The default export is a syntax sugar (`import * as FP from '...' → import FP from '...'`).
    // It should contain all the public exported values.
    var index = { load: load, hashComponents: hashComponents, componentsToDebugString: componentsToDebugString };
    // The exports below are for private usage. They may change unexpectedly. Use them at your own risk.
    /** Not documented, out of Semantic Versioning, usage is at your own risk */
    var murmurX64Hash128 = x64hash128;

    exports.componentsToDebugString = componentsToDebugString;
    exports.default = index;
    exports.getFullscreenElement = getFullscreenElement;
    exports.getScreenFrame = getScreenFrame;
    exports.hashComponents = hashComponents;
    exports.isAndroid = isAndroid;
    exports.isChromium = isChromium;
    exports.isDesktopSafari = isDesktopSafari;
    exports.isEdgeHTML = isEdgeHTML;
    exports.isGecko = isGecko;
    exports.isTrident = isTrident;
    exports.isWebKit = isWebKit;
    exports.load = load;
    exports.loadSources = loadSources;
    exports.murmurX64Hash128 = murmurX64Hash128;
    exports.prepareForSources = prepareForSources;
    exports.sources = sources;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],108:[function(require,module,exports){
var SDKUtils = require("./prime-utils");
var styleLogging = SDKUtils.styleLogging;
var oneSignalConfig = {
  lib: "https://cdn.onesignal.com/sdks/OneSignalSDK.js"
};

var OneSignalPrimeSDK = function (configs, analytics) {
  if (!configs) {
    console.log(styleLogging.prefixLog, styleLogging.errorStyleLog, "Options configuration is required!");
    return;
  }

  var options = configs.oneSignal.options;
  var isShowLog = options.showLogs || false;

  var OneSignalService = {
    /**
     * Init one signal sdk
     */
    initOneSignalSDK: function () {
      isShowLog && console.log("OneSignal: init script SDK with options: ", options);

      if (options.embedOneSignalSDK) {
        window.OneSignal = window.OneSignal || [];
        OneSignal.push(function () {
          OneSignal.init({
            appId: options.appId
          });

          isShowLog && console.log("OneSignal: init appId: ", options.appId);
        });
      }

      var profileId = localStorage.getItem("prime_profile_id");
      if (profileId) {
        OneSignalService.addProfileId(profileId);

        OneSignal.getUserId().then(function (playerId) {
          analytics.track("reached_channel", {properties: {onesignal: {website_player_id: playerId}}});
          isShowLog && console.log("OneSignal: reached_channel playerId: ", playerId);
        });
      }
    },
    addProfileId: function (profileId) {
      isShowLog && console.log("OneSignal: Add external user id (profileId): ", profileId);
      OneSignal.push(function () {
        OneSignal.setExternalUserId(profileId);
      });
    },
    removeProfileId: function (profileId) {
      isShowLog && console.log("OneSignal: Remove external user id (profileId): ", profileId);
      OneSignal.push(function () {
        OneSignal.removeExternalUserId();
      });
    },
    getProfileId: function () {
      OneSignal.getExternalUserId().then(function (externalUserId) {
        isShowLog && console.log("OneSignal: get external user id (profileId): ", externalUserId);
      });
    }
  };

  options.embedOneSignalSDK && SDKUtils.loadScript(oneSignalConfig.lib, OneSignalService.initOneSignalSDK);
  !options.embedOneSignalSDK && OneSignalService.initOneSignalSDK();

};

module.exports = OneSignalPrimeSDK;
},{"./prime-utils":112}],109:[function(require,module,exports){

var uuid = require("uuid/v4");
var SDKUtils = require("./prime-utils");
var styleLogging = SDKUtils.styleLogging;
// Separator để ngăn cách phần event alias và event id trong button_event channel message lúc tạo collect lead popup
var SEPARATOR_PREFIX = "__PRIMEDATA_AI__";
var showingMessageId = undefined;

var WebOnsitePrimeSDK = function (configs, analytics) {
  if (!configs) {
    console.log(styleLogging.prefixLog, styleLogging.errorStyleLog, "Options configuration is required!");
    return;
  }

  var options = {
    ...configs.webPopup.options,
    source: configs.scope,
    writeKey: configs.writeKey
  };

  const isShowLog = configs.webPopup.options.showLogs || false;

  var worker = null;
  var broadcastChannel = null;
  var websocket = null;
  var timeoutWorker = null;
  var webSocketState = WebSocket.CONNECTING;
  var PrimeOnsiteSDK = {
    onsiteOpts: {
      onsiteWorkerPath: "./posjs-worker.js",
      endpoint: "https://dev.primedata.ai"
    },
    eventStatusEnum: {
      delivered: "delivered", //on receive message
      viewed: "viewed", //onInit
      clicked: "clicked", //confirmAction
      visited: "visited", //confirmAction
      closed: "closed" //OK
    },
    /**
     * Load service-worker.js to connect and listen socket to delivery message to worker or broadcast channel
     * @param config
     * @param authDataObject
     */
    loadWorkerStatic: function (config, authDataObject) {
      isShowLog && console.log("Logging::: loadWorkerStatic Log::: ", config, authDataObject);
      var workerStatic = new SharedWorker(PrimeOnsiteSDK.onsiteOpts.onsiteWorkerPath, "prime-posjs-onsite-sdk");

      if (!!analytics && !!analytics.track && !!authDataObject && !!authDataObject.client_id) {

        isShowLog && console.log("Initializing the web worker for user: " + id);
        workerStatic.port.start();

        isShowLog && console.log("Authenticated with data:", authDataObject);

        analytics.track("reached_channel", {"onsite": {"notification_token": authDataObject.client_id}});

        var id = sessionStorage.getItem("cdp_tab_id") || SDKUtils.uuidByte();

        workerStatic.port.postMessage({type: "check_tab_id", data: id});
        workerStatic.port.onmessage = event => {
          if (event.data.type === "status_tab_id") {
            if (event.data.status === "YES") {
              sessionStorage.setItem("cdp_tab_id", id);
              workerStatic.port.postMessage({
                from: id,
                data: {config, storage: authDataObject},
                type: "init"
              });
              //When closing tab and reload will post a message with type is closing to shared-worker
              window.addEventListener("beforeunload", function () {
                workerStatic.port.postMessage({
                  from: id,
                  data: {
                    config,
                    storage: authDataObject,
                    closingInfo: localStorage.getItem("isPopupShowing") ? {
                      endpoint: PrimeOnsiteSDK.onsiteOpts.endpoint,
                      messageId: `${showingMessageId}`,
                      status: PrimeOnsiteSDK.eventStatusEnum.closed,
                      sessionId: SDKUtils.getCookie("XSessionId")
                    } : undefined
                  },
                  type: "closing"
                });
                // Remove isPopupShowing before tab closes
                localStorage.removeItem("isPopupShowing");
              });

              worker = workerStatic;

              PrimeOnsiteSDK.workerListener(workerStatic);
            }

            if (event.data.status === "NO") {
              id = SDKUtils.uuidByte();
              workerStatic.port.postMessage({type: "check_tab_id", data: id});
            }
          }
        };

      } else {

        timeoutWorker = setTimeout(() => {
          localStorage.removeItem(config.storageWorkerUrlKey);
          PrimeOnsiteSDK.loadWorkerStatic(config, authDataObject);
        }, 1000);

      }

    },
    /**
     * trackEventCollectLeadForm
     * @param eventAlias => event to track
     * @param forms => list forms elements
     * @param cb => callback function
     */
    trackEventCollectLeadForm: function(eventAlias, forms, cb) {

      const getValueByType = (value, type) => {
        switch (type) {
          case "string":
            return value;
          case "array":
            return [value];

          //TODO: handle trait type => implement common case
          case "number":
            return Number(value);
          case "boolean":
            return false;

          default:
            return value;
        }
      }

      let data = {}
      forms.forEach(element => {
        isShowLog && console.log('OS Logging::: Element Form: ', element)
        let valueInput = document.getElementById(element.fieldType)?.value || ""
        if(!valueInput) return;

        /**
         * refs: PDT-5493 Popup Collect Lead Properties
         * Handle compatible with before version. Before version not exist alias field & using fieldType to hardcode property
         */
        if(element?.alias && element?.data_type) {
          data[element.alias] = getValueByType(valueInput, element.data_type);
        } else {
          if(element.fieldType === "EMAIL") data.email = valueInput;
          if(element.fieldType === "PHONE") data.phone_number = valueInput;
          if(element.fieldType === "GENDER") data.gender = valueInput.toLowerCase().includes("nam") ? "Nam" : "Nữ";
          if(element.fieldType === "CITY") data.city = valueInput;
          if(element.fieldType === "FULL_NAME") data.full_name = valueInput;
          if(element.fieldType === "DOB") data.date_of_birth = valueInput;
        }
      })
      isShowLog && console.log("OS Logging::: Identify profile with data::: ", data);
      analytics.identify(SDKUtils.uuidByte(), {...data}, null, () => {
        isShowLog && console.log("OS Logging::: Track event with alias::: ", eventAlias);
        eventAlias && analytics.track(eventAlias, {});
        cb && cb()
      });
    },
    /**
     * Mapping data from socket to pathfora format
     * @param messageDataParam
     * @returns {{msg: (string|*), image: *, onModalClose: onModalClose, cancelShow: boolean, okMessage: *, colors: {actionText: string, actionBackground: string, background: string, text: string, headline: string, close: string}, layout: string, onInit: onInit, displayConditions: {hideAfterAction: *}, variant: number, theme, position: string, confirmAction: {name: *, callback: confirmAction.callback}, fields: {phone: boolean, name: boolean, company: boolean, title: boolean, message: boolean, email: boolean}, headline: *, formElements: (*|*[])}}
     */
    generatePathforaDetails: function (messageDataParam) {
      var dataParse = typeof messageDataParam === "object" ? messageDataParam : JSON.parse(messageDataParam || "{}");
      isShowLog && console.log("OS Logging::: generatePathforaDetails Log::: ", dataParse);
      var data = {};
      let dataType = dataParse ? (dataParse.type || 0) : 0;
      switch (dataType) {
        case "DRIVE_TRAFFIC":
          isShowLog && console.log("DRIVE_TRAFFIC: ", dataParse);
          data = dataParse.drive_traffic;
          break;
        case "COLLECT_LEADS":
          isShowLog && console.log("COLLECT_LEADS: ", dataParse);
          data = dataParse.collect_leads;
          break;
        case "PRESENT_MESSAGE":
          isShowLog && console.log("PRESENT_MESSAGE: ", dataParse);
          data = dataParse.present_message;
          break;
        default:
          data = {};
          break;
      }

      const layoutSwitchCaseObj = {
        MESSAGE_LAYOUT_MODAL: "modal",
        MESSAGE_LAYOUT_SLIDE_OUT: "slideout",
        MESSAGE_LAYOUT_BAR: "bar",

        FORM_LAYOUT_MODAL: "modal",
        FORM_LAYOUT_SLIDE_OUT: "slideout",

        SUBSCRIPTION_LAYOUT_MODAL: "modal",
        SUBSCRIPTION_LAYOUT_SLIDE_OUT: "slideout",
        SUBSCRIPTION_LAYOUT_BAR: "bar"
      };

      const themeSwitchCaseObj = {
        "THEME_LIGHT": "light",
        "THEME_DARK": "dark",
        "THEME_CUSTOM": "custom"
      };

      var layoutType = data.layout ? (data.layout.type || "") : "";
      let layout = layoutSwitchCaseObj[layoutType] || layoutSwitchCaseObj.MESSAGE_LAYOUT_MODAL;

      let positionPopup = "top-fixed";
      if (layoutType === "MESSAGE_LAYOUT_BAR" || layoutType === "SUBSCRIPTION_LAYOUT_BAR") positionPopup = "top-absolute";

      if (layoutType === "MESSAGE_LAYOUT_SLIDE_OUT" || layoutType === "SUBSCRIPTION_LAYOUT_SLIDE_OUT" || layoutType === "FORM_LAYOUT_SLIDE_OUT") {
        positionPopup = data.layout.slide_out.position?.toLowerCase().replace("_", "-");
      }

      if (
        layoutType === "MESSAGE_LAYOUT_MODAL" ||
        layoutType === "SUBSCRIPTION_LAYOUT_MODAL" ||
        layoutType === "FORM_LAYOUT_MODAL"
      ) {
        positionPopup = "center";
      }

      let formElements = [];

      if (data?.form_element) {
        let fieldType = {
          CITY: "text",
          EMAIL: "email",
          FULL_NAME: "text",
          PHONE: "text",
          GENDER: "text",
          DOB: "text",
          CHECKBOX_GROUP: "text",
          RADIO_GROUP: "text",
          TEXTAREA: "text",
          TEXT: "text",
          SELECT: "text",
        };

        formElements = data.form_element.map((el) => ({
          ...el,
          placeholder: el?.label + (el?.required ? " (*)" : ""),
          label: "",
          type: fieldType[el.type] || "text",
          fieldType: el.type,
        }));
      }


      const messageId = dataParse ? (dataParse.id || "") : "";
      showingMessageId = messageId;

      let imageOnsite = layout === "slideout"
        ? data.layout?.slide_out?.image
        : layout === "modal"
          ? data.layout?.modal?.image
          : layout === "bar"
            ? data.layout?.bar?.image
            : data.layout?.collect_leads?.image;

      return {
        className: 'primedata-cdp-popup-onsite-wrapper',
        layout: layout,
        position: positionPopup,
        headline: data.headline || "",
        msg: data.msg || "",
        image: imageOnsite || "",
        variant: 2,
        okShow: ![null, undefined, "", "undefined", "null"].includes(data?.cta_button?.text),
        cancelShow: false,
        okMessage: data?.cta_button?.text,
        theme: themeSwitchCaseObj[data.theme],
        colors: {
          background: SDKUtils.rgbStrToHex(data.color.background),
          text: SDKUtils.rgbStrToHex(data.color.text),
          headline: SDKUtils.rgbStrToHex(data.color.headline),
          close: SDKUtils.rgbStrToHex(data.color.close),
          actionBackground: SDKUtils.rgbStrToHex(data.cta_button.background_color),
          actionText: SDKUtils.rgbStrToHex(data.cta_button.text_color)
        },
        formElements: formElements,
        displayConditions: {
          hideAfterAction: data.display_condition.hide_after_action
        },
        fields: {
          name: false,
          title: false,
          email: false,
          message: false,
          phone: false,
          company: false
        },
        confirmAction: {
          name: data?.cta_button?.text,
          callback: function (event, payload) {
            isShowLog && console.log("OS Logging::: campaign response status clicked");
            PrimeOnsiteSDK.handleCampaignResponse(messageId, PrimeOnsiteSDK.eventStatusEnum.clicked);

            isShowLog && console.log("OS Logging::: campaign response status visited");
            PrimeOnsiteSDK.handleCampaignResponse(messageId, PrimeOnsiteSDK.eventStatusEnum.visited);


            isShowLog && console.log("dataType: ", dataType, "Form element size: ", formElements.length)
            if(dataType === "COLLECT_LEADS" && formElements.length > 0 ){
              let eventCTAOfCollectLead = data?.cta_button?.button_event;
              let eventAlias = eventCTAOfCollectLead ? eventCTAOfCollectLead.split(SEPARATOR_PREFIX)?.[0] : "";
              PrimeOnsiteSDK.trackEventCollectLeadForm(eventAlias, formElements, () => {
                data?.cta_button?.link && window.open(data.cta_button.link);
              });
            } else {
              data?.cta_button?.link && window.open(data.cta_button.link);
            }


          }
        },
        onInit: function (event, module) {
          isShowLog && console.log("OS Logging::: campaign response status viewed");
          PrimeOnsiteSDK.handleCampaignResponse(messageId, PrimeOnsiteSDK.eventStatusEnum.viewed);
        },
        onModalClose: function (event, payload) {
          localStorage.removeItem("isPopupShowing");
        },
        closeAction: {
          callback: function (event, payload) {
            isShowLog && console.log("OS Logging::: campaign response status closed");
            PrimeOnsiteSDK.handleCampaignResponse(messageId, PrimeOnsiteSDK.eventStatusEnum.closed);
          }
        }
      };

    },
    ackPopupForServer: function(event){
      const sharedWorkerIsSupported = SDKUtils.sharedWorkerIsSupported();
      if (sharedWorkerIsSupported) {
        let broadcastChannelBackup = new BroadcastChannel(PrimeOnsiteSDK.onsiteOpts.channelBroadcastName);
        broadcastChannelBackup.postMessage({type: "ack", data: event});
        localStorage.setItem("isPopupShowing", "true");
      }

      if (!sharedWorkerIsSupported && websocket) {
        websocket.send(JSON.stringify({type: "ack", data: {id: event.id}}));
        localStorage.setItem("isPopupShowing", "true");
      }
    },
    /**
     * Convert data recieve from socket to json
     * @param event
     * @returns {{msg: (string|*), image: *, onModalClose: onModalClose, cancelShow: boolean, okMessage: *, colors: {actionText: string, actionBackground: string, background: string, text: string, headline: string, close: string}, layout: string, onInit: onInit, displayConditions: {hideAfterAction: *}, variant: number, theme, position: string, confirmAction: {name: *, callback: confirmAction.callback}, fields: {phone: boolean, name: boolean, company: boolean, title: boolean, message: boolean, email: boolean}, headline: *, formElements: (*|*[])}}
     */
    generatePathforaFormData: function (event) {
      isShowLog && console.log("OS Logging:: generatePathforaFormData: event:: ", event);
      var formatEvent = typeof event === "object" ? event : JSON.parse(event || '{}');
      let dataParse = {};
      let messageId = "";
      if (formatEvent?.data) {
        dataParse = typeof formatEvent?.data === "object" ? formatEvent?.data : JSON.parse(formatEvent?.data || "{}");
      }
      messageId = dataParse?.id || "";
      isShowLog && console.log("OS Logging::: campaign response status delivered");
      PrimeOnsiteSDK.handleCampaignResponse(messageId, PrimeOnsiteSDK.eventStatusEnum.delivered);

      isShowLog && console.log("OS Logging:: generatePathforaFormData dataParse", dataParse);
      return PrimeOnsiteSDK.generatePathforaDetails(dataParse);
    },
    /**
     * showPopupTemplate
     * @param event - Response from campaign DE
     * @param eventBody - data of popup custom
     * @returns {*}
     */
    showPopupTemplate: function (event, eventBody) {
      let popup = JSON.parse(eventBody?.theme_Store?.custom_store) || {}
      isShowLog && console.log("OS Logging::: showPopupOnSite Log popup data ::: ", popup);
      isShowLog && console.log("OS Logging::: showPopupOnSite Log body data event ::: ", eventBody);
      if(popup?.html) {
        const styleId = uuid();
        let onsite = {
          show: Function('"use strict";return (' + popup.html + ')')(),
          confirmAction:  function (_event, _payload) {
            isShowLog && console.log("OS Logging::: campaign response status clicked");
            PrimeOnsiteSDK.handleCampaignResponse(eventBody.id, PrimeOnsiteSDK.eventStatusEnum.clicked);

            isShowLog && console.log("OS Logging::: campaign response status visited");
            PrimeOnsiteSDK.handleCampaignResponse(eventBody.id, PrimeOnsiteSDK.eventStatusEnum.visited);

            let formElements = [];
            if (popup?.form_element) {
              let fieldType = {
                CITY: "text",
                EMAIL: "email",
                FULL_NAME: "text",
                PHONE: "text",
                GENDER: "text",
                DOB: "text",
                CHECKBOX_GROUP: "text",
                RADIO_GROUP: "text",
                TEXTAREA: "text",
                TEXT: "text",
                SELECT: "text",
              };

              formElements = popup.form_element.map((el) => ({
                ...el,
                placeholder: el?.label + (el?.required ? " (*)" : ""),
                label: "",
                type: fieldType[el.type] || "text",
                fieldType: el.type,
                name: el.type,
              }));
            }

            isShowLog && console.log("Form element size: ", formElements.length)
            if( formElements.length > 0 ){
              let eventCTAOfCollectLead = popup?.cta_button?.button_event;
              let eventAlias = eventCTAOfCollectLead ? eventCTAOfCollectLead.split(SEPARATOR_PREFIX)?.[0] : "";
              PrimeOnsiteSDK.trackEventCollectLeadForm(eventAlias, formElements, () => {
                localStorage.removeItem("isPopupShowing");
                popup?.cta_button?.link && window.open(popup.cta_button.link);
              });
            } else {
              localStorage.removeItem("isPopupShowing");
              popup?.cta_button?.link && window.open(popup.cta_button.link);
            }

          },
          closeAction: function (_event, _payload) {
            localStorage.removeItem("isPopupShowing");
            isShowLog && console.log("OS Logging::: campaign response status closed");
            PrimeOnsiteSDK.handleCampaignResponse(eventBody.id, PrimeOnsiteSDK.eventStatusEnum.closed);
            styleId && document.getElementById(styleId)?.remove();
          }
        }
        isShowLog && console.log("OS Logging::: campaign response status viewed");
        PrimeOnsiteSDK.handleCampaignResponse(eventBody.id, PrimeOnsiteSDK.eventStatusEnum.viewed);
        isShowLog && console.log("OS Logging::: showPopupOnSite template show success!");
        PrimeOnsiteSDK.ackPopupForServer(event);
        return onsite.show({...popup, styleId: styleId}, onsite.confirmAction, onsite.closeAction);
      } else {
        isShowLog && console.log("OS Logging::: showPopupOnSite template broken => not show::: ");
      }
    },
    /**
     * Using pathfora to show popup on client site
     * @param event
     * @param modalId
     */
    showPopupOnSite: function (event, modalId) {
      isShowLog && console.log("OS Logging::: showPopupOnSite Log::: ", event);
      var eventParse = typeof event === "object" ? event?.data : JSON.parse(event?.data || "{}");
      var dataParse = JSON.parse(eventParse || "{}");
      isShowLog && console.log("OS Logging::: showPopupOnSite Popup Category Log::: ", dataParse?.category);
      if("POPUP_CATEGORY_THEME_STORE" === dataParse?.category) return PrimeOnsiteSDK.showPopupTemplate(event, dataParse);

      const modalData = PrimeOnsiteSDK.generatePathforaFormData(event);
      isShowLog && console.log("OS Logging::: modalData Log::: ", modalData);

      event.data = JSON.parse(event.data || "{}");

      if (event.data.type === "PRESENT_MESSAGE") {
        modalData.okShow = false;
        delete modalData.cta_button;
        delete modalData.confirmAction;
        delete modalData.okMessage;
        delete modalData.fields;
      }

      modalData.id = modalId;

      /*Check headline or message if contains double bracket then not show popup*/
      let isHasBracketCharacter = (modalData?.msg?.indexOf("{{") >= 0) || (modalData?.headline?.indexOf("{{") >= 0);
      if (isHasBracketCharacter) {
        isShowLog && console.log("OS Logging::: Not show popup because headline or message contains bracket => special character");
        return;
      }

      let messString = modalData?.msg || "";
      // not support in browser old version
      // messString = messString?.replaceAll("{{", "(");
      // messString = messString?.replaceAll("}}", ")");

      // support old version
      messString = messString?.split("{{")?.join("(");
      messString = messString?.split("}}")?.join(")");
      modalData.msg = messString;

      let headLineString = modalData?.headline || "";
      // not support in browser old version
      // headLineString = headLineString?.replaceAll("{{", "(");
      // headLineString = headLineString?.replaceAll("}}", ")");

      // support old version
      headLineString = headLineString?.split("{{")?.join("(");
      headLineString = headLineString?.split("}}")?.join(")");
      modalData.headline = headLineString;

      var modal;
      switch (event.data.type) {
        case "DRIVE_TRAFFIC" :
          modal = new pathfora.Message(modalData);
          break;
        case "COLLECT_LEADS" :
          modal = new pathfora.Form(modalData);
          break;
        case "PRESENT_MESSAGE" :
          modal = new pathfora.Message(modalData);
          break;
        default:
          modal = null;
          break;
      }

      isShowLog && console.log("OS Logging::: Pathfora Modal Data:: ", modal);


      if (modal) {
        window.pathfora.initializeWidgets([modal]);

        PrimeOnsiteSDK.ackPopupForServer(event);
      }
    },
    /**
     * Load styling and script of pathfora lib into head tag DOM
     * @param config
     */
    loadConfigPathfora: function (config) {

      const css = `
  .pf-widget-headline {
    line-height: 35px;
  }
  
  @font-face {
      src: url("${config.endpoint}/fonts/Gilroy-Medium.woff2") format("woff2");
      font-display: swap;
      font-family: "Gilroy";
      font-style: normal;
      font-weight: 500;
  }
  @font-face {
      src: url("${config.endpoint}/fonts/Gilroy-Bold.woff2") format("woff2");
      font-display: swap;
      font-family: "Gilroy";
      font-style: normal;
      font-weight: 700;
  }
  @font-face {
      src: url("${config.endpoint}/fonts/Gilroy.woff2") format("woff2");
      font-display: swap;
      font-family: "Gilroy";
      font-style: normal;
      font-weight: 400;
  }
  @font-face {
      src: url("${config.endpoint}/fonts/Gilroy-Light.woff2") format("woff2");
      font-display: swap;
      font-family: "Gilroy";
      font-style: normal;
      font-weight: 300;
  }
  @font-face {
      font-family: "Gilroy";
      font-display: swap;
      font-style: normal;
      font-weight: bold;
      src: url("${config.endpoint}/fonts/SVN-Gilroy SemiBold.otf");
  }
  
  .primedata-cdp-popup-onsite-wrapper {
    font-family: Gilroy, "svgGilroy" !important;
  }
`;
      SDKUtils.appendStyle(css);
      SDKUtils.loadStyle(config.stylePathfora);
      SDKUtils.loadScript(config.jsPathfora, null);
    },
    /**
     * Listener worker service receive message
     * @param workerStatic
     */
    workerListener: function (workerStatic) {

      if (workerStatic) {
        workerStatic.port.onmessage = event => {
          switch (event.data.type) {
            case "WSState":
              webSocketState = event.data.state;
              break;

            case "message":
              PrimeOnsiteSDK.handleMessageFromPort(event.data, event.data.tabId);
              break;

            case "setup":
              isShowLog && console.log("OS Logging:: setup - workerStatic.port.onmessage: ", event.data);
              break;

            case "notification":
              isShowLog && console.log("OS Logging:: notification - workerStatic.port.onmessage: ", event.data);
              break;

            case "check_live":
              clearTimeout(timeoutWorker);
              break;

            default:
              break;
          }
        };
      }
    },
    /**
     * Listener broadcast channel send message
     */
    broadcastChannelListener: function () {

      broadcastChannel = new BroadcastChannel(PrimeOnsiteSDK.onsiteOpts.channelBroadcastName);

      broadcastChannel.addEventListener("message", event => {
        switch (event.data.type) {
          case "WSState":
            webSocketState = event.data.state;
            break;

          case "message":
            isShowLog && console.log("OS Logging:: message - broadcastChannel.onmessage: ", event.data);
            PrimeOnsiteSDK.handleBroadcast(event.data);
            break;

          case "setup":
            isShowLog && console.log("OS Logging:: setup - broadcastChannel.onmessage: ", event.data);
            break;

          case "communication-ping":
            isShowLog && console.log("OS Logging:: communication - tab id: ", sessionStorage.getItem("cdp_tab_id"));
            broadcastChannel.postMessage({
              type: "communication-pong",
              tabId: sessionStorage.getItem("cdp_tab_id"),
              status: document.readyState,
              visible: document.visibilityState,
              isHidden: document.hidden
            });
            break;

          default:
            break;
        }
      });
    },
    /**
     * Receive message from broadcast channel and delivery to pathfora
     * @param data
     */
    handleBroadcast: function (data) {
      isShowLog && console.log("OS Logging::: handleBroadcast Log::: ", data);
      // var currentPopup = sessionStorage.getItem("posjs_modal_curr_id");
      // isShowLog && console.log("OS Logging::: current_popup_id Log::: ", currentPopup);
      var node = data?.data?.id ? document.getElementById(data.data.id) : null;
      if (!node) {
        // var id = SDKUtils.uuidByte();

        isShowLog && console.log("ShowPopup - document.readyState: ", document.readyState);
        // isShowLog && console.log("OS Logging::: push data popup to queue: ", data, id);

        if (document.readyState === "complete") {
          const hasPopupShowing = localStorage.getItem("isPopupShowing");
          if (hasPopupShowing || hasPopupShowing === "true") {
            isShowLog && console.log("ShowPopup - Has popup showing - Break function");
            return;
          }
          isShowLog && console.log("OS Logging::: Show popup now: ", data, data?.data?.id);
          PrimeOnsiteSDK.showPopupOnSite(data.data, data?.data?.id);
          // sessionStorage.setItem("posjs_modal_curr_id", data?.id);
        }

      }
    },
    /**
     * Receive message from another client browser tab
     * @param data
     * @param id
     */
    handleMessageFromPort: function (data, id) {
      isShowLog && console.log("OS Logging:: Receive message from tabId: ", id, " with message data: ", data);
      PrimeOnsiteSDK.handleBroadcast(data);
    },
    postMessageToWSServer: function (input, id) {
      if (webSocketState === WebSocket.CONNECTING) {
        isShowLog && console.log("Still connecting to the server, try again later!");
      } else if (
        webSocketState === WebSocket.CLOSING ||
        webSocketState === WebSocket.CLOSED
      ) {
        isShowLog && console.log("Connection Closed!");
      } else {
        worker.port.postMessage({
          // Include the sender information as a uuid to get back the response5
          from: id,
          data: input
        });
      }
    },
    /**
     * Handle get action from popup after show successful
     * @param messageId
     * @param status
     */
    handleCampaignResponse: function (messageId, status) {
      var request = PrimeOnsiteSDK.onsiteOpts.endpoint + "/v1/message/response?content_type=web_popup" +
        "&message_id=" + messageId +
        "&status=" + status +
        "&session_id=" + SDKUtils.getCookie("XSessionId");
      isShowLog && console.log("OS Logging:: handleCampaignResponse", request);
      fetch(request, {method: "POST"}).then(response => {
        if (!response || response.status !== 200) throw response;
      }).catch(error => {
        isShowLog && console.error("ERROR: ", error);
      });
      if (status === PrimeOnsiteSDK.eventStatusEnum.visited || status === PrimeOnsiteSDK.eventStatusEnum.closed) {
        // sessionStorage.removeItem("posjs_modal_curr_id");
      }
    },
    /**
     * Prepare data => create a client_id to init socket connection
     * @param config
     * @param client_id
     */
    prepareDataToInitSocket: function (config, client_id) {
      isShowLog && console.log("Logging::: prepareDataToInitSocket ClientID::: ", client_id);

      const headers = {
        x_client_id: config.source,
        x_client_access_token: config.writeKey
      };

      PrimeOnsiteSDK.loadConfigPathfora(config);
      var authDataObject = {...headers, client_id};
      localStorage.setItem(config.storageKey, JSON.stringify(authDataObject));
      worker = !worker && PrimeOnsiteSDK.loadWorkerStatic(config, authDataObject);
    },
    /**
     * Setup interceptor network request to catchup profile by context
     * @param ee
     * @returns {*}
     */
    interceptorNetworkRequests: function (ee) {
      const open = XMLHttpRequest.prototype.open;
      const send = XMLHttpRequest.prototype.send;

      const isRegularXHR = open.toString().indexOf("native code") !== -1;

      if (isRegularXHR) {
        XMLHttpRequest.prototype.open = function () {
          ee.onOpen && ee.onOpen(this, arguments);
          if (ee.onLoad) {
            this.addEventListener("load", ee.onLoad.bind(ee));
          }
          if (ee.onError) {
            this.addEventListener("error", ee.onError.bind(ee));
          }
          return open.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function () {
          ee.onSend && ee.onSend(this, arguments);
          return send.apply(this, arguments);
        };
      }

      return ee;
    },
    /**
     * Init connection with service-worker by data from local
     * @param config
     */
    initConnectionBySW: function (config) {
      isShowLog && console.log("Logging::: initConnectionBySW Log::: ", config);
      const storageString = localStorage.getItem(config.storageKey);
      const authDataObject = JSON.parse(storageString);
      // CR Update client_id generated by uuid. Not use profileId and sessionId.
      // const SEPARATOR = "___";
      // var client_id = config.profileId + SEPARATOR + config.sessionId;
      var client_id = authDataObject && authDataObject.client_id;
      if (!authDataObject || !authDataObject.client_id) {
        client_id = uuid();
      }

      PrimeOnsiteSDK.prepareDataToInitSocket(config, client_id);
      // PrimeOnsiteSDK.loadWorkerStatic(config, authDataObject);
    },
    /**
     * Init onsite SDK which SharedWorker on browsers not supported
     */
    initOnsiteSDKNotUsingSharedWorker: function (opt) {
      isShowLog && console.log("Logging::: initOnsiteSDKNotUsingSharedWorker Log::: ", opt);
      let client_id = sessionStorage.getItem("cdp_client_id");

      if (!client_id) {
        client_id = uuid();
        sessionStorage.setItem("cdp_client_id", client_id);
      }

      const storageConfig = {
        client_id: client_id,
        x_client_access_token: opt.writeKey,
        x_client_id: opt.source
      };

      client_id && analytics.track("reached_channel", {"onsite": {"notification_token": client_id}});
      localStorage.setItem("posjs-profile", JSON.stringify(storageConfig));

      const socketUrl = opt.SSL + "://" + opt.HOST + "/ws/register/" + client_id + "/" + opt.source + "/" + opt.writeKey;
      // Open a connection. This is a common connection. This will be opened only once.
      const ws = new WebSocket(socketUrl);
      isShowLog && console.log("OS Logging:: Status ws: ", ws);
      // Let all connected contexts(tabs) know about state changes
      ws.onopen = () => {
        isShowLog && console.log("OS Logging:: Status onopen", ws);
        websocket = ws;
      };
      ws.onclose = () => {
        isShowLog && console.log("OS Logging:: Status onclose", ws);
      };

      // When we receive data from the server.
      ws.onmessage = ({data}) => {
        isShowLog && console.log("OS Logging:: onmessage", data);
        // Construct object to be passed to handlers
        const parsedData = {data: JSON.parse(data), type: "message"};
        if (!parsedData.data.from) {
          // Broadcast to all contexts(tabs). This is because no particular id was set on the from field here. We're using this field to identify which tab sent the message
          // bcChannel.postMessage(parsedData);
          PrimeOnsiteSDK.handleBroadcast(parsedData);
        } else {
          // Get the port to post to using the uuid, ie send to expected tab only.
          // idToPortMap[parsedData.data.from].postMessage(parsedData);
        }
      };
    },
    /**
     * Load config env from system and init worker, socket connection
     */
    initOnsiteSDK: function () {
      isShowLog && console.log("initOnsiteSDK - document.readyState: ", document.readyState);
      const configEnv = window.ec;
      isShowLog && console.log("Logging::: initOnsiteSDK Log::: ", configEnv, options);
      var opt = {
        ...options
      };
      opt.SSL = configEnv.REACT_APP_WS_SSL;
      opt.HOST = configEnv.REACT_APP_WS_URL;
      opt.stylePathfora = configEnv.REACT_APP_WS_PATHFORA_STYLE_URL;
      opt.jsPathfora = configEnv.REACT_APP_WS_PATHFORA_SCRIPT_URL;
      opt.storageKey = configEnv.REACT_APP_WS_STORAGE_KEY;
      opt.storageWorkerUrlKey = configEnv.REACT_APP_WS_URL_WORKER_STORAGE_KEY;
      opt.channelBroadcastName = configEnv.REACT_APP_WS_BROADCAST_CHANNEL_NAME;
      PrimeOnsiteSDK.onsiteOpts = opt;

      const sharedWorkerIsSupported = SDKUtils.sharedWorkerIsSupported();
      isShowLog &&
      console.log(
        SDKUtils.styleLogging.prefixLog,
        sharedWorkerIsSupported ? SDKUtils.styleLogging.infoStyleLog : SDKUtils.styleLogging.warningStyleLog,
        "Logging::: SharedWorker status::: ",
        sharedWorkerIsSupported ?
          "Great, your browser supports web shared workers" :
          "Your browser not supported web shared workers. But don't worry, I can implement it works on your browser but have some limits like not working when you open more than 7 tabs in the same browser"
      );
      if (sharedWorkerIsSupported) {
        PrimeOnsiteSDK.initConnectionBySW(opt);
        PrimeOnsiteSDK.broadcastChannelListener();
      }

      if (!sharedWorkerIsSupported) {
        PrimeOnsiteSDK.loadConfigPathfora(opt);
        PrimeOnsiteSDK.initOnsiteSDKNotUsingSharedWorker(opt);
      }
    }
  };

  SDKUtils.loadScript(options.endpoint + "/ec.js", PrimeOnsiteSDK.initOnsiteSDK);

  if (!options.profileId && !options.sessionId) {
    setTimeout(() => {
      let profileId = localStorage.getItem("prime_profile_id");
      let sessionId = localStorage.getItem("prime_session_id");
      isShowLog && console.log("Logging::: sessionId: ", sessionId, ", profileId: ", profileId);
      options.profileId = profileId;
      options.sessionId = sessionId;
      isShowLog && console.log("Logging::: Init Web Onsite with options Log::: ", options);
    }, 3000);
  }

};
module.exports = WebOnsitePrimeSDK;
},{"./prime-utils":112,"uuid/v4":101}],110:[function(require,module,exports){
var PrimeRecommendation = {
  initWebComponent: function (_options) {
    console.log('log::3 initWebComponent', _options)
    window.customElements.define("product-recommendations", ProductRecommendations);
  }
};

class ProductRecommendations extends HTMLElement {
  get profileId() {
    return this.hasAttribute("profile-id");
  }

  constructor() {
    super();
    this.addEventListener("click", e => {
      alert("You Clicked Me!");
    });
    this.innerText = "Hello There!";
  }

  static get observedAttributes() {
    return ["profile-id"];
  }

  connectedCallback() {
    if (this.profileId) {
      let profileId = this.attributes["profile-id"].value;
      let recipeId = this.attributes["recipe-id"].value;
      this.innerHTML = `
<div>
<!--  <p style="text-align: center">Profile ID: <a href="https://dev.primedata.ai/Prime/en/audience/user-profile/${profileId}" target="_blank" rel="nofollow"><strong>${profileId}</strong></a></p>-->
<!--  <p style="text-align: center">Recipe ID: <a href="https://dev.primedata.ai/Prime/en/recommendation/edit/${recipeId}" target="_blank" rel="nofollow"><strong>${recipeId}</strong></a></p>-->
  <iframe id="${recipeId}" name="${recipeId}" src="https://prime-tools-ghp.primedatacdp.com/testing/product/recommendation-product-list.html" width="100%" height="460" frameBorder="0">Browser not compatible. </iframe>
</div>
`;
      console.log("RecommendationProductList HTML custom: ", this);
      const rec = document.getElementById(recipeId);

      if (rec) {
        rec.addEventListener("load", () => {
          const transportEventData = {
            type: "transport", data: {
              profileId: profileId, recipeId: recipeId
            }
          };
          rec.contentWindow.postMessage(transportEventData, "*" || window.location.origin);
        });
      }
    } else this.innerHTML = "No profile id";
  }

  attributeChangedCallback(_name, _oldValue, _newValue) {

  }
}

module.exports = PrimeRecommendation;
},{}],111:[function(require,module,exports){
//Refs: https://localforage.github.io/localForage
const localforage = require("localforage");

// This will use a different driver order.
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  version: 1.0,
  name: "primedata_sdk",
  description: "This is storage data support JS SDK work powerful",
});


// Create table 1 in primedata_sdk is device
var primeDeviceStorage = localforage.createInstance({
  name        : "primedata_sdk",
  storeName   : 'device',
  description: "Device information",
});


module.exports = {
  localforage,
  deviceStorage: primeDeviceStorage,
}
},{"localforage":68}],112:[function(require,module,exports){
var SDKUtils = {
  styleLogging: {
    prefixLog: "%c[PrimeData JS-SDK]: %s",
    errorStyleLog: "color: red; font-size: 16px; font-weight: bold",
    successStyleLog: "color: red; font-size: 16px; font-weight: bold",
    infoStyleLog: "color: red; font-size: 16px; font-weight: bold",
    warningStyleLog: "color: red; font-size: 16px; font-weight: bold"
  },
  /**
   * Generate uuid
   * @returns {string}
   */
  uuidByte: function () {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
  },

  /**
   * Check service-worker file path is valid?
   * @param {string} string - is the service-worker.js path
   * @returns {boolean|*}
   */
  isValidUrlSW: function (string) {
    if (!string) return false;
    if (string === "undefined") return false;
    if (string === "null") return false;
    if (string === "") return false;
    return string.includes("http");
  },

  /**
   * Add style css into the end of the head tag
   */
  appendStyle: function (cssString) {
    var head = document.head || document.getElementsByTagName("head")[0],
      style = document.createElement("style");

    head.appendChild(style);

    style.type = "text/css";
    if (style.styleSheet) {
      // This is required for IE8 and below.
      style.styleSheet.cssText = cssString;
    } else {
      style.appendChild(document.createTextNode(cssString));
    }
  },

  /**
   * Load style css into head html tag
   * @param {string} path - link css you want to load into head tag
   * @param fn
   * @param scope
   * @returns {HTMLLinkElement}
   */
  loadStyle: function (path, fn, scope) {
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.setAttribute("href", path);
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");

    var sheet, cssRules;

    if ("sheet" in link) {
      sheet = "sheet";
      cssRules = "cssRules";
    } else {
      sheet = "styleSheet";
      cssRules = "rules";
    }

    var interval_id = setInterval(function () {
        try {
          if (link[sheet] && link[sheet][cssRules].length) {
            clearInterval(interval_id);
            clearTimeout(timeout_id);
            fn && fn.call(scope || window, true, link);
          }
        } catch (e) {
        } finally {
        }
      }, 10),
      timeout_id = setTimeout(function () {
        clearInterval(interval_id);
        clearTimeout(timeout_id);
        head.removeChild(link);
        fn && fn.call(scope || window, false, link);
      }, 15000);

    head.appendChild(link);
    return link;
  },

  /**
   * Load script into head tag html
   * @param {string} src - Link script to load into head tag
   * @param cb
   */
  loadScript: function (src, cb) {
    var newScript = document.createElement("script");
    newScript.type = "text/javascript";
    newScript.setAttribute("async", "true");
    newScript.setAttribute("src", src);

    if (newScript.readyState) {
      newScript.onreadystatechange = function () {
        if (cb && /loaded|complete/.test(newScript.readyState)) cb();
      };
    } else {
      cb && newScript.addEventListener("load", cb, false);
    }

    document.documentElement.firstChild.appendChild(newScript);
  },

  /**
   * Convert rbg string to hex color
   * @param {string} rgbStr - string color
   * @returns {string}
   */
  rgbStrToHex: function (rgbStr) {
    if (!rgbStr || rgbStr === "") return "";
    if (rgbStr.indexOf("(") < 0 && rgbStr.indexOf(")") < 0) return rgbStr;
    if (rgbStr === "transparent") return "0x00000000";
    var a = rgbStr.split("(")[1].split(")")[0];
    a = a.split(",");
    const b = a.map(function (x) {             //For each array element
      x = parseInt(x).toString(16);      //Convert to a base16 string
      return (x.length === 1) ? "0" + x : x;  //Add zero if we get only one character
    });
    b.splice(3, 1);
    return "#" + b.join("");
  },

  /**
   * get cookie by key
   * @param {string} cname - cookie name need get value
   * @returns {string}
   */
  getCookie: function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },

  /**
   * getLocalStorageByKey
   * @param {string} key
   * @returns {string}
   */
  getLocalStorageByKey: function (key) {
    if (!(key in window.localStorage)) {
      console.log(SDKUtils.styleLogging.prefixLog, SDKUtils.styleLogging.errorStyleLog, key + " localStorage not found this key!");
    }
    return window.localStorage.getItem(key);
  },

  /**
   * getSessionStorageByKey
   * @param {string} key
   * @returns {string}
   */
  getSessionStorageByKey: function (key) {
    if (!(key in window.sessionStorage)) {
      console.log(SDKUtils.styleLogging.prefixLog, SDKUtils.styleLogging.errorStyleLog, key + " sessionStorage not found this key!");
    }
    return window.sessionStorage.getItem(key);
  },

  /**
   * getUrlParams
   * @param {string || null} url
   * @returns {{}}
   */
  getUrlParams: function (url) {
    var urlParam = url ? url : (window.location.href || "");

    var queryString = urlParam.substring(urlParam.indexOf("?"), urlParam.length);
    const urlParams = new URLSearchParams(queryString);
    const entries = urlParams.entries();

    var searchParamsJson = {};
    for (var i = 0; i < entries.length - 1; i++) {
      var entry = entries[i];
      searchParamsJson[entry[0]] = entry[1];
    }

    return searchParamsJson;

  },

  /**
   * getSearchParamFromUrl
   * @param urlParam
   * @returns {{}|null}
   */
  getSearchParamFromUrl: function (urlParam){
    if (urlParam.indexOf("?") === -1) {
      return null;
    }

    const queryString = urlParam.substring(urlParam.indexOf("?"), urlParam.length);

    const urlParams = new URLSearchParams(queryString);

    const // keys = urlParams.keys(),
      // values = urlParams.values(),
      entries = urlParams.entries();

    // for (const key of keys) console.table(key);

    // for (const value of values) console.table(value);

    let objectJson = {};
    for (const entry of entries) {
      objectJson[entry[0]] = entry[1];
    }

    return objectJson;
  },

  /**
   * getDevicesInfo: get IP, platform, network, user-agent, ...
   * @returns {{}}
   */
  getDevicesInfo: function () {
    const defaultValue = "";
    const width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    const height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;
    return {
      language: navigator.language,
      network: navigator.connection.type || navigator.connection.effectiveType || defaultValue,
      browser: {
        appCodeName: navigator.appCodeName,
        version: navigator.appVersion || defaultValue,
        platform: navigator.platform || defaultValue,
        cookieEnabled: navigator.cookieEnabled,
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        userAgent: navigator.userAgent
      },
      screen: {
        width: width,
        height: height
      },
      vendor: navigator.vendor
    };
  },

  /**
   * setUniversalEventTracker
   * @param trigger, ex: "hover", "click"
   * @param {string} selectorElement, ex: ".className", "#idName"
   * @param {func} func
   */
  setUniversalEventTracker: function (trigger, selectorElement, func) {
    if (!func) {
      console.log(SDKUtils.styleLogging.prefixLog, SDKUtils.styleLogging.errorStyleLog, "'func' parameter not found!");
      return;
    }

    var listDoms = document.querySelectorAll(selectorElement);

    listDoms.forEach(function (nodeItem) {
      nodeItem.addEventListener(trigger, function (e) {
        func(nodeItem, e);
      });
    });
  },

  /**
   * trackClickByAttr
   * @param attr
   */
  trackClickByAttr: function (attr) {
    function trackingDataByEvent(event, nodeItem) {
      const listAttr = nodeItem.attributes;

      var arrAttr = [];
      for (var i = 0; i < listAttr.length; i++) {
        var item = listAttr[i];
        arrAttr.push(item.name + "_" + item.value);
      }


      console.log(SDKUtils.styleLogging.prefixLog, SDKUtils.styleLogging.successStyleLog, "Track successfully!");
    }

    document.onreadystatechange = function () {
      if (document.readyState === "complete") {
        var listDomHaveAttr = document.querySelectorAll("[" + attr + "]");

        listDomHaveAttr.forEach(function (nodeItem) {
          nodeItem.addEventListener("click", function () {
            trackingDataByEvent("EVENT_NAME.searched", nodeItem);
          });
        });
      }
    };
  },

  /**
   * Catchup profile_id, session_id from init context request
   * @param xhr
   * @param bodyRequest
   * @returns {Promise<void>}
   */
  catchupProfile: async function (xhr, bodyRequest) {
    var repeatedInterval = setInterval(function () {
      try {
        var status = xhr.status;
        var isContextResponse = xhr.responseURL.includes("/context");
        var isInitSDKXhr = JSON.parse(bodyRequest[0]).events[0].eventType === "view";
        if (status === 200 && isContextResponse && isInitSDKXhr) {
          const response = JSON.parse(xhr.response) || xhr.response;
          localStorage.setItem("prime_profile_id", response.profileId);
          localStorage.setItem("prime_session_id", response.sessionId);
          clearInterval(repeatedInterval);
        }

        if (status !== 0 || !isInitSDKXhr) clearInterval(repeatedInterval);
      } catch (e) {
        clearInterval(repeatedInterval);
      }

    }, 1000);
  },
  /**
   * Setup interceptor network request to catchup profile by context
   * @param ee
   * @returns {*}
   */
  interceptorNetworkRequests: function (ee) {
    const open = XMLHttpRequest.prototype.open;
    const send = XMLHttpRequest.prototype.send;

    const isRegularXHR = open.toString().indexOf("native code") !== -1;

    if (isRegularXHR) {
      XMLHttpRequest.prototype.open = function () {
        ee.onOpen && ee.onOpen(this, arguments);
        if (ee.onLoad) {
          this.addEventListener("load", ee.onLoad.bind(ee));
        }
        if (ee.onError) {
          this.addEventListener("error", ee.onError.bind(ee));
        }
        return open.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function () {
        ee.onSend && ee.onSend(this, arguments);
        return send.apply(this, arguments);
      };
    }

    return ee;
  },
  trackReachedChannel: function (options) {
    if (options && options.webPopup && options.webPopup.enabled) {
      const configStore = JSON.parse(localStorage.getItem("posjs-profile") || "{}");
      const client_id = configStore?.client_id;
      client_id && window.follower.track("reached_channel", {"onsite": {"notification_token": client_id}});
    }

    if (options && options.webPush && options.webPush.enabled) {
      const browser_token = localStorage.getItem("notification_token");
      browser_token && window.follower.track("reached_channel", {"web_push": {"notification_token": browser_token}});
    }

  },
  sharedWorkerIsSupported: function () {
    if (typeof (SharedWorker) !== "undefined") {
      return true;
    } else {
      return false;
    }
  },
  detectAdBlock: async function (options) {
    const configs = options.detectAdBlock;

    function renderUIWarning(isBlocked, key) {

      if (isBlocked) {
        const closeButtonLabel = `<div style="padding-left: ${configs.closeButtonLabel ? "6px" : "0px"}">${configs.closeButtonLabel}</div>`;

        let domHtml = `
<div id="cdp_primedata-warning_ads_blocked" class="cdp_primedata-warning-block">
    <div class="cdp_primedata-warning-text">
        ${configs.bannerMessage}
    </div>
    <button id="cdp_primedata_close_warning" class="cdp_primedata-btn-close">
      <div style="display:flex; justify-content: center;">
        <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="16px" id="cdp_primedata_icon-close-svg" viewBox="0 0 512 512" width="16px" xml:space="preserve"><path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/></svg>  
      </div>
      ${configs.closeButtonLabel && closeButtonLabel}
    </button>
</div>`;

        document.body.insertAdjacentHTML("afterbegin", domHtml);

        let css = `
<style>
.cdp_primedata-warning-block {
    display: flex; flex-wrap: wrap; padding: 12px 24px;background: #cca556;color: #000;width: 100%;
}

.cdp_primedata-warning-text {
    padding-right: 12px; display: flex;align-items: center;align-content: center;
}

.cdp_primedata-btn-close {
    cursor: pointer; 
    text-transform: uppercase; 
    color: #fff; 
    background: #845a12; 
    padding: 4px 8px; 
    border-radius: 4px; 
    border: unset;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
}
</style>`;
        document.head.insertAdjacentHTML("beforeend", css);

        document.getElementById("cdp_primedata_close_warning").addEventListener("click", function () {
          document.getElementById("cdp_primedata-warning_ads_blocked")?.remove();
          localStorage.setItem(key, "true");
        });
      }

      if (!isBlocked) {
        document.getElementById("cdp_primedata-warning_ads_blocked")?.remove();
      }
    }

    const hide_warning_ad_blocked = "cdp_primedata_ads_block";
    let isHideWarning = localStorage.getItem(hide_warning_ad_blocked) === "true";
    let adBlockEnabled = false;
    const googleAdUrl = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    try {
      await fetch(new Request(googleAdUrl)).catch(_ => adBlockEnabled = true);
    } catch (e) {
      adBlockEnabled = true;
    } finally {
      console.log(`CDP PrimeData: AdBlock Enabled: ${adBlockEnabled}`);
      !isHideWarning && renderUIWarning(adBlockEnabled, hide_warning_ad_blocked);
    }
  }
};
/**
 * Expose the `SDKUtils` constructor.
 */
module.exports = SDKUtils;
},{}],113:[function(require,module,exports){
var SDKUtils = require("./prime-utils");
var styleLogging = SDKUtils.styleLogging;

var WebPushPrimeSDK = function (options, analytics) {
  var isShowLog = options.showLogs || false;
  if (!options) {
    isShowLog && console.log(styleLogging.prefixLog, styleLogging.errorStyleLog, "Options configuration is required!");
    return;
  }
  var PrimePushSDK = {
    endpoint: options.endpoint,
    eventStatusEnum: {
      viewed: "viewed",
      clicked: "clicked",
      closed: "closed",
      unsubscribed: "unsubscribed"
    },
    firebaseMessagingSwUrl: options.firebaseMessagingSwUrl,
    notification_token: "",
    /**
     * Receive message from firebase
     */
    receiveMessage: function () {
      var messaging = firebase.messaging();

      // [START messaging_receive_message]
      // Handle incoming messages. Called when:
      // - a message is received while the app has focus
      // - the user clicks on an app notification created by a service worker
      //   `messaging.onBackgroundMessage` handler.
      var enableForegroundNotification = true;
      isShowLog && console.log("ReceiveMessageInit");
      messaging.onMessage(function (payload) {

        if (enableForegroundNotification) {

          // read cookies value
          isShowLog && console.log("[web-push-sdk.js] XSessionId:", SDKUtils.getCookie("XSessionId"));

          var data = payload.data;
          var actions = JSON.parse(data.Actions || "[]").map((el, index) => ({
            ...el,
            action: "p-cta-" + index
          }));
          var messageId = data.ID;
          var options = {
            ...data,
            body: data.Message,
            icon: data.Icon,
            image: data.Image,
            requireInteraction: data.RequireInteraction === "true" || data.RequireInteraction === true,
            vibrate: [100, 50, 100],
            actions: actions
          };
          isShowLog && console.log("[web-push-sdk.js] Received foreground message ", {title: data.Title, ...options});

          navigator.serviceWorker
            .getRegistrations()
            .then((registration) => {

              registration[0].addEventListener("notificationclick", function (event) {
                isShowLog && console.log("[web-push-sdk.js] On action click", event);
                PrimePushSDK.handleCampaignResponse(messageId, PrimePushSDK.eventStatusEnum.clicked);
                event.notification.close();

                var cta = actions.find(el => el.action === event.action);
                isShowLog && console.log("[web-push-sdk.js] Cta", cta);
                cta && cta.deep_link && clients.openWindow(cta.deep_link);

              }, false);

              PrimePushSDK.handleCampaignResponse(messageId, PrimePushSDK.eventStatusEnum.viewed);
              registration[0].showNotification(data.Title, options);
            });
        }
      });
      // [END messaging_receive_message]
    },
    /**
     * Get token of browser client to send push notification
     */
    getToken: function () {
      var messaging = firebase.messaging();

      // [START messaging_get_token]
      // Get registration token. Initially this makes a network call, once retrieved
      // subsequent calls to getToken will return from cache.
      messaging.getToken()
        // messaging.getToken({vapidKey: VAPID_KEY})
        // console.log("log::69 getToken", token);
        .then((currentToken) => {
          if (currentToken) {
            // Send the token to your server and update the UI if necessary
            PrimePushSDK.notification_token = currentToken;
            analytics.track("reached_channel", {"web_push": {"notification_token": currentToken}});
            localStorage.setItem("notification_token", currentToken);
            isShowLog && console.log("Token generated: \"" + currentToken + "\"");
          } else {
            // Show permission request UI
            isShowLog && console.log("No registration token available. Request permission to generate one.");
          }
        }).catch((err) => {
        isShowLog && console.error("An error occurred while retrieving token. ", err);
      });
      // [END messaging_get_token]
    },
    /**
     * Request permission to show notification on browser
     */
    requestPermission: function () {
      // // [START messaging_request_permission]
      var messaging = firebase.messaging();
      messaging
        .requestPermission()
        .then(function () {
          isShowLog && console.log("Notification permission granted.");
        })
        .catch(function (err) {
          isShowLog && console.log("Unable to get permission to notify.", err);
        });
      // // [END messaging_request_permission]
    },
    /**
     * Delete token browser
     */
    deleteToken: function () {
      var messaging = firebase.messaging();

      // [START messaging_delete_token]
      messaging.deleteToken().then(() => {
        isShowLog && console.log("Token deleted.");
        // ...
      }).catch((err) => {
        isShowLog && console.log("Unable to delete token. ", err);
      });
      // [END messaging_delete_token]
    },
    /**
     * Init web push, request permission and trigger receive message function
     */
    initWebPushSDK: function () {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(PrimePushSDK.firebaseMessagingSwUrl).then(function (registration) {
          // Registration was successful
          var messaging = {};
          if (firebase.messaging.isSupported()) {
            messaging = firebase.messaging();
          }
          messaging.useServiceWorker(registration);
          messaging.getToken().then(function (currentToken) {
            PrimePushSDK.notification_token = currentToken;
            isShowLog && console.log("Token generated: \"" + currentToken + "\"");
            localStorage.setItem("notification_token", currentToken);
            analytics.track("reached_channel", {"web_push": {"notification_token": currentToken}});
          });
          isShowLog && console.log("ServiceWorker registration successful with scope: ", registration.scope);

        }, function (err) {
          // registration failed :(
          isShowLog && console.log("ServiceWorker registration failed: ", err);
        });
      }
      PrimePushSDK.requestPermission();
      PrimePushSDK.receiveMessage();
    },
    /**
     * Handle track event from notification message viewed, closed, clicked
     * @param messageId
     * @param status
     */
    handleCampaignResponse: function (messageId, status) {
      var request = PrimePushSDK.endpoint + "/v1/message/response?content_type=web_push" +
        "&message_id=" + messageId +
        "&status=" + status +
        "&session_id=" + SDKUtils.getCookie("XSessionId");
      fetch(request, {method: "POST"}).then(response => {
        if (!response || response.status !== 200) throw response;
      }).catch(error => {
        console.error("ERROR: ", error);
      });
    }
  };
  PrimePushSDK.initWebPushSDK();
};
module.exports = WebPushPrimeSDK;
},{"./prime-utils":112}]},{},[104])(104)
});
