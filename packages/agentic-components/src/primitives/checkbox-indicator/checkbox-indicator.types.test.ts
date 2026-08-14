/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { CheckboxIndicator } from './checkbox-indicator';

const CheckboxIndicatorSlot: SlotProp<typeof CheckboxIndicator> = {
  iconColor: 'blue',
  iconSize: 12,
  status: 'indeterminate',
};

// @ts-expect-error CheckboxIndicator owns its children.
const CheckboxIndicatorWithChildren: SlotProp<typeof CheckboxIndicator> = { children: 'Checked' };

describe('CheckboxIndicator slot types', () => {
  it('accepts indicator status and icon props', () => {
    expect(CheckboxIndicatorSlot).toBeDefined();
  });
});
