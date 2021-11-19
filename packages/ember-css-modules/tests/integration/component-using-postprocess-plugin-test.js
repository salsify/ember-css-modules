import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | "postprocess" Plugins', function (hooks) {
  setupRenderingTest(hooks);

  test('executes postprocess plugins', async function (assert) {
    await render(hbs`{{testing/component-using-postprocess-plugin}}`);

    let testElement = this.element.querySelector('[data-test-element]');
    assert.ok(testElement);

    let styles = window.getComputedStyle(testElement);
    assert.equal(styles.backgroundColor, 'rgb(102, 51, 153)');
  });
});
