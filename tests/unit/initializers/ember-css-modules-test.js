import Ember from 'ember';
import { module, test } from 'qunit';
import Initializer from '../../../initializers/ember-css-modules';

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
  // 1.13.x passes the registry rather than the application
  let app = application.registerOptionsForType ? application : application.registry;
  let registeredOptionsForType = app.registeredOptionsForType || app.getOptionsForType;

  Initializer.initialize(app);

  assert.deepEqual(registeredOptionsForType.call(app, 'styles'), {
    instantiate: false
  });
});
