import Ember from 'ember';

export default Ember.Mixin.create({
  componentFor(name, owner, options) {
    let component = this._super(name, owner, options);

    // Changes made to support local lookup render this mixin unnecessary (and actually, broken) in Ember >= 2.5
    if (options) { return component; }

    // Ensure components are always managed my the container and thus have a connection to their styles
    if (!component) {
      if (owner.register) {
        owner.register(`component:${name}`, Ember.Component);
      } else {
        owner._registry.register(`component:${name}`, Ember.Component); // Support for Ember 2.0.X
      }
      component = this._super(name, owner, options);
    }

    return component;
  }
});
