var generateScopedName = require('../../lib/generate-scoped-name');

/*jshint node:true*/
module.exports = {
  name: 'dummy-addon',

  options: {
    cssModules: {
      virtualModules: {
        'virtual-addon-constants': {
          'superbold': 800,
          'important-background': 'rgb(255, 255, 0)'
        }
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
