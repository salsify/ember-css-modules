# ember-css-modules [![Actions Status](https://github.com/salsify/ember-css-modules/workflows/CI/badge.svg)](https://github.com/salsify/ember-css-modules/actions) [![Ember Observer Score](https://emberobserver.com/badges/ember-css-modules.svg)](https://emberobserver.com/addons/ember-css-modules)

Ember-flavored support for [CSS Modules](https://github.com/css-modules/css-modules). For an overview of some of the motivations for the CSS Modules concept, see [this blog post](http://blog.salsify.com/engineering/good-fences-with-css-modules).

If you have ideas or questions that aren't addressed here, try [#topic-css](https://discordapp.com/channels/480462759797063690/486013244667068436) on the Ember Discord Server.

* [Installation](#installation)
* [What and Why?](#what-and-why)
* [Usage](#usage)
  * [Simple Example](#simple-example)
  * ["Classic" Structure Applications](#classic-structure-applications)
  * [Styling Reuse](#styling-reuse)
  * [Programmatic Styles Access](#programmatic-styles-access)
  * [Global Classes](#global-classes)
  * [Values](#values)
* [Usage in Addons](#usage-in-addons)
* [Plugins](#plugins)
* [Advanced Configuration](#advanced-configuration)
  * [Where to Specify Options](#where-to-specify-options)
  * [Scoped Name Generation](#scoped-name-generation)
  * [Source Maps](#source-maps)
* [Ember Support](#ember-support)

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

### Component Colocation in Octane Applications

**Note:** you currently need the beta version for component template colocation support:
```
ember install ember-css-modules@1.3.0-beta.1
```

In Octane apps, where component templates can be colocated with their backing class, your styles module for a component takes the same name as the backing class and template files:

```hbs
{{! app/components/my-component.hbs }}
<div local-class="hello-class">Hello, world!</div>
```

```css
/* app/components/my-component.css */
.hello-class {
  font-weight: bold;
}
```

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

If you need to access a local class in a template in other scenarios (such as passing in a class name as a property or reusing a class from another module), there is also a `local-class` helper you can use. For example, the "secondary-header" example above can be written as:

```hbs
{{! app/components/my-component/template.hbs }}
<div class="{{local-class 'secondary-header' from='my-app-name/styles/headers'}}">Hello, world!</div>
```

Note that the `from` parameter is optional; by default classes will come from the current module, as with the `local-class` attribute.

In a JavaScript context, the class mappings can also be imported directly from whatever path the corresponding CSS module occupies, e.g.

```js
import styles from 'my-app-name/components/my-component/styles';
console.log(styles['hello-class']);
// => "_hello-class_1dr4n4"
```

**Note**: by default, the import path for a styles module does _not_ include the `.css` (or equivalent) extension. However, if you set `includeExtensionInModulePath: true`, then you'd instead write:

```js
import styles from 'my-app-name/components/my-component/styles.css';
```

Note that the extension is **always** included for styles modules that are part of an Octane "colocated" component, to avoid a conflict with the import path for the component itself.

### Applying Classes to a Component's Root Element

There is no root element, if you are using either of the following:

- [Glimmer components (`@glimmer/component`)](https://octane-guides-preview.emberjs.com/release/components/component-basics/)
- [template-only components](https://github.com/emberjs/rfcs/blob/master/text/0278-template-only-components.md)
- [tag-less components](https://api.emberjs.com/ember/3.9/classes/Component/properties/tagName?anchor=tagName)

In this case, you can ignore this complete section and just use the `local-class` attribute or helper.

#### Ember Object Model

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

#### Native ES6 Class Syntax

The trusty Ember Object Model, that predates native ES6 class syntax, has served the community well over the years. But it's on its way out and you can already use the new native syntax in your apps today!

Instead of setting [`classNames`](http://emberjs.com/api/classes/Ember.ClassNamesSupport.html#property_classNames) and [`classNameBindings`](http://emberjs.com/api/classes/Ember.ClassNamesSupport.html#property_classNameBindings) properties, you would use [`@classNames`](http://ember-decorators.github.io/ember-decorators/latest/docs/api/modules/@ember-decorators/component#classNames) and [`@className`](http://ember-decorators.github.io/ember-decorators/latest/docs/api/modules/@ember-decorators/component#className) decorators from the amazing [ember-decorators addon](http://ember-decorators.github.io/ember-decorators/latest/). ember-css-modules provides the exact same decorators, but for local classes.

For instance, to statically set a local `my-component` class on your component, you use the `@localClassNames` decorator:

```js
import Component from '@ember/component';
import { localClassNames } from 'ember-css-modules';

@localClassNames('my-component')
export default class ExampleComponent extends Component {
  // your kickass code here
}
```

Just as with [`@classNames`](http://ember-decorators.github.io/ember-decorators/latest/docs/api/modules/@ember-decorators/component#classNames) you can pass as many classes as you like:

```js
import Component from '@ember/component';
import { localClassNames } from 'ember-css-modules';

@localClassNames('my-component', 'make-it-pop', 'vibrant-colors')
export default class ExampleComponent extends Component {
  // your sensational code here
}
```

And just like you'd use [`@className`](http://ember-decorators.github.io/ember-decorators/latest/docs/api/modules/@ember-decorators/component#className) to dynamically toggle classes on your component based on the boolean value of a given property, you use `@localClassName` for local classes:

```js
import Component from '@ember/component';
import { localClassName } from 'ember-css-modules';

export default class ExampleComponent extends Component {
  @localClassName propA;
  @localClassName('special') propB;
  @localClassName('yes', 'no') propC;
}
```

- If `propA` is true, a local `prop-a` class will be applied. If it's false, no additional classes will be applied.
- If `propB` is true, a local `special` class will be applied. If it's false, no additional classes will be applied.
- If `propC` is true, a local `yes` class will be applied. If it's false, a local `no` class will be applied.

This is especially beautiful when combined with other decorators or computed properties:

```js
import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { notEmpty } from '@ember-decorators/object/computed';
import { localClassName } from 'ember-css-modules';

export default class ExampleComponent extends Component {
  user; // provided as an attr to the component

  @localClassName
  @notEmpty('user.lastName')
  hasLastName;

  @localClassName('the-good-stuff', 'soda-pop')
  @computed('user.age')
  get isOldEnoughToDrink() {
    return this.user.age >= 21;
  }
}
```

- If the property `user.lastName` is not empty, a local `has-last-name` class will be applied.
- If the user is at least of age `21`, a local `the-good-stuff` class is applied, otherwise a local `soda-pop` class is applied.

You can even return strings from computed properties or decorate string properties in order to set local classes in a fully dynamic fashion:

```js
import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { localClassName } from 'ember-css-modules';

export default class ExampleComponent extends Component {
  user; // provided as an attr to the component

  @localClass somethingDynamic = 'hello-world';

  @localClass
  @reads('user.favoriteColor')
  favoriteColor;

  @localClass
  @computed('user.usedTechnologies.[]')
  get coolness() {
    const { usedTechnologies } = this.user;
    const coolTech = ['TypeScript', 'Ember.js', 'ember-css-modules'];
    const coolUsedTech = coolTech.filter(t => usedTechnologies.includes(t));

    switch (coolUsedTech.length) {
      case 1: return 'cool';
      case 2: return 'pretty-rad'
      case 3: return 'rockstar';
    }

    return null;
  }
}
```
- The local `hello-world` class will be applied.
- If the property `user.favoriteColor` is `'red'`, a local `red` class will be applied.
- If the user uses all the cool technologies, the local `rockstar` class will be applied. If the user uses no cool technoloy, no further local class will be applied.

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

You can also use ember-css-modules in addons that expose components to their consuming application. To do this you'll need to move `ember-css-modules` out of `devDependencies` and into `dependencies` in your addon's `package.json` ([see issue #8](https://github.com/salsify/ember-css-modules/issues/8)).

Note also that **your addon must have an `addon/styles` directory** in order to trigger CSS processing in Ember CLI. In order for the directory to be preserved when you publish your addon, you can create an empty `.placeholder` file (`.gitkeep` won't work; by default, the `.npmignore` for your addon will prevent files with that name from being published).

## Plugins

Ember CSS Modules has a plugin ecosystem that allows for people to bundle up common configurations and extensions for easy reuse and distribution. For example, if your organization has a common set of PostCSS plugins you always use, you could package those as a plugin and then just drop that into any Ember project and have it automatically take effect.

For details on developing your own, see the [plugins mini-guide](docs/PLUGINS.md). You can also look at the following examples of what plugin implementations can look like:

 - [ember-css-modules-sass](https://github.com/dfreeman/ember-css-modules-sass)
 - [ember-css-modules-stylelint](https://github.com/dfreeman/ember-css-modules-stylelint)
 - [ember-css-modules-reporter](https://github.com/dfreeman/ember-css-modules-reporter)

You can find a list of all publicly available plugins by browsing [the npm `ember-css-modules-plugin` keyword](https://www.npmjs.com/browse/keyword/ember-css-modules-plugin).

## Advanced Configuration

Details about specific advanced configuration options are broken out into smaller mini-guides that each focus on a single topic:
 - [Using CSS Modules with Tailwind CSS](docs/TAILWINDCSS.md)
 - [Using CSS Modules with other preprocessors like Sass or Less](docs/PREPROCESSORS.md)
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

### Extensions in Module Paths

When importing a CSS module's values from JS, or referencing it via `@value` or `composes:`, by default you do not include the `.css` extension in the import path. The exception to this rule is for modules that are part of an Octane-style colocated component, as the extension is the only thing to differentiate the styles module from the component module itself.

If you wish to enable this behavior for _all_ modules, you can set the `includeExtensionInModulePath` flag in your configuration:

```js
new EmberApp(defaults, {
  cssModules: {
    includeExtensionInModulePath: true,
  },
});
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

This addon is tested against and expected to work with Ember's active [LTS releases](http://emberjs.com/blog/2016/02/25/announcing-embers-first-lts.html) as well as the current [release, beta, and canary](http://emberjs.com/builds/) builds.

Note that if you're using ember-css-modules with a version of Ember CLI prior to 2.13, you'll need to add the following to your `app.js`:

```js
import 'ember-css-modules/extensions';
```
