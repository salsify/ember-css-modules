/* jshint node: true */
'use strict';

var debug = require('debug')('ember-css-modules:addon');

var HtmlbarsPlugin = require('./lib/htmlbars-plugin');
var ModulesPreprocessor = require('./lib/modules-preprocessor');
var OutputStylesPreprocessor = require('./lib/output-styles-preprocessor');

module.exports = {
  name: 'ember-css-modules',

  shouldIncludeChildAddon: function(addon) {
    // Don't infinitely recurse – it's the dummy test app that depends on dummy-addon, not this addon itself
    return addon.name.indexOf('dummy') === -1;
  },

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);
    this.modulesPreprocessor = new ModulesPreprocessor({ owner: this });
    this.outputStylesPreprocessor = new OutputStylesPreprocessor({ owner: this });
  },

  included: function(parent) {
    debug('included in %s', parent.name);
    this.options = parent.options && parent.options.cssModules || {};
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

  getScopedNameGenerator: function() {
    return this.options.generateScopedName || require('./lib/generate-scoped-name');
  },

  getModulesTree: function() {
    return this.modulesPreprocessor.getModulesTree();
  },

  getModuleDependencies: function() {
    return this.modulesPreprocessor.getDependencies();
  },

  getIntermediateOutputPath: function() {
    return this.options.intermediateOutputPath;
  },

  getPlugins: function() {
    return this.options.plugins || [];
  },

  getFileExtension: function() {
    return this.options && this.options.extension || 'css';
  },

  getPostcssOptions: function() {
    return this.options.postcssOptions;
  },

  belongsToAddon: function() {
    return !!this.parent.parent;
  }
};
