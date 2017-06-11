'use strict';

const QUnit = require('qunitjs'), test = QUnit.test, testModule = QUnit.module;
const Addon = require('ember-cli/lib/models/addon');
const Project = require('ember-cli/lib/models/project');
const Plugin = require('../../../lib/plugin');

testModule('Unit | Plugin');

test('Addon parent', function(assert) {
  let parent = Object.create(Addon.prototype);
  let plugin = new Plugin(parent);
  assert.ok(plugin.isForAddon());
  assert.notOk(plugin.isForApp());
});

test('App parent', function(assert) {
  let parent = Object.create(Project.prototype);
  let plugin = new Plugin(parent);
  assert.ok(plugin.isForApp());
  assert.notOk(plugin.isForAddon());
});

test('addPostcssPlugin() with no existing config', function(assert) {
  let config = {};
  let plugin = new Plugin();
  plugin.addPostcssPlugin(config, 'before', 'x');
  assert.deepEqual(config, {
    plugins: {
      before: ['x'],
      after: []
    }
  });
});

test('addPostcssPlugin() with existing array config', function(assert) {
  let config = { plugins: ['a'] };
  let plugin = new Plugin();
  plugin.addPostcssPlugin(config, 'before', 'x');
  assert.deepEqual(config, {
    plugins: {
      before: ['x'],
      after: ['a']
    }
  });
});

test('addPostcssPlugin() with existing full config', function(assert) {
  let config = { plugins: { after: ['a'], before: ['b'] } };
  let plugin = new Plugin();

  plugin.addPostcssPlugin(config, 'before', 'x');
  assert.deepEqual(config, {
    plugins: {
      before: ['x', 'b'],
      after: ['a']
    }
  });

  plugin.addPostcssPlugin(config, 'after', 'y');
  assert.deepEqual(config, {
    plugins: {
      before: ['x', 'b'],
      after: ['a', 'y']
    }
  });
});

test('addPostcssPlugin() with invalid type', function(assert) {
  let config = {};
  let plugin = new Plugin();

  assert.throws(() => plugin.addPostcssPlugin(config, 'foo', 'x'), /Unknown plugin type/);
});
