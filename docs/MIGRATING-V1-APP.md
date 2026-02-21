# Migrating an App from ember-css-modules to glimmer-local-class-transform

This guide covers migrating the CSS Modules portion of an Ember app from `ember-css-modules` (classic build) to native CSS Modules with `glimmer-local-class-transform` (Embroider + Vite).

## Prerequisites

Your app should already be on Embroider + Vite. This guide covers only the CSS Modules migration, not the broader build pipeline migration. For help migrating to Embroider, see the [Embroider migration guide](https://github.com/embroider-build/embroider/blob/main/PORTING-ADDONS-TO-V2.md).

## Steps

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

### 3. Rename CSS files to `.module.css`

Vite uses the `.module.css` extension to identify CSS Modules. Rename all your component CSS files:

**Colocated components:**

```
app/components/my-component.css → app/components/my-component.module.css
```

**Pod components** — move from the pod's `styles.css` to a colocated `.module.css` file:

```
app/components/my-component/styles.css → app/components/my-component.module.css
```

**Classic layout** — move from the `styles/components/` directory to colocated:

```
app/styles/components/my-component.css → app/components/my-component.module.css
```

### 4. Remove `cssModules:` config

Remove the `cssModules` key from your `ember-cli-build.js`. The options no longer apply — see [Config differences](#config-differences) below for details on what replaces each option.

### 5. Template syntax

No changes needed. `local-class` works identically with `glimmer-local-class-transform`:

```hbs
<div local-class="my-class">Hello</div>
<div local-class={{this.dynamicClass}}>Hello</div>
<div class="global" local-class="scoped">Hello</div>
```

### 6. Update JS imports

If you import styles in JavaScript, update the import paths from absolute (module-prefix-based) to relative, and add the `.module.css` extension:

**Before:**

```js
import styles from 'my-app/components/my-component/styles';
// or for colocated:
import styles from 'my-app/components/my-component.css';
```

**After:**

```js
import styles from './my-component.module.css';
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
| `extension` | No equivalent. Vite requires `.module.css`. |
| `includeExtensionInModulePath` | No equivalent (imports always use the full `.module.css` path). |
| `postcssOptions` | Configure PostCSS directly via `postcss.config.js`. |
| `sourceMap` | Configure via Vite's `css.devSourcemap` option. |
| `composes` | Works natively with CSS Modules in Vite — no configuration needed. |
| `@value` | Works natively with CSS Modules in Vite — no configuration needed. |

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
