'use strict';

const QUnit = require('qunit'),
  test = QUnit.test,
  testModule = QUnit.module;
const Plugin = require('../../../lib/plugin');

testModule('Unit | Plugin');

test('Addon parent', function (assert) {
  let parent = { parent: {} };
  let plugin = new Plugin(parent);
  assert.ok(plugin.isForAddon());
  assert.notOk(plugin.isForApp());
});

test('App parent', function (assert) {
  let parent = {};
  let plugin = new Plugin(parent);
  assert.ok(plugin.isForApp());
  assert.notOk(plugin.isForAddon());
});

test('addPostcssPlugin() with no existing config', function (assert) {
  let config = {};
  let plugin = new Plugin();
  plugin.addPostcssPlugin(config, 'before', 'x', 'y', 'z');
  plugin.addPostcssPlugin(config, 'after', 'X', 'Y', 'Z');
  assert.deepEqual(config, {
    plugins: {
      before: ['x', 'y', 'z'],
      after: ['X', 'Y', 'Z'],
      postprocess: [],
    },
  });
});

test('addPostcssPlugin() with existing array config', function (assert) {
  let config = { plugins: ['a'] };
  let plugin = new Plugin();
  plugin.addPostcssPlugin(config, 'before', 'x', 'y', 'z');
  plugin.addPostcssPlugin(config, 'after', 'X', 'Y', 'Z');
  assert.deepEqual(config, {
    plugins: {
      before: ['x', 'y', 'z'],
      after: ['a', 'X', 'Y', 'Z'],
      postprocess: [],
    },
  });
});

test('addPostcssPlugin() with existing full config', function (assert) {
  let config = { plugins: { after: ['a'], before: ['b'], postprocess: ['z'] } };
  let plugin = new Plugin();
  plugin.addPostcssPlugin(config, 'before', 'x', 'y', 'z');
  plugin.addPostcssPlugin(config, 'after', 'X', 'Y', 'Z');
  assert.deepEqual(config, {
    plugins: {
      before: ['x', 'y', 'z', 'b'],
      after: ['a', 'X', 'Y', 'Z'],
      postprocess: ['z'],
    },
  });

  plugin.addPostcssPlugin(config, 'before', 'w');
  plugin.addPostcssPlugin(config, 'after', 'W');
  assert.deepEqual(config, {
    plugins: {
      before: ['w', 'x', 'y', 'z', 'b'],
      after: ['a', 'X', 'Y', 'Z', 'W'],
      postprocess: ['z'],
    },
  });
});

test('addPostcssPlugin() with invalid type', function (assert) {
  let config = {};
  let plugin = new Plugin();

  assert.throws(
    () => plugin.addPostcssPlugin(config, 'foo', 'x'),
    /Unknown plugin type/
  );
});
