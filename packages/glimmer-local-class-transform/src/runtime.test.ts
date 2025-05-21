import { describe, test, expect } from 'vitest';
import { join, classNames } from './runtime.js';

describe('Runtime helpers', () => {
  test('classNames', () => {
    expect(classNames({}, 'foo')).toBe('foo');
    expect(classNames({ foo: 'bar' }, 'foo')).toBe('bar');
    expect(classNames({ foo: 'bar' }, '  foo    baz ')).toBe('bar baz');
  });

  test('join', () => {
    expect(join()).toBe('');
    expect(join('foo')).toBe('foo');
    expect(join('foo', 'bar')).toBe('foobar');
  });
});
