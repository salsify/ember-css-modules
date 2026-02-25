import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | style imports', function (hooks) {
  setupRenderingTest(hooks);

  test('absolute imports', async function (assert) {
    await render(hbs`<Imports::Absolute />`);

    let testElement = this.element.querySelector('[data-test-element]');
    let styles = getComputedStyle(testElement);
    assert.equal(styles.backgroundColor, 'rgb(255, 255, 0)');
    assert.equal(styles.fontWeight, '800');
  });

  test('relative imports', async function (assert) {
    await render(hbs`<Imports::Relative />`);

    let testElement = this.element.querySelector('[data-test-element]');
    let styles = getComputedStyle(testElement);
    assert.equal(styles.backgroundColor, 'rgb(255, 255, 0)');
    assert.equal(styles.fontWeight, '800');
  });

  test('virtual imports', async function (assert) {
    await render(hbs`<Imports::Virtual  />`);

    let testElement = this.element.querySelector('[data-test-element]');
    let styles = getComputedStyle(testElement);
    assert.equal(styles.backgroundColor, 'rgb(255, 255, 0)');
    assert.equal(styles.fontWeight, '800');
  });
});
