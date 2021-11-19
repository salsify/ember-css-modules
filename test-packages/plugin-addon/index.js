'use strict';

const Plugin = require('ember-css-modules/lib/plugin');
const MergeTrees = require('broccoli-merge-trees');
const FileCreator = require('broccoli-file-creator');

module.exports = {
  name: require('./package').name,

  createCssModulesPlugin(parent) {
    return (this.plugin = new LoggingPlugin(parent));
  },

  postprocessTree(type, tree) {
    if (type === 'all') {
      tree = new MergeTrees([
        tree,
        new FileCreator(
          'assets/plugin-log.json',
          () => this.plugin.buildPromise
        ),
      ]);
    }
    return tree;
  },
};

class LoggingPlugin extends Plugin {
  constructor(parent) {
    super(parent);
    this.logItems = [];
    this.buildPromise = new Promise((r) => (this.resolve = r));
  }

  config() {
    this.logItems.push('config');
  }

  buildStart() {
    this.logItems.push('buildStart');
  }

  buildSuccess() {
    this.logItems.push('buildSuccess');
  }

  buildError() {
    this.logItems.push('buildError');
  }

  buildEnd() {
    this.logItems.push('buildEnd');
    this.resolve(JSON.stringify(this.logItems));
  }
}
