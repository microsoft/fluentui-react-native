/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Checkbox } from './checkbox';

const CheckboxSlot: SlotProp<typeof Checkbox> = {
  defaultStatus: 'checked',
  label: 'Notify me',
  secondaryText: 'We will only email important updates.',
  showSecondaryText: true,
  status: 'indeterminate',
  variant: 'circular',
};

const CheckboxWithChildren: SlotProp<typeof Checkbox> = {
  // @ts-expect-error Checkbox owns children.
  children: 'bad',
};

describe('Checkbox slot types', () => {
  it('accepts the public checkbox contract as a slot prop', () => {
    expect(CheckboxSlot).toBeDefined();
  });
});
