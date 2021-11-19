import { module, test } from 'qunit';

module('Unit | plugin hooks', function () {
  test('Hooks are invoked in the expected order', async function (assert) {
    // This file is created in the build by the plugin defined in
    // this addon's `index.js`
    let response = await fetch('/assets/plugin-log.json');
    let json = await response.json();

    assert.deepEqual(json, [
      'config',
      'buildStart',
      'buildSuccess',
      'buildEnd',
    ]);
  });
});
