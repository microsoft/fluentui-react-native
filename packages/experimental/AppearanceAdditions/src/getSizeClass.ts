import type { RootTag } from 'react-native';

import type { SizeClass } from './NativeAppearanceAdditions.types';

export function useHorizontalSizeClass(_rootTag: RootTag): SizeClass {
  // Stubbed out for non-iOS platforms
  return 'regular';
}
