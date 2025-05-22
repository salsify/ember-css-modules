'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      cssLoaderOptions: {
        modules: { auto: true },
      },
    },

    'ember-cli-babel': {
      enableTypeScriptTransform: true,
      throwUnlessParallelizable: true,
    },

    // Note to the reader: these options still exist for backwards-compatibility reasons,
    // but generally shouldn't be adopted going forward as they have no direct counterpart
    // in bundler-native CSS Modules support.
    cssModules: {
      headerModules: [
        'app-v1-ecm/styles/ordering/h',
        'app-v1-ecm/styles/ordering/g',
      ],
      footerModules: [
        'app-v1-ecm/styles/ordering/t',
        'app-v1-ecm/styles/ordering/u',
      ],
      virtualModules: {
        'virtual-constants': {
          superbold: 800,
          'important-background': 'rgb(255, 255, 0)',
        },
      },
    },
  });

  if (process.env.EMBROIDER) {
    const { Webpack } = require('@embroider/webpack');
    return require('@embroider/compat').compatBuild(app, Webpack, {
      staticEmberSource: true,
      staticAddonTestSupportTrees: true,
      staticAddonTrees: true,
      staticComponents: true,
      staticHelpers: true,
      staticModifiers: true,
      packagerOptions: {
        cssLoaderOptions: {
          modules: { auto: true },
        },
      },
    });
  } else {
    return app.toTree();
  }
};
