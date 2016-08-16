import { lookupModuleStyles } from 'dummy/helpers/lookup-module-styles';
import { module, test } from 'qunit';

module('Unit | Helper | lookup-module-styles');

test('applying local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  };

  let classNames = lookupModuleStyles([stylesMap, 'foo']);
  assert.equal(classNames, '_foo_123');
});

test('applying multiple local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  };

  let classNames = lookupModuleStyles([stylesMap, 'foo bar']);
  assert.equal(classNames, '_foo_123 _bar_456');
});

test('applying to no style map', function(assert) {
  let stylesMap = {};

  let classNames = lookupModuleStyles([stylesMap, 'baz']);
  assert.equal(classNames, '');
});

test('applying local-class to non-existent map', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  };

  let classNames = lookupModuleStyles([stylesMap, 'baz']);
  assert.equal(classNames, '');
});
