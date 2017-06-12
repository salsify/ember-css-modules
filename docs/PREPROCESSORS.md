# Using ember-css-modules with other preprocessors

The one-step solution for using ember-css-modules in concert with another preprocessor like Sass or Less is to use a plugin like [ember-css-modules-sass](https://npmjs.com/package/ember-css-modules-sass). However, if you want to tweak the default behavior or are looking to implement your own integration with another preprocessor, the settings here will help you in that direction.

## Two Approaches

High level, there are two approaches to using ECM alongside another preprocessor.

### Modules and preprocessor syntax in isolation

The first is to have your modules be completely separate from e.g. your Sass, only combining the two at the very end of the build into a single stylesheet. In this scenario, you use vanilla CSS (possibly with some PostCSS plugins) in all your `.css` module files, and ember-css-modules doesn't touch any of your `.scss`/`.less`/etc files, leaving them to behave globally exactly as they did before.

The advantage to this approach is that it provides a clear migration path: as you convert global classes into local modularized styling, the file extension and syntax you use also changes with it, making the divide clear.

For example, with Sass you could install ember-cli-sass and then configure ember-css-modules to emit a `_modules` partial:

```js
cssModules: {
  intermediateOutputPath: 'app/styles/_modules.scss'
}
```

And then in your `app.scss`, simply import it:

```scss
// other Sass code and imports
@import 'modules';
```

Note: when specifying `intermediateOutputPath`, for an app you must include `app/styles/_modules.scss` at the front, but addon styles output is already implicitly scoped, so you would just set `intermediateOutputPath` to `_modules.scss`.

#### Custom syntax directly in modules

The second approach is viable for preprocessors for which there is a PostCSS syntax extension, such as [Sass](https://github.com/postcss/postcss-scss) and (at least partially) [Less](https://github.com/gilt/postcss-less). It allows for using custom preprocessor syntax directly in CSS modules, handing off the concatenated final output directly to the preprocessor. This is the approach taken by plugins like `ember-css-modules-sass`.

Again using Sass as an example, you would specify `app.scss` as your intermediate output file so that ember-cli-sass would pick it up directly, and then tell ember-css-modules to look for `.scss` files and pass through custom PostCSS syntax configuration.

```js
cssModules: {
  // Emit a combined SCSS file for ember-cli-sass to compile
  intermediateOutputPath: 'app/styles/app.scss',

  // Use .scss as the extension for CSS modules instead of the default .css
  extension: 'scss',

  // Pass a custom parser/stringifyer through to PostCSS for processing modules
  postcssOptions: {
    syntax: require('postcss-scss')
  }
}
```
