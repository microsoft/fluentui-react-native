import { mergeKeys, toKey } from './keys';

const _delim = '|';

describe('Memo key unit tests', () => {
  test('merge keys works with multiple', () => {
    const keys = ['hello', 'world'];
    expect(mergeKeys(keys)).toEqual(`hello${_delim}world`);
  });

  test('merge one key returns key', () => {
    const keys = ['hello'];
    expect(mergeKeys(keys)).toEqual('hello');
  });

  test('merge keys with empty returns empty string', () => {
    const keys = [];
    expect(mergeKeys(keys)).toEqual('');
  });

  test('toKey with string', () => {
    const val = 'hello';
    const { key, isObj } = toKey(val);
    expect(key).toEqual('hello');
    expect(isObj).toBeFalsy();
  });

  test('toKey with object', () => {
    const val = {};
    const { key, isObj } = toKey(val);
    expect(key).toBe(val);
    expect(isObj).toBeTruthy();
  });

  test('toKey with function', () => {
    const val = () => {
      return 3 + 4;
    };
    const { key, isObj } = toKey(val);
    expect(key).toBe(val);
    expect(isObj).toBeTruthy();
  });

  test('toKey with array', () => {
    const val = ['hello', 'world'];
    const { key, isObj } = toKey(val);
    expect(key).toBe(val);
    expect(isObj).toBeTruthy();
  });

  test('toKey with number', () => {
    const val = 34;
    const { key, isObj } = toKey(val);
    expect(key).toEqual('34');
    expect(isObj).toBeFalsy();
  });

  test('toKey with boolean', () => {
    const val = true;
    const { key, isObj } = toKey(val);
    expect(key).toEqual('true');
    expect(isObj).toBeFalsy();
  });

  test('toKey with undefined', () => {
    const val = undefined;
    const { key, isObj } = toKey(val);
    expect(key).toEqual('undefined');
    expect(isObj).toBeFalsy();
  });

  test('toKey with undefined obj key', () => {
    const objWithVal: { a?: number; b?: number } = { a: 23 };
    const { key, isObj } = toKey(objWithVal.b);
    expect(key).toEqual('undefined');
    expect(isObj).toBeFalsy();
  });

  test('toKey with null key', () => {
    const val = null;
    const { key, isObj } = toKey(val);
    expect(key).toBe(val);
    expect(isObj).toBeTruthy();
  });
});
