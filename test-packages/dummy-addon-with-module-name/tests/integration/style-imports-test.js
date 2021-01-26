import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | style imports', function(hooks) {
  setupRenderingTest(hooks);

  const components = [
    'addon-component-with-relative-imports',
    'addon-component-with-absolute-imports',
    'addon-component-with-virtual-imports'
  ];

  for (let component of components) {
    test(component, async function(assert) {
      this.component = component;
      await render(hbs`{{component (concat 'testing/' this.component)}}`);

      let testElement = this.element.querySelector('[data-test-element]');
      assert.ok(testElement);

      let styles = window.getComputedStyle(testElement);
      assert.equal(styles.backgroundColor, 'rgb(255, 255, 0)');
      assert.equal(styles.fontWeight, '800');
    });
  }
});
