'use strict';

// eslint-disable-next-line node/no-unpublished-require
var generateScopedName = require('../../lib/generate-scoped-name');

module.exports = {
  name: 'dummy-less-addon',

  options: {
    cssModules: {
      extension: 'less',
      intermediateOutputPath: 'addon.less',
      postcssOptions: {
        syntax: require('postcss-less')
      },
      generateScopedName: function(className, modulePath) {
        return '_less_addon' + generateScopedName(className, modulePath);
      }
    }
  },

  hintingEnabled: function() {
    return false;
  },

  isDevelopingAddon: function() {
    return true;
  }
};
