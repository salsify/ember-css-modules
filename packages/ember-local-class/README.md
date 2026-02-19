# `ember-local-class`

This package is a lightweight wrapper around [`glimmer-local-class-transform`](https://npmjs.com/package/glimmer-local-class-transform) that automatically installs the transform in a v1 `ember-cli` application. Due to the timing of initialization in the v1 build pipeline, it's not possible for applications to install template transforms in their own config; an addon must do it for them—hence this package.

## Config

Configuration can be specified in the `new EmberApp()` constructor parameters in your `ember-cli-build.js` under an `ember-local-class` key.

### `extension`

Default: `.module.css`

The extension style modules are expected to have. This is used when populating the default `pathMapping`; this option has no effect if you specify your own `pathMapping`.

### `pathMapping`

An object mapping template paths to their corresponding CSS module paths. Each key is a regular expression, and the first matching key for a given module will be the one used to import the CSS module. By default, legacy "pod" and "classic" layout `.hbs` files will map to corresponding stylesheets under those layout patterns, and any other `.hbs` files (as well as `.js`/`.ts`/`.gjs`/`.gts` files) will map to a "colocated" stylesheet in the same location as the template's source file.

```js
let defaultPathMapping = {
  '/template\\.hbs$': `/styles${extension}`,
  '/templates/(.*/)?(.*)\\.hbs$': `/styles/$1$2${extension}`,
  '(\\.g?[tj]s|\\.hbs)+$': extension,
};
```
