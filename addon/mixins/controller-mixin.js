import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Mixin.create({
  styles: Ember.computed('__styles__', function() {
    Ember.deprecate(
      'Using the implicit `controller.styles` computed is deprecated. In a template, use the {{local-class}} helper, ' +
      'and in JavaScript, import the styles hash and reference it directly.',
      false,
      {
        id: 'ember-css-modules.styles-computed',
        until: '0.7.0'
      }
    );

    return this.get('__styles__');
  }),


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
