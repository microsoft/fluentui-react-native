import * as React from 'react';
import { View } from 'react-native';
import { Separator } from '@fluentui/react-native';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { TextWin32 } from '@office-iss/react-native-win32';

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <TextWin32 style={commonStyles.section}>Standard Usage</TextWin32>
      <Separator />
      <StandardUsage />

      <TextWin32 style={commonStyles.section}>Customize Usage</TextWin32>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
