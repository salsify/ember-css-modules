/* eslint-env node */
/* eslint node/no-extraneous-require:off */
'use strict';

const Plugin = require('broccoli-plugin');
const webpack = require('webpack');

module.exports = {
  name: 'template-stuff',

  included() {
    this._super.included.apply(this, arguments);

    this.import('node_modules/ember-source/dist/ember-template-compiler.js');
    this.import('vendor/ecm-template-transform.js', {
      using: [{ transformation: 'amd', as: 'ecm-template-transform' }],
    });
  },

  treeForVendor() {
    return new HTMLBarsPluginTree(this.project);
  },
};

class HTMLBarsPluginTree extends Plugin {
  constructor(project) {
    super([], {
      persistentOutput: true,
    });

    this.project = project;
    this.built = false;
  }

  build() {
    if (this.built) return;

    return new Promise((resolve, reject) => {
      webpack(
        {
          mode: 'development',
          entry: `${this.project.root}/lib/htmlbars-plugin`,
          output: {
            path: this.outputPath,
            filename: 'ecm-template-transform.js',
            library: 'ecm-template-transform',
            libraryTarget: 'umd',
          },
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
