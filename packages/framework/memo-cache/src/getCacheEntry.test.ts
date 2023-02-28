import type { CacheEntry } from './getCacheEntry';
import { getCacheEntry } from './getCacheEntry';

interface TestObj {
  id: number;
}

type TestEntry = CacheEntry<TestObj>;

function compareResults(base: TestEntry, args: any[], argsNoMatch?: any[]): void {
  const e1 = getCacheEntry(base, args);
  expect(getCacheEntry(base, args)).toBe(e1);

  if (argsNoMatch) {
    expect(getCacheEntry(base, argsNoMatch)).not.toBe(e1);
  }
}

describe('Memo cache unit tests', () => {
  test('undefined args to return noargs', () => {
    const base: TestEntry = {};
    expect(getCacheEntry(base, undefined)).toBe(base.noargs);
  });

  test('empty args array to return noargs entry', () => {
    const base: TestEntry = {};
    expect(getCacheEntry(base, [])).toBe(base.noargs);
  });

  test('undefined goes to empty entry', () => {
    const base: TestEntry = {};
    expect(getCacheEntry(base, [undefined])).toBe(base.empty);
  });

  test('null to go to empty entry', () => {
    const base: TestEntry = {};
    expect(getCacheEntry(base, [null])).toBe(base.empty);
  });

  test('string gets keyed correctly', () => {
    const base: TestEntry = {};
    const key = 'foo';
    expect(getCacheEntry(base, [key])).toBe(base.str[key]);
  });

  test('number gets keyed correctly', () => {
    const base: TestEntry = {};
    const val = 235;
    const key = val + '';
    expect(getCacheEntry(base, [val])).toBe(base.str[key]);
  });

  test('bool gets keyed correctly', () => {
    const base: TestEntry = {};
    const val = true;
    const key = val + '';
    expect(getCacheEntry(base, [val])).toBe(base.str[key]);
  });

  test('false bool gets keyed correctly', () => {
    const base: TestEntry = {};
    const val = false;
    const key = val + '';
    expect(getCacheEntry(base, [val])).toBe(base.str[key]);
  });

  test('object gets keyed correctly', () => {
    const base: TestEntry = {};
    const key = {};
    expect(getCacheEntry(base, [key])).toBe(base.obj.get(key));
  });

  test('function gets keyed correctly', () => {
    const base: TestEntry = {};
    const key = () => {
      return 'hello world';
    };
    expect(getCacheEntry(base, [key])).toBe(base.obj.get(key));
  });

  test('basic string retrieval', () => {
    compareResults({}, ['hello', 'world'], ['hello world']);
  });

  test('mixed keys with strings', () => {
    compareResults({}, ['hello', 1, true, undefined, 'world'], ['hello', 1, true, '', 'world']);
  });

  test('basic object matches', () => {
    const obj = {};
    compareResults({}, [obj]);
  });

  test('mixed object and string matches', () => {
    const obj = {};
    compareResults({}, [obj, 'hello', 1, 'world']);
  });

  test('mixed obj and strings with obj at end', () => {
    const obj = {};
    const obj2 = {};
    compareResults({}, ['hello', 1, 'world', obj], ['hello', 1, 'world', obj2]);
  });

  test('hybrid sets', () => {
    const obj = {};
    const obj2 = {};
    compareResults({}, ['hello', obj, 'world', 1, false, obj2, undefined]);
  });

  test('sub cache on object', () => {
    const obj = {};
    const args1 = ['hello', obj];
    const base = {};
    const subRoot = getCacheEntry(base, args1);
    const args2 = ['world', base];
    const target = getCacheEntry(subRoot, args2);
    expect(getCacheEntry(base, [...args1, ...args2])).toBe(target);
  });
});
