import { memoize } from './memoize';

let _globalCalls = 0;

describe('Memoize unit tests', () => {
  test('simple function no args', () => {
    const noArgsFn = memoize(() => {
      return ++_globalCalls;
    });
    const result1 = noArgsFn();
    expect(noArgsFn()).toEqual(result1);
  });

  test('simple function 1 arg', () => {
    const incrementFn = memoize((bump: number) => {
      ++_globalCalls;
      return bump + 1;
    });

    expect(incrementFn(3)).toEqual(4);
    const calls = _globalCalls;
    incrementFn(3);
    expect(_globalCalls).toEqual(calls);
    incrementFn(4);
    expect(_globalCalls).toEqual(calls + 1);
    incrementFn(4);
    expect(_globalCalls).toEqual(calls + 1);
  });

  test('void function 2 args', () => {
    const voidFn = memoize((a: number, b: string) => {
      if (a) {
        ++_globalCalls;
      } else if (b) {
        ++_globalCalls;
      } else {
        ++_globalCalls;
      }
    });

    voidFn(3, 'hello');
    const calls = _globalCalls;
    voidFn(3, 'hello');
    expect(_globalCalls).toEqual(calls);
    voidFn(3, 'world');
    expect(_globalCalls).toEqual(calls + 1);
  });
});
