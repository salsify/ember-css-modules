/* eslint-env node */
'use strict';

var path = require('path');
var fs = require('fs');
var debug = require('debug')('ember-css-modules:addon');
var VersionChecker = require('ember-cli-version-checker');

var HtmlbarsPlugin = require('./lib/htmlbars-plugin');
var ModulesPreprocessor = require('./lib/modules-preprocessor');
var OutputStylesPreprocessor = require('./lib/output-styles-preprocessor');

module.exports = {
  name: 'ember-css-modules',

  shouldIncludeChildAddon: function(addon) {
    // Don't infinitely recurse – it's the dummy test app that depends on dummy-addon, not this addon itself
    return addon.name.indexOf('dummy') === -1;
  },

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);
    this.modulesPreprocessor = new ModulesPreprocessor({ owner: this });
    this.outputStylesPreprocessor = new OutputStylesPreprocessor({ owner: this });
    this.checker = new VersionChecker(this);
  },

  included: function(parent) {
    debug('included in %s', parent.name);
    this.ownerName = parent.name;
    this.cssModulesOptions = parent.options && parent.options.cssModules || {};

    if (this.belongsToAddon()) {
      this.verifyStylesDirectory();
      this.parentAddon = parent;
    }

    this._super.included.apply(this, arguments);
  },

  setupPreprocessorRegistry: function(type, registry) {
    // Skip if we're setting up this addon's own registry
    if (type !== 'parent') { return; }

    registry.add('js', this.modulesPreprocessor);
    registry.add('css', this.outputStylesPreprocessor);
    registry.add('htmlbars-ast-plugin', {
      name: 'ember-css-modules',
      plugin: HtmlbarsPlugin,
      baseDir: function() {
        return __dirname;
      }
    });
  },

  verifyStylesDirectory: function() {
    if (!fs.existsSync(path.join(this.parent.root, this.parent.treePaths['addon-styles']))) {
      this.ui.writeWarnLine(
        'The addon ' + this.getOwnerName() + ' has ember-css-modules installed, but no addon styles directory. ' +
        'You must have at least a placeholder file in this directory (e.g. `addon/styles/.placeholder`) in ' +
        'the published addon in order for ember-cli to process its CSS modules.'
      );
    }
  },

  getOwnerName: function() {
    return this.ownerName;
  },

  getProject: function() {
    return this.project;
  },

  getScopedNameGenerator: function() {
    return this.cssModulesOptions.generateScopedName || require('./lib/generate-scoped-name');
  },

  getModulesTree: function() {
    return this.modulesPreprocessor.getModulesTree();
  },

  getModuleDependencies: function() {
    return this.modulesPreprocessor.getDependencies();
  },

  getIntermediateOutputPath: function() {
    return this.cssModulesOptions.intermediateOutputPath;
  },

  getPlugins: function() {
    return this.cssModulesOptions.plugins || [];
  },

  getVirtualModules: function() {
    return this.cssModulesOptions.virtualModules || {};
  },

  getFileExtension: function() {
    return this.cssModulesOptions && this.cssModulesOptions.extension || 'css';
  },

  getPostcssOptions: function() {
    return this.cssModulesOptions.postcssOptions;
  },

  getAddonModulesRoot: function() {
    // CLI 2.12 stopped exposing addon stuff nested under `modules/`
    if (this.checker.for('ember-cli', 'npm').satisfies('>= 2.12')) {
      return '';
    } else {
      return 'modules/';
    }
  },

  getParentAddonTree: function() {
    return path.join(this.parentAddon.root, this.parentAddon.treePaths.addon);
  },

  enableSourceMaps: function() {
    if (this._enableSourceMaps === undefined) {
      var mapOptions = this._findRootApp().options.sourcemaps;
      this._enableSourceMaps = mapOptions.enabled && mapOptions.extensions.indexOf('css') !== -1;
    }

    return this._enableSourceMaps;
  },

  belongsToAddon: function() {
    return !!this.parent.parent;
  },

  _findRootApp: function() {
    var current = this;
    while (current.parent.parent) {
      current = current.parent;
    }
    return current.app;
  }
};
