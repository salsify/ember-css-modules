/* eslint-env node */
'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const Funnel = require('broccoli-funnel');
const path = require('path');

const HAS_EMBER_SOURCE = 'ember-source' in require('./package.json').devDependencies;

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    sourcemaps: {
      extensions: ['js', 'css'],
      enabled: true
    },

    cssModules: {
      virtualModules: {
        'virtual-constants': {
          'superbold': 800,
          'important-background': 'rgb(255, 255, 0)'
        }
      }
    }
  });

  if (app.env === 'test') {
    app.import(`${HAS_EMBER_SOURCE ? 'vendor' : 'bower_components'}/ember/ember-template-compiler.js`);
  }

  let additionalTrees = [];

  if (HAS_EMBER_SOURCE) {
    additionalTrees.push(new Funnel(path.dirname(require.resolve('ember-source')), {
      srcDir: 'dist',
      destDir: 'vendor/ember',
      include: ['ember-template-compiler.js']
    }));
  }

  return app.toTree(additionalTrees);
};
