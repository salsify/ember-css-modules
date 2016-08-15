import { lookupModuleStyles } from 'dummy/helpers/lookup-module-styles';
import { module, test } from 'qunit';

module('Unit | Helper | lookup-module-styles');

test('applying local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  }

  let classNames = lookupModuleStyles([null, stylesMap, 'foo']);
  assert.equal(classNames, '_foo_123');
});

test('applying local-class to non-existent map', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  }

  let classNames = lookupModuleStyles([null, stylesMap, 'baz']);
  assert.equal(classNames, '');
});

test('applying to no style map', function(assert) {
  let stylesMap = {
  }

  let classNames = lookupModuleStyles(['a', stylesMap, 'baz']);
  assert.equal(classNames, 'a');
});

test('applying class and multiple local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  }

  let classNames = lookupModuleStyles(['a', stylesMap, 'foo bar']);
  assert.equal(classNames, 'a _foo_123 _bar_456');
});

test('applying multiple local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  }

  let classNames = lookupModuleStyles([null, stylesMap, 'foo bar']);
  assert.equal(classNames, '_foo_123 _bar_456');
});

test('applying multiple class and multiple local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  }

  let classNames = lookupModuleStyles(['a b', stylesMap, 'foo bar']);
  assert.equal(classNames, 'a b _foo_123 _bar_456');
});
