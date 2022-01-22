import { ViewProps, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { ButtonSlotProps, ButtonTokens, ButtonPropsWithInnerRef } from '../Button.types';
import { FontTokens } from '@fluentui-react-native/tokens';

export const compoundButtonName = 'CompoundButton';

export interface CompoundButtonTokens extends ButtonTokens {
  /**
   * Font of the second line of text on the button.
   */
  secondaryContentFont?: FontTokens;

  /**
   * Color of the second line of text on the button.
   */
  secondaryContentColor?: ColorValue;

  /**
   * States that can be applied to a button
   * These can be used to modify styles of the button when under the specified state.
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

export interface CompoundButtonPropsWithInnerRef extends Omit<ButtonPropsWithInnerRef, 'iconOnly'> {
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
  props: CompoundButtonProps;
  tokens: CompoundButtonTokens;
  slotProps: CompoundButtonSlotProps;
}
