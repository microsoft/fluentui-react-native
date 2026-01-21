import type { MergeOptions } from './Merge';
import { immutableMerge, immutableMergeCore, processImmutable } from './Merge';

interface IFakeStyle {
  s1?: string;
  s2?: number;
  nm?: INoMerge;
}

interface INoMerge {
  nm1?: number;
  nm2?: number;
}

interface IFakeSettings {
  root?: {
    p1?: string;
    p2?: number;
    nm?: INoMerge;
    style?: IFakeStyle;
  };
  fakeSlot?: {
    ps1?: string;
    ps2?: number;
    style?: IFakeStyle;
  };
}

const sett1: IFakeSettings = {
  root: {
    p2: 1,
    nm: { nm1: 1 },
    style: { s1: 'foo', s2: 2, nm: { nm1: 1 } },
  },
  fakeSlot: {
    ps2: 2,
  },
};

const sett2: IFakeSettings = {
  root: {
    p1: 'sett2',
    p2: 2,
    nm: { nm2: 2 },
  },
  fakeSlot: {
    style: { s1: 'sett2' },
  },
};

const sett1plus2: IFakeSettings = {
  root: {
    p1: 'sett2',
    p2: 2,
    nm: { nm2: 2 },
    style: { s1: 'foo', s2: 2, nm: { nm1: 1 } },
  },
  fakeSlot: {
    ps2: 2,
    style: { s1: 'sett2' },
  },
};

const sett3: IFakeSettings = {
  root: {
    p1: 'sett3',
    style: { s2: 3, nm: { nm2: 2 } },
  },
};

const sett1plus3: IFakeSettings = {
  root: {
    p1: 'sett3',
    p2: 1,
    nm: { nm1: 1 },
    style: { s1: 'foo', s2: 3, nm: { nm2: 2 } },
  },
  fakeSlot: {
    ps2: 2,
  },
};

const sett1plus2plus3: IFakeSettings = {
  root: {
    p1: 'sett3',
    p2: 2,
    nm: { nm2: 2 },
    style: { s1: 'foo', s2: 3, nm: { nm2: 2 } },
  },
  fakeSlot: {
    ps2: 2,
    style: { s1: 'sett2' },
  },
};

const mergeOptions: MergeOptions = {
  object: {
    style: 0,
  },
};

interface IDeepObj {
  a: { b: { c: number } };
  b: { c: { d: { d: string } } };
}

const deep1 = {
  a: { b: { c: 1 } },
  b: { c: { d: { d: 'foo' } } },
  c: { e: 4 },
};

const deep2 = {
  a: { b1: 3, b: { c: 2 } },
  b: { c: { d2: 'bar' } },
  c: { e2: { f: 'baz' } },
};

const deepMerged = {
  a: { b1: 3, b: { c: 2 } },
  b: { c: { d: { d: 'foo' }, d2: 'bar' } },
  c: { e: 4, e2: { f: 'baz' } },
};

const singleToChange = {
  a: { b: { c: { changeMe: { color: 'blue' } } } },
  b: { d: { changeMe: { font: 'fixed' } } },
};

const singleWithChanges = {
  a: { b: { c: { changeMe: { color: 'changed' } } } },
  b: { d: { changeMe: { font: 'fixed' } } },
};

const _colorKey = 'color';

const changeMeHandler = (...objs: (Record<string, unknown> | undefined)[]) => {
  // written always assuming only one entry
  if (objs.length === 1) {
    const firstObj = objs[0]!;

    if (firstObj[_colorKey]) {
      return { ...firstObj, color: 'changed' };
    }

    return firstObj;
  }
  return undefined;
};

const changeMeOption1: MergeOptions = {
  a: {
    b: {
      c: {
        changeMe: changeMeHandler,
      },
    },
  },
};

const changeMeOption2: MergeOptions = {
  object: {
    object: {
      object: {
        changeMe: changeMeHandler,
      },
      changeMe: changeMeHandler,
    },
  },
};

