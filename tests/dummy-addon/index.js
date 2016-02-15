/*jshint node:true*/
module.exports = {
  name: 'dummy-addon',

  hintingEnabled: function() {
    return false;
  },

  isDevelopingAddon: function() {
    return true;
  }
};
