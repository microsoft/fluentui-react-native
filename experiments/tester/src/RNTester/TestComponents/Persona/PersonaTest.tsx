import * as React from 'react';
import { View } from 'react-native';
import { Separator } from '@fluentui/react-native';
import { TextWin32 } from '@office-iss/react-native-win32';
import { commonTestStyles } from '../Common/styles';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';

export const PersonaTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <TextWin32 style={commonTestStyles.section}>Standard Usage</TextWin32>
      <Separator />
      <StandardUsage />

      <TextWin32 style={commonTestStyles.section}>Customize Usage</TextWin32>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
