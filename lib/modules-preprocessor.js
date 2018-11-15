'use strict';

const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const ensurePosixPath = require('ensure-posix-path');
const normalizePostcssPlugins = require('./utils/normalize-postcss-plugins');
const debug = require('debug')('ember-css-modules:modules-preprocessor');

module.exports = class ModulesPreprocessor {
  constructor(options) {
    this.name = 'ember-css-modules';
    this.owner = options.owner;
  }

  toTree(inputTree, path) {
    if (path !== '/') { return inputTree; }

    return new MergeTrees(
      [
        new Funnel(inputTree, {
          exclude: ['**/*.' + this.owner.getFileExtension()]
        }),
        this.getModulesTree()
      ],
      { overwrite: true }
    );
  }

  getModulesTree() {
    if (!this._modulesTree) {
      let inputRoot = this.owner.belongsToAddon()
        ? this.owner.getParentAddonTree()
        : this.owner.app.trees.app || this.owner.app.trees.src;

      let outputRoot = this.owner.belongsToAddon()
        ? this.owner.getAddonModulesRoot() + this.owner.getOwnerName()
        : this.owner.app.trees.src
        ? this.owner.getOwnerName() + '/src'
        : this.owner.getOwnerName();

      let modulesSources = new Funnel(inputRoot, {
        include: ['**/*.' + this.owner.getFileExtension()],
        destDir: outputRoot
      });

      this._modulesTree = new (require('broccoli-css-modules'))(modulesSources, {
        extension: this.owner.getFileExtension(),
        plugins: this.getPostcssPlugins(),
        enableSourceMaps: this.owner.enableSourceMaps(),
        sourceMapBaseDir: this.owner.belongsToAddon() ? this.owner.getAddonModulesRoot() : '',
        postcssOptions: this.owner.getPostcssOptions(),
        virtualModules: this.owner.getVirtualModules(),
        generateScopedName: this.scopedNameGenerator(),
        resolvePath: this.resolveAndRecordPath.bind(this),
        onBuildStart: () => this.owner.notifyPlugins('buildStart'),
        onBuildEnd: () => this.owner.notifyPlugins('buildEnd'),
        onBuildSuccess: () => this.owner.notifyPlugins('buildSuccess'),
        onBuildError: () => this.owner.notifyPlugins('buildError'),
        onProcessFile: this.resetFileDependencies.bind(this),
        onModuleResolutionFailure: this.onModuleResolutionFailure.bind(this),
        onImportResolutionFailure: this.onImportResolutionFailure.bind(this),
        formatJS: formatJS
      });
    }

    return this._modulesTree;
  }

  scopedNameGenerator() {
    let generator = this.owner.getScopedNameGenerator();
    return function(className, modulePath, fullRule, dependency) {
      let realPath = '/' + (dependency.keyPath || modulePath);
      return generator(className, realPath, fullRule);
    };
  }

  resetFileDependencies(filePath) {
    this.getDependencies()[filePath] = null;
  }

  getDependencies() {
    if (!this._dependencies) {
      this._dependencies = Object.create(null);
    }
    return this._dependencies;
  }

  getPostcssPlugins() {
    if (!this._plugins) {
      let plugins = normalizePostcssPlugins(this.owner.getPostcssPlugins());

      this._plugins = {
        before: [this.rootPathPlugin()].concat(plugins.before || []),
        after: [this.dependenciesPlugin()].concat(plugins.after || [])
      };
    }

    return this._plugins;
  }

  onModuleResolutionFailure(failure, modulePath, fromFile) {
    throw new Error('Unable to locate module "' + modulePath + '" imported from ' + fromFile);
  }

  onImportResolutionFailure(symbol, modulePath, fromFile) {
    let absolutePath;
    if (modulePath in this.owner.getVirtualModules()) {
      absolutePath = 'virtual module "' + modulePath + '"';
    } else {
      absolutePath = this.resolvePath(modulePath, fromFile);
    }

    throw new Error(`No class or value named '${symbol}' was found in ${absolutePath}, imported from ${ fromFile}.`);
  }

  recordDependencies(fromFile, type, resolvedPaths) {
    debug('recording %s dependencies from %s to %o', type, fromFile, resolvedPaths);
    let deps = this.getDependencies();
    let fileDeps = deps[fromFile] || (deps[fromFile] = {});
    fileDeps[type] = (fileDeps[type] || []).concat(resolvedPaths);
  }

  // Records dependencies from `composes` and `@value` imports
  resolveAndRecordPath(importPath, fromFile) {
    let resolved = this.resolvePath(importPath, fromFile);
    this.recordDependencies(fromFile, 'implicit', [resolved]);
    return resolved;
  }

  // Records explicit `@after-module` dependency declarations
  dependenciesPlugin() {
    let recordDependencies = this.recordDependencies.bind(this);
    let resolve = this.resolvePath.bind(this);
    return require('./postcss-module-order-directive')({
      ui: this.owner.ui,
      emitDeprecationWarning: !this.owner.cssModulesOptions._silenceAfterModuleDeprecation,
      updateDependencies: function(fromFile, relativePaths) {
        recordDependencies(fromFile, 'explicit', relativePaths.map(function(relativePath) {
          return resolve(relativePath, fromFile);
        }));
      }
    });
  }

  rootPathPlugin() {
    return require('postcss').plugin('root-path-tag', () => (css) => {
      css.source.input.rootPath = this.getModulesTree().inputPaths[0];
    });
  }

  resolvePath(importPath, fromFile) {
    this._resolvePath = this._resolvePath || require('./resolve-path');

    return this._resolvePath(importPath, fromFile, {
      defaultExtension: this.owner.getFileExtension(),
      ownerName: this.owner.getOwnerName(),
      addonModulesRoot: this.owner.getAddonModulesRoot(),
      root: ensurePosixPath(this.getModulesTree().inputPaths[0]),
      parent: this.owner.getParent()
    });
  }
};

const EXPORT_PRE = 'export default ';
const EXPORT_POST = ';\n';

function formatJS(classMapping) {
  return EXPORT_PRE + JSON.stringify(classMapping, null, 2) + EXPORT_POST;
}
