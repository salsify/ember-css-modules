'use strict';

const normalizePostcssPlugins = require('../utils/normalize-postcss-plugins');

module.exports = class Plugin {
  constructor(parent) {
    this.parent = parent;
  }

  isForApp() {
    return !this.parent.parent;
  }

  isForAddon() {
    return !this.isForApp();
  }

  addPostcssPlugin(config, type, plugin) {
    config.plugins = normalizePostcssPlugins(config.plugins);

    if (type === 'before') {
      config.plugins.before.unshift(plugin);
    } else if (type === 'after') {
      config.plugins.after.push(plugin);
    } else {
      throw new Error(`Unknown plugin type '${type}'`);
    }
  }
};
