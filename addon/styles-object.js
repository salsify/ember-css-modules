import Ember from 'ember';

export default Ember.Object.extend({
  create() {
    // These things are their own factories in order to play nice with the container.
    return this;
  }
});
