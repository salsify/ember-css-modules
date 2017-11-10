import { run } from '@ember/runloop';
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('changing-dynamic-class', 'Integration | Changing local classes', {
  integration: true
});

test('changing a dynamic class value works', function(assert) {
  this.set('extraClass', 'bar');
  this.set('__styles__', {
    foo: '--foo',
    bar: '--bar',
    baz: '--baz'
  });

  this.render(hbs`<div data-test-element class="global" local-class="foo {{extraClass}}"></div>`);
  assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --bar');

  run(() => this.set('extraClass', 'baz'));
  assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --baz');

  run(() => this.set('extraClass', 'qux'));
  assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo');
});
