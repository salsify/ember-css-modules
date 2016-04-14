import Ember from 'ember';

export default Ember.Mixin.create({
  componentFor(name, owner, options) {
    let component = this._super(name, owner, options);

    // Changes made to support local lookup render this mixin unnecessary (and actually, broken) in Ember >= 2.5
    if (options) { return component; }

    // Ensure components are always managed my the container and thus have a connection to their styles
    if (!component) {
      findRegistry(owner).register(`component:${name}`, Ember.Component);
      component = this._super(name, owner, options);
    }

    return component;
  }
});

// There are like a dozen different ways of registering something across our various supported versions of Ember,
// all varying levels of public-ish. This threads that needle without triggering deprecation warnings.
function findRegistry(owner) {
  return owner._registry || (owner.register ? owner : owner.registry);
}
