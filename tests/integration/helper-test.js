import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('helper:test-helper', 'Integration | Helpers still function', {
  integration: true
});

test('helpers work correctly', function(assert) {
  this.render(hbs`{{test-helper 'foo' 'bar'}}`);
  assert.equal(this.$().text().trim(), 'foo, bar');
});
