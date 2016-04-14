/* jshint node: true */
'use strict';

var Funnel = require('broccoli-funnel');
var CSSModules = require('broccoli-css-modules');
var MergeTrees = require('broccoli-merge-trees');
var debug = require('debug')('ember-css-modules:modules-preprocessor');

var explicitOrdering = require('./postcss-module-order-directive');
var resolvePath = require('./resolve-path');

module.exports = ModulesPreprocessor;

function ModulesPreprocessor(options) {
  this.owner = options.owner;
  this.ext = this.getExtension();
  this.modulesTree = null;
}

ModulesPreprocessor.prototype.constructor = ModulesPreprocessor;
ModulesPreprocessor.prototype.name = 'ember-css-modules';

ModulesPreprocessor.prototype.getModulesTree = function() {
  if (!this.modulesTree) {
    throw new Error('Unable to provide the modules tree before the preprocessor has been invoked');
  }

  return this.modulesTree;
};

ModulesPreprocessor.prototype.toTree = function(inputTree, path) {
  if (path !== '/') { return inputTree; }

  var inputWithStyles = this.inputTreeWithStyles(inputTree);

  // Hack: manually exclude stuff in tests/modules because of https://github.com/ember-cli/ember-cli-qunit/pull/96
  var modulesSources = new Funnel(inputWithStyles, {
    exclude: ['**/tests/modules/**'],
    include: ['**/*.css']
  });

  this.modulesTree = new CSSModules(modulesSources, {
    plugins: this.getPlugins(),
    generateScopedName: this.owner.getScopedNameGenerator(),
    resolvePath: this.resolveAndRecordPath.bind(this),
    onProcessFile: this.resetFileDependencies.bind(this),
    formatJS: formatJS
  });

  var merged = new MergeTrees([inputWithStyles, this.modulesTree], { overwrite: true });

  // Exclude the individual CSS files – those will be concatenated into the styles tree later
  return new Funnel(merged, { exclude: ['**/*.css'] });
};

// This is gross, but we don't have a way to treat stuff in /app/styles uniformly with everything else in /app
ModulesPreprocessor.prototype.inputTreeWithStyles = function(inputTree) {
  // If we're attached to an addon, we're already good
  if (this.owner.belongsToAddon()) { return inputTree; }

  var appStyles = new Funnel(this.owner.app.trees.styles, { destDir: this.owner.app.name + '/styles' });
  return new MergeTrees([inputTree, appStyles]);
};

/*
 * When processing an addon, CSS won't be included unless `.css` is specified as the extension. On the other hand,
 * we'll get the CSS regardless when processing apps, but registering as a `.css` processor will cause terrible things
 * to happen when `app.import`ing a CSS file.
 */
ModulesPreprocessor.prototype.getExtension = function() {
  return this.owner.belongsToAddon() ? 'css' : null;
};

ModulesPreprocessor.prototype.resetFileDependencies = function(filePath) {
  this.getDependencies()[filePath] = null;
};

ModulesPreprocessor.prototype.getDependencies = function() {
  if (!this._dependencies) {
    this._dependencies = Object.create(null);
  }
  return this._dependencies;
};

ModulesPreprocessor.prototype.getPlugins = function() {
  if (!this._plugins) {
    var plugins = this.owner.getPlugins() || {};
    if (Array.isArray(plugins)) {
      plugins = { after: plugins };
    }

    this._plugins = {
      before: plugins.before,
      after: [this.dependenciesPlugin()].concat(plugins.after || [])
    };
  }

  return this._plugins;
};

ModulesPreprocessor.prototype.recordDependencies = function(fromFile, type, resolvedPaths) {
  debug('recording %s dependencies from %s to %o', type, fromFile, resolvedPaths);
  var deps = this.getDependencies();
  var fileDeps = deps[fromFile] || (deps[fromFile] = {});
  fileDeps[type] = (fileDeps[type] || []).concat(resolvedPaths);
};

// Records dependencies from `composes` and `@value` imports
ModulesPreprocessor.prototype.resolveAndRecordPath = function(importPath, fromFile) {
  var resolved = resolvePath(importPath, fromFile);
  this.recordDependencies(fromFile, 'implicit', [resolved]);
  return resolved;
};

// Records explicit `@after-module` dependency declarations
ModulesPreprocessor.prototype.dependenciesPlugin = function() {
  var recordDependencies = this.recordDependencies.bind(this);
  return explicitOrdering({
    updateDependencies: function(fromFile, relativePaths) {
      recordDependencies(fromFile, 'explicit', relativePaths.map(function(relativePath) {
        return resolvePath(relativePath, fromFile);
      }));
    }
  });
};

var EXPORT_PRE = 'export default ';
var EXPORT_POST = ';\n';

function formatJS(classMapping) {
  return EXPORT_PRE + JSON.stringify(classMapping, null, 2) + EXPORT_POST;
}
