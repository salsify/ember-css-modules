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
    let outputFile =
      this.owner.getIntermediateOutputPath() ||
      options.outputPaths[this.owner.belongsToAddon() ? 'addon' : 'app'];
    let concatOptions = {
      inputFiles: ['**/*.' + this.owner.getFileExtension()],
      outputFile: outputFile,
      allowNone: true,
      sourceMapConfig: this.sourceMapConfig(),
    };

    debug('concatenating module stylesheets: %o', concatOptions);

    let concat = this.dynamicHeaderConcat(concatOptions);

    let plugins = this.owner.getPostcssPlugins();
    let postprocessPlugins = plugins && plugins.postprocess;

    if (postprocessPlugins && postprocessPlugins.length) {
      debug('running postprocess plugins: %o', postprocessPlugins);

      concat = new PostCSS(concat, {
        plugins: postprocessPlugins,
        exclude: ['**/*.map'],
      });
    }

    // If an intermediate output path is specified, we need to pass through the full contents of the styles tree
    // and trust that a subsequent preprocessor will appropriately filter out everything else.
    if (this.owner.getIntermediateOutputPath()) {
      let passthroughExtensions = this.owner.getPassthroughFileExtensions();
      if (passthroughExtensions.length) {
        inputNode = new Funnel(inputNode, {
          include: passthroughExtensions.map((ext) => `**/*.${ext}`),
        });
      }
      return new MergeTrees([inputNode, concat], { overwrite: true });
    } else {
      return concat;
    }
  }

  /*
   * A broccoli-concat tree that will dynamically order header files based on dependencies
   * between modules and declared header files.
   */
  dynamicHeaderConcat(options) {
    let modulesTree = this.owner.getModulesTree();
    let fixedHeaders = this.owner.getFixedModules('header');
    let fixedFooters = this.owner.getFixedModules('footer');
    let getDependentFiles = this.getDependentFiles.bind(
      this,
      new Set(fixedHeaders.concat(fixedFooters))
    );

    let concat = new Concat(modulesTree, options);
    let build = concat.build;
    concat.build = function () {
      this.footerFiles = fixedFooters;
      this.headerFiles = fixedHeaders.concat(getDependentFiles());
      this._headerFooterFilesIndex = makeIndex(
        this.headerFiles,
        this.footerFiles
      );
      return build.apply(this, arguments);
    };

    return concat;
  }

  /*
   * Based on dependencies between modules, produce an ordered list of modules that
   * should be boosted to the top of output, just below
   */
  getDependentFiles(fixedModules) {
    let implicitDeps = this.implicitDependencies(fixedModules);
    let sorted = require('toposort')(implicitDeps);
    debug('sorted dependencies %o', sorted);
    return sorted.filter((file) => !fixedModules.has(file));
  }

  // Dependencies stemming from `composes:` and `@value` directives
  implicitDependencies(fixedModules) {
    let edges = [];

    this.eachFileWithDependencies(function (file, deps) {
      // headerFiles and footerFiles ignore implicit ordering constraints
      if (fixedModules.has(file)) {
        return;
      }

      deps.forEach(function (dep) {
        if (!fixedModules.has(dep)) {
          edges.push([dep, file]);
        }
      });
    });

    debug('implicit dependencies: %o', edges);
    return edges;
  }

  eachFileWithDependencies(callback) {
    let depMap = this.owner.getModuleDependencies();

    Object.keys(depMap).forEach((file) => {
      let deps = depMap[file] && depMap[file];
      if (!deps || !deps.length) {
        return;
      }

      let relativeFile = this.owner.getModuleRelativePath(file);
      callback(
        relativeFile,
        deps
          .filter(function (dep) {
            return dep.type === 'internal';
          })
          .map(function (dep) {
            return dep.keyPath;
          })
      );
    });
  }

  sourceMapConfig() {
    if (this.owner.enableSourceMaps()) {
      return {
        extensions: ['css'],
        mapCommentType: 'block',
      };
    }
  }
};

// Pulled straight from broccoli-concat :(
function makeIndex(a, b) {
  let index = Object.create(null);

  (a || []).concat(b || []).forEach(function (a) {
    index[a] = true;
  });

  return index;
}
