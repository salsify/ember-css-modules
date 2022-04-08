'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { Webpack } = require('@embroider/webpack');
const { compatBuild } = require('@embroider/compat');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
  });

  return compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticHelpers: true,

    // Due to runtime use of dynamic require(), we need staticAddonsTrees:false
    // to preserve style modules in addons and staticComponents:false to
    // preserve style modules in apps.
    staticAddonTrees: false,
    staticComponents: false,
  });
};
