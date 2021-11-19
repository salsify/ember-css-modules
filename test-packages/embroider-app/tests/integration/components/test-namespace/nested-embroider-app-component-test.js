import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | TestNamespace::NestedEmbroiderAppComponent',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders with the correct styles', async function (assert) {
      await render(hbs`
      <TestNamespace::NestedEmbroiderAppComponent>
        <span data-test>hello</span>
      </TestNamespace::NestedEmbroiderAppComponent>
    `);

      let element = this.element.querySelector('[data-test]');
      let styles = getComputedStyle(element);

      assert.equal(styles.fontFamily, 'NestedTestComponent');
      assert.equal(styles.color, 'rgb(224, 224, 224)');
    });
  }
);
