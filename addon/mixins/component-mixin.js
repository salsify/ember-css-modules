import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

const { dasherize } = Ember.String;

export default Ember.Mixin.create({
  localClassNames: null,
  localClassNameBindings: null,

  concatenatedProperties: ['localClassNames', 'localClassNameBindings'],

  init() {
    this._super();
    this.classNameBindings = [
      ...this.classNameBindings,
      ...localClassNames(this),
      ...localClassNameBindings(this)
    ];
  },

  // TODO deprecate accessing `styles` directly in 0.6.0
  styles: Ember.computed.readOnly('__styles__'),

  __styles__: Ember.computed(function() {
    // If styles is an explicitly set hash, defer to it. Otherwise, use the resolver.
    if (Object.getPrototypeOf(this.styles) === Object.prototype) {
      return this.styles;
    }

    let key = this._debugContainerKey;
    if (!key) { return; }

    return getOwner(this).resolveRegistration(`styles:components/${key.split(':')[1]}`);
  })
});

function localClassNames(component) {
  return component.localClassNames.map(className => `__styles__.${className}`);
}

function localClassNameBindings(component) {
  return component.localClassNameBindings.reduce((bindings, bindingSource) => {
    return bindings.concat(buildBindings(component, bindingSource));
  }, []);
}

function buildBindings(component, bindingSource) {
  let styles = component.get('__styles__');
  let [property, trueStyle = dasherize(property), falseStyle] = bindingSource.split(':');

  let trueClasses = (styles[trueStyle] || '').split(/\s+/);
  let falseClasses = (styles[falseStyle] || '').split(/\s+/);
  let bindings = [];

  for (let i = 0, len = Math.max(trueClasses.length, falseClasses.length); i < len; i++) {
    bindings.push(bindingString(property, trueClasses[i], falseClasses[i]));
  }

  return bindings;
}

function bindingString(property, trueClass = '', falseClass = '') {
  let binding = `${property}:${trueClass || ''}`;
  if (falseClass) {
    binding += `:${falseClass}`;
  }
  return binding;
}
