// Ensure our core extensions are loaded before the app boots
import 'ember-css-modules/extensions';

export function initialize(application) {
  // For 1.13.x compat
  let registerOptions = application.registerOptionsForType || application.optionsForType;
  registerOptions.call(application, 'styles', { instantiate: false });
}

export default {
  name: 'ember-css-modules',
  initialize
};
