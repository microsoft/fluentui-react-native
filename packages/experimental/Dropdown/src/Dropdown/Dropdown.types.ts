import type { IViewProps } from '@fluentui-react-native/adapters';
import { ButtonProps } from '@fluentui-react-native/button';
import { IconProps } from '@fluentui-react-native/icon';
import { IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';

export const dropdownName = 'Dropdown';

export interface DropdownTokens {}

export interface DropdownProps extends IWithPressableOptions<IViewProps> {}

export interface DropdownState extends IPressableHooks<DropdownProps & React.ComponentPropsWithRef<any>> {}

export interface DropdownSlotProps {
  root: IViewProps;
  button: ButtonProps;
  expandIcon: IconProps;
}

export interface DropdownType {
  props: DropdownProps;
  tokens: DropdownTokens;
  slotProps: DropdownSlotProps;
}
