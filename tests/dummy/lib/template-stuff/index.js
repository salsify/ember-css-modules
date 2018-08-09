/* eslint-env node */
/* eslint node/no-extraneous-require:off */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = {
  name: 'template-stuff',

  isDevelopingAddon() {
    return true;
  },

  init(parent) {
    this._super.init && this._super.init.apply(this, arguments);

    let project = parent;
    while (project.parent) {
      project = project.parent;
    }

    this.isDisabled = project.name() !== 'ember-css-modules';
  },

  included() {
    this._super.included.apply(this, arguments);

    if (!this.isDisabled && EmberApp.env() === 'test') {
      this.import('node_modules/ember-source/dist/ember-template-compiler.js');
      this.import('vendor/ecm-template-transform.js', {
        using: [{ transformation: 'amd', as: 'ecm-template-transform' }]
      });
    }
  },

  treeForVendor() {
    if (!this.isDisabled) {
      const Rollup = require('broccoli-rollup');
      return new Rollup(`${__dirname}/../../../../lib`, {
        rollup: {
          input: 'htmlbars-plugin/index.js',
          plugins: [
            require('rollup-plugin-commonjs')(),
            require('rollup-plugin-node-resolve')()
          ],
          output: {
            file: 'ecm-template-transform.js',
            format: 'umd',
            name: 'ecm-template-transform'
          }
        }
      });
    }

    return this._super.treeForVendor.apply(this, arguments);
  }
};
