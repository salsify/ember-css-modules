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
      ...this.localClassNames.map(className => `styles.${className}`),
      ...this.localClassNameBindings.map(bindingSource => localClassNameBinding(this, bindingSource))
    ];
  },

  styles: Ember.computed(function() {
    let key = this._debugContainerKey;
    if (!key) { return; }

    return getOwner(this).resolveRegistration(`styles:components/${key.split(':')[1]}`);
  })
});

function localClassNameBinding(component, bindingSource) {
  let [property, trueClass = dasherize(property), falseClass] = bindingSource.split(':');
  let binding = `${property}:${component.get(`styles.${trueClass}`)}`;

  if (falseClass) {
    binding += `:${component.get(`styles.${falseClass}`)}`;
  }

  return binding;
}
