'use strict';

const QUnit = require('qunit'),
  test = QUnit.test,
  testModule = QUnit.module;
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const sinon = require('sinon');
const PluginRegistry = require('../../../lib/plugin/registry');

testModule('Unit | PluginRegistry', {
  beforeEach() {
    sinon.stub(EmberApp, 'env').callsFake(() => 'mock-env');
  },

  afterEach() {
    EmberApp.env.restore();
  },
});

test('plugin discovery and instantiation', function (assert) {
  let parent = {
    addons: [
      {
        name: 'a',
        pkg: { keywords: [] },
        createCssModulesPlugin: (parent) =>
          new TestPlugin(parent, { name: 'a' }),
      },
      {
        name: 'b',
        pkg: { keywords: ['ember-css-modules-plugin'] },
        createCssModulesPlugin: (parent) =>
          new TestPlugin(parent, { name: 'b' }),
      },
    ],
  };

  let registry = new PluginRegistry(parent);
  assert.equal(registry.getPlugins().length, 1);
  assert.equal(registry.getPlugins()[0].name, 'b');
});

test('lint plugin discovery and instantiation', function (assert) {
  let parent = {
    isDevelopingAddon: () => true,
    addons: [
      {
        name: 'a',
        pkg: {
          keywords: [
            'ember-css-modules-plugin',
            'ember-css-modules-lint-plugin',
          ],
        },
        createCssModulesPlugin: (parent) =>
          new TestPlugin(parent, { name: 'a' }),
      },
    ],

    project: {
      addons: [
        {
          name: 'a',
          pkg: {
            keywords: [
              'ember-css-modules-plugin',
              'ember-css-modules-lint-plugin',
            ],
          },
          createCssModulesPlugin: (parent) =>
            new TestPlugin(parent, { name: 'already-in-addon' }),
        },
        {
          name: 'b',
          pkg: {
            keywords: [
              'ember-css-modules-plugin',
              'ember-css-modules-lint-plugin',
            ],
          },
          createCssModulesPlugin: (parent) =>
            new TestPlugin(parent, { name: 'b' }),
        },
      ],
    },
  };

  let registry = new PluginRegistry(parent);
  assert.equal(registry.getPlugins().length, 2);
  assert.equal(registry.getPlugins()[0].name, 'a');
  assert.equal(registry.getPlugins()[1].name, 'b');
});

test('warning when not returning a Plugin instance', function (assert) {
  let parent = {
    ui: { writeWarnLine: sinon.spy() },
    addons: [
      {
        name: 'a',
        pkg: { keywords: ['ember-css-modules-plugin'] },
        createCssModulesPlugin: () => 'ok',
      },
    ],
  };

  new PluginRegistry(parent).getPlugins();
  assert.ok(
    parent.ui.writeWarnLine.calledWith(
      'Addon a did not return a Plugin instance from its createCssModulesPlugin hook'
    )
  );
});

test('computing merged options', function (assert) {
  let parent = {
    ui: { writeWarnLine: sinon.spy() },
    addons: [
      {
        name: 'a',
        pkg: { keywords: ['ember-css-modules-plugin'] },
        createCssModulesPlugin: (parent) =>
          new TestPlugin(parent, {
            config(env) {
              return {
                env,
                extra: true,
                safe: 'clobbered',
              };
            },
          }),
      },
    ],
  };

  let registry = new PluginRegistry(parent);
  let options = registry.computeOptions({ safe: 'base' });
  assert.deepEqual(options, {
    env: 'mock-env',
    extra: true,
    safe: 'base',
    plugins: {
      before: [],
      after: [],
      postprocess: [],
    },
  });
});

test('explicitly mutating config', function (assert) {
  let parent = {
    addons: [
      {
        name: 'a',
        pkg: { keywords: ['ember-css-modules-plugin'] },
        createCssModulesPlugin: (parent) =>
          new TestPlugin(parent, {
            config(env, base) {
              base.safe = 'clobbered';
            },
          }),
      },
    ],
  };

  let registry = new PluginRegistry(parent);
  let original = { safe: 'base' };
  let options = registry.computeOptions(original);
  assert.deepEqual(original, { safe: 'base' });
  assert.deepEqual(options, {
    safe: 'clobbered',
    plugins: {
      before: [],
      after: [],
      postprocess: [],
    },
  });
});

test('notifying plugins', function (assert) {
  let somethingHappened = sinon.spy();
  let parent = {
    addons: [
      {
        name: 'a',
        pkg: { keywords: ['ember-css-modules-plugin'] },
        createCssModulesPlugin: (parent) =>
          new TestPlugin(parent, {
            somethingHappened,
          }),
      },
    ],
  };

  let registry = new PluginRegistry(parent);
  registry.notify('somethingHappened');
  assert.ok(somethingHappened.calledOnce);
});

class TestPlugin extends require('../../../lib/plugin') {
  constructor(parent, options) {
    super(parent);
    Object.assign(this, options);
  }
}
