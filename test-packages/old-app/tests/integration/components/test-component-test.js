import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | test-component', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<TestComponent />`);

    let element = this.element.querySelector('[data-test-element]');
    let styles = getComputedStyle(element);

    assert.equal(styles.color, 'rgb(0, 128, 0)');
  });
});
