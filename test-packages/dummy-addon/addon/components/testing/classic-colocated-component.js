import Component from '@ember/component';

export default Component.extend({
  localClassNames: ['component-class'],
  attributeBindings: ['dataTest:data-test-element'],
  dataTest: true,
});
