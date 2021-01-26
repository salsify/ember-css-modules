'use strict';

module.exports = {
  name: require('./package').name,

  moduleName: function () {
    return 'dummy-addon-with-module-name';
  },

  options: {
    cssModules: {
      virtualModules: {
        'virtual-addon-constants': {
          'superbold': 800,
          'important-background': 'rgb(255, 255, 0)'
        }
      }
    }
  }
};
