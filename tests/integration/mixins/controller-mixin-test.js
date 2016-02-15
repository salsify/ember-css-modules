import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

import ControllerMixin from 'ember-css-modules/mixins/controller-mixin';
import { moduleFor, test } from 'ember-qunit';

moduleFor('Unit | Mixin | controller mixin', {
  integration: true,

  beforeEach() {
    this.owner = getOwner(this);
    this.owner.registerOptionsForType('styles', { instantiate: false });
  }
});

test('it exposes a computed styles property', function(assert) {
  let styles = {};

  this.owner.register('controller:thing', Ember.Controller.extend(ControllerMixin));
  this.owner.register('styles:thing', styles);

  let subject = this.owner.lookup('controller:thing');

  assert.equal(subject.get('styles'), styles);
});
