import { describe, test, expect } from 'vitest';
import { join, classNames } from './runtime.js';

describe('Runtime helpers', () => {
  test('classNames', () => {
    expect(classNames({}, 'foo')).toBe('');
    expect(classNames({ foo: 'bar' }, 'foo')).toBe('bar');
    expect(classNames({ foo: 'bar' }, '  foo    baz ')).toBe('bar');
    expect(classNames({ foo: 'bar', baz: 'qux' }, '  foo    baz ')).toBe('bar qux');
  });

  test('classNames with undefined or empty classes', () => {
    expect(classNames({}, undefined as unknown as string)).toBe('');
    expect(classNames({}, null as unknown as string)).toBe('');
    expect(classNames({}, '')).toBe('');
  });

  test('join', () => {
    expect(join()).toBe('');
    expect(join('foo')).toBe('foo');
    expect(join('foo', 'bar')).toBe('foobar');
  });
});
