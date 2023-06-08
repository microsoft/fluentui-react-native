import { Platform } from 'react-native';
// Please read http://93days.me/testing-react-native-application/ to understand why we set accessibilityLabel here.

/**
 * The underlying Android test drivers use accessibilityLabel to find elements. However, all other platforms use testID.
 * Because of this, we're adding the testProps function that takes in a unique identifier and returns the correct prop based on the platform
 * (testID for Win32, Windows, macOS, iOS; accessibilityId for Android).
 *
 * If explicit accessibilityLabel is being used for other platforms, apply testProps after it to override it for Android.
 * @param id The string to be used as the test identifier
 * @returns an object with the correct test identifier prop based on platform
 */
export function testProps(id) {
  return Platform.select({
    android: {
      accessible: true,
      accessibilityLabel: id,
    },
    macos: {
      accessible: true,
      accessibilityLabel: id,
      testID: id,
    },
    default: {
      testID: id,
    },
  });
}
