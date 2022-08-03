import { Platform, useWindowDimensions } from 'react-native';

export type SizeClassIOS = 'regular' | 'compact' | undefined;

/**
 * Hook that "guesses" our Size Class on iOS based on our window width
 * For more information about Size Classes, see teh following:
 * https://developer.apple.com/documentation/uikit/uitraitcollection
 * https://developer.apple.com/design/human-interface-guidelines/foundations/layout/#platform-considerations
 * @returns SizeClassIOS: enum determining our size class
 */
export const useSizeClassIOS: () => SizeClassIOS = () => {
  const width = useWindowDimensions().width;
  if (Platform.OS === 'ios') {
    if (width > 375) {
      return 'regular';
    } else {
      return 'compact';
    }
  } else {
    return undefined;
  }
};
