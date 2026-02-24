# Migrating an App from ember-css-modules to glimmer-local-class-transform

This guide covers migrating the CSS Modules portion of an Ember app from `ember-css-modules` (classic build) to native CSS Modules with `glimmer-local-class-transform` (Embroider + Vite).

The migration can be done in stages, so you don't need to change everything at once. Each stage produces a working app, and several preparation steps can be done while you're still on `ember-css-modules`.

## Migration stages

### Overview

| Stage | Build pipeline | CSS Modules provided by |
| --- | --- | --- |
| **Starting point** | Classic (Broccoli) | `ember-css-modules` |
| **Stage 1** | Embroider + Webpack | `ember-css-modules` |
| **Stage 2** | Embroider + Vite | `glimmer-local-class-transform` |

`ember-css-modules` works with both the classic Broccoli build and Embroider + Webpack. It does **not** work with Vite. This means you can migrate your build pipeline first (stage 1), confirm everything works, and then swap the CSS Modules implementation when you move to Vite (stage 2).

Several preparation steps can be done during stage 1 (or even at the starting point) to reduce the amount of change needed when you finally swap to Vite.

## Preparation (can be done before stage 2)

These steps work with `ember-css-modules` on either the classic build or Embroider + Webpack. Do them incrementally at any time — each produces a working app.

### Consolidate to colocated file layout

If you have components using pod layout (`component/styles.css`) or classic layout (`styles/components/foo.css`), move them to colocated files alongside the component's template/JS. `ember-css-modules` already supports colocated layout, so this is a safe change:

**Pod layout → colocated:**

```
app/components/my-component/styles.css → app/components/my-component.css
```

**Classic layout → colocated:**

```
app/styles/components/my-component.css → app/components/my-component.css
```

This step can be done one component at a time. Once all components use colocated layout, the remaining migration steps are simpler.

### Rename CSS files to `.module.css`

`ember-css-modules` supports configuring the file extension it looks for. You can rename your CSS files to `.module.css` now — matching the convention Vite will expect later — by setting the `extension` option:

```js
// ember-cli-build.js
cssModules: {
  extension: 'module.css',
},
```

Then rename your files:

```
app/components/my-component.css → app/components/my-component.module.css
```

This can be done across the whole app at once, since it's a single config change plus renames.

Note: for colocated components, `ember-css-modules` always includes the extension in JS import paths. After this change, JS imports would look like `import styles from 'my-app/components/my-component.module.css'` — the `.module.css` part already matches the final v2 format.

### Remove `headerModules`, `footerModules`, and `virtualModules`

