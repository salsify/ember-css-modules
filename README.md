# ember-css-modules [![Build Status](https://travis-ci.org/salsify/ember-css-modules.svg?branch=master)](https://travis-ci.org/salsify/ember-css-modules) [![Window Build Status](https://ci.appveyor.com/api/projects/status/github/salsify/ember-css-modules?svg=true&branch=master)](https://ci.appveyor.com/project/dfreeman97827/ember-css-modules?branch=master) [![Ember Observer Score](https://emberobserver.com/badges/ember-css-modules.svg)](https://emberobserver.com/addons/ember-css-modules)

Ember-flavored support for [CSS Modules](https://github.com/css-modules/css-modules). For an overview of some of the motivations for the CSS Modules concept, see [this blog post](http://blog.salsify.com/engineering/good-fences-with-css-modules).

If you have ideas or questions that aren't addressed here, try [#e-css-modules](https://embercommunity.slack.com/messages/e-css-modules/) in the [Ember Slack community](https://ember-community-slackin.herokuapp.com/).

## Installation

```sh
ember install ember-css-modules
```

## What and Why?

When you build a component, you drop a `.js` file and a `.hbs` file in your app directory, and your tooling takes care of the rest. Babel takes your fancy ES6 module and restructures it into nice browser-friendly code, while still giving you isolation and modularity guarantees. Meanwhile, the rest of the Ember CLI build pipeline picks up these new files and automatically incorporates them into your final JS artifact. And when it's time to come back and tweak your component, you (just like the Ember resolver) know exactly where those files live based just on the name of the component.

**With ember-css-modules, your styling is a first-class citizen alongside your templates and JavaScript**. You have one `.css` file per component (or route controller), in the same structure you're already using in the rest of your app. Every class you write is local to that file by default, with explicit mechanisms for opting into sharing, just like your JavaScript modules. And just like all your JS modules are automatically included in `<app-name>.js`, your CSS modules will automatically be included in `<app-name>.css`.

## Usage

### Simple Example

With ember-css-modules, you define styles on a per-component (or -controller) basis. You define these styles using the same file layout you use for templates; for example, in pod structure you'd put `styles.css` alongside `template.hbs` in the component's pod. The classes in that stylesheet are then automatically namespaced to the corresponding  component or controller. In order to reference them, you use the `local-class` attribute rather than the standard `class`.

```hbs
{{! app/components/my-component/template.hbs }}
<div local-class="hello-class">Hello, world!</div>
```

```css
/* app/components/my-component/styles.css */
.hello-class {
  font-weight: bold;
}
```

Similarly, if you were styling e.g. your application controller, you would place your styles alongside `controller.js` in `<podModulePrefix>/application/styles.css`.

### "Classic" Structure Applications

In classic structure, all your modules are grouped by type rather than related functionality. Just like all your templates live in `app/templates` and all your routes live in `app/routes`, all your styles will live in `app/styles`. When determining where to put your CSS for a given controller or component, you should mirror the location of the corresponding template.

For example, the component given above in pod structure would look like this in classic structure:

```hbs
{{! app/templates/components/my-component.hbs }}
<div local-class="hello-class">Hello, world!</div>
```

```css
/* app/styles/components/my-component.css */
.hello-class {
  font-weight: bold;
}
```

Similarly, if you were styling e.g. your application controller, you would mirror the template at `app/templates/application.hbs` and put your CSS at `app/styles/application.css`.

### Styling Reuse

In the example above, `hello-class` is rewritten internally to something like `_hello-class_1dr4n4` to ensure it doesn't conflict with a `hello-class` defined in some other module.

For cases where class reuse is desired, there's [the `composes` property](https://github.com/css-modules/css-modules#composition). Suppose you have a title in your component that you'd like to inherit your app-wide "secondary header" styling, which itself uses generic styling shared by all headers:

```css
/* app/styles/headers.css */
.header {
  font-weight: bold;
  text-decoration: underline;
}

.secondary-header {
  composes: header;
  color: #339;
}
```

```css
/* app/components/my-component/styles.css */
.component-title {
  composes: secondary-header from 'my-app-name/styles/headers';
  background-color: #eee;
}
```

In the template for `my-component`, an element with `local-class="component-title"` will end up with an actual class string like `_component-title_1dr4n4 _secondary-header_1658xu _header_1658xu`, incorporating styles from all of the composing classes.

Note that you may also use relative paths to specify the source modules for composition.

Finally, you can compose local classes from global un-namespaced ones that are provided e.g. by a CSS framework by specifying `global` as the source of the class:

```css
/* vendor/some-lib.css */
.super-important {
  color: orange;
}
```

```css
/* app/components/my-component/styles.css */
.special-button {
  composes: super-important from global;
}
```

### Programmatic Styles Access

Currently the `local-class` attribute is honored on HTML elements and component invocations, e.g. `<div local-class="foo {{bar}}">` and `{{input local-class="baz"}}`. It is not (currently) supported in subexpressions like the `(component)` helper.

If you need to access a local class in a template in other scenarios (such as passing in a class name as a property to a component), there is also a `local-class` helper you can use. For example, the simple "hello-class" example above is equivalent to:

```hbs
{{! app/components/my-component/template.hbs }}
<div class="{{local-class 'hello-class'}}">Hello, world!</div>
```

In a JavaScript context, the class mappings can also be imported directly from whatever path the corresponding CSS module occupies, e.g.

```js
import styles from 'my-app-name/components/my-component/styles';
console.log(styles['hello-class']);
// => "_hello-class_1dr4n4"
```

### Applying Classes to a Component's Root Element

Just like using [`classNames`](http://emberjs.com/api/classes/Ember.ClassNamesSupport.html#property_classNames) and [`classNameBindings`](http://emberjs.com/api/classes/Ember.ClassNamesSupport.html#property_classNameBindings) to set global classes on a component's root element, the `localClassNames` and `localClassNameBindings` properties allow you to set local classes on the root element.

For instance, to statically set a local `my-component` class on your component:

```js
export default Ember.Component.extend({
  localClassNames: 'my-component'
});
```

To dynamically set one or more classes on your component based on the boolean value of a given property:

```js
export default Ember.Component.extend({
  localClassNameBindings: ['propA', 'propB:special', 'propC:yes:no'],
  propA: true,
  propB: true,
  propC: true
});
```

- If `propA` is true, a local `prop-a` class will be applied. If it's false, no additional classes will be applied.
- If `propB` is true, a local `special` class will be applied. If it's false, no additional classes will be applied.
- If `propC` is true, a local `yes` class will be applied. If it's false, a local `no` class will be applied.

**Note**: `localClassNameBindings` [currently only works with boolean values](https://github.com/salsify/ember-css-modules/issues/56), unlike `classNameBindings` which will apply a string value directly as a class name.

### Global Classes

Some libraries provide explicit class names as part of their public interface in order to allow customization of their look and feel. If, for example, you're wrapping such a library in a component, you need to be able to reference those unscoped class names in the context of your component styles. The `:global` pseudoselector allows for this:

```css
.my-component :global(.some-library-class) {
  color: orange;
}
```

For more details on `:local` and `:global` exceptions, see [the CSS Modules documentation](https://github.com/css-modules/css-modules#exceptions).

### Values

For exposing data other than class names across module boundaries, you can use `@value`.

```css
/* app/styles/colors.css */
@value primary-color: #8af;
@value secondary-color: #fc0;
```

```css
/* app/some-route-pod/styles.css */
@value primary-color, secondary-color from 'my-app-name/styles/colors';

.blurb {
  color: primary-color;
  background-color: secondary-color;
}
```

Note that values are also exposed on the `styles` object for a given module, so they are also accessible from JavaScript if you need to coordinate between the two. As a contrived example:

```js
// app/some-route-pod/controller.js
import styles from 'app/some-route-pod/styles';

export default Ember.Controller.extend({
  logColor() {
    console.log('primary color is', styles['primary-color']);
  }
});
```

## Usage in Addons

You can also use ember-css-modules in addons that expose components to their consuming application. However, as with component templates, the styles will need to be explicitly bound to the component class, since the resolver won't be able to find them in the addon tree. You will also need to move `ember-css-modules` out of `devDependencies` and into `dependencies` in your addon's `package.json` ([see issue #8](https://github.com/salsify/ember-css-modules/issues/8)).

```js
// addon/components/my-addon-component.js
import Ember from 'ember';
import layout from '../templates/components/my-addon-component'; // or './template' in pod format
import styles from '../styles/components/my-addon-component';    // or './styles' in pod format

export default Ember.Component.extend({
  layout,
  styles
});
```

Note also that **your addon must have an `addon/styles` directory** in order to trigger CSS processing in Ember CLI. In order for the directory to be preserved when you publish your addon, you can create an empty `.placeholder` file (`.gitkeep` won't work; by default, the `.npmignore` for your addon will prevent files with that name from being published).

If you're writing a [routable engine](https://github.com/dgeb/ember-engines#ember-engines-) and have route controller styles, you'll have to import the styles module and set it on your controller the same way you would with a component in the example above.

## Plugins

Ember CSS Modules has a plugin ecosystem that allows for people to bundle up common configurations and extensions for easy reuse and distribution.
 - ember-css-modules-sass
 - ember-css-modules-stylelint
 - ember-css-modules-reporter

More details to come as these projects are published and polished.

## Advanced Configuration

Details about specific advanced configuration options are broken out into smaller mini-guides that each focus on a single topic:
 - [Using CSS Modules with other preprocessors](docs/PREPROCESSORS.md)
 - [Working with PostCSS plugins](docs/POSTCSS.md)
 - [Module ordering](docs/ORDERING.md)
 - [Defining values at build time with virtual modules](docs/VIRTUAL_MODULES.md)
 - [Authoring ember-css-modules plugins](docs/PLUGINS.md)

### Where to Specify Options

For applications, custom configuration for ember-css-modules may be specified in `ember-cli-build.js`:

```js
new EmberApp(defaults, {
  // ...
  cssModules: {
    // config
  }
});
```

For addons, configuration may be specified in your addon's `index.js` instead:

```js
module.exports = {
  // ...
  options: {
    cssModules: {
      // config
    }
  }
};
```

### Scoped Name Generation

By default, ember-css-modules produces a unique scoped name for each class in a module by combining the original class name with a hash of the path of the containing module. You can override this behavior by passing a `generateScopedName` function in the configuration.

```js
new EmberApp(defaults, {
  cssModules: {
    generateScopedName(className, modulePath) {
      // Your logic here
    }
  }
});
```

### Source Maps

Ember CLI allows you to [specify source map settings](https://ember-cli.com/user-guide/#source-maps) for your entire build process, and ember-css-modules will honor that configuration. For instance, to enable source maps in all environments for both JS and CSS files, you could put the following in your `ember-cli-build.js`:

```
sourcemaps: {
  enabled: true,
  extensions: ['js', 'css']
}
```

#### Notes
- You should specify the `css` extension in your source map configuration even if you're using a different extension for your modules themselves, since the final output file will be a `.css` file.
- Currently CSS source maps (for _any_ Ember CLI preprocessor) only work for applications, not for addons. Watch [ember-cli/broccoli-concat#58](https://github.com/ember-cli/broccoli-concat/issues/58) for progress on that front.
- Enabling source maps for CSS can cause Ember CLI to output an invalid comment at the end of your `vendor.css` file. This is harmless in many situations, but can cause issues with tools that postprocess your css, like ember-cli-autoprefixer. [ember-cli/broccoli-concat#58](https://github.com/ember-cli/broccoli-concat/issues/58) is the root cause of this issue as well.

## Ember Support

This addon is tested against and expected to work with the Ember's [LTS releases](http://emberjs.com/blog/2016/02/25/announcing-embers-first-lts.html) as well as the current [release, beta, and canary](http://emberjs.com/builds/) builds.
