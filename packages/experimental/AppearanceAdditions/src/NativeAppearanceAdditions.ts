import type { AccessibilityContrastOption, SizeClass, UserInterfaceLevel } from './NativeAppearanceAdditions.types';

export const NativeAppearanceAdditions = {
  addListener: (_: string) => {},

  removeListeners: (_: number) => {},
  initializeTraitCollection: (_: number) => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
  },
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
