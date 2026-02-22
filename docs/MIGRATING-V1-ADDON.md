# Migrating an Addon from ember-css-modules to v2 format

This guide covers migrating the CSS Modules portion of an Ember addon from v1 (with `ember-css-modules`) to v2 format (with `glimmer-local-class-transform` and `rollup-plugin-preprocess-css-modules`).

The migration can be done in stages. Some preparation steps can be done while the addon is still in v1 format, reducing the amount of change needed in the final conversion.

## Prerequisites

You should be familiar with the v2 addon format generally. This guide covers only the CSS Modules portion of the migration. For the broader v1-to-v2 addon migration, see the [Embroider v2 addon guide](https://github.com/embroider-build/embroider/blob/main/PORTING-ADDONS-TO-V2.md).

## Preparation (can be done before converting to v2)

These steps work with `ember-css-modules` while the addon is still in v1 format. Each produces a working addon.

### Consolidate to colocated file layout

If you have components using pod layout (`component/styles.css`) or classic layout (`styles/components/foo.css`), move them to colocated files alongside the component's template/JS. `ember-css-modules` already supports colocated layout:

**Pod layout → colocated:**

```
addon/components/my-component/styles.css → addon/components/my-component.css
```

**Classic layout → colocated:**

```
addon/styles/components/my-component.css → addon/components/my-component.css
```

This step can be done one component at a time.

### Rename CSS files to `.module.css`

`ember-css-modules` supports configuring the file extension via the addon's `index.js`. You can rename your CSS files to `.module.css` now — matching the convention the v2 build will expect — by setting the `extension` option:

```js
// index.js
module.exports = {
  name: require('./package').name,

  options: {
    cssModules: {
      extension: 'module.css',
    },
  },
};
```

Then rename your files:

```
addon/components/my-component.css → addon/components/my-component.module.css
```

## Converting to v2

When you're ready to convert to the v2 addon format, follow these steps. The broader structural changes (adding Rollup, `addon/` → `src/`, new `package.json` exports) are part of the general v2 addon migration — this guide covers the CSS Modules–specific parts.

### 1. Swap dependencies

Remove `ember-css-modules` from `dependencies`. Add the new packages:

```sh
npm uninstall ember-css-modules
npm install --save glimmer-local-class-transform
npm install --save-dev rollup-plugin-preprocess-css-modules
```

`glimmer-local-class-transform` goes in `dependencies` because consuming apps need it at build time. `rollup-plugin-preprocess-css-modules` is only used to build the addon, so it goes in `devDependencies`.

### 2. Create `babel.publish.config.cjs`

This Babel config is used when building the addon for publication. It must include `glimmer-local-class-transform` in the template compilation transforms, with `targetFormat: 'hbs'` so that templates are compiled to `.hbs` (which Rollup and the consuming app can process):

```js
// babel.publish.config.cjs
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
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: 'decorator-transforms/runtime-esm',
        },
      },
    ],
  ],

  generatorOpts: {
    compact: false,
  },
};
```

### 3. Update Rollup config

Add `preprocessCSSModules()` to your Rollup plugins, include `.hbs` in the Babel extensions, and use `addon.keepAssets(['**/*.css'])` to preserve the CSS output:

```js
// rollup.config.mjs
import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';
import { preprocessCSSModules } from 'rollup-plugin-preprocess-css-modules';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default {
  output: addon.output(),

  plugins: [
    addon.publicEntrypoints(['**/*.js', 'index.js']),
    addon.appReexports([
      'components/**/*.js',
      'helpers/**/*.js',
      'modifiers/**/*.js',
      'services/**/*.js',
    ]),
    addon.dependencies(),

    babel({
      extensions: ['.hbs', '.js', '.gjs'],
      babelHelpers: 'bundled',
      configFile: './babel.publish.config.cjs',
    }),

    // Ensure that standalone .hbs files are properly integrated as Javascript.
    addon.hbs(),

    // Ensure that .gjs files are properly integrated as Javascript.
    addon.gjs(),

    // Preprocess CSS Modules so consumers get plain CSS.
    preprocessCSSModules(),

    // Keep CSS files in the published output.
    addon.keepAssets(['**/*.css']),

    addon.clean(),
  ],
};
```

### 4. Move and rename files

Move your component files from `addon/` to `src/` (standard v2 addon layout). If you've already renamed to `.module.css` during preparation, just move the files:

```
addon/components/my-component.hbs        → src/components/my-component.hbs
addon/components/my-component.js         → src/components/my-component.js
addon/components/my-component.module.css → src/components/my-component.module.css
```

If you haven't renamed yet, rename as you move:

```
addon/components/my-component.css → src/components/my-component.module.css
```

You can also remove `addon/styles/.placeholder` — it was only needed by `ember-css-modules` to trigger CSS processing in the classic build.

Remove the `app/` re-export files (e.g. `app/components/my-component.js`) — v2 addons handle re-exports via `addon.appReexports()` in the Rollup config.

### 5. Template syntax

No changes needed. `local-class` works identically:

```hbs
<div local-class="my-class">{{yield}}</div>
<div local-class={{this.dynamicClass}}>{{yield}}</div>
```

## What `rollup-plugin-preprocess-css-modules` does

In a v2 addon, CSS Modules are an implementation detail — consuming apps shouldn't need to know or care that your addon uses them internally.

`rollup-plugin-preprocess-css-modules` handles this by preprocessing `.module.css` imports at build time. It:

1. Processes each `.module.css` file through CSS Modules, generating scoped class names.
2. Replaces the JavaScript `import styles from './my-component.module.css'` (which `glimmer-local-class-transform` generates) with a static object mapping original class names to their scoped equivalents.
3. Outputs a plain `.css` file with the scoped class names already applied.

The result is that your published addon contains only standard CSS and JS — no CSS Modules runtime is needed by consumers.

See the [`rollup-plugin-preprocess-css-modules` README](../packages/rollup-plugin-preprocess-css-modules/README.md) for configuration options like `generateScopedName` and `getOutputFilename`.
