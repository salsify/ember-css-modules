import Component from '@ember/component';

export default Component.extend({
  localClassNames: ['test-component'],
  localClassNameBindings: ['prop'],
  prop: 'test-component-bound',
});
