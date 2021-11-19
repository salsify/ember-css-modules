import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helpers still function', function (hooks) {
  setupRenderingTest(hooks);

  test('helpers work correctly', async function (assert) {
    await render(hbs`{{test-helper 'foo' 'bar'}}`);
    assert.equal(this.element.textContent.trim(), 'foo, bar');
  });
});
