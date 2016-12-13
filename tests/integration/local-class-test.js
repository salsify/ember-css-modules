import 'ember-getowner-polyfill';
import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('helper:local-class', 'Integration | Helper | local-class', {
  integration: true
});

test('it works as a mustache', function(assert) {
  this.set('__styles__', { foo: '--foo-value' });
  this.render(hbs`{{local-class 'foo'}}`);
  assert.equal(this.$().text().trim(), '--foo-value');
});

test('it works as a positional', function(assert) {
  const owner = Ember.getOwner(this);
  owner.register('template:components/test-component', hbs`{{yield (local-class 'foo')}}`);
  owner.register('styles:components/test-component', { foo: '--foo-value' });

  this.render(hbs`
    {{#test-component as |value|}}
      {{value}}
    {{/test-component}}
  `);

  assert.equal(this.$().text().trim(), '--foo-value');
});

test('it works as a named parameter', function(assert) {
  const owner = Ember.getOwner(this);
  owner.register('helper:hash', Ember.Helper.helper((params, hash) => hash));
  owner.register('template:components/test-component', hbs`{{yield (hash value=(local-class 'foo'))}}`);
  owner.register('styles:components/test-component', { foo: '--foo-value' });

  this.render(hbs`
    {{#test-component as |stuff|}}
      {{stuff.value}}
    {{/test-component}}
  `);

  assert.equal(this.$().text().trim(), '--foo-value');
});
