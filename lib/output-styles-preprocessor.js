/* jshint node: true */
'use strict';

var debug = require('debug')('ember-css-modules:output-styles-preprocessor');
var Plugin = require('broccoli-plugin');
var Concat = require('broccoli-concat');

module.exports = OutputStylesPreprocessor;

function OutputStylesPreprocessor(options) {
  this.owner = options.owner;
}

OutputStylesPreprocessor.prototype.constructor = OutputStylesPreprocessor;
OutputStylesPreprocessor.prototype.toTree = function(inputNode, inputPath, outputPath, options) {
  if (this.owner.belongsToAddon()) {
    // Addon styles will be concatenated by the CLI automatically from the ModulesPreprocessor's output
    return EMPTY_NODE;
  } else {
    // App styles need to be explicitly concatenated into the configured output file
    debug('concatenating app styles into %s', options.outputPaths.app);
    
    return new Concat(this.owner.getModulesTree(), {
      inputFiles: ['**/*.css'],
      outputFile: options.outputPaths.app,
      allowNone: true
    });
  }
};

var EMPTY_NODE = new Plugin([]);
EMPTY_NODE.build = function() {};
