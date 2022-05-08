import { module, only as test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | TestComposesFromAddon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with the correct styles', async function (assert) {
    await render(hbs`
      <TestComposesFromAddon data-test>
        <span>hello</span>
      </TestComposesFromAddon>
    `);

    let element = this.element.querySelector('[data-test]');

    let styles = getComputedStyle(element);

    assert.equal(
      styles.backgroundColor,
      'rgb(0, 0, 255)',
      'background-color should match my-message-component.css .message-container'
    );
  });
});
