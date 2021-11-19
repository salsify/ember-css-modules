'use strict';

// eslint-disable-next-line node/no-unpublished-require
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Plugin = require('./index');
const merge = require('lodash.merge');
const debug = require('debug')('ember-css-modules:plugin-registry');
const normalizePostcssPlugins = require('../utils/normalize-postcss-plugins');

module.exports = class PluginRegistry {
  constructor(parent) {
    this.parent = parent;
    this._plugins = null;
  }

  computeOptions(includerOptions) {
    let env = EmberApp.env();
    let baseOptions = merge({}, includerOptions);
    baseOptions.plugins = normalizePostcssPlugins(baseOptions.plugins);

    let pluginOptions = this._computePluginOptions(env, baseOptions);
    return merge(pluginOptions, baseOptions);
  }

  notify(event) {
    for (let plugin of this.getPlugins()) {
      if (typeof plugin[event] === 'function') {
        plugin[event]();
      }
    }
  }

  getPlugins() {
    if (this._plugins === null) {
      this._plugins = this._instantiatePlugins();
    }
    return this._plugins;
  }

  _instantiatePlugins() {
    let plugins = this._discoverPlugins(
      this.parent.addons,
      'ember-css-modules-plugin'
    );

    // For addons under development, crawl the host app's available plugins for linting tools so they can be devDependencies
    if (
      typeof this.parent.isDevelopingAddon === 'function' &&
      this.parent.isDevelopingAddon()
    ) {
      let parentAddonNames = new Set(
        this.parent.addons.map((addon) => addon.name)
      );
      let hostAddons = this.parent.project.addons.filter(
        (addon) => !parentAddonNames.has(addon.name)
      );
      plugins = plugins.concat(
        this._discoverPlugins(hostAddons, 'ember-css-modules-lint-plugin')
      );
    }

    return plugins;
  }

  _discoverPlugins(addons, keyword) {
    return addons
      .filter((addon) => this._isPlugin(addon, keyword))
      .map((addon) => this._instantiatePluginFor(addon));
  }

  _isPlugin(addon, keyword) {
    return (
      addon.pkg &&
      addon.pkg.keywords &&
      addon.pkg.keywords.indexOf(keyword) >= 0
    );
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
    for (let plugin of this.getPlugins()) {
      if (plugin.config) {
        merge(options, plugin.config(env, baseOptions));
      }
    }
    return options;
  }
};
