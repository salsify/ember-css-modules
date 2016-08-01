import Ember from 'ember';

export function testHelper(params) {
  return params.join(', ');
}

export default Ember.Helper.helper(testHelper);
