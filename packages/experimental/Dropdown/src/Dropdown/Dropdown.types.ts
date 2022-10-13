import type { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';

export const dropdownName = 'Dropdown';

export interface DropdownTokens {}

export interface DropdownProps extends IWithPressableOptions<IViewProps> {}

export interface DropdownState extends IPressableHooks<DropdownProps & React.ComponentPropsWithRef<any>> {}
