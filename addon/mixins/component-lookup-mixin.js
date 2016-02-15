import Ember from 'ember';

export default Ember.Mixin.create({
  componentFor(name, owner) {
    let component = this._super(name, owner);

    // Ensure components are always managed my the container and thus have a connection to their styles
    if (!component) {
      owner.register(`component:${name}`, Ember.Component);
      component = this._super(name, owner);
    }

    return component;
  }
});
