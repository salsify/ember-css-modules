import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | component styles lookup', function(hooks) {
  setupRenderingTest(hooks);

  const components = [
    'addon-component',
    'classic-colocated-component',
    'component-with-addon-value',
    'component-with-addon-composition'
  ];

  for (let component of components) {
    test(component, async function(assert) {
      this.component = component;
      await render(hbs`{{component (concat 'testing/' this.component)}}`);

      let testElement = this.element.querySelector('[data-test-element]');
      let styles = window.getComputedStyle(testElement);
      assert.equal(styles.fontFamily.replace(/['"]/g, ''), component);
    });
  }
});
