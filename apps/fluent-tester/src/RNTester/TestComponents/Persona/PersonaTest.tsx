import * as React from 'react';
import { View } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';
import { Text } from '@fluentui-react-native/text';
import { commonTestStyles } from '../Common/styles';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PERSONA_TESTPAGE } from './consts';

export const PersonaTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonTestStyles.section} testID={PERSONA_TESTPAGE}>
        Standard Usage
      </Text>
      <Separator />
      <StandardUsage />

      <Text style={commonTestStyles.section}>Customize Usage</Text>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
