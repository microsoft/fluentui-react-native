/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  StyleProp,
  ObjectBase,
  ObjectFallback,
  DistributiveOmit,
  DistributivePick,
  UnionToIntersection,
  ReplaceNullWithUndefined,
  IsSingleton,
} from './helpers.ts';
import type { StyleProp as RNStyleProp } from 'react-native';

/**
 * Helper that only compiles when its argument resolves to `true`, allowing type level assertions to
 * surface as build breaks if a helper type stops behaving as expected.
 */
type Expect<T extends true> = T;

/**
 * Exact type equality check. Resolves to `true` only when `X` and `Y` are mutually assignable.
 */
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

/**
 * Forces lazy mapped/conditional types (such as `Pick`) to resolve to their concrete object shape so
 * structurally identical results can be compared with {@link Equal}.
 */
type Resolve<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type StyleBase = {
  color?: string;
  fontSize?: number;
};

type TestProps = {
  p1?: string;
  p2?: number;
  p3?: boolean;
  style?: StyleProp<StyleBase>;
};

const typeProps: TestProps = {
  p1: 'string',
  p2: 123,
  p3: true,
  style: {
    color: 'red',
    fontSize: 16,
  },
};

interface IStyleBase {
  color?: string;
  fontSize?: number;
}

interface ITestProps {
  p1?: string;
  p2?: number;
  p3?: boolean;
  style?: StyleProp<IStyleBase>;
}

const interfaceProps: ITestProps = {
  p1: 'string',
  p2: 123,
  p3: true,
  style: {
    color: 'red',
    fontSize: 16,
  },
};

describe('helpers types', () => {
  it('StyleProp should be compatible with React Native StyleProp', () => {
    // Validate that StyleProp is compatible with React Native's StyleProp type, as this is a critical
    // part of our type system for styles and we want to ensure it remains compatible with RN's types.
    type ValidateStyleProp<T> = StyleProp<T> extends RNStyleProp<T> ? true : never;

    const stylePropTest: ValidateStyleProp<IStyleBase> = true;
    const stylePropTest2: ValidateStyleProp<StyleBase> = true;

    expect(stylePropTest && stylePropTest2).toBe(true);
  });

  it('ObjectBase should accept any object shape', () => {
    const objectBaseTest1: ObjectBase = {};
    const objectBaseTest2: ObjectBase = { key: 'value' };
    const objectBaseTest3: ObjectBase = new Date();
    const objectBaseTest4: ObjectBase = typeProps;
    const objectBaseTest5: ObjectBase = interfaceProps;

    expect(objectBaseTest1).toBeDefined();
    expect(objectBaseTest2).toBeDefined();
    expect(objectBaseTest3).toBeDefined();
    expect(objectBaseTest4).toBeDefined();
    expect(objectBaseTest5).toBeDefined();
  });

  it('ObjectFallback should only accept record-compatible objects', () => {
    const objectBaseTest6: ObjectFallback = {};
    const objectBaseTest7: ObjectFallback = { key: 'value' };
    // @ts-expect-error - this should error because Date is not compatible with Record<string, unknown> due to its properties not being string keys and unknown values
    const objectBaseTest8: ObjectFallback = new Date();
    const objectBaseTest9: ObjectFallback = typeProps;
    // @ts-expect-error - this should error because interfaceProps is not compatible with Record<string, unknown> due to the style property being a StyleProp type which is not compatible with Record<string, unknown>
    const objectBaseTest10: ObjectFallback = interfaceProps;

    expect(objectBaseTest6).toBeDefined();
    expect(objectBaseTest7).toBeDefined();
    expect(objectBaseTest8).toBeDefined();
    expect(objectBaseTest9).toBeDefined();
    expect(objectBaseTest10).toBeDefined();
  });

  it('ObjectBase and ObjectFallback should cross-assign in only one direction', () => {
    const fallbackValue: ObjectFallback = { key: 'value' };
    const baseValue: ObjectBase = { key: 'value' };

    // an ObjectFallback is always a valid ObjectBase
    const baseFromFallback: ObjectBase = fallbackValue;
    // @ts-expect-error - this should error because ObjectFallback is not compatible with ObjectBase due to ObjectBase allowing for more types of objects than ObjectFallback
    const fallbackFromBase: ObjectFallback = baseValue;

    expect(baseFromFallback).toBeDefined();
    expect(fallbackFromBase).toBeDefined();
  });

  it('DistributiveOmit should distribute the omission across union members', () => {
    type Distributed = DistributiveOmit<{ a: string; c: number } | { b: string; c: number }, 'c'>;
    const assert: Expect<Equal<Distributed, { a: string } | { b: string }>> = true;

    // a non-distributive Omit would collapse to {} since the union has no common keys other than 'c',
    // so asserting the members survive proves the omission is distributed across the union
    const assertDistributes: Expect<Equal<DistributiveOmit<{ a: string } | { b: string }, never>, { a: string } | { b: string }>> = true;

    const value: Distributed = { a: 'hello' };
    expect(assert && assertDistributes).toBe(true);
    expect(value).toBeDefined();
  });

  it('DistributivePick should distribute the pick across union members', () => {
    type Distributed = DistributivePick<{ a: string; c: number } | { b: string; d: boolean }, 'c' | 'd'>;
    const assert: Expect<Equal<Resolve<Distributed>, { c: number } | { d: boolean }>> = true;

    const value: Distributed = { c: 1 };
    expect(assert).toBe(true);
    expect(value).toBeDefined();
  });

  it('UnionToIntersection should convert a union into an intersection', () => {
    type Intersection = UnionToIntersection<{ a: string } | { b: number }>;
    const assert: Expect<Equal<Resolve<Intersection>, { a: string; b: number }>> = true;

    const value: Intersection = { a: 'hello', b: 1 };
    expect(assert).toBe(true);
    expect(value).toBeDefined();
  });

  it('ReplaceNullWithUndefined should swap null for undefined', () => {
    const assertNull: Expect<Equal<ReplaceNullWithUndefined<null>, undefined>> = true;
    const assertUnion: Expect<Equal<ReplaceNullWithUndefined<string | null>, string | undefined>> = true;
    const assertNoNull: Expect<Equal<ReplaceNullWithUndefined<number>, number>> = true;

    const value: ReplaceNullWithUndefined<string | null> = undefined;
    expect(assertNull && assertUnion && assertNoNull).toBe(true);
    expect(value).toBeUndefined();
  });

  it('IsSingleton should detect single string literals versus unions', () => {
    const assertSingle: Expect<Equal<IsSingleton<'a'>, true>> = true;
    const assertUnion: Expect<Equal<IsSingleton<'a' | 'b' | 'c'>, false>> = true;

    const single: IsSingleton<'a'> = true;
    const union: IsSingleton<'a' | 'b'> = false;
    expect(assertSingle && assertUnion).toBe(true);
    expect(single).toBe(true);
    expect(union).toBe(false);
  });
});
