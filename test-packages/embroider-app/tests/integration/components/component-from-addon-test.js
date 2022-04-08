import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | from addon', function (hooks) {
  setupRenderingTest(hooks);

  test('MyMessageComponent renders with styles', async function (assert) {
    await render(hbs`
      <MyMessageComponent @error={{this.isError}} >
        <div data-test-target></div>
      </MyMessageComponent>
    `);

    assert.equal(
      getComputedStyle(document.querySelector('[data-test-target]')).color,
      'rgb(0, 102, 0)'
    );
    this.set('isError', true);
    assert.equal(
      getComputedStyle(document.querySelector('[data-test-target]')).color,
      'rgb(204, 0, 0)'
    );
  });
});
