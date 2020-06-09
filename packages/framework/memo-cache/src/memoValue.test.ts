import { memoValue } from './memoValue';

interface TestObj {
  id: number;
}

function getObjFactory() {
  const obj: TestObj = { id: 0 };
  return () => ({
    id: obj.id++
  });
}

describe('memoValue unit tests', () => {
  test('memo calls function only once', () => {
    const fn = getObjFactory();
    const keys = ['hello', 'world'];
    const o1 = memoValue(fn, ...keys).value;
    expect(memoValue(fn, ...keys).value).toBe(o1);
  });
});
