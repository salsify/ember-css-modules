# PostCSS Plugins

Since the CSS module loader is built on [PostCSS](https://github.com/postcss/postcss), your modules have access to the [full range of plugins](http://postcss.parts/) that exist.

## Simple Usage

For example, to automatically manage vendor prefixes with [Autoprefixer](https://github.com/postcss/autoprefixer):

```js
var autoprefixer = require('autoprefixer');
// ...
new EmberApp(defaults, {
  cssModules: {
    plugins: [
      autoprefixer('last 2 versions')
    ]
  }
});
```

## Plugin Configuration

If you're unfamiliar with PostCSS, it may not be obvious how you pass configuration to a plugin. PostCSS plugins are themselves actually functions that you call with the configuration you want to pass to them. In the Autoprefixer example above, note that we call the `autoprefixer` function with the config we want to use with it (in this case a simple string, but with many plugins this would be an object literal with any number of option keys provided).

Note: if you're coming from `ember-cli-postcss`, its nonstandard `[plugin, config]` tuple format is _not_ supported.

## Before/After PostCSS Plugins

By default, any PostCSS plugins you specify will be applied after the module transformation. To apply a set of plugins beforehand instead, you can pass a hash with `before` and `after` keys. For instance, if you wanted to use [postcss-nested](https://github.com/postcss/postcss-nested) so that you could define a set of global classes as a single block:

```js
new EmberApp(defaults, {
  cssModules: {
    plugins: {
      before: [
        nested
      ],
      after: [
        autoprefixer('last 2 versions')
      ]
    }
  }
});
```

## Post-Process Plugins

You can also provide a set of `postprocess` plugins that will run on the file after it has been concatenated.  This is useful for plugins like `postcss-sprites` that behave better when run against a single file. The `postprocess` array will be passed through to the `plugins` option in [`broccoli-postcss`](https://github.com/jeffjewiss/broccoli-postcss#broccolipostcsstree-options); see that package for details.

```javascript
new EmberApp(defaults, {
  cssModules: {
    plugins: {
      postprocess: [
        require('postcss-sprites')({ /* options */ })
      ]
    }
  }
});
```

## Importing Third Party Files

Out of the box, ember-css-modules doesn't provide a way to to include CSS from outside the app or addon in development. Where possible, including these styles by `app.import`ing them from Bower or using a tool like [ember-cli-node-assets](https://github.com/dfreeman/ember-cli-node-assets) is a good practice, since the build pipeline will have to do less work during development, and your users will benefit from better caching in `vendor.css`.

Some styling tools, however, allow for customization as part of a build process. As a specific example, [Basscss](http://www.basscss.com/) allows you to define specific [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) to customize its default styling. To accomplish this with ember-css-modules, you can use [postcss-import](https://github.com/postcss/postcss-import) and [postcss-css-variables](https://github.com/MadLittleMods/postcss-css-variables).

```js
new EmberApp(defaults, {
  cssModules: {
    plugins: [
      require('postcss-import'),
      require('postcss-css-variables')
    ]
  }
});
```

```css
/* app/styles/third-party.css */
@import 'some-other-library';
@import 'basscss';

:root {
  --h1: 4rem;
}
```

Note that any plugins that run _after_ postcss-import will be applied to the imported files, which is why setting the `--h1` variable above affects the Basscss output.
