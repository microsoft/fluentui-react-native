import type { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';

export const optionName = 'Option';

export interface OptionTokens {}

export interface OptionProps extends IWithPressableOptions<IViewProps> {}

export interface OptionState extends IPressableHooks<OptionProps & React.ComponentPropsWithRef<any>> {}

export interface OptionSlotProps {}

export interface OptionType {
  props: OptionProps;
  tokens: OptionTokens;
  slotProps: OptionSlotProps;
}
