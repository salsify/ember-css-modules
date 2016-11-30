import { localClass } from 'dummy/helpers/local-class';
import { module, test } from 'qunit';

module('Unit | Helper | local-class');

test('applying local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  };

  let classNames = localClass(['foo'], { from: stylesMap });
  assert.equal(classNames, '_foo_123');
});

test('applying multiple local-class', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  };

  let classNames = localClass(['foo bar'], { from: stylesMap });
  assert.equal(classNames, '_foo_123 _bar_456');
});

test('applying to no style map', function(assert) {
  let stylesMap = {};

  let classNames = localClass(['baz'], { from: stylesMap });
  assert.equal(classNames, '');
});

test('applying local-class to non-existent map', function(assert) {
  let stylesMap = {
    foo: '_foo_123',
    bar: '_bar_456'
  };

  let classNames = localClass(['baz'], { from: stylesMap });
  assert.equal(classNames, '');
});

test('with no source specified', function(assert) {
  assert.throws(() => localClass(['abc'], {}), /No source specified/);
});

test('with an empty source specified', function(assert) {
  assert.equal(localClass(['abc'], { from: null }), '');
});

test('with an undefined local class', function(assert) {
  assert.equal(localClass([undefined], { from: {} }), '');
});

export default { foo: '_foo_123', bar: '_bar_789' };

test('with a string source specified', function(assert) {
  let classNames = localClass(['foo bar'], { from: 'dummy/tests/unit/helpers/local-class-test' });
  assert.equal(classNames, '_foo_123 _bar_789');
});
