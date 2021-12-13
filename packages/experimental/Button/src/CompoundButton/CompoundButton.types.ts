import { ViewProps, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { ButtonSlotProps, ButtonTokens, ButtonPropsWithInnerRef } from '../Button.types';
import { FontTokens } from '@fluentui-react-native/tokens';

export const compoundButtonName = 'CompoundButton';

export interface CompoundButtonTokens extends ButtonTokens {
  secondaryContentFont?: FontTokens;
  secondaryContentColor?: ColorValue;

  /**
   * States that can be applied to a button
   */
  hovered?: CompoundButtonTokens;
  focused?: CompoundButtonTokens;
  pressed?: CompoundButtonTokens;
  disabled?: CompoundButtonTokens;
  primary?: CompoundButtonTokens;
  subtle?: CompoundButtonTokens;
  small?: CompoundButtonTokens;
  medium?: CompoundButtonTokens;
  large?: CompoundButtonTokens;
  hasContent?: CompoundButtonTokens;
}

export interface CompoundButtonPropsWithInnerRef extends ButtonPropsWithInnerRef {
  /**
   * Second line of text that describes the action this button takes.
   */
  secondaryContent?: string;
}

export type CompoundButtonProps = Omit<CompoundButtonPropsWithInnerRef, 'innerRef'>;

export interface CompoundButtonSlotProps extends ButtonSlotProps {
  contentContainer: ViewProps;
  secondaryContent: TextProps;
}

export interface CompoundButtonType {
  props: CompoundButtonPropsWithInnerRef;
  tokens: CompoundButtonTokens;
  slotProps: CompoundButtonSlotProps;
}
