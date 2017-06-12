# Plugins

An ember-css-modules plugin is really just an Ember addon with two additional characteristics:
 - it has the `ember-css-modules-plugin` keyword in its `package.json`
 - it implements a `createCssModulesPlugin` hook in its base `index.js`

The first point is hopefully self explanatory, so let's dig in on the second. The simplest possible implementation of an ECM plugin would look something like this:

```js
// index.js
const Plugin = require('ember-css-modules/lib/plugin');

module.exports = {
  name: 'ember-css-modules-super-cool-plugin',

  createCssModulesPlugin(parent) {
    return new Plugin(parent);
  }
}
```

The `createCssModulesPlugin` method receives a reference to the plugin's parent, which is either a [`Project`](https://ember-cli.com/api/classes/Project.html) or an [`Addon`](https://ember-cli.com/api/classes/Addon.html), depending on whether the plugin was included by an app or an addon, respectively.

This isn't a particularly exciting example, though, as it doesn't actually do anything. To have any impact on the build, a plugin needs to implement one or more of the available hooks.

## Hooks

### `config(env, baseOptions)`
Very similar to an addon's [`config`](https://ember-cli.com/api/classes/Addon.html#method_config) hook, a plugin's `config` hook is invoked with the current build environment and its parent's base ember-css-modules configuration. Also like the `Addon#config` hook, a plugin can return a hash of configuration options which will be deeply merged with the base config, with the parent's own values always winning out when there's a conflict. For more complex changes, the plugin can directly mutate the `baseOptions` hash.

### `buildStart()`
Invoked each time a build or rebuild of the parent's styles begins.

### `buildEnd()`
Invoked each time a build or rebuild of the parent's styles ends, regardless of whether it succeeded or failed.

### `buildSuccess()`
Invoked each time a build or rebuild of the parent's styles successfully completes.

### `buildError()`
Invoked each time a build or rebuild of the parent's styles fails for any reason.

## Predefined Plugin Methods

### `isForAddon()`
Indicates whether this plugin's parent is an addon (which may be useful when determining things such as output paths).

### `isForApp()`
The inverse of `isForAddon()` — indicates whether this plugin's parent is an app.

### `addPostcssPlugin(config, type, plugin)`
Given a config hash, adds the given PostCSS plugin to that configuration, either as a `before` or `after` plugin. Particularly useful within the `config` hook.
