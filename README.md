# ember-css-modules [![Build Status](https://travis-ci.org/salsify/ember-css-modules.svg?branch=master)](https://travis-ci.org/salsify/ember-css-modules)

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

With ember-css-modules, you define styles on a per-component (or -controller) basis. The classes you define are then available from a `styles` object in the template. You define these styles using the same file layout you use for templates; for example, in pod structure you'd put `styles.css` alongside `template.hbs` in the component's pod:

```hbs
{{! app/components/my-component/template.hbs }}
<div class="{{styles.hello-class}}">Hello, world!</div>
```

```css
/* app/components/my-component/styles.css */
.hello-class {
  font-weight: bold;
}
```

In "classic" structure, these files would instead be `app/templates/components/my-component.hbs` and `app/styles/components/my-component.css`, respectively.

Styles belonging to a route controller rather than a component mirror their corresponding templates similarly.

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

In the template for `my-component`, the value of `styles.component-title` will look something like `_component-title_1dr4n4 _secondary-header_1658xu _header_1658xu`, incorporating styles from all of the composing classes.

Note that you may also use relative paths to specify the source modules for composition.

### Applying CSS to Component Root

In a case where you need to apply a rule to the top-level root element of the component, leverage `classNameBindings` to do so. Then just reference the class in your `styles.css` normally:

```js
/* app/components/my-component/component.js */
export default Ember.Component.extend({
  classNameBindings: ['styles.my-component'],

  ...
});
```

```css
/* app/components/my-component/styles.css */
.my-component {
  margin-left: 5px;
}
```

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

Note also that **your addon must have an `addon/styles` directory** in order to trigger CSS processing in Ember CLI. It can be empty or contain a version control placeholder like `.gitkeep`; it just needs to exist.

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

## Ember Support

This addon is tested against and expected to work with Ember 1.13.x, as well as the current 2.x release, beta, and canary builds.
