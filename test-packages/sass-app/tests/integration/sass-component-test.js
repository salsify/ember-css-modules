import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Sass Component', function(hooks) {
  setupRenderingTest(hooks);

  test('sass styles are properly processed', async function(assert) {
    await render(hbs`<Testing::SassComponent />`);

    let testElement = this.element.querySelector('[data-test-element]');
    let styles = getComputedStyle(testElement);
    assert.equal(styles.fontFamily, "sass-component");
  });
})
