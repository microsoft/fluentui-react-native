export interface AppearanceAdditions {
  readonly horizontalSizeClass: SizeClass;
  readonly userInterfaceLevel: UserInterfaceLevel;
  readonly accessibilityContrastOption: AccessibilityContrastOption;
}

export const HorizontalSizeClassKey = 'horizontalSizeClass';
export type SizeClass = 'compact' | 'regular';

export const UserInterfaceLevelKey = 'userInterfaceLevel';
export type UserInterfaceLevel = 'base' | 'elevated';

export const AccessibilityContrastOptionKey = 'accessibilityContrastOption';
export type AccessibilityContrastOption = 'normal' | 'high';
