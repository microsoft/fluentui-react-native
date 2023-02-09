import type { AccessibilityContrastOption, SizeClass, UserInterfaceLevel } from './NativeAppearanceAdditions.types';

export const NativeAppearanceAdditions = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addListener: (_: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeListeners: (_: number) => {},
  horizontalSizeClass: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return 'regular' as SizeClass;
  },
  userInterfaceLevel: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return 'base' as UserInterfaceLevel;
  },
  accessibilityContrastOption: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return 'normal' as AccessibilityContrastOption;
  },
};

export default NativeAppearanceAdditions;
