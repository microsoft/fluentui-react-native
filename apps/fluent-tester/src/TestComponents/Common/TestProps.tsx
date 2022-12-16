import { Platform } from 'react-native';
// Please read http://93days.me/testing-react-native-application/ to understand why we set accessibilityLabel here.

/**
 * Android uses accessibilityLabel to find elements in tests, while other platforms use testID.
 * This function returns the correct prop for test identifier based on platform.
 *
 * If explict accessibilityLabel is being used for other platforms, apply testProps after it to override it for Android.
 * @param id The string to be used as the test identifier
 * @returns an object with the correct test identifier prop based on platform
 */
export function testProps(id) {
  if (Platform.OS === 'android') {
    return {
      accessible: true,
      accessibilityLabel: id,
    };
  }
  return {
    testID: id,
  };
}
