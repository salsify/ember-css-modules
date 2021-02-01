import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import styles from 'octane-addon-with-module-name/components/my-message-component.css';

module('Integration | Component | MyMessageComponent', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <MyMessageComponent />
    `);

    assert.dom('h1').hasClass(styles.message);
  });
});
