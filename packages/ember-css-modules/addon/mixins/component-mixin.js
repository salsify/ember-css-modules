/* global require */

import { computed, defineProperty } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { dasherize } from '@ember/string';
import { getOwner } from '@ember/application';
import { assert, deprecate } from '@ember/debug';

export default Mixin.create({
  localClassNames: null,
  localClassNameBindings: null,

  concatenatedProperties: ['localClassNames', 'localClassNameBindings'],

  init() {
    this._super();

    if (this.tagName === '') return;

    this.classNameBindings = [
      ...this.classNameBindings,
      ...localClassNames(this),
      LOCAL_CLASS_NAMES_CP,
    ];

    if (this.localClassNameBindings.length) {
      let value = localClassNamesCP(this.localClassNameBindings, this.get('__styles__'));
      defineProperty(this, LOCAL_CLASS_NAMES_CP, value);
    }
  },

  __styles__: computed(function() {
    let key = this._debugContainerKey;
    if (!key) { return; }

    let name = key.replace(/^component:/, '');
    let layout = this.layout || getOwner(this).lookup(`template:components/${name}`);
    assert(
      `Unable to resolve localClassNames or localClassNameBindings for component ${name}, which has no ` +
      `layout. You can fix this by either creating an empty template for your component or importing and ` +
      `using the styles hash directly instead, e.g. \`classNames: styles['my-class']\`.`,
      layout
    );

    deprecate(
      'Support for `localClassNames`, `localClassNameBindings` and the `@localClassName` and `@localClassNames` ' +
      'decorators will be removed in the next major release of ember-css-modules. The `' + name + '` component ' +
      'uses one or more of these APIs. See the ECM 1.5.0 release notes for further details and migration options: ' +
      'https://github.com/salsify/ember-css-modules/releases/tag/v1.5.0',
      false,
      {
        id: 'ember-css-modules.classic-component-apis',
        for: 'ember-css-modules',
        until: '2.0.0',
        since: {
          enabled: '1.5.0'
        }
      }
    );

    // Since https://github.com/emberjs/ember.js/pull/18096
    if (typeof layout === 'function') layout = layout(getOwner(this));

    // This is not public API and might break at any time...
    let moduleName = (layout.meta || layout.referrer).moduleName.replace(/\.hbs$/, '');
    if (/\/template$/.test(moduleName)) {
      return tryLoad(moduleName.replace(/template$/, 'styles'));
    } else if (/\/templates\//.test(moduleName)) {
      return tryLoad(moduleName.replace('/templates/', '/styles/'));
    }

    return;
  })
});

function tryLoad(path) {
  if (require.has(path)) {
    return require(path).default;
  }
}

const LOCAL_CLASS_NAMES_CP = '__ecm_local_class_names__';

function localClassNames(component) {
  return component.localClassNames.map(className => `__styles__.${className}`);
}

function localClassNamesCP(localClassNameBindings, styles) {
  let bindings = localClassNameBindings.map((binding) => {
    let [property, trueStyle, falseStyle] = binding.split(':');
    let trueClasses = styles[trueStyle || dasherize(property)] || '';
    let falseClasses = styles[falseStyle] || '';
    let isBoolean = !!trueStyle;
    return { property, trueClasses, falseClasses, isBoolean };
  });

  return computed(...bindings.map(binding => binding.property), function() {
    let classes = [];

    bindings.forEach((binding) => {
      let value = this.get(binding.property);
      if (binding.isBoolean || typeof value !== 'string') {
        classes.push(value ? binding.trueClasses : binding.falseClasses);
      } else {
        classes.push(value.split(/\s+/).map(key => styles[key]).join(' '));
      }
    });

    return classes.join(' ');
  });
}
