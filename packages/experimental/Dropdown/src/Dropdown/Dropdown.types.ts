import type { PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';

export const dropdownName = 'Dropdown';

export interface DropdownTokens {}

export interface DropdownProps extends PressablePropsExtended {}

export type DropdownState = PressableState;

export interface DropdownInfo {
  props: DropdownProps & React.ComponentPropsWithRef<any>;
  state: DropdownProps;
}
