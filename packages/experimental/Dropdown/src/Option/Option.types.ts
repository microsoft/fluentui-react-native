import type { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { TextProps } from '@fluentui-react-native/text';
import { SvgProps } from 'react-native-svg';

export const optionName = 'Option';

export interface OptionTokens {}

export interface OptionProps extends IWithPressableOptions<IViewProps> {}

export interface OptionState extends IPressableHooks<OptionProps & React.ComponentPropsWithRef<any>> {}

export interface OptionSlotProps {
  root: IViewProps;
  checkIcon: SvgProps;
  label: TextProps;
}

export interface OptionType {
  props: OptionProps;
  tokens: OptionTokens;
  slotProps: OptionSlotProps;
}
