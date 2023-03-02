export interface AppearanceAdditions {
  horizontalSizeClassForRootTag(rootTag: number): SizeClass;
  userInterfaceLevelForRootTag(rootTag: number): UserInterfaceLevel;
  accessibilityContrastOptionForRootTag(rootTag: number): AccessibilityContrastOption;
}

export const RootTagKey = 'rootTag';

export const HorizontalSizeClassKey = 'horizontalSizeClass';
export type SizeClass = 'compact' | 'regular';

export const UserInterfaceLevelKey = 'userInterfaceLevel';
export type UserInterfaceLevel = 'base' | 'elevated';

export const AccessibilityContrastOptionKey = 'accessibilityContrastOption';
export type AccessibilityContrastOption = 'normal' | 'high';
