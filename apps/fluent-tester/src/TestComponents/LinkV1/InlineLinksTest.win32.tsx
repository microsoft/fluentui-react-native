import * as React from 'react';

import { TextV1 as Text } from '@fluentui/react-native';

// Platform.select not available for win32
// Forking test instead
export const InlineLinks: React.FunctionComponent = () => {
  return <Text>Inline links are not supported on win32.</Text>;
};
