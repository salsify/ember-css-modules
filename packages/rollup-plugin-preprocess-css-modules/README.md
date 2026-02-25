# `rollup-plugin-preprocess-css-modules`

A Rollup plugin that preprocesses [CSS Modules](https://github.com/css-modules/css-modules) at build time, replacing `.module.css` imports with plain CSS and a static JS mapping object.

This is primarily useful for component libraries that want to use CSS Modules as an internal implementation detail while publishing standard CSS that doesn't require CSS Module support from consuming apps.

## What It Does

Given a CSS Module import like this:

```js
import styles from './my-component.module.css';
```

```css
/* my-component.module.css */
.title {
  color: darkblue;
}
```

The plugin produces two output files:

```js
// my-component.module.css.js
import './my-component.css';

export default {
  title: '_title_abc123_',
};
```

```css
/* my-component.css */
._title_abc123_ {
  color: darkblue;
}
```

The original import is rewritten to point at the generated `.module.css.js` file, so consuming code continues to work unchanged — but the published output is plain CSS with no CSS Modules processing required.

## Setup

Add the plugin to your `rollup.config.mjs`:

```js
import { preprocessCSSModules } from 'rollup-plugin-preprocess-css-modules';

export default {
  plugins: [
    // ...other plugins
    preprocessCSSModules(),
    // If using @embroider/addon-dev, keep the emitted .css files in output:
    addon.keepAssets(['**/*.css']),
  ],
};
```

## Config

All options are optional:

```js
preprocessCSSModules({
  include: '**/*.module.css',
  generateScopedName: (name, filename, css) => `_${name}_abc123_`,
  getOutputFilename: (filename) => filename.replace(/\.module\.css$/, '.css'),
})
```

### `include`

A glob pattern controlling which CSS files are treated as CSS Modules.

**Default:** `'**/*.module.css'`

### `generateScopedName`

A function that determines the scoped class name for each local identifier. Receives the original class name, the source filename, and the full CSS content.

**Default:** Uses the [postcss-modules](https://github.com/css-modules/postcss-modules) default scoping.

### `getOutputFilename`

A function that maps the input `.module.css` path to the output `.css` path.

**Default:** Strips `.module` from the filename (e.g. `foo.module.css` → `foo.css`).
