# ember-css-modules [![Build Status](https://travis-ci.org/salsify/ember-css-modules.svg?branch=master)](https://travis-ci.org/salsify/ember-css-modules)

Ember-flavored support for [CSS Modules](https://github.com/css-modules/css-modules). For a deeper overview of the details of the CSS Modules concept, see [this blog post](http://glenmaddern.com/articles/css-modules).

## Installation

```sh
ember install ember-css-modules
```

## Usage

### Overview

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

## Usage in Addons

You can also use ember-css-modules in addons that expose components to their consuming application. However, as with component templates, the styles will need to be explicitly bound to the component class, since the resolver won't be able to find them in the addon tree.

```js
// addon/components/my-addon-component.js
import Ember from 'ember';
import template from '../templates/components/my-addon-component';
import styles from '../styles/components/my-addon-component';

export default Ember.Component.extend({
  template,
  styles
});
```

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

Since the CSS module loader is built on [PostCSS](https://github.com/postcss/postcss), your modules have access to the [full range of plugins](http://postcss.parts/) that exist. For example, to automatically manage vendor prefixes with [Autoprefixer](https://github.com/postcss/autoprefixer):

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

## Ember Support

This addon is tested against and expected to work with Ember 1.13.x, as well as the current 2.x release, beta, and canary builds.
