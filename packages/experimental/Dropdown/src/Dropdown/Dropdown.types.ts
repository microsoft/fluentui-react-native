import type { ColorValue } from 'react-native';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';

export const dropdownName = 'Dropdown';

export interface DropdownTokens {
  buttonBackground?: ColorValue;
  buttonBorder?: ColorValue;
  buttonText?: ColorValue;
  expandIconColor?: ColorValue;

  focused?: DropdownTokens;
  hovered?: DropdownTokens;
  pressed?: DropdownTokens;
}

export interface DropdownProps extends IWithPressableOptions<IViewProps> {}

export interface DropdownState extends IPressableHooks<DropdownProps & React.ComponentPropsWithRef<any>> {}
