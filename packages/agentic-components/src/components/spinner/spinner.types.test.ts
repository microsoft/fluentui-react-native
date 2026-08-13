/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { View } from 'react-native';

import type { Spinner } from './spinner';
import type { SpinnerProps, SpinnerSize } from './spinner.types';

const SpinnerPropsValue: SpinnerProps = {
  accessibilityLabel: 'Loading messages',
  size: 'medium',
};

const SpinnerSizeValue: SpinnerSize = 'large';

const SpinnerSlotValue: SlotProp<typeof Spinner> = {
  accessibilityLabel: 'Loading messages',
  size: 'large',
};

const SpinnerReplacementSlot: SlotProp<typeof Spinner> = {
  as: View,
  accessibilityLabel: 'Loading messages',
  size: 'x-large',
};

// @ts-expect-error Spinner sizes are fixed.
const InvalidSpinnerSize: SpinnerSize = 'giant';

describe('Spinner types', () => {
  it('accepts the public spinner prop and slot contracts', () => {
    expect(SpinnerPropsValue).toBeDefined();
    expect(SpinnerSizeValue).toBeDefined();
    expect(SpinnerSlotValue).toBeDefined();
    expect(SpinnerReplacementSlot).toBeDefined();
    expect(InvalidSpinnerSize).toBeDefined();
  });
});
