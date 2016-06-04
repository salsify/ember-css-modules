/* jshint node: true */
'use strict';

var debug = require('debug')('ember-css-modules:addon');
var ModulesPreprocessor = require('./lib/modules-preprocessor');
var OutputStylesPreprocessor = require('./lib/output-styles-preprocessor');

module.exports = {
  name: 'ember-css-modules',

  shouldIncludeChildAddon: function(addon) {
    // Don't infinitely recurse – it's the dummy test app that depends on dummy-addon, not this addon itself
    return addon.name !== 'dummy-addon';
  },

  included: function(parent) {
    debug('included in %s', parent.name);
    this.options = parent.options && parent.options.cssModules || {};
    this._super.included.apply(this, arguments);
  },

  setupPreprocessorRegistry: function(type, registry) {
    // Skip if we're setting up this addon's own registry
    if (type !== 'parent') { return; }

    var options = registry.app.options && registry.app.options.cssModules || {};

    if (!options.includeFiles) {
      options.includeFiles = ['**/*.css'];
    }

    this.modulesPreprocessor = new ModulesPreprocessor({
      owner: this,
      options: options
    });

    this.outputStylesPreprocessor = new OutputStylesPreprocessor({
      owner: this,
      options: options
    });

    registry.add('js', this.modulesPreprocessor);
    registry.add('css', this.outputStylesPreprocessor);
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

  getPlugins: function() {
    return this.options.plugins || [];
  },

  belongsToAddon: function() {
    return !!this.parent.parent;
  }
};
