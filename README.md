# Ember CSS Modules

This repository contains several packages for working with [CSS Modules](https://github.com/css-modules/css-modules) in [Ember.js](https://emberjs.com/).

* [Dependency-free Usage](#dependency-free-usage)
* [`local-class` Syntax](#local-class-syntax)
* [CSS Modules in Libraries](#css-modules-in-libraries)
* [Migration Guides](#migration-guides)

## Dependency-free Usage

Historically, [`ember-css-modules`](./packages/ember-css-modules/README.md) was the core means of using CSS Modules in Ember, but do note that with modern tooling **you don't necessarily need any custom packages at all!**

If your bundler is configured to support CSS Modules, then you can just import the class name mapping and reference it directly in your components:

```gjs
// my-component.gjs
import styles from './my-component.module.css';

<template>
  <div class="some-global-name {{styles.some-local-name}}">
    Hello!
  </div>
</template>
```

<details>
<summary>Bundler Configuration Examples</summary>

### v1 app with `ember-auto-import`
```js
  const app = new EmberApp(defaults, {
    ...config,
    autoImport: {
      allowAppImports: ['**/*.module.css'],
      cssLoaderOptions: {
        modules: { auto: true },
      },
    },
  })
```

### v1 app with `@embroider/compat` and `@embroider/webpack`

```js
  return compatBuild(app, Webpack, {
    // ...
    packagerOptions: {
      cssLoaderOptions: {
        modules: { auto: true },
      },
    },
  });
```

### v2 app with Vite

Nothing required! Vite supports CSS Modules out of the box.

</details>

## `local-class` Syntax

The main thing `ember-css-modules` provides that doesn't come with out-of-the-box bundler support is special `local-class` syntax for referring to classes from a component's corresponding CSS Module. If you still wish to make use of this syntax, you can use [`ember-local-class`](./packages/ember-local-class/README.md) or [`glimmer-local-class-transform`](./packages/glimmer-local-class-transform/README.md) to write the equivalent of the above GJS example:

```gjs
<template>
  <div class="some-global-name" local-class="some-local-name">
    Hello!
  </div>
</template>
```

See the READMEs for `ember-local-class` and `glimmer-local-class-transform`, as well as the **Migration Guides** below, for further details on getting set up with those packages.

## CSS Modules in Libraries

When publishing libraries (e.g. v2 addons) that use CSS Modules as an implementation detail, you ideally want to publish standard CSS that the consuming application's bundler can package appropriately, without requiring CSS Module support from that bundler.

The [`rollup-plugin-preprocess-css-modules`](./packages/rollup-plugin-preprocess-css-modules/README.md) enables this by preprocessing CSS Modules to standards-compliant JS + CSS at publish time for your library.

## Migration Guides

- [Migrating an App from ember-css-modules (v1 → v2)](./docs/MIGRATING-V1-APP.md)
- [Migrating an Addon from ember-css-modules (v1 → v2)](./docs/MIGRATING-V1-ADDON.md)
