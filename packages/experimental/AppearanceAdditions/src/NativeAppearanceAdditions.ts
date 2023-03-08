export const NativeAppearanceAdditions = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addListener: (_: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeListeners: (_: number) => {},
  rootTagHorizontalSizeClassMap: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return {};
  },
  rootTagUserInterfaceLevelMap: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return {};
  },
  rootTagAccessibilityContrastOptionMap: () => {
    console.warn('NativeAppearanceAdditions is only available on iOS');
    return {};
  },
};

export default NativeAppearanceAdditions;
