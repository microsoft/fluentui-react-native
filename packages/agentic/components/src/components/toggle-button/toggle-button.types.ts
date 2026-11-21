import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot, SlotProp } from '@fluentui-react-native/framework-base';
import type { Pressable, PressableProps } from 'react-native';
import type { Icon } from '../../primitives/icon/icon';
import type { ButtonState } from '../button/button.types';
import type { Text } from '../text/text';
import type { ToggleButtonTokens } from './toggle-button.styles';

export type ToggleButtonSlots = {
  root: Slot<typeof Pressable>;
  content: OptionalSlot<typeof Text>;
  leadingIcon: OptionalSlot<typeof Icon>;
  trailingIcon: OptionalSlot<typeof Icon>;
  selectedLeadingIcon: OptionalSlot<typeof Icon>;
  selectedTrailingIcon: OptionalSlot<typeof Icon>;
};

interface ToggleButtonBaseProps extends Omit<
  PressableProps,
  'children' | 'accessibilityRole' | 'role' | 'aria-checked' | 'aria-disabled' | 'accessibilityState'
> {
  ref?: PropsWithRefOf<typeof Pressable>['ref'];
  accessibilityState?: Omit<NonNullable<PressableProps['accessibilityState']>, 'checked' | 'disabled'>;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  shape?: 'rounded' | 'circular';
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (next: boolean) => void;
  selectedLeadingIcon?: SlotProp<typeof Icon> | null;
}

type AccessibleName =
  | { accessibilityLabel: string }
  | { accessibilityLabelledBy: NonNullable<PressableProps['accessibilityLabelledBy']> }
  | { 'aria-label': string }
  | { 'aria-labelledby': string };

type ContentLayout =
  | {
      content: NonNullable<SlotProp<typeof Text>>;
      leadingIcon?: SlotProp<typeof Icon> | null;
      trailingIcon?: SlotProp<typeof Icon> | null;
      selectedTrailingIcon?: SlotProp<typeof Icon> | null;
    }
  | (AccessibleName & {
      content?: null;
      leadingIcon: SlotProp<typeof Icon>;
      trailingIcon?: never;
      selectedTrailingIcon?: never;
    });

export type ToggleButtonProps = ToggleButtonBaseProps & ContentLayout;

export type ToggleButtonTokenState = Pick<ButtonState, 'highContrast' | 'visualState'> & { selected: boolean };

export type ToggleButtonState = ButtonState &
  ToggleButtonTokenState &
  ComponentState<{ contentHidden: OptionalSlot<typeof Text> }> & { toggleButtonTokens: ToggleButtonTokens };
