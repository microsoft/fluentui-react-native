import type { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';

export const listboxName = 'Listbox';

export interface ListboxTokens {}

export interface ListboxProps extends IWithPressableOptions<IViewProps> {}

export interface ListboxState extends IPressableHooks<ListboxProps & React.ComponentPropsWithRef<any>> {}

export interface ListboxSlotProps {}

export interface ListboxType {
  props: ListboxProps;
  tokens: ListboxTokens;
  slotProps: ListboxSlotProps;
}
