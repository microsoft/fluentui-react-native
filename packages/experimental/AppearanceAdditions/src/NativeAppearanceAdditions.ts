import { SizeClass, UserInterfaceLevel } from './NativeAppearanceAdditions.types';

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
};

// export default NativeFontMetrics;
export default NativeAppearanceAdditions;
