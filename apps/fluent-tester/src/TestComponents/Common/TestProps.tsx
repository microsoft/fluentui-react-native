import { Platform } from 'react-native';
// Please read http://93days.me/testing-react-native-application/ to understand why we set accessibilityLabel here.
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
