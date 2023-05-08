import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native';

import { DrawerV1 } from '@fluentui-react-native/drawer';

export const DrawerV1Default: React.FunctionComponent = () => {
  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={200} style={{ flex: 1 }}>
      <DrawerV1 />
    </KeyboardAvoidingView>
  );
};
