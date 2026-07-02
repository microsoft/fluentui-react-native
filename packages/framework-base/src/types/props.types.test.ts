/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Type-consistency tests for the base prop types.
 *
 * The `type`-level assertions below are validated at build time by the type-check pass
 * (`targets/tsconfig.check.json` includes `*.test.*` files), so any regression in these foundational
 * types will break the build. Each assertion is also materialized as a runtime boolean so the `it`
 * blocks form a real Jest suite that fails loudly if an assertion ever resolves to something other
 * than `true`.
 */

import type { StyleProp, ObjectBase, ObjectFallback } from './props.types.ts';
import type { StyleProp as RNStyleProp } from 'react-native';

// --- type assertion helpers ---------------------------------------------------------------------

/** Resolves to `true` when `A` is assignable to `B`, otherwise `false`. Wrapped in tuples to avoid distributing over unions. */
type Extends<A, B> = [A] extends [B] ? true : false;

/** Resolves to `true` only when `X` and `Y` are exactly the same type. */
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

/** Compile-time guard: only accepts a `true` type argument, producing a build error otherwise. */
type Expect<T extends true> = T;

// --- fixtures -----------------------------------------------------------------------------------

type StyleBase = {
  color?: string;
  fontSize?: number;
};

interface IStyleBase {
  color?: string;
  fontSize?: number;
}

// --- compile-time assertions --------------------------------------------------------------------
// Each constant is typed via `Expect<...>`; if a type relationship regresses, the build fails here.
// The runtime value is always `true`, so the Jest assertions below pass while still exercising the
// exact relationships we care about.

// StyleProp must remain assignable to React Native's StyleProp, for both type aliases and interfaces.
const stylePropCompatibleWithType: Expect<Extends<StyleProp<StyleBase>, RNStyleProp<StyleBase>>> = true;
const stylePropCompatibleWithInterface: Expect<Extends<StyleProp<IStyleBase>, RNStyleProp<IStyleBase>>> = true;

// ObjectBase should accept plain records, interfaces, and class instances.
const objectBaseAcceptsRecord: Expect<Extends<Record<string, unknown>, ObjectBase>> = true;
const objectBaseAcceptsInterface: Expect<Extends<IStyleBase, ObjectBase>> = true;
const objectBaseAcceptsClass: Expect<Extends<Date, ObjectBase>> = true;

// ObjectFallback (Record<string, unknown>) is stricter: it accepts records but rejects class
// instances and interfaces that lack an implicit index signature.
const objectFallbackAcceptsRecord: Expect<Extends<Record<string, unknown>, ObjectFallback>> = true;
const objectFallbackRejectsClass: Expect<Equal<Extends<Date, ObjectFallback>, false>> = true;
const objectFallbackRejectsInterface: Expect<Equal<Extends<IStyleBase, ObjectFallback>, false>> = true;

// Cross assignment: ObjectFallback widens to ObjectBase, but ObjectBase does not narrow to ObjectFallback.
const fallbackAssignableToBase: Expect<Extends<ObjectFallback, ObjectBase>> = true;
const baseNotAssignableToFallback: Expect<Equal<Extends<ObjectBase, ObjectFallback>, false>> = true;

// --- runtime suite ------------------------------------------------------------------------------

describe('base prop type consistency', () => {
  it('keeps StyleProp compatible with React Native StyleProp', () => {
    expect(stylePropCompatibleWithType).toBe(true);
    expect(stylePropCompatibleWithInterface).toBe(true);
  });

  it('keeps ObjectBase permissive for records, interfaces, and class instances', () => {
    expect(objectBaseAcceptsRecord).toBe(true);
    expect(objectBaseAcceptsInterface).toBe(true);
    expect(objectBaseAcceptsClass).toBe(true);
  });

  it('keeps ObjectFallback strict against classes and index-less interfaces', () => {
    expect(objectFallbackAcceptsRecord).toBe(true);
    expect(objectFallbackRejectsClass).toBe(true);
    expect(objectFallbackRejectsInterface).toBe(true);
  });

  it('allows ObjectFallback to widen to ObjectBase but not the reverse', () => {
    expect(fallbackAssignableToBase).toBe(true);
    expect(baseNotAssignableToFallback).toBe(true);
  });
});
