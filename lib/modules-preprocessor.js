/* jshint node: true */
'use strict';

var Funnel = require('broccoli-funnel');
var CSSModules = require('broccoli-css-modules');
var MergeTrees = require('broccoli-merge-trees');

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

  // Hack: manually exclude stuff in tests/modules because of https://github.com/ember-cli/ember-cli-qunit/pull/96
  var filteredInput = new Funnel(inputTree, {
    exclude: ['**/tests/modules/**'],
    include: ['**/*.css']
  });

  // This is gross, but we don't have a way to treat stuff in /app/styles uniformly with everything else in /app
  if (!this.owner.belongsToAddon()) {
    var appStyles = new Funnel(this.owner.app.trees.styles, { destDir: this.owner.app.name + '/styles' });
    filteredInput = new MergeTrees([filteredInput, appStyles]);
  }

  this.modulesTree = new CSSModules(filteredInput, {
    plugins: this.owner.getPlugins(),
    generateScopedName: this.owner.getScopedNameGenerator(),
    resolvePath: resolvePath,
    formatJS: formatJS
  });

  return new MergeTrees([inputTree, this.modulesTree], { overwrite: true });
};

/*
 * When processing an addon, CSS won't be included unless `.css` is specified as the extension. On the other hand,
 * we'll get the CSS regardless when processing apps, but registering as a `.css` processor will cause terrible things
 * to happen when `app.import`ing a CSS file.
 */
ModulesPreprocessor.prototype.getExtension = function() {
  return this.owner.belongsToAddon() ? 'css' : null;
};

var IMPORT = 'import StylesObject from \'ember-css-modules/styles-object\';';
var EXPORT_PRE = 'export default StylesObject.create(';
var EXPORT_POST = ');\n';

function formatJS(classMapping) {
  return IMPORT + '\n\n' + EXPORT_PRE + JSON.stringify(classMapping, null, 2) + EXPORT_POST;
}
