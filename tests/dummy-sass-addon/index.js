var generateScopedName = require('../../lib/generate-scoped-name');

/*jshint node:true*/
module.exports = {
  name: 'dummy-sass-addon',

  options: {
    cssModules: {
      extension: 'scss',
      intermediateOutputPath: 'addon.scss',
      postcssOptions: {
        syntax: require('postcss-scss')
      },
      generateScopedName: function(className, modulePath) {
        return '_sass_addon' + generateScopedName(className, modulePath);
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
