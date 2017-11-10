import Controller from '@ember/controller';
import { getOwner } from '@ember/application';

import ControllerMixin from 'ember-css-modules/mixins/controller-mixin';
import { moduleFor, test } from 'ember-qunit';

moduleFor('Integration | Mixin | controller mixin', {
  integration: true,

  beforeEach() {
    this.owner = getOwner(this);
    this.owner.registerOptionsForType('styles', { instantiate: false });
  }
});

test('it exposes a computed __styles__ property', function(assert) {
  let styles = {};

  this.owner.register('controller:thing', Controller.extend(ControllerMixin));
  this.owner.register('styles:thing', styles);

  let subject = this.owner.lookup('controller:thing');

  assert.equal(subject.get('__styles__'), styles);
});
