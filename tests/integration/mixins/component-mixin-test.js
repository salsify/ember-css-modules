import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

import ComponentMixin from 'ember-css-modules/mixins/component-mixin';
import { moduleFor, test } from 'ember-qunit';

moduleFor('Integration | Mixin | component mixin', {
  integration: true,

  beforeEach() {
    this.owner = getOwner(this);
    this.owner.registerOptionsForType('styles', { instantiate: false });
  }
});

test('it exposes a computed styles property', function(assert) {
  let styles = {};

  this.owner.register('component:thing', Ember.Component.extend(ComponentMixin));
  this.owner.register('styles:components/thing', styles);

  let subject = this.owner.lookup('component:thing');

  assert.equal(subject.get('styles'), styles);
});
