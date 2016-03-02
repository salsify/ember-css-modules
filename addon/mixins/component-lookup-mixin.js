import Ember from 'ember';

export default Ember.Mixin.create({
  componentFor(name, owner) {
    let component = this._super(name, owner);

    // Ensure components are always managed my the container and thus have a connection to their styles
    if (!component) {
      if (owner.register) {
        owner.register(`component:${name}`, Ember.Component);
      } else {
        owner._registry.register(`component:${name}`, Ember.Component); // Support for Ember 2.0.X
      }
      component = this._super(name, owner);
    }

    return component;
  }
});
