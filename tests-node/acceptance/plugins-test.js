'use strict';

const QUnit = require('qunitjs'), test = QUnit.test, testModule = QUnit.module;

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const ui = new (require('console-ui'))({
  outputStream: process.stdout,
  ci: process.env.CI,
});

testModule('Acceptance | plugins', {
  before() {
    this.app = new AddonTestApp();

    ui.startProgress('Creating dummy app for plugin testing...');
    return this.app.create('plugins', { fixturesPath: 'tests-node/fixtures' })
      .then(() => {
        ui.stopProgress();
      })
      .catch((error) => {
        ui.stopProgress();
        console.error(error); // eslint-disable-line no-console
        throw error;
      });
  }
});

test('plugin discovery and build hooks', function(assert) {
  this.app.editPackageJSON((pkg) => {
    pkg['ember-addon'] = { paths: ['lib/noisy'] };
  });

  return this.app.runEmberCommand('build').then((result) => {
    let lines = result.output.join('').split(/\r?\n/);

    assert.equal(result.code, 0);
    assert.deepEqual(lines.filter(line => line.startsWith('[plugin]')), [
      '[plugin] config',
      '[plugin] buildStart',
      '[plugin] buildSuccess',
      '[plugin] buildEnd'
    ]);
  });
});
