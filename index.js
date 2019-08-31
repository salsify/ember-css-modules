'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('debug')('ember-css-modules:addon');
const VersionChecker = require('ember-cli-version-checker');
const MergeTrees = require('broccoli-merge-trees');

const HtmlbarsPlugin = require('./lib/htmlbars-plugin');
const ModulesPreprocessor = require('./lib/modules-preprocessor');
const OutputStylesPreprocessor = require('./lib/output-styles-preprocessor');
const PluginRegistry = require('./lib/plugin/registry');

module.exports = {
  name: require('./package.json').name,

  shouldIncludeChildAddon(addon) {
    // Don't infinitely recurse – it's the dummy test app that depends on dummy-addon, not this addon itself
    return addon.name.indexOf('dummy') === -1;
  },

  init() {
    this._super.init && this._super.init.apply(this, arguments);
    this.modulesPreprocessor = new ModulesPreprocessor({ owner: this });
    this.outputStylesPreprocessor = new OutputStylesPreprocessor({ owner: this });
    this.checker = new VersionChecker(this.project);
  },

  included(includer) {
    debug('included in %s', includer.name);
    this.plugins = new PluginRegistry(this.parent);
    this.cssModulesOptions = this.plugins.computeOptions(includer.options && includer.options.cssModules);

    if (this.belongsToAddon()) {
      this.verifyStylesDirectory();
      this.parentAddon = includer;
    }

    this._super.included.apply(this, arguments);
  },

  treeForAddon() {
    let addonTree = this._super.treeForAddon.apply(this, arguments);
    return new MergeTrees([addonTree, `${__dirname}/vendor`]);
  },

  cacheKeyForTree(treeType) {
    // We override treeForAddon, but the result is still stable
    if (treeType === 'addon') {
      return require('calculate-cache-key-for-tree')('addon', this);
    } else {
      return this._super.cacheKeyForTree.call(this, treeType);
    }
  },

  setupPreprocessorRegistry(type, registry) {
    // Skip if we're setting up this addon's own registry
    if (type !== 'parent') { return; }

    registry.add('js', this.modulesPreprocessor);
    registry.add('css', this.outputStylesPreprocessor);
    registry.add('htmlbars-ast-plugin', HtmlbarsPlugin.forEmberVersion(this.checker.forEmber().version));
  },

  verifyStylesDirectory() {
    if (!fs.existsSync(path.join(this.parent.root, this.parent.treePaths['addon-styles']))) {
      this.ui.writeWarnLine(
        'The addon ' + this.getParentName() + ' has ember-css-modules installed, but no addon styles directory. ' +
        'You must have at least a placeholder file in this directory (e.g. `addon/styles/.placeholder`) in ' +
        'the published addon in order for ember-cli to process its CSS modules.'
      );
    }
  },

  notifyPlugins(event) {
    this.plugins.notify(event);
  },

  getParentName() {
    return this.app ? this.app.name : this.parent.name;
  },

  getParent() {
    return this.parent;
  },

  getProject() {
    return this.project;
  },

  getPassthroughFileExtensions() {
    return this.cssModulesOptions.passthroughFileExtensions || ['css', 'scss', 'sass', 'less', 'styl'];
  },

  getScopedNameGenerator() {
    return this.cssModulesOptions.generateScopedName || require('./lib/generate-scoped-name');
  },

  getModulesTree() {
    return this.modulesPreprocessor.getModulesTree();
  },

  getModuleDependencies() {
    return this.modulesPreprocessor.getDependencies();
  },

  getIntermediateOutputPath() {
    return this.cssModulesOptions.intermediateOutputPath;
  },

  getPostcssPlugins() {
    return this.cssModulesOptions.plugins || [];
  },

  getVirtualModules() {
    return this.cssModulesOptions.virtualModules || {};
  },

  getFileExtension() {
    return this.cssModulesOptions && this.cssModulesOptions.extension || 'css';
  },

  getPostcssOptions() {
    return this.cssModulesOptions.postcssOptions;
  },

  getAddonModulesRoot() {
    // CLI 2.12 stopped exposing addon stuff nested under `modules/`
    if (this.checker.for('ember-cli', 'npm').satisfies('< 2.12')) {
      return 'modules/';
    } else {
      return '';
    }
  },

  getParentAddonTree() {
    return path.join(this.parentAddon.root, this.parentAddon.treePaths.addon);
  },

  getFixedModules(type) {
    let modules = this.cssModulesOptions[`${type}Modules`] || [];
    let extension = this.getFileExtension();
    return modules.map(file => file.endsWith(`.${extension}`) ? file : `${file}.${extension}`);
  },

  enableSourceMaps() {
    if (this._enableSourceMaps === undefined) {
      var mapOptions = this._findRootApp().options.sourcemaps;
      this._enableSourceMaps = mapOptions.enabled && mapOptions.extensions.indexOf('css') !== -1;
    }

    return this._enableSourceMaps;
  },

  belongsToAddon() {
    return !!this.parent.parent;
  },

  _findRootApp() {
    var current = this;
    while (current.parent.parent) {
      current = current.parent;
    }
    return current.app;
  }
};
