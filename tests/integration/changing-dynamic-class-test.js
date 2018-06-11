import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import setupStyles from '../helpers/render-with-styles';

module('Integration | Changing local classes', function(hooks) {
  setupRenderingTest(hooks);

  test('changing a dynamic class value works', async function(assert) {
    const hbs = setupStyles({
      foo: '--foo',
      bar: '--bar',
      baz: '--baz'
    });

    this.set('extraClass', 'bar');

    await render(hbs`<div data-test-element class="global" local-class="foo {{extraClass}}"></div>`);
    assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --bar');

    run(() => this.set('extraClass', 'baz'));
    assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --baz');

    run(() => this.set('extraClass', 'qux'));
    assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo');
  });
});
