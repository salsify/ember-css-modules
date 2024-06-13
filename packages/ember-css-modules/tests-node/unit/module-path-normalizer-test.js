const { createBuilder, createTempDir } = require('broccoli-test-helper');
const normalize = require('../../lib/utils/module-path-normalizer');
const QUnit = require('qunit');
const { test } = QUnit;

QUnit.module('Unit | module-path-normalizer', (hooks) => {
  let input, output;

  hooks.beforeEach(async () => {
    input = await createTempDir();
  });

  hooks.afterEach(async () => {
    await input.dispose();
    await output.dispose();
  });

  test('no-op', async function (assert) {
    const subject = normalize(input.path(), {
      moduleName: 'sample-app',
    });

    output = createBuilder(subject);
    // INITIAL
    input.write({
      'sample-app': {
        components: {
          'greeting.hbs': '',
          'greeting.js': '',
          'greeting.css': '',
        },
      },
    });

    await output.build();

    assert.deepEqual(output.read(), {
      'sample-app': {
        components: {
          'greeting.css': '',
          'greeting.hbs': '',
          'greeting.js': '',
        },
      },
    });
  });

  test('should prepend moduleName', async function (assert) {
    const moduleName = 'sample-app';

    const subject = normalize(input.path(), { moduleName });

    output = createBuilder(subject);
    // INITIAL
    input.write({
      components: {
        'greeting.hbs': '',
        'greeting.js': '',
        'greeting.css': '',
      },
    });

    await output.build();

    assert.deepEqual(output.read(), {
      'sample-app': {
        components: {
          'greeting.css': '',
          'greeting.hbs': '',
          'greeting.js': '',
        },
      },
    });
  });
});
