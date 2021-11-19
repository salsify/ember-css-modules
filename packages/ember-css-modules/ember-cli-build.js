'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    sourcemaps: {
      extensions: ['js', 'css'],
      enabled: true
    },

    'ember-cli-babel': {
      throwUnlessParallelizable: true
    },

    cssModules: {
      _silenceAfterModuleDeprecation: true,
      headerModules: [
        'dummy/styles/testing/ordering/h',
        'dummy/styles/testing/ordering/g'
      ],
      footerModules: [
        'dummy/styles/testing/ordering/t',
        'dummy/styles/testing/ordering/u'
      ],
      virtualModules: {
        'virtual-constants': {
          'superbold': 800,
          'important-background': 'rgb(255, 255, 0)'
        }
      },
      plugins: {
        postprocess: [
          require('postcss-color-rebeccapurple')()
        ]
      }
    }
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
