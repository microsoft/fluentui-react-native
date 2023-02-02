import { fallbackOfficeModule } from '../fallbackOfficeModule';
import type { OfficeThemingModule } from '../officeThemingModule';

/**
 * implementations for react-native-web, where the native module will not exist. In this case just use the full fallback implementation
 */
export function getThemingModule(): [OfficeThemingModule, undefined] {
  return [fallbackOfficeModule, undefined];
}
