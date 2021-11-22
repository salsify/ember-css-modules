'use strict';

const { Funnel } = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const Bridge = require('broccoli-bridge');
const ensurePosixPath = require('ensure-posix-path');
const normalizePostcssPlugins = require('./utils/normalize-postcss-plugins');
const debug = require('debug')('ember-css-modules:modules-preprocessor');
const fs = require('fs');

module.exports = class ModulesPreprocessor {
  constructor(options) {
    this.name = 'ember-css-modules';
    this.owner = options.owner;
    this._modulesTree = null;
    this._modulesBasePath = null;
    this._modulesBridge = new Bridge();

    /*
     * The addon name we should use to look up modules.
     * Uses moduleName if defined, else uses the parent/package name.
     */
    this._ownerName = null;

    /*
     * The parent/package name. This is used as a fallback to look up
     * paths that may reference the package name instead of the
     * module name. (See resolve-path.js)
     */
    this._parentName = null;
  }

  toTree(inputTree, path) {
    if (path !== '/') {
      return inputTree;
    }

    let merged = new MergeTrees([inputTree, this.buildModulesTree(inputTree)], {
      overwrite: true,
    });

    // Exclude the individual CSS files – those will be concatenated into the styles tree later
    return new Funnel(merged, {
      exclude: ['**/*.' + this.owner.getFileExtension()],
    });
  }

  buildModulesTree(modulesInput) {
    if (!this._modulesTree) {
      let inputRoot = this.owner.belongsToAddon()
        ? this.owner.getParentAddonTree()
        : this.owner.app.trees.app;
      let outputRoot = this.owner.belongsToAddon()
        ? this.owner.getAddonModulesRoot()
        : '';

      if (outputRoot) {
        inputRoot = new Funnel(inputRoot, {
          destDir: outputRoot,
        });
      }

      // If moduleName is defined, that should override the parent's name.
      // Otherwise, the template and generated module will disagree as to what the path should be.
      let ownerParent = this.owner.getParent();
      this._parentName = this.owner.getParentName();
      let ownerName = ownerParent.moduleName
        ? ownerParent.moduleName()
        : this._parentName;
      this._ownerName = ownerName;

      let modulesSources = new ModuleSourceFunnel(inputRoot, modulesInput, {
        include: ['**/*.' + this.owner.getFileExtension()],
        outputRoot,
        parentName: ownerName,
      });

      let modulesTree = new (require('broccoli-css-modules'))(modulesSources, {
        extension: this.owner.getFileExtension(),
        plugins: this.getPostcssPlugins(),
        enableSourceMaps: this.owner.enableSourceMaps(),
        sourceMapBaseDir: this.owner.belongsToAddon()
          ? this.owner.getAddonModulesRoot()
          : '',
        postcssOptions: this.owner.getPostcssOptions(),
        virtualModules: this.owner.getVirtualModules(),
        generateScopedName: this.scopedNameGenerator(),
        resolvePath: this.resolveAndRecordPath.bind(this),
        getJSFilePath: (cssPath) => this.getJSFilePath(cssPath, modulesSources),
        onBuildStart: () => this.owner.notifyPlugins('buildStart'),
        onBuildEnd: () => this.owner.notifyPlugins('buildEnd'),
        onBuildSuccess: () => this.owner.notifyPlugins('buildSuccess'),
        onBuildError: () => this.owner.notifyPlugins('buildError'),
        onProcessFile: this.resetFileDependencies.bind(this),
        onModuleResolutionFailure: this.onModuleResolutionFailure.bind(this),
        onImportResolutionFailure: this.onImportResolutionFailure.bind(this),
        formatJS: formatJS,
      });

      this._modulesTree = modulesTree;
      this._modulesBridge.fulfill('modules', modulesTree);
    }

    return this.getModulesTree();
  }

  getModulesTree() {
    return this._modulesBridge.placeholderFor('modules');
  }

  getModuleRelativePath(fullPath) {
    if (!this._modulesBasePath) {
      this._modulesBasePath = ensurePosixPath(this._modulesTree.inputPaths[0]);
    }

    return fullPath.replace(this._modulesBasePath + '/', '');
  }

  getJSFilePath(cssPathWithExtension, modulesSource) {
    if (this.owner.includeExtensionInModulePath()) {
      return `${cssPathWithExtension}.js`;
    }

    let extensionRegex = new RegExp(`\\.${this.owner.getFileExtension()}$`);
    let cssPathWithoutExtension = cssPathWithExtension.replace(
      extensionRegex,
      ''
    );

    if (modulesSource.has(`${cssPathWithoutExtension}.hbs`)) {
      return `${cssPathWithExtension}.js`;
    } else {
      return `${cssPathWithoutExtension}.js`;
    }
  }

  scopedNameGenerator() {
    let generator = this.owner.getScopedNameGenerator();
    return function (className, modulePath, fullRule, dependency) {
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
        after: plugins.after || [],
      };
    }

    return this._plugins;
  }

  onModuleResolutionFailure(failure, modulePath, fromFile) {
    throw new Error(
      'Unable to locate module "' + modulePath + '" imported from ' + fromFile
    );
  }

  onImportResolutionFailure(symbol, modulePath, fromFile) {
    let absolutePath;
    if (modulePath in this.owner.getVirtualModules()) {
      absolutePath = 'virtual module "' + modulePath + '"';
    } else {
      absolutePath = this.resolvePath(modulePath, fromFile);
    }

    throw new Error(
      `No class or value named '${symbol}' was found in ${absolutePath}, imported from ${fromFile}.`
    );
  }

  // Records dependencies from `composes` and `@value` imports
  resolveAndRecordPath(importPath, fromFile) {
    let resolvedPath = this.resolvePath(importPath, fromFile);
    let allDependencies = this.getDependencies();
    let fileDependencies =
      allDependencies[fromFile] || (allDependencies[fromFile] = []);

    debug('recording dependency from %s to %s', fromFile, resolvedPath);
    fileDependencies.push(resolvedPath);

    return resolvedPath;
  }

  rootPathPlugin() {
    return Object.assign(
      () => ({
        postcssPlugin: 'root-path-tag',
        Once: (css) => {
          css.source.input.rootPath = this._modulesTree.inputPaths[0];
        },
      }),
      { postcss: true }
    );
  }

  resolvePath(importPath, fromFile) {
    this._resolvePath = this._resolvePath || require('./resolve-path');

    return this._resolvePath(importPath, fromFile, {
      defaultExtension: this.owner.getFileExtension(),
      ownerName: this._ownerName,
      parentName: this._parentName,
      addonModulesRoot: this.owner.getAddonModulesRoot(),
      root: ensurePosixPath(this._modulesTree.inputPaths[0]),
      parent: this.owner.getParent(),
      ui: this.owner.ui,
    });
  }
};

const EXPORT_PRE = 'export default ';
const EXPORT_POST = ';\n';

function formatJS(classMapping) {
  return EXPORT_PRE + JSON.stringify(classMapping, null, 2) + EXPORT_POST;
}

class ModuleSourceFunnel extends Funnel {
  constructor(input, stylesTree, options) {
    super([input, stylesTree], options);
    this.parentName = options.parentName;
    this.destDir = options.outputRoot;
    this.inputHasParentName = null;
  }

  has(filePath) {
    let relativePath = this.inputHasParentName
      ? filePath
      : filePath.replace(`${this.parentName}/`, '');
    return fs.existsSync(`${this.inputPaths[0]}/${relativePath}`);
  }

  build() {
    if (this.inputHasParentName === null) {
      this.inputHasParentName = fs.existsSync(
        `${this.inputPaths[0]}/${this.parentName}`
      );

      let stylesTreePath = this.inputPaths[1];
      let stylesTreeHasParentName = fs.existsSync(
        `${stylesTreePath}/${this.parentName}`
      );
      if (stylesTreeHasParentName && !this.inputHasParentName) {
        this.destDir += `/${this.parentName}`;
      }
    }

    return super.build(...arguments);
  }
}
