import * as React from 'react';
import { View, Text } from 'react-native';
import { Separator } from '@fluentui/react-native';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { PERSONACOIN_TESTPAGE } from './../../Consts';

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonStyles.section} testID={PERSONACOIN_TESTPAGE}>
        Standard Usage
      </Text>
      <Separator />
      <StandardUsage />

      <Text style={commonStyles.section}>Customize Usage</Text>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
