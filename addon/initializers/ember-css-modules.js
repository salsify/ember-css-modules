// Ensure our core extensions are loaded before the app boots
import 'ember-css-modules/extensions';

export function initialize(application) {
  application.registerOptionsForType('styles', { instantiate: false });
}

export default {
  name: 'ember-css-modules',
  initialize
};
