import { module, test } from 'qunit';
import addonComponentStyles from 'dummy-addon/styles/components/addon-component';

module('Unit | Custom Name Scoping');

test('custom `generateScopedName` option is honored', function(assert) {
  // See dummy-addon/index.js
  assert.equal(addonComponentStyles['component-class'].indexOf('_addon'), 0);
});
