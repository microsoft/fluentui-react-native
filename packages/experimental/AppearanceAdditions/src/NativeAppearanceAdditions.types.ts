export interface AppearanceAdditions {
  horizontalSizeClass(viewTag): SizeClass;
  userInterfaceLevel(viewTag): UserInterfaceLevel;
  accessibilityContrastOption(viewTag): AccessibilityContrastOption;
}

export const HorizontalSizeClassKey = 'horizontalSizeClass';
export type SizeClass = 'compact' | 'regular';

export const UserInterfaceLevelKey = 'userInterfaceLevel';
export type UserInterfaceLevel = 'base' | 'elevated';

export const AccessibilityContrastOptionKey = 'accessibilityContrastOption';
export type AccessibilityContrastOption = 'normal' | 'high';
