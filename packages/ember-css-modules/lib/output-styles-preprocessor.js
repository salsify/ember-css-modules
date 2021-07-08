'use strict';

const debug = require('debug')('ember-css-modules:output-styles-preprocessor');
const Concat = require('broccoli-concat');
const MergeTrees = require('broccoli-merge-trees');
const PostCSS = require('broccoli-postcss');
const { Funnel } = require('broccoli-funnel');

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

    let plugins = this.owner.getPostcssPlugins();
    let postprocessPlugins = plugins && plugins.postprocess;

    if (postprocessPlugins && postprocessPlugins.length) {
      debug('running postprocess plugins: %o', postprocessPlugins);

      concat = new PostCSS(concat, {
        plugins: postprocessPlugins,
        exclude: ['**/*.map']
      });
    }

    // If an intermediate output path is specified, we need to pass through the full contents of the styles tree
    // and trust that a subsequent preprocessor will appropriately filter out everything else.
    if (this.owner.getIntermediateOutputPath()) {
      let passthroughExtensions = this.owner.getPassthroughFileExtensions();
      if (passthroughExtensions.length) {
        inputNode = new Funnel(inputNode, { include: passthroughExtensions.map(ext => `**/*.${ext}`) });
      }
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
    let fixedHeaders = this.owner.getFixedModules('header');
    let fixedFooters = this.owner.getFixedModules('footer');
    let getHeaderFiles = this.getHeaderFiles.bind(this, new Set(fixedHeaders.concat(fixedFooters)));

    let concat = new Concat(modulesTree, options);
    let build = concat.build;
    concat.build = function() {
      this.footerFiles = fixedFooters;
      this.headerFiles = fixedHeaders.concat(getHeaderFiles());
      this._headerFooterFilesIndex = makeIndex(this.headerFiles, this.footerFiles);
      return build.apply(this, arguments);
    };

    return concat;
  }

  /*
   * Based on the @after-module directives in the source files, produces an ordered list of files that should be
   * boosted to the top of the concatenated output.
   */
  getHeaderFiles(fixedModules) {
    let explicitDeps = this.explicitDependencies(fixedModules);
    let implicitDeps = this.implicitDependencies(fixedModules);
    let sorted = require('toposort')(explicitDeps.concat(implicitDeps));
    debug('sorted dependencies %o', sorted);
    return sorted.filter(file => !fixedModules.has(file));
  }

  // Dependencies due to explicit `@after-module` declarations
  explicitDependencies(fixedModules) {
    let edges = [];

    this.eachFileWithDependencies('explicit', function(file, deps) {
      let currentFile = file, dep;

      if (fixedModules.has(currentFile)) {
        throw new Error(`Configured headerFiles and footerFiles can't use @after-module`);
      }

      // For each file with explicit dependencies, create a chain of edges in the reverse order they appear in source
      for (let i = deps.length - 1; i >= 0; i--) {
        dep = deps[i];

        if (fixedModules.has(dep)) {
          throw new Error(`Configured headerFiles and footerFiles can't be the target of @after-module`);
        }

        edges.push([dep, currentFile]);
        currentFile = dep;
      }
    });

    debug('explicit dependencies: %o', edges);
    return edges;
  }

  // Dependencies stemming from `composes:` and `@value` directives
  implicitDependencies(fixedModules) {
    let edges = [];

    this.eachFileWithDependencies('implicit', function(file, deps) {
      // headerFiles and footerFiles ignore implicit ordering constraints
      if (fixedModules.has(file)) { return; }

      deps.forEach(function(dep) {
        if (!fixedModules.has(dep)) {
          edges.push([dep, file]);
        }
      });
    });

    debug('implicit dependencies: %o', edges);
    return edges;
  }

  eachFileWithDependencies(type, callback) {
    let depMap = this.owner.getModuleDependencies();

    Object.keys(depMap).forEach((file) => {
      let deps = depMap[file] && depMap[file][type];
      if (!deps || !deps.length) { return; }

      let relativeFile = this.owner.getModuleRelativePath(file);
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
