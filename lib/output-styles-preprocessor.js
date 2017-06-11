'use strict';

const debug = require('debug')('ember-css-modules:output-styles-preprocessor');
const ensurePosixPath = require('ensure-posix-path');
const Concat = require('broccoli-concat');
const MergeTrees = require('broccoli-merge-trees');

module.exports = class OutputStylesPreprocessor {
  constructor(options) {
    this.owner = options.owner;
  }

  toTree(inputNode, inputPath, outputDirectory, options) {
    let outputFile = this.owner.getIntermediateOutputPath() || options.outputPaths[this.owner.belongsToAddon() ? 'addon' : 'app'];
    let concatOptions = {
      inputFiles: ['**/*.' + this.owner.getFileExtension()],
      outputFile: outputFile,
      allowNone: true,
      sourceMapConfig: this.sourceMapConfig()
    };

    debug('concatenating module stylesheets: %o', concatOptions);

    let concat = this.dynamicHeaderConcat(concatOptions);

    // If an intermediate output path is specified, we need to pass through the full contents of the styles tree
    // and trust that a subsequent preprocessor will appropriately filter out everything else.
    if (this.owner.getIntermediateOutputPath()) {
      return new MergeTrees([inputNode, concat], { overwrite: true });
    } else {
      return concat;
    }
  }

  /*
   * A broccoli-concat tree that will dynamically order header files based on our @after-module directives.
   */
  dynamicHeaderConcat(options) {
    let modulesTree = this.owner.getModulesTree();
    let getHeaderFiles = this.getHeaderFiles.bind(this);

    let concat = new Concat(modulesTree, options);
    let build = concat.build;
    concat.build = function() {
      this.headerFiles = getHeaderFiles();
      this._headerFooterFilesIndex = makeIndex(this.headerFiles, this.footerFiles);
      return build.apply(this, arguments);
    };

    return concat;
  }

  /*
   * Based on the @after-module directives in the source files, produces an ordered list of files that should be
   * boosted to the top of the concatenated output.
   */
  getHeaderFiles() {
    let explicitDeps = this.explicitDependencies();
    let implicitDeps = this.implicitDependencies();
    let sorted = require('toposort')(explicitDeps.concat(implicitDeps));
    debug('sorted dependencies %o', sorted);
    return sorted;
  }

  // Dependencies due to explicit `@after-module` declarations
  explicitDependencies() {
    let edges = [];

    this.eachFileWithDependencies('explicit', function(file, deps) {
      let currentFile = file, dep;

      // For each file with explicit dependencies, create a chain of edges in the reverse order they appear in source
      for (let i = deps.length - 1; i >= 0; i--) {
        dep = deps[i];
        edges.push([dep, currentFile]);
        currentFile = dep;
      }
    });

    debug('explicit dependencies: %o', edges);
    return edges;
  }

  // Dependencies stemming from `composes:` and `@value` directives
  implicitDependencies() {
    let edges = [];

    this.eachFileWithDependencies('implicit', function(file, deps) {
      deps.forEach(function(dep) {
        edges.push([dep, file]);
      });
    });

    debug('implicit dependencies: %o', edges);
    return edges;
  }

  eachFileWithDependencies(type, callback) {
    let basePath = ensurePosixPath(this.owner.getModulesTree().inputPaths[0]) + '/';
    let depMap = this.owner.getModuleDependencies();

    Object.keys(depMap).forEach(function(file) {
      let deps = depMap[file] && depMap[file][type];
      if (!deps || !deps.length) { return; }

      let relativeFile = file.replace(basePath, '');
      callback(relativeFile, deps.filter(function(dep) {
        return dep.type === 'internal';
      }).map(function(dep) {
        return dep.keyPath;
      }));
    });
  }

  sourceMapConfig() {
    if (this.owner.enableSourceMaps()) {
      return {
        extensions: ['css'],
        mapCommentType: 'block'
      };
    }
  }
};

// Pulled straight from broccoli-concat :(
function makeIndex(a, b) {
  let index = Object.create(null);

  ((a || []).concat(b ||[])).forEach(function(a) {
    index[a] = true;
  });

  return index;
}
