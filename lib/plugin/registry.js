'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Plugin = require('./index');
const merge = require('lodash.merge');
const debug = require('debug')('ember-css-modules:plugin-registry');
const normalizePostcssPlugins = require('../utils/normalize-postcss-plugins');

module.exports = class PluginRegistry {
  constructor(parent) {
    this.parent = parent;
    this.plugins = this._instantiatePlugins();
  }

  computeOptions(includerOptions) {
    let env = EmberApp.env();
    let baseOptions = merge({}, includerOptions);
    baseOptions.plugins = normalizePostcssPlugins(baseOptions.plugins);

    let pluginOptions = this._computePluginOptions(env, baseOptions);
    return merge(pluginOptions, baseOptions);
  }

  notify(event) {
    for (let plugin of this.plugins) {
      if (typeof plugin[event] === 'function') {
        plugin[event]();
      }
    }
  }

  _instantiatePlugins() {
    return this.parent.addons
      .filter(addon => this._isPlugin(addon))
      .map(addon => this._instantiatePluginFor(addon));
  }

  _isPlugin(addon) {
    return addon.pkg 
      && addon.pkg.keywords
      && addon.pkg.keywords.indexOf('ember-css-modules-plugin') >= 0;
  }

  _instantiatePluginFor(addon) {
    debug('instantiating plugin %s', addon.name);

    const plugin = addon.createCssModulesPlugin(this.parent);
    if (!(plugin instanceof Plugin)) {
      this.parent.ui.writeWarnLine(
        `Addon ${addon.name} did not return a Plugin instance from its createCssModulesPlugin hook`
      );
    }
    return plugin;
  }

  _computePluginOptions(env, baseOptions) {
    let options = merge({}, baseOptions);
    for (let plugin of this.plugins) {
      if (plugin.config) {
        merge(options, plugin.config(env, baseOptions));
      }
    }
    return options;
  }
}
