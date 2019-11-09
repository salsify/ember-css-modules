# Using ember-css-modules with tailwindcss

Adapted from https://github.com/chrism/emberjs-tailwind-purgecss

## Installation

```bash
ember install ember-css-modules
yarn add tailwindcss postcss-import @fullhuman/postcss-purgecss -D
```

## Setup tailwindcss
```bash
mkdir app/tailwind
npx tailwind init app/tailwind/config.js --full
```

## Create new CSS files and import Tailwind

Create app/styles/components.css and app/styles/utilities.css then update app.css

```css
@import "tailwindcss/base";

@import "tailwindcss/components";
@import "components.css";

@import "tailwindcss/utilities";
@import "utilities.css";
```

## Update build pipeline to include plugins

```js
// ember-cli-build.js
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const isProduction = EmberApp.env() === 'production';

const purgeCSS = {
  module: require('@fullhuman/postcss-purgecss'),
  options: {
    content: [
      // add extra paths here for components/controllers which include tailwind classes
      './app/index.html',
      './app/templates/**/*.hbs',
      './app/components/**/*.hbs'
    ],
    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
  }
}

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    cssModules: {
      plugins: [
        require('postcss-import')({path: ['node_modules']}),
        require('tailwindcss')('./app/tailwind/config.js'),
        ...isProduction ? [purgeCSS] : []
      ]
    }
  });

  return app.toTree();
};
```
