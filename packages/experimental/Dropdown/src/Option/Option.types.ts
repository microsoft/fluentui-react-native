import type { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { TextProps } from '@fluentui-react-native/text';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { ColorValue } from 'react-native';
import { SvgProps } from 'react-native-svg';

export const optionName = 'Option';

export interface OptionTokens extends FontTokens, IBorderTokens, IColorTokens, LayoutTokens {
  /**
   * Color of the checkmark icon on the Option indicating Option is selected
   */
  checkmarkColor?: ColorValue;

  /**
   * Height and width of the checkmark icon on the Option indicating Option is selected
   */
  checkmarkSize?: number;

  /**
   * Spacing, in pixels, between the label and icons
   */
  spacingContentIcon?: number;
}

export type OptionProps = IWithPressableOptions<IViewProps>;
export type OptionState = IPressableHooks<OptionProps & React.ComponentPropsWithRef<any>>;

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
