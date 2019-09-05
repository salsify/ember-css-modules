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

  createCssModulesPlugin(parent, includer) {
    return new Plugin(parent, includer);
  }
}
```

The `createCssModulesPlugin` method receives a reference to the plugin's parent, which is either a [`Project`](https://ember-cli.com/api/classes/Project.html) or an [`Addon`](https://ember-cli.com/api/classes/Addon.html), depending on whether the plugin was included by an app or an addon, respectively.

It also receives the direct [`includer`](https://ember-cli.com/api/classes/Addon.html#method_included) as a second parameter.

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

### `addPostcssPlugin(config, type, ...plugins)`
Given a config hash, adds the given PostCSS plugins to that configuration, either as a `before`, `after` or `postprocess` plugin. Particularly useful within the `config` hook.

`after` and `postprocess` plugins are inserted after already registered plugins. `before` plugins are prepended to already registered plugins.
This means for `before` that if you called this method with plugins that are dependent on order of execution, you would either have to register the plugin that needs to be executed _last_ as the _first_ plugin, like so:

```js
class ExamplePlugin extends Plugin {
  config(env, baseConfig) {
    this.addPostcssPlugin(baseConfig, 'before', require('postcss-nested'));

    // needs to be executed *before* `postcss-nested` and is thus registered, *after* it
    this.addPostcssPlugin(baseConfig, 'before', require('postcss-nested-ancestors'));
  }
}
```

Because this is confusing, you should rather pass both plugins in one go, like so:

```js
class ExamplePlugin extends Plugin {
  config(env, baseConfig) {
    this.addPostcssPlugin(
      baseConfig,
      'before',
      require('postcss-nested-ancestors'),
      require('postcss-nested')
    );
  }
}
```

`addPostcssPlugin` is variadic and accepts as many plugins as you like. The order _is preserved_, when passing all plugins in one go.

## Lint Plugins

Normally, an ember-css-modules plugin will activate in exactly the same scenario a normal addon would: for apps when it's a `devDependency`, and for addons when it's a `dependency`. However, for addons this may cause an issue with plugins that provide development-time support, such as code linting. As an addon author, you wouldn't want to declare a production dependency on these plugins, but you _do_ want them to apply to your addon code while you're developing it.

To handle this case, ECM plugins may provide an additonal package keyword: `ember-css-modules-lint-plugin`. This will cause the plugin to activate for addon code **even if it's only in the dummy app's `devDependencies`** as long as that addon's `isDevelopingAddon()` hook returns `true`. Plugins like [ember-css-modules-stylelint](https://github.com/dfreeman/ember-css-modules-stylelint) take advantage of this so they can be used with addons and engines without weighing down downstream consumers with extra dependencies.
