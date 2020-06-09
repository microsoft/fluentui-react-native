import { getMemoCacheEntry, CacheEntry } from './getMemoCacheEntry';

interface TestObj {
  id: number;
}

/*
function getObjFactory() {
  const obj: TestObj = { id: 0 };
  return () => ({
    id: obj.id++
  });
}
*/

type TestEntry = CacheEntry<TestObj>;

function compareResults(base: TestEntry, args: any[], argsNoMatch?: any[]): void {
  const e1 = getMemoCacheEntry(base, args);
  expect(getMemoCacheEntry(base, args)).toBe(e1);

  if (argsNoMatch) {
    expect(getMemoCacheEntry(base, argsNoMatch)).not.toBe(e1);
  }
}

describe('Memo cache unit tests', () => {
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
    const subRoot = getMemoCacheEntry(base, args1);
    const args2 = ['world', base];
    const target = getMemoCacheEntry(subRoot, args2);
    expect(getMemoCacheEntry(base, [...args1, ...args2])).toBe(target);
  });
});
