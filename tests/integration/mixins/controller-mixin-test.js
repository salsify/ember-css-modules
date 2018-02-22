import Controller from '@ember/controller';
import ControllerMixin from 'ember-css-modules/mixins/controller-mixin';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Integration | Mixin | controller mixin', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.registerOptionsForType('styles', { instantiate: false });
  });

  test('it exposes a computed __styles__ property', function(assert) {
    let styles = {};

    this.owner.register('controller:thing', Controller.extend(ControllerMixin));
    this.owner.register('styles:thing', styles);

    let subject = this.owner.lookup('controller:thing');

    assert.equal(subject.get('__styles__'), styles);
  });
});
