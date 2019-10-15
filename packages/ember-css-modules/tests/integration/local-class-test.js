import { helper } from '@ember/component/helper';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import setupStyles from '../helpers/render-with-styles';

module('Integration | Helper | local-class', function(hooks) {
  setupRenderingTest(hooks);

  test('it works as a mustache', async function(assert) {
    let hbs = setupStyles({ foo: '--foo-value' });
    await render(hbs`{{local-class 'foo'}}`);
    assert.equal(this.element.textContent.trim(), '--foo-value');
  });

  test('it works as a positional', async function(assert) {
    let hbs = setupStyles({ foo: '--foo-value' });
    this.owner.register('template:components/test-component', hbs`{{yield (local-class 'foo')}}`);

    await render(hbs`
      {{#test-component as |value|}}
        {{value}}
      {{/test-component}}
    `);

    assert.equal(this.element.textContent.trim(), '--foo-value');
  });

  test('it works as a named parameter', async function(assert) {
    let hbs = setupStyles({ foo: '--foo-value' });
    this.owner.register('helper:hash', helper((params, hash) => hash));
    this.owner.register('template:components/test-component', hbs`{{yield (hash value=(local-class 'foo'))}}`);

    await render(hbs`
      {{#test-component as |stuff|}}
        {{stuff.value}}
      {{/test-component}}
    `);

    assert.equal(this.element.textContent.trim(), '--foo-value');
  });
});
