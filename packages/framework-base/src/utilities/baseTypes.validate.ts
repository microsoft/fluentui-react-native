/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Type validation that the base types behave as expected. This code is never run and is not included
 * in other files, but will cause build breaks if the types no longer behave as expected.
 */

import type { StyleProp, ObjectBase, ObjectFallback } from './baseTypes.ts';
import type { StyleProp as RNStyleProp } from 'react-native';

/**
 * Validate that StyleProp is compatible with React Native's StyleProp type, as this is a critical part of our type system for styles and we want to ensure it remains compatible with RN's types.
 */
export type ValidateStyleProp<T> = StyleProp<T> extends RNStyleProp<T> ? true : never;

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

export function validateBaseTypes() {
  // This function is never called, but if the types of the base types change in a way that breaks compatibility with expected types, this will cause a build error and alert us to the issue.

  // Test that StyleProp is compatible with React Native's StyleProp type
  const stylePropTest: ValidateStyleProp<IStyleBase> = true;
  const stylePropTest2: ValidateStyleProp<StyleBase> = true;

  // just using the values to stop typescript complaints
  if (!stylePropTest || !stylePropTest2) {
    throw new Error("StyleProp is not compatible with React Native's StyleProp type");
  }

  // Test that ObjectBase is compatible with object and Record<string, unknown>

  const objectBaseTest1: ObjectBase = {};
  const objectBaseTest2: ObjectBase = { key: 'value' };
  const objectBaseTest3: ObjectBase = new Date();
  const objectBaseTest4: ObjectBase = typeProps;
  const objectBaseTest5: ObjectBase = interfaceProps;
  const objectBaseTest6: ObjectFallback = {};
  const objectBaseTest7: ObjectFallback = { key: 'value' };
  // @ts-expect-error - this should error because Date is not compatible with Record<string, unknown> due to its properties not being string keys and unknown values
  const objectBaseTest8: ObjectFallback = new Date();
  const objectBaseTest9: ObjectFallback = typeProps;
  // @ts-expect-error - this should error because interfaceProps is not compatible with Record<string, unknown> due to the style property being a StyleProp type which is not compatible with Record<string, unknown>
  const objectBaseTest10: ObjectFallback = interfaceProps;

  // cross assignment
  const baseFromFallback: ObjectBase = objectBaseTest7;
  // @ts-expect-error - this should error because ObjectFallback is not compatible with ObjectBase due to ObjectBase allowing for more types of objects than ObjectFallback
  const fallbackFromBase: ObjectFallback = objectBaseTest2;

  return {
    ...objectBaseTest1,
    ...objectBaseTest2,
    ...objectBaseTest3,
    ...objectBaseTest4,
    ...objectBaseTest5,
    ...objectBaseTest6,
    ...objectBaseTest7,
    ...objectBaseTest8,
    ...objectBaseTest9,
    ...objectBaseTest10,
    ...baseFromFallback,
  };
}
