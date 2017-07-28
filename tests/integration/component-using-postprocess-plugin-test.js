import { test, moduleForComponent } from 'ember-qunit';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('testing/component-using-postprocess-plugin', 'Integration | "postprocess" Plugins', {
  integration: true
});

test('executes postprocess plugins', function(assert) {
  this.render(hbs`{{testing/component-using-postprocess-plugin}}`);

  let testElement = $('[data-test-element]').get(0);
  assert.ok(testElement);

  let styles = window.getComputedStyle(testElement);
  assert.equal(styles.backgroundColor, 'rgb(102, 51, 153)');
});
