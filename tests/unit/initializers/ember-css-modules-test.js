import Ember from 'ember';
import Initializer from '../../../initializers/ember-css-modules';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | ember css modules', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

test('registers options for the `styles` container entity type', function(assert) {
  Initializer.initialize(application);

  assert.deepEqual(application.registeredOptionsForType('styles'), {
    instantiate: false
  });
});
