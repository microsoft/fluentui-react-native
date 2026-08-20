/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { CompoundItemLayout } from './compound-item-layout';

const CompoundItemLayoutSlot: SlotProp<typeof CompoundItemLayout> = {
  primary: 'Primary',
  secondary: 'Secondary',
  secondaryPosition: 'under',
};

// @ts-expect-error CompoundItemLayout requires primary content.
const CompoundItemLayoutWithoutPrimary: SlotProp<typeof CompoundItemLayout> = { secondary: 'Secondary' };

describe('CompoundItemLayout slot types', () => {
  it('accepts compound item regions', () => {
    expect(CompoundItemLayoutSlot).toBeDefined();
  });
});
