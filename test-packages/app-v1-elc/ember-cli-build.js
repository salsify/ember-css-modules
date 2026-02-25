'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const config = {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
      throwUnlessParallelizable: true,
    },
  };

  if (process.env.EMBROIDER) {
    const { Webpack } = require('@embroider/webpack');
    const app = new EmberApp(defaults, config);
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
    const app = new EmberApp(defaults, {
      ...config,
      autoImport: {
        allowAppImports: ['**/*.module.css'],
        cssLoaderOptions: {
          modules: { auto: true },
        },
      },
    });

    return app.toTree();
  }
};
