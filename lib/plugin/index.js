'use strict';

const normalizePostcssPlugins = require('../utils/normalize-postcss-plugins');

module.exports = class Plugin {
  constructor(parent, includer) {
    this.parent = parent;
    this.includer = includer;
  }

  isForApp() {
    return !this.parent.parent;
  }

  isForAddon() {
    return !this.isForApp();
  }

  addPostcssPlugin(config, type, ...plugins) {
    config.plugins = normalizePostcssPlugins(config.plugins);

    if (type === 'before') {
      config.plugins.before.unshift(...plugins);
    } else if (type === 'after' || type === 'postprocess') {
      config.plugins[type].push(...plugins);
    } else {
      throw new Error(`Unknown plugin type '${type}'`);
    }
  }
};
