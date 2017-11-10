import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { getOwner } from '@ember/application';

export default Mixin.create({
  __styles__: computed(function() {
    // If styles is an explicitly set hash, defer to it. Otherwise, use the resolver.
    if (this.styles && Object.getPrototypeOf(this.styles) === Object.prototype) {
      return this.styles;
    }

    let key = this._debugContainerKey;
    if (!key) { return; }

    return getOwner(this).resolveRegistration(`styles:${key.substring(key.indexOf(':') + 1)}`);
  })
});
