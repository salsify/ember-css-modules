const semver = require('semver');
const postcssVersion = require('postcss/package.json').version;

if (semver.lt(postcssVersion, '8.0.0')) {
  module.exports = require('postcss').plugin;
} else {
  module.exports = function(name, callback) {
    let plugin = (options = {}) => {
      let handler = callback(options);
      return {
        postcssPlugin: name,
        Once: handler
      };
    };
    plugin.postcss = true;
    return plugin;
  };
}
