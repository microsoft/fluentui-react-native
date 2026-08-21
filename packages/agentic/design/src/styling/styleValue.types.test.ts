/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ViewStyle } from 'react-native';

import { getGapStyleValue } from './gapStyleValue';
import { getNumericStyleValue } from './numericStyleValue';
import { interactiveStatePriority } from './interactiveStatePriority';

const numericValue: number | string = getNumericStyleValue('12');
const gapValue: NonNullable<ViewStyle['gap']> = getGapStyleValue(12);
const firstPriority = interactiveStatePriority[0];

// @ts-expect-error interactiveStatePriority is readonly.
interactiveStatePriority[0] = 'pressed';

describe('style value types', () => {
  it('exposes validated styling helpers', () => {
    expect(numericValue).toBe('12');
    expect(gapValue).toBe(12);
    expect(firstPriority).toBe('disabled');
  });
});
