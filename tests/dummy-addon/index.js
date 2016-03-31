var generateScopedName = require('../../lib/generate-scoped-name');

/*jshint node:true*/
module.exports = {
  name: 'dummy-addon',

  options: {
    cssModules: {
      generateScopedName: function(className, modulePath) {
        return '_addon' + generateScopedName(className, modulePath);
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
