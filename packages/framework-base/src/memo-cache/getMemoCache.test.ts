import { getMemoCache } from './getMemoCache';

interface TestObj {
  id: number;
}

function getObjFactory() {
  const obj: TestObj = { id: 0 };
  return () => ({
    id: obj.id++,
  });
}

describe('getMemoCache unit tests', () => {
  test('memoValue with null function', () => {
    const memoValue = getMemoCache();
    const [val] = memoValue(null, ['foo', 'bar']);
    expect(val).toBeNull();
  });

  test('memoValue with undefined', () => {
    const memoValue = getMemoCache();
    const [val] = memoValue(undefined, ['foo', 'bar']);
    expect(val).toBeUndefined();
  });

  test('memoValue with string', () => {
    const memoValue = getMemoCache();
    const [val] = memoValue('foo', ['bar', 'baz']);
    expect(val).toEqual('foo');
  });

  test('memoValue with object', () => {
    const memoValue = getMemoCache();
    const obj = { foo: 'hello', bar: 2, baz: 'you' };
    const [val] = memoValue(obj, ['hello', obj]);
    expect(val).toBe(obj);
  });

  test('memoValue executes function', () => {
    const memoValue = getMemoCache();
    const fn = getObjFactory();
    const v1 = fn();
    const [v2] = memoValue(fn, ['bar', 'baz']);
    expect(v1).not.toBe(v2);
    expect(v1.id).not.toEqual(v2.id);
  });

  test('memo calls function only once', () => {
    const memoValue = getMemoCache();
    const fn = getObjFactory();
    const keys = ['hello', 'world'];
    const [o1] = memoValue(fn, keys);
    const [o2] = memoValue(fn, keys);
    expect(o2).toBe(o1);
  });

  test('memo calls function only once for empty inputs', () => {
    const memoValue = getMemoCache();
    const fn = getObjFactory();
    const [o1] = memoValue(fn, undefined);
    const [o2] = memoValue(fn, undefined);
    expect(o2).toBe(o1);
  });

  test('sub caches are separate', () => {
    const memoValue = getMemoCache();
    const base1 = {};
    const base2 = {};
    const [, getCache1] = memoValue(null, [base1]);
    const [, getCache2] = memoValue(null, [base2]);
    const objKey = {};
    const fn = getObjFactory();
    const [o1] = getCache1(fn, [objKey]);
    const [o2] = getCache2(fn, [objKey]);
    const [o3] = getCache2(fn, [objKey]);
    expect(o1).not.toBe(o2);
    expect(o3).toBe(o2);
  });

  test('sub caches work on branches', () => {
    const memoValue = getMemoCache();
    const keys1 = [{}, 2, 'hello'];
    const keys2 = [{}, true];
    const fn = getObjFactory();
    const [, getMemoValue] = memoValue(null, keys1);
    const [val1] = getMemoValue(fn, keys2);
    const [val2] = memoValue(fn, [...keys1, ...keys2]);
    expect(val2).toBe(val1);
  });
});
