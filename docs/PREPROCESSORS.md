# Using ember-css-modules with other preprocessors

The one-step solution for using ember-css-modules in concert with another preprocessor like Sass or Less is to use a plugin like [ember-css-modules-sass](https://npmjs.com/package/ember-css-modules-sass) or [ember-css-modules-less](https://www.npmjs.com/package/ember-css-modules-less). However, if you want to tweak the default behavior or are looking to implement your own integration with another preprocessor, the settings here will help you in that direction.

## Three Approaches

High level, there are three approaches to using ember-css-modules with a preprocessor.

### 1. Vanilla modules alongside preprocessed style files

The first is to have your modules be completely separate from e.g. your Sass, only combining the two at the very end of the build into a single stylesheet. In this scenario, you use vanilla `.css` (possibly with some PostCSS plugins) for all your module files, and ember-css-modules doesn't touch any of your `.scss`/`.less`/etc files, leaving them to behave exactly as they did before.

For example, with Sass you could install ember-cli-sass and then configure ember-css-modules to emit a `_modules` partial:

```js
// ember-cli-build.js

const app = new EmberApp(defaults, {
  cssModules: {
    intermediateOutputPath: 'app/styles/_modules.scss'
  }
  // ...
};
```

And then in your `app.scss`, simply import it:

```scss
// ...other Sass code and imports...

@import 'modules';
```

> **Note**: when specifying `intermediateOutputPath` for an app you must include `app/styles/_modules.scss` at the front, but for addons the output is implicitly scoped so you would just set `intermediateOutputPath` to `_modules.scss`.

The advantage to this approach is that it provides a clear migration path: as you convert global classes into local modularized styling, the file extension and syntax you use also changes with it, making the divide clear.

### 2. Preprocessed modules alongside preprocessed style files

This approach is identical to the the first except it allows you to use preprocessor sytnax for your CSS modules as well. To avoid confusion between module files and regular style files a custom extension is used for the modules. The concatenated, final output of the modules is imported into your `app.scss`/`app.less` file like above.

Important to note is that for this approach to work a PostCSS plugin for your preprocessor syntax is required, such as [postcss-sass](https://github.com/postcss/postcss-scss) or [postcss-less](https://github.com/shellscape/postcss-less). If using an ember-css-modules plugin like [ember-css-modules-sass](https://npmjs.com/package/ember-css-modules-sass) or [ember-css-modules-less](https://www.npmjs.com/package/ember-css-modules-less) this will be handled for you.

Using Less as an example:

```js
// ember-cli-build.js

cssModules: {
  intermediateOutputPath: 'app/styles/_modules.less',
  extension: 'module.less'
}
```

With this config `app/styles/foo.module.less` would be treated as a CSS module for the `foo` route, but `app/styles/bar.less` would be treated like normal. Like above, the result would then be imported into your `app.less` file:

```less
// ...other Less code and imports...

@import "modules";
```

Like the first approach, this setup provides a clear migration path: as you convert global styles into modules the file extension (and possibly file location) change with it.

### 3. Preprocessed modules only

For the third approach only CSS modules are used but with preprocessor syntax. (Like the second approach this is only possible if a PostCSS syntax exists for your preprocessor.) In this case the concatenated modules are output as your `app.scss`/`app.less` directly (rather than being imported).

Again using Sass as an example, you would specify `app.scss` as your intermediate output file so that ember-cli-sass would pick it up directly, and then tell ember-css-modules to look for `.scss` files and pass through custom PostCSS syntax configuration.

```js
// ember-cli-build.js

cssModules: {
  // Emit a combined SCSS file for ember-cli-sass to compile
  intermediateOutputPath: 'app/styles/app.scss',

  // Use .scss as the extension for CSS modules instead of the default .css
  extension: 'scss',

  // Pass a custom parser/stringifyer through to PostCSS for processing modules OR use a plugin instead, like ember-css-modules-sass
  postcssOptions: {
    syntax: require('postcss-scss')
  }
}
```

## Passing Through Other Files

When you configure an `intermediateOutputPath`, ember-css-modules will automatically pass through all files with stylesheet-like extensions for subsequent processors to be able to include. If you're relying on being able to reference data from other files in a downstream processing step, you may configure the extensions of files that should be passed on.

```js
// ember-cli-build.js

cssModules: {
  passthroughFileExtensions: ['json']
}
```
