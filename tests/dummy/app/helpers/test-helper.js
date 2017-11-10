import { helper } from '@ember/component/helper';

export function testHelper(params) {
  return params.join(', ');
}

export default helper(testHelper);
