import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('test-component', 'Integration | Component | test component', {
  integration: true
});

test('it renders with the correct styles', function(assert) {
  this.render(hbs`{{test-component}}`);

  let testElement = this.$('[data-test-element]')[0];
  let styles = getComputedStyle(testElement);

  assert.equal(styles.color, 'rgb(0, 128, 0)');
});
