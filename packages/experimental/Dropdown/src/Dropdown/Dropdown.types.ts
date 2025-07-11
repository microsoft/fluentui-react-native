import type { PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';

export const dropdownName = 'Dropdown';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type DropdownTokens = {};

export type DropdownProps = PressablePropsExtended;

export type DropdownState = PressableState;

export interface DropdownInfo {
  props: DropdownProps & React.ComponentPropsWithRef<any>;
  state: DropdownProps;
}
