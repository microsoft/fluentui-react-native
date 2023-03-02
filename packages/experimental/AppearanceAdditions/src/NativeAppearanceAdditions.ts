export const NativeAppearanceAdditions = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addListener: (_: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeListeners: (_: number) => {},
  horizontalSizeClass: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return {};
  },
  userInterfaceLevel: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return {};
  },
  accessibilityContrastOption: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return {};
  },
};

export default NativeAppearanceAdditions;
