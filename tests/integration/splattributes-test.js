import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import setupStyles from '../helpers/render-with-styles';
import { gte } from 'ember-compatibility-helpers';
import styles from 'dummy/components/component-with-splattributes/styles';

if (gte('3.4.0')) {
  module('Integration | Components with splattributes', function(hooks) {
    setupRenderingTest(hooks);

    test('inner and outer local and global classes are all present', async function(assert) {
      const hbs = setupStyles({
        'local-outer': '--local-outer'
      });

      await render(hbs`<ComponentWithSplattributes local-class="local-outer" class="global-outer" />`);
      assert.dom('[data-test-element]').hasClass('global-outer');
      assert.dom('[data-test-element]').hasClass('--local-outer');
      assert.dom('[data-test-element]').hasClass('global-inner');
      assert.dom('[data-test-element]').hasClass(styles['local-inner']);
    });
  });
}
