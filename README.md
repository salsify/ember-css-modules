# ember-css-modules [![Build Status](https://travis-ci.org/salsify/ember-css-modules.svg?branch=master)](https://travis-ci.org/salsify/ember-css-modules) [![Ember Observer Score](https://emberobserver.com/badges/ember-css-modules.svg)](https://emberobserver.com/addons/ember-css-modules)

Ember-flavored support for [CSS Modules](https://github.com/css-modules/css-modules). For an overview of some of the motivations for the CSS Modules concept, see [this blog post](http://blog.salsify.com/engineering/good-fences-with-css-modules).

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

Currently the `local-class` attribute is honored on HTML elements and component invocations with static values, e.g. `<div local-class="foo bar">` and `{{input local-class="baz"}}`. It is not (yet) supported with dynamic class values or subexpressions like the `(component)` helper.

For these situations, or any other scenario where you need to access a namespaced class outside of a `local-class` attribute, components and controllers with a corresponding styles module expose a mapping from the original class name to the namespaced version in a `styles` property. For instance, the simple "hello-class" example above is actually equivalent to:

```hbs
{{! app/components/my-component/template.hbs }}
<div class="{{unbound styles.hello-class}}">Hello, world!</div>
```

The object exposed as the `styles` property in the template can also be imported directly into JS from whatever path the corresponding CSS module occupies, e.g.

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

- If `propA` is truthy, a local `prop-a` class will be applied. If it's falsey, no additional classes will be applied.
- If `propB` is truthy, a local `special` class will be applied. If it's falsey, no additional classes will be applied.
- If `propC` is truthy, a local `yes` class will be applied. If it's falsey, a local `no` class will be applied.

Note that `localClassNameBindings` treats all bound values as boolean flags, unlike `classNameBindings` which will apply a string value directly as a class name.

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
export default Ember.Controller.extend({
  logColor() {
    console.log('primary color is', this.get('styles.primary-color'));
  }
});
```

### Module Ordering

All `.css` files in your `app`/`addon` directories are automatically concatenated into a single output file. Since [the ordering of rules in CSS is what breaks specificity ties](https://developer.mozilla.org/en/docs/Web/CSS/Specificity), the details of this concatenation can be important.

#### Implicit Dependencies

Where possible, ember-css-modules takes advantage of information it has about the dependencies between your CSS modules when making decisions about ordering. Any time, for instance, a class in one module `a` composes a class in module `b`, the contents of module `b` will be included earlier in the file output than the contents of `a`. This means you can override properties from composed classes without worrying about specificity hacks:

```css
/* app/styles/b.css */
.b {
  color: green;
  font-weight: bold;
}
```

```css
/* app/styles/a.css */
.a {
  composes: b from './b';
  color: orange;
}
```

#### Explicit Dependencies

You may also have cases where you want certain files to be included early in the concatenated CSS without specifically pulling a class or value from those files. This may be common if, for example, you have a set of global base classes in your application. To meet this goal, ember-css-modules provides the `@after-module` at-rule to explicitly declare that one module should be included after another.

```css
/* app/styles/app.css */
@after-module './base/simple-elements';
@after-module './base/typography';
```

In the above example, the two files referenced are guaranteed to be included before the actual contents of `app.css`. Where possible, all files that are part of an explicit `@after-module` dependency graph will be included before modules that are connected via implicit dependencies.

#### Final Output

Given the rules above, the final ordering for the modules included in an app or addon build will look something like this:

```
<modules containing or referenced by @after-module rules>
<modules connected via composes: or @value imports>
<all other modules>
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

## Configuration

For applications, configuration for ember-css-modules may be specified in `ember-cli-build.js`:

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

### Plugins

Since the CSS module loader is built on [PostCSS](https://github.com/postcss/postcss), your modules have access to the [full range of plugins](http://postcss.parts/) that exist.

#### Simple Usage

For example, to automatically manage vendor prefixes with [Autoprefixer](https://github.com/postcss/autoprefixer):

```js
var autoprefixer = require('autoprefixer');
// ...
new EmberApp(defaults, {
  cssModules: {
    plugins: [
      autoprefixer('last 2 versions')
    ]
  }
});
```

#### Virtual Modules

Predefined modules that export constants may be configured by passing a `virtualModules` hash to ember-css-modules.

For example, given this configuration:

```js
cssModules: {
  virtualModules: {
    'color-palette': {
      'grass-green': '#4dbd33'
    }
  }
}
```

The following import would retrieve the value `#fdbd33`:

```css
@value grass-green from 'color-palette';
```

Virtual modules may be particularly useful for addon authors, as they provide a way to make your addon styling configurable by consumers of your addon at build time. For instance, in your `index.js` you might have something like:

```js
included: function() {
  // ...
  this.options = Object.assign({}, this.options, {
    cssModules: {
      virtualModules: {
        'my-addon-config': {
          'header-color': config.headerColor || 'green',
          'header-background': config.headerBackground || 'gray'
        }
      }
    }
  });
  this._super.included.apply(this, arguments);
  // ...
}
```

#### Before/After Plugins

By default, any plugins you specify will be applied after the module transformation. To apply a set of plugins beforehand instead, you can pass a hash with `before` and `after` keys. For instance, if you wanted to use [postcss-nested](https://github.com/postcss/postcss-nested) so that you could define a set of global classes as a single block:

```js
new EmberApp(defaults, {
  cssModules: {
    plugins: {
      before: [
        nested
      ],
      after: [
        autoprefixer('last 2 versions')
      ]
    }
  }
});
```

#### Importing Third Party Files

Out of the box, ember-css-modules doesn't provide a way to to include CSS from outside the app or addon in development. Where possible, including these styles by `app.import`ing them from Bower or using a tool like [ember-cli-node-assets](https://github.com/dfreeman/ember-cli-node-assets) is a good practice, since the build pipeline will have to do less work during development, and your users will benefit from better caching in `vendor.css`.

Some styling tools, however, allow for customization as part of a build process. As a specific example, [Basscss](http://www.basscss.com/) allows you to define specific [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) to customize its default styling. To accomplish this with ember-css-modules, you can use [postcss-import](https://github.com/postcss/postcss-import) and [postcss-css-variables](https://github.com/MadLittleMods/postcss-css-variables).

```js
new EmberApp(defaults, {
  cssModules: {
    plugins: [
      require('postcss-import'),
      require('postcss-css-variables')
    ]
  }
});
```

```css
/* app/styles/third-party.css */
@import 'some-other-library';
@import 'basscss';

:root {
  --h1: 4rem;
}
```

```css
/* app/styles/app.css */
@after-module './third-party';
```

Note that any plugins that run _after_ postcss-import will be applied to the imported files, which is why setting the `--h1` variable above affects the Basscss output.

### Scoped Name Generation

By default, ember-css-modules produces a unique scoped name for each class in a module by combining the original class name with a hash of the path of the containing module. You can override this behavior by passing a `generateScopedName` function in the configuration.

```js
new EmberApp(defaults, {
  cssModules: {
    generateScopedName: function(className, modulePath) {
      // Your logic here
    }
  }
});
```

### Other Preprocessors

There are two approaches to integrating CSS modules with other style preprocessors like Sass, Less or Stylus.

#### Modules and preprocessor syntax in isolation

The first approach is to use PostCSS to perform any processing on the modules themselves, and then emit a single vanilla CSS file with those modules that you can then import into your preprocessor of choice. This keeps your modules and other styles in isolation from one another, but provides a nice migration path from another preprocessor to PostCSS + modules.

For example, with Sass you could install ember-cli-sass and then configure ember-css-modules to emit a `_modules` partial:

```js
cssModules: {
  intermediateOutputPath: 'app/styles/_modules.scss'
}
```

And then in your `app.scss`, simply import it:

```scss
// other Sass code and imports
@import 'modules';
```

#### Custom syntax directly in modules

The second approach is viable for preprocessors for which there is a PostCSS syntax extension, such as [Sass](https://github.com/postcss/postcss-scss) and (at least partially) [Less](https://github.com/gilt/postcss-less). It allows for using custom preprocessor syntax directly in CSS modules, handing off the concatenated final output directly to the preprocessor.

Again using Sass as an example, you would specify `app.scss` as your intermediate output file so that ember-cli-sass would pick it up directly, and then tell ember-css-modules to look for `.scss` files and pass through custom PostCSS syntax configuration.

```js
cssModules: {
  // Emit a combined SCSS file for ember-cli-sass to compile
  intermediateOutputPath: 'app/styles/app.scss',

  // Use .scss as the extension for CSS modules instead of the default .css
  extension: 'scss',

  // Pass a custom parser/stringifyer through to PostCSS for processing modules
  postcssOptions: {
    syntax: require('postcss-scss')
  }
}
```


## Ember Support

This addon is tested against and expected to work with Ember 1.13.x, as well as the current 2.x release, beta, and canary builds.
