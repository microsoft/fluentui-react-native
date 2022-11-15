import { ButtonSlotProps, ButtonCoreTokens, ButtonCoreProps } from '../Button.types';
import { ShadowProps } from '@fluentui-react-native/experimental-shadow';

export const fabName = 'FAB';
export type FABSize = 'small' | 'large';
export type FABAppearance = 'primary' | 'subtle' | 'ascent';

export interface FABSlotProps extends ButtonSlotProps {
  shadow?: ShadowProps;
}

export interface FABProps extends ButtonCoreProps {
  /**
   * A button can have its content and borders styled for greater emphasis or to be subtle.
   * - 'primary' or 'ascent': Emphasizes the button as a primary action.
   *   'ascent' is mobile naming convention, 'primary' included here to maintain parity with Button.
   * - 'subtle': Minimizes emphasis to blend into the background until hovered or focused.
   * @default 'primary' (or 'ascent')
   */
  appearance?: FABAppearance;

  /**
   * FAB text and other content can be hidden with this prop.
   * @default 'true'
   */
  showContent?: boolean;

  /** Sets style of FAB to a preset size style.
   * @default 'large'
   */
  size?: FABSize;
}

export interface FABTokens extends ButtonCoreTokens {
  /**
   * States that can be applied to FAB.
   */
  focused?: FABTokens;
  pressed?: FABTokens;
  subtle?: FABTokens;
  disabled?: FABTokens;
  large?: FABTokens;
  small?: FABTokens;
  hasContent?: FABTokens;
}

export interface FABType {
  props: FABProps;
  tokens: FABTokens;
  slotProps: FABSlotProps;
}
