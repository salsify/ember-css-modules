import getOwner from 'ember-getowner-polyfill';
import { moduleFor, test } from 'ember-qunit';
import Initializer from '../../../initializers/ember-css-modules';

moduleFor('Integration | Initializer | ember css modules', {
  integration: true
});

test('registers options for the `styles` container entity type', function(assert) {
  let owner = getOwner(this);

  Initializer.initialize(owner);

  assert.deepEqual(owner.registeredOptionsForType('styles'), {
    instantiate: false
  });
});
