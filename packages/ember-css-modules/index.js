'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('debug')('ember-css-modules:addon');
const VersionChecker = require('ember-cli-version-checker');

const HtmlbarsPlugin = require('./lib/htmlbars-plugin');
const ModulesPreprocessor = require('./lib/modules-preprocessor');
const OutputStylesPreprocessor = require('./lib/output-styles-preprocessor');
const PluginRegistry = require('./lib/plugin/registry');

module.exports = {
  name: require('./package.json').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);
    this.modulesPreprocessor = new ModulesPreprocessor({ owner: this });
    this.outputStylesPreprocessor = new OutputStylesPreprocessor({
      owner: this,
    });
    this.checker = new VersionChecker(this.project);
    this.plugins = new PluginRegistry(this.parent);
  },

  included(includer) {
    debug('included in %s', includer.name);

    if (this.belongsToAddon()) {
      this.verifyStylesDirectory();
      this.parentAddon = includer;
    }

    this._super.included.apply(this, arguments);

    this.cssModulesOptions = this.plugins.computeOptions(
      includer.options && includer.options.cssModules
    );
    this.setupTemplateTransform();
  },

  setupPreprocessorRegistry(type, registry) {
    // Skip if we're setting up this addon's own registry
    if (type !== 'parent') {
      return;
    }

    this.parentPreprocessorRegistry = registry;

    registry.add('js', this.modulesPreprocessor);
    registry.add('css', this.outputStylesPreprocessor);
  },

  setupTemplateTransform() {
    // This is a pretty sketchy approach, as we're adding another entry to the
    // template transform registry long after `setupPreprocessorRegistry` was called,
    // but for backcompat reasons, we need to wait to compute the effective ECM
    // options until our own `included()` hook, and we need those options in order
    // to configure the template transform.
    if (!this.parentPreprocessorRegistry) {
      throw new Error(
        '[ember-css-modules] internal error: unable to locate parent preprocessor registry'
      );
    }

    this.parentPreprocessorRegistry.add(
      'htmlbars-ast-plugin',
      HtmlbarsPlugin.instantiate({
        emberVersion: this.checker.for('ember-source').version,
        options: {
          fileExtension: this.getFileExtension(),
          includeExtensionInModulePath: this.includeExtensionInModulePath(),
        },
      })
    );
  },

  verifyStylesDirectory() {
    if (
      !fs.existsSync(
        path.join(this.parent.root, this.parent.treePaths['addon-styles'])
      )
    ) {
      this.ui.writeWarnLine(
        'The addon ' +
          this.getParentName() +
          ' has ember-css-modules installed, but no addon styles directory. ' +
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
    return (
      this.cssModulesOptions.passthroughFileExtensions || [
        'css',
        'scss',
        'sass',
        'less',
        'styl',
      ]
    );
  },

  getScopedNameGenerator() {
    if (!this._scopedNameGenerator) {
      let rootOptions = this._findRootApp().options.cssModules || {};
      this._scopedNameGenerator =
        this.cssModulesOptions.generateScopedName ||
        rootOptions.generateScopedName ||
        require('./lib/generate-scoped-name');
    }

    return this._scopedNameGenerator;
  },

  getModuleRelativePath(fullPath) {
    return this.modulesPreprocessor.getModuleRelativePath(fullPath);
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
    return (
      (this.cssModulesOptions && this.cssModulesOptions.extension) || 'css'
    );
  },

  includeExtensionInModulePath() {
    return !!this.cssModulesOptions.includeExtensionInModulePath;
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
    return modules.map((file) =>
      file.endsWith(`.${extension}`) ? file : `${file}.${extension}`
    );
  },

  enableSourceMaps() {
    if (this._enableSourceMaps === undefined) {
      var mapOptions = this._findRootApp().options.sourcemaps;
      this._enableSourceMaps =
        mapOptions.enabled && mapOptions.extensions.indexOf('css') !== -1;
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
  },
};
