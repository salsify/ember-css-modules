import 'ember-css-modules/templates/static-helpers-hack';

export default {
  initialize() {
    // This file exists to support Embroider's `staticHelpers` option.
    // ECM relies on the existence of a `local-class` helper, but that
    // helper may never be statically referenced in an application template.
    // Instead, we reference it in our own template, and then import that
    // template from a file (an initializer) that we know must always
    // be loaded in order to boot the app and/or run tests.
  }
}
