import { module, test } from 'qunit';

import sassAddonComponentStyles from 'dummy-sass-addon/styles/components/sass-addon-component';
import lessAddonComponentStyles from 'dummy-less-addon/styles/components/less-addon-component';

module('Unit | Custom Name Scoping');

test('custom `generateScopedName` option is honored', function(assert) {
  assert.equal(sassAddonComponentStyles['component-class'].indexOf('_sass_addon'), 0);
  assert.equal(lessAddonComponentStyles['component-class'].indexOf('_less_addon'), 0);
});
