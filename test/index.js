var define = require('../');
var test = require('tape');
var keys = require('object-keys');

var arePropertyDescriptorsSupported = function () {
	var obj = { a: 1 };
	try {
		Object.defineProperty(obj, 'x', { value: obj });
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var descriptorsSupported = !!Object.defineProperty && arePropertyDescriptorsSupported();

test('defineProperties', function (dt) {

	dt.test('with descriptor support', { skip: !descriptorsSupported }, function (t) {
		var getDescriptor = function (value) {
			return {
				configurable: true,
				enumerable: false,
				writable: true,
				value: value
			};
		};

		var obj = {
			a: 1,
			b: 2,
			c: 3
		};
		t.deepEqual(keys(obj), ['a', 'b', 'c'], 'all literal-set keys start enumerable');
		define(obj, {
			b: 3,
			c: 4,
			d: 5
		});
		t.deepEqual(obj, {
			a: 1,
			b: 2,
			c: 3
		}, 'existing properties were not overridden');
		t.deepEqual(Object.getOwnPropertyDescriptor(obj, 'd'), getDescriptor(5), 'new property "d" was added and is not enumerable');
		t.deepEqual(['a', 'b', 'c'], keys(obj), 'new keys are not enumerable');

		define(obj, {
			a: 2,
			b: 3,
			c: 4
		}, {
			a: function () { return true; },
			b: function () { return false; }
		});
		t.deepEqual(obj, {
			b: 2,
			c: 3
		}, 'properties only overriden when predicate exists and returns true');
		t.deepEqual(Object.getOwnPropertyDescriptor(obj, 'd'), getDescriptor(5), 'existing property "d" remained and is not enumerable');
		t.deepEqual(Object.getOwnPropertyDescriptor(obj, 'a'), getDescriptor(2), 'existing property "a" was overridden and is not enumerable');
		t.deepEqual(['b', 'c'], keys(obj), 'overridden keys are not enumerable');

		t.end();
	});

	dt.test('without descriptor support', { skip: descriptorsSupported }, function (t) {
		var obj = {
			a: 1,
			b: 2,
			c: 3
		};
		define(obj, {
			b: 3,
			c: 4,
			d: 5
		});
		t.deepEqual(obj, {
			a: 1,
			b: 2,
			c: 3,
			d: 5
		}, 'existing properties were not overridden, new properties were added');

		define(obj, {
			a: 2,
			b: 3,
			c: 4
		}, {
			a: function () { return true; },
			b: function () { return false; }
		});
		t.deepEqual(obj, {
			a: 2,
			b: 2,
			c: 3,
			d: 5
		}, 'properties only overriden when predicate exists and returns true');

		t.end();
	});

	dt.end();
});
