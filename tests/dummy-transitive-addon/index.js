'use strict';

module.exports = {
  name: 'dummy-transitive-addon',

  hintingEnabled: function() {
    return false;
  },

  isDevelopingAddon: function() {
    return true;
  }
};
