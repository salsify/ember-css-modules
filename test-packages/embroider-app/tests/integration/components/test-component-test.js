import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | TestComponent', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with the correct styles', async function(assert) {
    await render(hbs`
      <TestComponent>
        <span data-test>hello</span>
      </TestComponent>
    `);

    let element = this.element.querySelector('[data-test]');
    let styles = getComputedStyle(element);

    assert.equal(styles.fontFamily, 'TestComponent');
  });
});
