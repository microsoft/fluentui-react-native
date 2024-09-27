import { buildProps } from '@fluentui-react-native/framework';

import type { ButtonAppearance, ButtonSize, ButtonTokens } from './Button.types';

export function buttonPlatformSlotProps() {
  return {
    rippleContainer: buildProps(
      (tokens: ButtonTokens) => {
        return {
          style: {
            flexDirection: 'row',
            alignSelf: 'baseline',
            borderColor: tokens.borderInnerColor,
            borderWidth: tokens.borderInnerWidth,
            borderRadius: tokens.borderRadius,
            overflow: 'hidden',
          },
        };
      },
      ['borderRadius'],
    ),
  };
}

export const getDefaultSize = (): ButtonSize => {
  return 'medium';
};

export const getPlatformSpecificAppearance = (appearance: ButtonAppearance): ButtonAppearance => {
  switch (appearance) {
    case 'accent': // Included to cover Mobile platform naming guidelines, maps to 'primary'.
      return 'primary';

    case 'primary':
    case 'subtle':
    case 'outline': // 'Outline' exists only for Mobile platforms, default picked on other platforms.
      return appearance;

    default:
      return 'primary';
  }
};
