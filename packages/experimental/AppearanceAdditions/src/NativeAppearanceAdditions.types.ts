import type { RootTag } from 'react-native';

export interface AppearanceAdditions {
  horizontalSizeClassForRootTag(rootTag: RootTag): SizeClass;
  userInterfaceLevelForRootTag(rootTag: RootTag): UserInterfaceLevel;
  accessibilityContrastOptionForRootTag(rootTag: RootTag): AccessibilityContrastOption;
}

export const RootTagKey = 'rootTag';

export const HorizontalSizeClassKey = 'horizontalSizeClass';
export type SizeClass = 'compact' | 'regular';

export const UserInterfaceLevelKey = 'userInterfaceLevel';
export type UserInterfaceLevel = 'base' | 'elevated';

export const AccessibilityContrastOptionKey = 'accessibilityContrastOption';
export type AccessibilityContrastOption = 'normal' | 'high';
