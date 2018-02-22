import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import $ from 'jquery';

module('Acceptance | style imports', function(hooks) {
  setupApplicationTest(hooks);

  const componentRoutes = [
    'component-with-relative-imports',
    'component-with-absolute-imports',
    'component-with-virtual-imports',
    'addon-component-with-relative-imports',
    'addon-component-with-absolute-imports',
    'addon-component-with-virtual-imports'
  ].map(name => [name, `/testing/render-component/${name}`]);

  componentRoutes.forEach(([name, route]) => {
    test(name, async function(assert) {
      await visit(route);

      let testElement = $('[data-test-element]').get(0);
      assert.ok(testElement);

      let styles = window.getComputedStyle(testElement);
      assert.equal(styles.backgroundColor, 'rgb(255, 255, 0)');
      assert.equal(styles.fontWeight, '800');
    });
  });
});
