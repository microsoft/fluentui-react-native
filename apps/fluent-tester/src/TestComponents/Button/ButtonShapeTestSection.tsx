import { ButtonV1 as Button, CompoundButton, TextV1 as Text } from '@fluentui/react-native';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';

export const ButtonShapeTest: React.FunctionComponent = () => {
  return (
    <View style={testContentRootViewStyle}>
      <Button shape="rounded" style={commonTestStyles.vmargin}>
        <Text>
          Default <Text underline>Rounded Button</Text>
        </Text>
      </Button>
    </View>
  );
};
