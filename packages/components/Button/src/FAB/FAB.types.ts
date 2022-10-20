import { ButtonSlotProps, ButtonCoreTokens, ButtonCoreProps } from '../Button.types';
import { ShadowProps } from '@fluentui-react-native/experimental-shadow';

export const fabName = 'FAB';
export type FABSize = 'small' | 'large';

export interface FABSlotProps extends ButtonSlotProps {
  shadow?: ShadowProps;
}

export interface FABProps extends ButtonCoreProps {
  /**
   * FAB text and other content can be hidden with this prop
   * @default 'true'
   */
  showContent?: boolean;

  /** Sets style of FAB to a preset size style
   * @default 'large' on android
   */
  size?: FABSize;
}

export interface FABTokens extends ButtonCoreTokens {
  /**
   * States that can be applied to FAB
   */
  focused?: FABTokens;
  pressed?: FABTokens;
  subtle?: FABTokens;
  disabled?: FABTokens;
  large?: FABTokens;
  small?: FABTokens;
}

export interface FABType {
  props: FABProps;
  tokens: FABTokens;
  slotProps: FABSlotProps;
}
