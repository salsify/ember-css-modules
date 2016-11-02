import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

export default Ember.Mixin.create({
  // TODO deprecate accessing `styles` directly in 0.6.0
  styles: Ember.computed.readOnly('__styles__'),

  __styles__: Ember.computed(function() {
    // If styles is an explicitly set hash, defer to it. Otherwise, use the resolver.
    if (Object.getPrototypeOf(this.styles) === Object.prototype) {
      return this.styles;
    }

    let key = this._debugContainerKey;
    if (!key) { return; }

    return getOwner(this).resolveRegistration(`styles:${key.split(':')[1]}`);
  })
});
