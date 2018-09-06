'use strict';

// eslint-disable-next-line node/no-missing-require
const Plugin = require('ember-css-modules/lib/plugin');

module.exports = {
  name: 'noisy',

  createCssModulesPlugin(parent) {
    return new NoisyPlugin(parent);
  }
};

class NoisyPlugin extends Plugin {
  config() {
    this.parent.ui.writeLine('[plugin] config');
  }

  buildStart() {
    this.parent.ui.writeLine('[plugin] buildStart');
  }

  buildEnd() {
    this.parent.ui.writeLine('[plugin] buildEnd');
  }

  buildSuccess() {
    this.parent.ui.writeLine('[plugin] buildSuccess');
  }

  buildError() {
    this.parent.ui.writeLine('[plugin] buildError')
  }
}
