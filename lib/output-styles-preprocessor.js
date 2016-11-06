/* jshint node: true */
'use strict';

var debug = require('debug')('ember-css-modules:output-styles-preprocessor');
var ensurePosixPath = require('ensure-posix-path');
var Concat = require('broccoli-concat');
var MergeTrees = require('broccoli-merge-trees');

module.exports = OutputStylesPreprocessor;

function OutputStylesPreprocessor(options) {
  this.owner = options.owner;
}

OutputStylesPreprocessor.prototype.constructor = OutputStylesPreprocessor;
OutputStylesPreprocessor.prototype.toTree = function(inputNode, inputPath, outputDirectory, options) {
  var outputFile = this.owner.getIntermediateOutputPath() || options.outputPaths[this.owner.belongsToAddon() ? 'addon' : 'app'];
  var concatOptions = {
    inputFiles: ['**/*.' + this.owner.getFileExtension()],
    outputFile: outputFile,
    allowNone: true,
    sourceMapConfig: this.sourceMapConfig()
  };

  debug('concatenating module stylesheets: %o', concatOptions);

  var concat = this.dynamicHeaderConcat(concatOptions);

  // If an intermediate output path is specified, we need to pass through the full contents of the styles tree
  // and trust that a subsequent preprocessor will appropriately filter out everything else.
  if (this.owner.getIntermediateOutputPath()) {
    return new MergeTrees([inputNode, concat], { overwrite: true });
  } else {
    return concat;
  }
};

/*
 * A broccoli-concat tree that will dynamically order header files based on our @after-module directives.
 */
OutputStylesPreprocessor.prototype.dynamicHeaderConcat = function(options) {
  var modulesTree = this.owner.getModulesTree();
  var getHeaderFiles = this.getHeaderFiles.bind(this);

  var concat = new Concat(modulesTree, options);
  var build = concat.build;
  concat.build = function() {
    this.headerFiles = getHeaderFiles();
    this._headerFooterFilesIndex = makeIndex(this.headerFiles, this.footerFiles);
    return build.apply(this, arguments);
  };

  return concat;
};

/*
 * Based on the @after-module directives in the source files, produces an ordered list of files that should be
 * boosted to the top of the concatenated output.
 */
OutputStylesPreprocessor.prototype.getHeaderFiles = function() {
  var explicitDeps = this.explicitDependencies();
  var implicitDeps = this.implicitDependencies();
  var sorted = require('toposort')(explicitDeps.concat(implicitDeps));
  debug('sorted dependencies %o', sorted);
  return sorted;
};

// Dependencies due to explicit `@after-module` declarations
OutputStylesPreprocessor.prototype.explicitDependencies = function() {
  var edges = [];

  this.eachFileWithDependencies('explicit', function(file, deps) {
    var currentFile = file, dep;

    // For each file with explicit dependencies, create a chain of edges in the reverse order they appear in source
    for (var i = deps.length - 1; i >= 0; i--) {
      dep = deps[i];
      edges.push([dep, currentFile]);
      currentFile = dep;
    }
  });

  debug('explicit dependencies: %o', edges);
  return edges;
};

// Dependencies stemming from `composes:` and `@value` directives
OutputStylesPreprocessor.prototype.implicitDependencies = function() {
  var edges = [];

  this.eachFileWithDependencies('implicit', function(file, deps) {
    deps.forEach(function(dep) {
      edges.push([dep, file]);
    });
  });

  debug('implicit dependencies: %o', edges);
  return edges;
};

OutputStylesPreprocessor.prototype.eachFileWithDependencies = function(type, callback) {
  var basePath = ensurePosixPath(this.owner.getModulesTree().inputPaths[0]) + '/';
  var depMap = this.owner.getModuleDependencies();

  Object.keys(depMap).forEach(function(file) {
    var deps = depMap[file] && depMap[file][type];
    if (!deps || !deps.length) { return; }

    var relativeFile = file.replace(basePath, '');
    callback(relativeFile, deps.filter(function(dep) {
      return dep.type === 'internal';
    }).map(function(dep) {
      return dep.keyPath;
    }));
  });
};

OutputStylesPreprocessor.prototype.sourceMapConfig = function() {
  if (this.owner.enableSourceMaps()) {
    return {
      extensions: ['css'],
      mapCommentType: 'block'
    };
  }
}

// Pulled straight from broccoli-concat :(
function makeIndex(a, b) {
  var index = Object.create(null);

  ((a || []).concat(b ||[])).forEach(function(a) {
    index[a] = true;
  });

  return index;
}
