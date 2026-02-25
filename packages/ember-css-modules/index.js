'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('debug')('ember-css-modules:addon');

const { localClassRegistryPlugin } = require('glimmer-local-class-transform');
const ModulesPreprocessor = require('./lib/modules-preprocessor');
const OutputStylesPreprocessor = require('./lib/output-styles-preprocessor');
const normalizePostcssPlugins = require('./lib/utils/normalize-postcss-plugins');

module.exports = {
  name: require('./package.json').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);
    this.modulesPreprocessor = new ModulesPreprocessor({ owner: this });
    this.outputStylesPreprocessor = new OutputStylesPreprocessor({
      owner: this,
    });
  },

  included(includer) {
    debug('included in %s', includer.name);

    if (this.belongsToAddon()) {
      this.verifyStylesDirectory();
      this.parentAddon = includer;
    }

    this._super.included.apply(this, arguments);

    this.cssModulesOptions = includer.options?.cssModules ?? {};
    this.cssModulesOptions.plugins = normalizePostcssPlugins(
      this.cssModulesOptions.plugins
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

    let fileExtension = `.${this.getFileExtension()}`;
    let defaultExtension = this.includeExtensionInModulePath()
      ? fileExtension
      : '';
    let runtimeModule = 'ember-css-modules/-runtime';
    let pathMapping = {
      '/template\\.hbs$': `/styles${defaultExtension}`,
      '/templates/(.*/)?(.*)\\.hbs$': `/styles/$1$2${defaultExtension}`,
      '(\\.g?[tj]s|\\.hbs)+$': fileExtension,
    };

    this.parentPreprocessorRegistry.add(
      'htmlbars-ast-plugin',
      localClassRegistryPlugin({ pathMapping, runtimeModule })
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
    return (this.cssModulesOptions.extension ?? 'css').replace(/^\./, '');
  },

  includeExtensionInModulePath() {
    return !!this.cssModulesOptions.includeExtensionInModulePath;
  },

  getPostcssOptions() {
    return this.cssModulesOptions.postcssOptions;
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
