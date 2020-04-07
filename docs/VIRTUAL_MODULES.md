# Virtual Modules

There are many scenarios where it can be useful to programmatically define constants at build time rather than hard coding them in your source. You can accomplish this in ember-css-modules by passing a `virtualModules` hash in your config.

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

The following import would retrieve the value `#4dbd33`:

```css
@value grass-green from 'color-palette';
```

Virtual modules may be particularly useful for addon authors, as they provide a way to make your addon styling configurable by consumers of your addon at build time. For instance, in your `index.js` you might have something like:

```js
setupPreprocessorRegistry(target) {
  if (target === 'parent') {
    let includingAppOrAddon = this.app || this.parent;
    let config = includingAppOrAddon.options.mySpecialConfig || {};

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
  }
}
```
