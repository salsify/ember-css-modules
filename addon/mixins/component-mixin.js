import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { dasherize } from '@ember/string';
import { getOwner } from '@ember/application';

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
      Object.defineProperty(this, LOCAL_CLASS_NAMES_CP, {
        value: localClassNamesCP(this.localClassNameBindings, this.get('__styles__'))
      });
    }
  },

  __styles__: computed(function() {
    // If styles is an explicitly set hash, defer to it. Otherwise, use the resolver.
    if (this.styles && Object.getPrototypeOf(this.styles) === Object.prototype) {
      return this.styles;
    }

    let key = this._debugContainerKey;
    if (!key) { return; }

    return getOwner(this).resolveRegistration(`styles:components/${key.substring(key.indexOf(':') + 1)}`);
  })
});

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
