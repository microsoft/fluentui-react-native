import type { ButtonAppearance, ButtonSize } from './Button.types';

export function buttonPlatformSlotProps() {
  return {};
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
