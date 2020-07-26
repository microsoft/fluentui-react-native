import * as React from 'react';
import { View, Text } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';
import { ButtonFocusTest } from './ButtonFocusTest';
import { ButtonIconTest } from './ButtonIconTest';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { BUTTON_TESTPAGE } from './consts';

export const ButtonTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonStyles.section} testID={BUTTON_TESTPAGE}>
        Button Focus
      </Text>
      <Separator />
      <ButtonFocusTest />

      <Text style={commonStyles.section}>Button Icon</Text>
      <Separator />
      <ButtonIconTest />
    </View>
  );
};
