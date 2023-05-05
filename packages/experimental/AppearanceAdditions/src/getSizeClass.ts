import type { SizeClass, UserInterfaceLevel, AccessibilityContrastOption } from './NativeAppearanceAdditions.types';

export function useHorizontalSizeClass(): SizeClass {
  // Stubbed out for non-iOS platforms
  return 'regular';
}

export function useUserInterfaceLevel(): UserInterfaceLevel {
  // Stubbed out for non-iOS platforms
  return 'base';
}

export function useAccessibilityContrastOption(): AccessibilityContrastOption {
  // Stubbed out for non-iOS platforms
  return 'normal';
}
