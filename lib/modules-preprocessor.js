/* jshint node: true */
'use strict';

var Funnel = require('broccoli-funnel');
var MergeTrees = require('broccoli-merge-trees');
var ensurePosixPath = require('ensure-posix-path');
var debug = require('debug')('ember-css-modules:modules-preprocessor');

module.exports = ModulesPreprocessor;

function ModulesPreprocessor(options) {
  this.owner = options.owner;
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
    include: ['**/*.' + this.owner.getFileExtension()]
  });

  this.modulesTree = require('broccoli-css-modules')(modulesSources, {
    extension: this.owner.getFileExtension(),
    plugins: this.getPlugins(),
    enableSourceMaps: this.owner.enableSourceMaps(),
    sourceMapBaseDir: this.owner.belongsToAddon() ? this.owner.getAddonModulesRoot() : '',
    postcssOptions: this.owner.getPostcssOptions(),
    virtualModules: this.owner.getVirtualModules(),
    generateScopedName: this.scopedNameGenerator(),
    resolvePath: this.resolveAndRecordPath.bind(this),
    onProcessFile: this.resetFileDependencies.bind(this),
    onModuleResolutionFailure: this.onModuleResolutionFailure.bind(this),
    onImportResolutionFailure: this.onImportResolutionFailure.bind(this),
    formatJS: formatJS
  });

  var merged = new MergeTrees([inputWithStyles, this.modulesTree], { overwrite: true });

  // Exclude the individual CSS files – those will be concatenated into the styles tree later
  return new Funnel(merged, { exclude: ['**/*.' + this.owner.getFileExtension()] });
};

// This is gross, but we don't have a way to treat stuff in /app/styles uniformly with everything else in /app
ModulesPreprocessor.prototype.inputTreeWithStyles = function(inputTree) {
  // If we're attached to an addon, we're already good
  if (this.owner.belongsToAddon()) { return inputTree; }

  var appStyles = new Funnel(this.owner.app.trees.styles, { destDir: this.owner.app.name + '/styles' });
  return new MergeTrees([inputTree, appStyles], { overwrite: true });
};

Object.defineProperty(ModulesPreprocessor.prototype, 'ext', {
  get: function() {
    return this.getFileExtension();
  }
});

/*
 * When processing an addon, CSS won't be included unless `.css` is specified as the extension. On the other hand,
 * we'll get the CSS regardless when processing apps, but registering as a `.css` processor will cause terrible things
 * to happen when `app.import`ing a CSS file.
 */
ModulesPreprocessor.prototype.getFileExtension = function() {
  var extension = this.owner.getFileExtension();
  if (extension === 'css') {
    return this.owner.belongsToAddon() ? 'css' : null;
  } else {
    return extension;
  }
};

ModulesPreprocessor.prototype.scopedNameGenerator = function() {
  var generator = this.owner.getScopedNameGenerator();
  return function(className, modulePath, fullRule, dependency) {
    var realPath = '/' + (dependency.keyPath || modulePath);
    return generator(className, realPath, fullRule);
  };
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

ModulesPreprocessor.prototype.onModuleResolutionFailure = function(failure, modulePath, fromFile) {
  throw new Error('Unable to locate module "' + modulePath + '" imported from ' + fromFile);
};

ModulesPreprocessor.prototype.onImportResolutionFailure = function(symbol, modulePath, fromFile) {
  var absolutePath;
  if (modulePath in this.owner.getVirtualModules()) {
    absolutePath = 'virtual module "' + modulePath + '"';
  } else {
    absolutePath = this.resolvePath(modulePath, fromFile);
  }

  this.owner.ui.writeDeprecateLine(
    'No class or value named "' + symbol + '" was found in ' + absolutePath + ', imported from ' + fromFile + '. ' +
    'In the future, this will be an error.'
  );
};

ModulesPreprocessor.prototype.recordDependencies = function(fromFile, type, resolvedPaths) {
  debug('recording %s dependencies from %s to %o', type, fromFile, resolvedPaths);
  var deps = this.getDependencies();
  var fileDeps = deps[fromFile] || (deps[fromFile] = {});
  fileDeps[type] = (fileDeps[type] || []).concat(resolvedPaths);
};

// Records dependencies from `composes` and `@value` imports
ModulesPreprocessor.prototype.resolveAndRecordPath = function(importPath, fromFile) {
  var resolved = this.resolvePath(importPath, fromFile);
  this.recordDependencies(fromFile, 'implicit', [resolved]);
  return resolved;
};

// Records explicit `@after-module` dependency declarations
ModulesPreprocessor.prototype.dependenciesPlugin = function() {
  var recordDependencies = this.recordDependencies.bind(this);
  var resolve = this.resolvePath.bind(this);
  return require('./postcss-module-order-directive')({
    updateDependencies: function(fromFile, relativePaths) {
      recordDependencies(fromFile, 'explicit', relativePaths.map(function(relativePath) {
        return resolve(relativePath, fromFile);
      }));
    }
  });
};

ModulesPreprocessor.prototype.resolvePath = function(importPath, fromFile) {
  this._resolvePath = this._resolvePath || require('./resolve-path');

  return this._resolvePath(importPath, fromFile, {
    defaultExtension: this.owner.getFileExtension(),
    ownerName: this.owner.getOwnerName(),
    addonModulesRoot: this.owner.getAddonModulesRoot(),
    root: ensurePosixPath(this.modulesTree.inputPaths[0]),
    project: this.owner.getProject()
  });
};

var EXPORT_PRE = 'export default ';
var EXPORT_POST = ';\n';

function formatJS(classMapping) {
  return EXPORT_PRE + JSON.stringify(classMapping, null, 2) + EXPORT_POST;
}
