/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Checkbox } from './checkbox';
import type { CheckboxProps } from './checkbox.types';

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

const CheckboxSlot: SlotProp<typeof Checkbox> = {
  defaultStatus: 'checked',
  label: 'Notify me',
  secondaryText: 'We will only email important updates.',
  showSecondaryText: true,
  status: 'indeterminate',
  variant: 'circular',
};

const CheckboxOwnsChildren: Expect<Equal<CheckboxProps['children'], never>> = true;

type OwnedAliases = Extract<keyof CheckboxProps, 'role' | 'accessibilityRole' | 'aria-checked' | 'aria-disabled'>;
const CheckboxOwnsAliases: Expect<Equal<OwnedAliases, never>> = true;
type CheckboxAccessibilityState = NonNullable<CheckboxProps['accessibilityState']>;
const CheckboxOwnsCheckedAndDisabled: Expect<Equal<CheckboxAccessibilityState['checked' | 'disabled'], undefined>> = true;

describe('Checkbox slot types', () => {
  it('accepts the public checkbox contract as a slot prop', () => {
    expect(CheckboxSlot).toBeDefined();
    expect(CheckboxOwnsChildren).toBe(true);
    expect(CheckboxOwnsAliases).toBe(true);
    expect(CheckboxOwnsCheckedAndDisabled).toBe(true);
  });
});
