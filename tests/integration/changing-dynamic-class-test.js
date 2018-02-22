import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Changing local classes', function(hooks) {
  setupRenderingTest(hooks);

  test('changing a dynamic class value works', async function(assert) {
    this.set('extraClass', 'bar');
    this.set('__styles__', {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz'
    });

    await render(hbs`<div data-test-element class="global" local-class="foo {{extraClass}}"></div>`);
    assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --bar');

    run(() => this.set('extraClass', 'baz'));
    assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --baz');

    run(() => this.set('extraClass', 'qux'));
    assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo');
  });
});