import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { ButtonSlotProps, ButtonTokens, ButtonProps } from '../Button.types';
import { FontTokens } from '@fluentui-react-native/tokens';

export const compoundButtonName = 'CompoundButton';

/**
 * A baseline set of color plates.
 */
// export type ColorTokens = Partial<{
//   background: string;
//   contentColor: string;
//   secondaryContentColor: string;
//   linkColor: string;
//   iconColor: string;
//   borderColor: string;
//   dividerColor: string;
//   focusColor: string;
//   focusInnerColor: string;
//   opacity: string;
// }>;

// export type ColorTokenStates = Partial<{
//   hovered: ColorTokens;
//   pressed: ColorTokens;
//   disabled: ColorTokens;
//   checked: ColorTokens;
//   checkedHovered: ColorTokens;
//   checkedPressed: ColorTokens;
// }>;

// export type ColorTokenSet = ColorTokens & ColorTokenStates;

export interface CompoundButtonTokens extends ButtonTokens {
  secondaryContentTokens?: FontTokens & { color?: string };
}

export interface CompoundButtonProps extends ButtonProps {
  /**
   * Second line of text that describes the action this button takes.
   */
  secondaryContent?: string;
}

export interface CompoundButtonSlotProps extends ButtonSlotProps {
  contentContainer: ViewProps;
  secondaryContent: TextProps;
}

export interface CompoundButtonType {
  props: CompoundButtonProps;
  tokens: CompoundButtonTokens;
  slotProps: CompoundButtonSlotProps;
}