These `cssModules` options have no equivalent in the v2 setup (see [Config differences](#config-differences)). Removing them while still on `ember-css-modules` lets you verify replacements work before the final migration:

- **`headerModules` / `footerModules`** — Replace with standard CSS `@import` rules or adjust your stylesheet ordering manually.
- **`virtualModules`** — Replace with CSS custom properties, a shared `.module.css` file with `composes`, or build-time code generation.

### Migrate PostCSS config to `postcss.config.js`

If you have PostCSS plugins configured via `cssModules.plugins` or `cssModules.postcssOptions`, move them to a standalone `postcss.config.js` file. Both Webpack (with appropriate loader config) and Vite pick up `postcss.config.js` automatically, so this works across all stages.

## Stage 1: Migrate to Embroider + Webpack

In this stage, you migrate your build pipeline from classic Broccoli to Embroider + Webpack. `ember-css-modules` continues to work — no CSS Modules changes are needed.

This stage is not covered in detail here. See the [Embroider migration guide](https://github.com/embroider-build/embroider/blob/main/PORTING-ADDONS-TO-V2.md) for instructions. The key addition for CSS Modules is to enable `css-loader` modules support in your Embroider config:

```js
// ember-cli-build.js
const { Webpack } = require('@embroider/webpack');

return require('@embroider/compat').compatBuild(app, Webpack, {
  // ...embroider options
  packagerOptions: {
    cssLoaderOptions: {
      modules: { auto: true },
    },
  },
});
```

At this point your app is on Embroider + Webpack with `ember-css-modules` still handling CSS Modules. Verify everything works before continuing.

## Stage 2: Swap to glimmer-local-class-transform + Vite

This is where you swap out `ember-css-modules` for native CSS Modules. This stage coincides with moving from Webpack to Vite, since `ember-css-modules` doesn't work with Vite.

If you've completed the preparation steps above, the remaining changes are:

### 1. Swap dependencies

Remove `ember-css-modules` and add `glimmer-local-class-transform`:

```sh
npm uninstall ember-css-modules
npm install --save-dev glimmer-local-class-transform
```

### 2. Register the transform

In your `babel.config.cjs`, add `glimmer-local-class-transform` to the `transforms` array of `babel-plugin-ember-template-compilation`:

```js
// babel.config.cjs
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

### 3. Remove remaining `cssModules:` config

Remove the `cssModules` key from your `ember-cli-build.js` entirely. If you haven't already migrated individual options during preparation, see [Config differences](#config-differences) below.

### 4. Update JS imports

If you import styles in JavaScript, update the import paths from absolute (module-prefix-based) to relative:

**Before:**

```js
import styles from 'my-app/components/my-component.module.css';
```

**After:**

```js
import styles from './my-component.module.css';
```

If you haven't yet renamed to `.module.css` (skipped the preparation step), you'll also need to add the extension:

```js
// Before (no extension or .css):
import styles from 'my-app/components/my-component/styles';
import styles from 'my-app/components/my-component.css';

// After:
import styles from './my-component.module.css';
```

### 5. Template syntax

No changes needed. `local-class` works identically with `glimmer-local-class-transform`:

```hbs
<div local-class="my-class">Hello</div>
<div local-class={{this.dynamicClass}}>Hello</div>
<div class="global" local-class="scoped">Hello</div>
```

## Config differences

| `cssModules` option | v2 equivalent |
| --- | --- |
| `headerModules` | No direct equivalent. Use standard CSS `@import` or adjust your stylesheet ordering manually. |
| `footerModules` | No direct equivalent. Use standard CSS `@import` or adjust your stylesheet ordering manually. |
| `virtualModules` | No direct equivalent. Use CSS custom properties or a shared `.module.css` file with `composes`. |
| `plugins` (PostCSS) | Configure PostCSS directly via `postcss.config.js` — Vite picks it up automatically. |
| `generateScopedName` | Configure in `vite.config.mjs` under `css.modules.generateScopedName`. |
| `intermediateOutputPath` | No equivalent (not needed with Vite). |
| `extension` | No equivalent. Vite uses the `.module.*` convention (e.g. `.module.css`, `.module.scss`). |
| `includeExtensionInModulePath` | No equivalent (imports always use the full `.module.css` path). |
| `postcssOptions` | Configure PostCSS directly via `postcss.config.js`. |
| `sourceMap` | Configure via Vite's `css.devSourcemap` option. |
| `composes` | Works natively with CSS Modules in Vite — no configuration needed. |
| `@value` | Works natively with CSS Modules in Vite — no configuration needed. |

## Apps using SCSS

If your app uses SCSS with CSS Modules (via `@csstools/postcss-sass` and `postcss-scss`), the migration is straightforward because Vite has built-in Sass support and natively handles `.module.scss` files.

### What changes

With `ember-css-modules`, SCSS is typically processed via PostCSS plugins:

```js
// ember-cli-build.js (before)
const sassPlugin = require('@csstools/postcss-sass')({
  includePaths: ['app/styles', 'node_modules'],
  silenceDeprecations: ['import', 'legacy-js-api'],
});
const cssParser = require('postcss-scss');

cssModules: {
  extension: 'module.scss',
  plugins: {
    before: [sassPlugin],
  },
  postcssOptions: {
    syntax: cssParser,
  },
},
```

With Vite, Sass compilation is built in — you don't need PostCSS plugins for it. Configure Sass options directly in `vite.config.mjs`:

```js
// vite.config.mjs (after)
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['app/styles', 'node_modules'],
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
  },
  plugins: [
    // ...ember plugins
  ],
});
```

Vite automatically applies CSS Modules scoping to any file with the `.module.scss` extension — no additional configuration is needed.

### Config mapping

| `ember-css-modules` SCSS config | Vite equivalent |
| --- | --- |
| `extension: 'module.scss'` | Native — Vite handles `.module.scss` out of the box |
| `plugins.before: [sassPlugin]` | Not needed — Vite compiles Sass natively |
| `postcssOptions.syntax: cssParser` | Not needed — Vite handles Sass→CSS before PostCSS |
| `includePaths` | `css.preprocessorOptions.scss.includePaths` |
| `silenceDeprecations` | `css.preprocessorOptions.scss.silenceDeprecations` |
| `intermediateOutputPath` | No equivalent |

### Transform `pathMapping`

Configure `glimmer-local-class-transform` to look for `.module.scss` files instead of `.module.css`:

```js
// babel.config.cjs
transforms: [
  ['glimmer-local-class-transform', { pathMapping: { '(\\.g?[tj]s|\\.hbs)+$': '.module.scss' } }],
],
```

### File naming

If you're already using `.module.scss` files with `ember-css-modules` (via `extension: 'module.scss'`), no file renames are needed — the files are already in the format Vite expects.

## Custom `pathMapping`

By default, the transform maps template files to `.module.css` files of the same name:

- `my-component.gjs` → `./my-component.module.css`
- `my-component.hbs` → `./my-component.module.css`

If you want to use plain `.css` instead of `.module.css` (e.g. with a bundler that doesn't require the `.module.css` convention), you can configure `pathMapping`:

```js
// babel.config.cjs
transforms: [
  ['glimmer-local-class-transform', { pathMapping: { '\\.(gjs|hbs)$': '.css' } }],
],
```

See the [`glimmer-local-class-transform` README](../packages/glimmer-local-class-transform/README.md) for full configuration options.
