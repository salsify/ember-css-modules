import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

export default Ember.Mixin.create({
  styles: Ember.computed(function() {
    let key = this._debugContainerKey;
    if (!key) { return; }

    return getOwner(this)._lookupFactory(`styles:${key.split(':')[1]}`);
  })
});
