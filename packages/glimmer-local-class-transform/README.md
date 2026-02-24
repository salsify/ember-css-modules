# `glimmer-local-class-transform`

This package provides a Glimmer template transform allowing the use of `local-class` as shorthand for importing and referencing a value from another module as a class name. Generally this is intended for use alongside [CSS Modules](https://github.com/css-modules/css-modules), a technique for writing scoped CSS supported out of the box by most bundlers like [Vite](https://vite.dev/guide/features#css-modules), [Webpack (`css-loader`)](https://webpack.js.org/loaders/css-loader/#modules), and [Parcel](https://parceljs.org/languages/css/#css-modules).

## Setup

This transform is designed for use in v2 Ember apps and addons. If you're using a v1 app or the classic build pipeline, use [`ember-css-modules`](../ember-css-modules) or [`ember-local-class`](../ember-local-class) instead.

### v2 Ember Apps

Register the transform in your `babel.config.cjs` as part of the `babel-plugin-ember-template-compilation` transforms:

```js
module.exports = {
  plugins: [
    [
      'babel-plugin-ember-template-compilation',
      {
        // ...
        transforms: [
          'glimmer-local-class-transform',
          // ...other transforms
        ],
      },
    ],
    // ...other plugins
  ],
};
```

### v2 Ember Addons

For v2 addons using Rollup, add the transform to your `babel.publish.config.cjs`:

```js
module.exports = {
  plugins: [
    '@embroider/addon-dev/template-colocation-plugin',
    [
      'babel-plugin-ember-template-compilation',
      {
        targetFormat: 'hbs',
        transforms: ['glimmer-local-class-transform'],
      },
    ],
    // ...other plugins
  ],
};
```

Make sure your Rollup babel plugin includes `.hbs` in its extensions so that standalone template files are processed:

```js
babel({
  extensions: ['.hbs', '.js', '.gjs'],
  babelHelpers: 'bundled',
  configFile: './babel.publish.config.cjs',
}),
```

### Config

To pass configuration options, use the array form instead of the string shorthand:

```js
transforms: [
  ['glimmer-local-class-transform', { pathMapping: { '\\.gjs$': '.css' } }],
],
```

The following options are available:

#### `pathMapping`

A mapping where each key is a regular expression and each value is a replacement string, used to determine the CSS module path for a given template file. The first matching pattern is used.

Replacement strings may use `$1`, `$2`, etc. to reference capture groups from the regular expression.

**Default:** `{ '(\\.g?[tj]s|\\.hbs)+$': '.module.css' }`

This default maps any `.js`, `.ts`, `.gjs`, `.gts`, or `.hbs` file to a `.module.css` file of the same name in the same directory.

Example — map `.gjs` and `.hbs` files to plain `.css`:

```js
pathMapping: {
  '\\.(gjs|hbs)$': '.css',
}
```

#### `runtimeModule`

The module specifier from which runtime helpers (`classNames`, `join`) are imported.

**Default:** `'glimmer-local-class-transform/-runtime'`

You generally don't need to change this unless you're providing your own runtime implementation.

## Usage

### Static class names

```hbs
<div local-class="my-class"></div>
```

This resolves `my-class` from the co-located CSS module and applies the scoped class name.

### Dynamic class names

```hbs
<div local-class={{someProperty}}></div>
```

### Mixed static and dynamic

```hbs
<div local-class="foo {{bar}}"></div>
```

### Combined with `class`

`local-class` and `class` can be used together on the same element. The resolved local classes are appended to the regular classes:

```hbs
<div class="global-class" local-class="scoped-class"></div>
```

### The `local-class` helper

For more control, you can use `local-class` as a helper directly in a `class` attribute. This also supports a `from` argument to reference a CSS module from a different path:

```hbs
<div class={{local-class "foo"}}></div>
<div class="bar {{local-class "foo" from="@some/other-module"}}"></div>
```

## How It Works

At compile time, the transform rewrites templates that use `local-class`:

1. It determines the CSS module path for the current template using `pathMapping` (e.g. `my-component.gjs` → `./my-component.module.css`).
2. It imports the CSS module's default export (the class name mapping object) and the `classNames` runtime helper.
3. It replaces `local-class` usages with calls to `classNames(styles, ...)`, which looks up each class name in the CSS module mapping and returns the corresponding scoped class names.

For example, `<div local-class="foo">` is transformed into the equivalent of:

```js
import styles from './my-component.module.css';
import { classNames } from 'glimmer-local-class-transform/-runtime';
```

```hbs
<div class={{classNames styles "foo"}}></div>
```
