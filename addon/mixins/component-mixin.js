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

  styles: Ember.computed(function() {
    let key = this._debugContainerKey;
    if (!key) { return; }

    return getOwner(this).resolveRegistration(`styles:components/${key.split(':')[1]}`);
  })
});

function localClassNames(component) {
  return component.localClassNames.map(className => `styles.${className}`);
}

function localClassNameBindings(component) {
  return component.localClassNameBindings.reduce((bindings, bindingSource) => {
    return bindings.concat(buildBindings(component, bindingSource));
  }, []);
}

function buildBindings(component, bindingSource) {
  let styles = component.get('styles');
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
