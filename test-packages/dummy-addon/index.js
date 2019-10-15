'use strict';

module.exports = {
  name: require('./package').name,

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
