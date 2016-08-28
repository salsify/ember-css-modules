import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('changing-dynamic-class', 'Integration | Changing local classes', {
  integration: true
});

test('changing a dynamic class value works', function(assert) {
  this.set('extraClass', 'bar');
  this.set('styles', {
    foo: '--foo',
    bar: '--bar',
    baz: '--baz'
  });

  this.render(hbs`<div data-test-element class="global" local-class="foo {{extraClass}}"></div>`);
  assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --bar');

  Ember.run(() => this.set('extraClass', 'baz'));
  assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo --baz');

  Ember.run(() => this.set('extraClass', 'qux'));
  assert.equal(this.$('[data-test-element]').attr('class'), 'global --foo');
});