describe('Immutable merge unit tests', () => {
  test('merge one returns same object', () => {
    const obj = {
      a: 'a',
      b: 2,
    };
    expect(immutableMerge(obj, undefined)).toBe(obj);
    expect(immutableMerge(undefined, obj)).toBe(obj);
  });

  test('merge flat is like assign', () => {
    const obj1 = { a: 'a', b: 1 };
    const obj2 = { b: 2, c: true };
    const merged = { a: 'a', b: 2, c: true };
    expect(immutableMerge<any>(obj1, obj2)).toEqual(merged);
    expect(immutableMergeCore<any>(0, obj1, obj2)).toEqual(merged);
    expect(immutableMergeCore<any>(true, obj1, obj2)).toEqual(merged);
  });

  const dm1 = {
    a: { b: { c: { foo: 'foo', bar: 'bar' } } },
    d: { e: 1, f: { g: 'hello', h: 2 } },
  };

  const dm2 = {
    a: { b: { c: { bar: 'bar2', baz: 'baz' } }, i: 'world' },
    d: { j: 4 },
  };

  test('deep merge', () => {
    expect(immutableMerge<any>(dm1, dm2)).toEqual({
      a: { b: { c: { foo: 'foo', bar: 'bar2', baz: 'baz' } }, i: 'world' },
      d: { e: 1, f: { g: 'hello', h: 2 }, j: 4 },
    });
  });

  test('merge zero levels', () => {
    expect(immutableMergeCore<any>(0, dm1, dm2)).toEqual(dm2);
  });

  test('merge one level deep', () => {
    const result = {
      a: dm2.a,
      d: { ...dm1.d, ...dm2.d },
    };
    expect(immutableMergeCore<any>(1, dm1, dm2)).toEqual(result);
    expect(immutableMergeCore<any>({ object: 0 }, dm1, dm2)).toEqual(result);
  });

  test('merge with empty object', () => {
    const merged = immutableMergeCore(mergeOptions, sett1, {});
    expect(merged).toBe(sett1);
    const merged2 = immutableMergeCore(mergeOptions, {}, sett2);
    expect(merged2).toBe(sett2);
  });

  test('merge sett1 and sett2', () => {
    const merged = immutableMergeCore(mergeOptions, sett1, sett2) as IFakeSettings;
    expect(merged).toEqual(sett1plus2);
    expect(merged!.root.style).toBe(sett1.root.style);
    expect(merged!.fakeSlot!.style).toBe(sett2.fakeSlot!.style);
  });

  test('merge sett1 and sett3', () => {
    const merged = immutableMergeCore(mergeOptions, sett1, sett3) as IFakeSettings;
    expect(merged).toEqual(sett1plus3);
    expect(merged!.fakeSlot).toBe(sett1.fakeSlot);
  });

  test('merge three', () => {
    const merged = immutableMergeCore(mergeOptions, sett1, sett2, sett3);
    expect(merged).toEqual(sett1plus2plus3);
  });

  test('deepMerge', () => {
    const merged = immutableMergeCore<any>(-1, deep1, deep2) as IDeepObj;
    expect(merged).toEqual(deepMerged);
    expect(merged.b.c.d).toBe(deep1.b.c.d);
    expect(merged.a.b).not.toBe(deep2.a.b);
  });

  test('singleProcessNoChange', () => {
    const merged = processImmutable({ object: true }, singleToChange);
    expect(merged).toBe(singleToChange);
  });

  test('single process with change', () => {
    const merged = processImmutable(changeMeOption1, singleToChange);
    expect(merged).toEqual(singleWithChanges);
    expect(merged).not.toBe(singleToChange);
    expect((merged as any).b).toBe(singleToChange.b);
  });

  test('single process with change - alternative', () => {
    const merged = processImmutable(changeMeOption2, singleToChange);
    expect(merged).toEqual(singleWithChanges);
    expect(merged).not.toBe(singleToChange);
    expect((merged as any).b).toBe(singleToChange.b);
  });

  const withArray1 = {
    baseArray: [1, 2, 3],
    sub: { subArray: ['a', 'b', 'c'] },
  };

  const withArray2 = {
    baseArray: [4, 5, 6],
    sub: { subArray: ['d', 'e', 'f'] },
  };

  test('arrays overwrite each other', () => {
    const merged = immutableMergeCore({ depth: -1 }, withArray1, withArray2);
    expect(merged).toEqual(withArray2);
    expect(merged).not.toBe(withArray2);
  });

  const withObj = {
    a: { foo: 'bar' },
    b: 2,
  };

  const withNonObj = {
    a: 'hello',
    b: 3,
  };

  test('last writer wins for objects and non-objects', () => {
    const merged = immutableMerge<any>(withObj, withNonObj);
    expect(merged).toEqual(withNonObj);
    const merged2 = immutableMerge<any>(withNonObj, withObj);
    expect(merged2).toEqual(withObj);
  });

  const arrayMerger = (...targets: any[]) => {
    const arrays = targets.filter((t) => Array.isArray(t));
    let result = [];
    for (const v of arrays) {
      if (v.length > 0) {
        result = result.concat(...v);
      }
    }
    return result;
  };

  test('arrays can merge with handler', () => {
    const merged = immutableMergeCore(
      {
        object: {
          subArray: arrayMerger,
        },
      },
      withArray1,
      withArray2,
    );
    expect(merged).toEqual({
      baseArray: [4, 5, 6],
      sub: { subArray: ['a', 'b', 'c', 'd', 'e', 'f'] },
    });
  });

  test('arrays can merge deeply', () => {
    const merged = immutableMergeCore(
      {
        object: true,
        array: 'appendArray',
      },
      withArray1,
      withArray2,
    );
    expect(merged).toEqual({
      baseArray: [1, 2, 3, 4, 5, 6],
      sub: { subArray: ['a', 'b', 'c', 'd', 'e', 'f'] },
    });
  });
});
