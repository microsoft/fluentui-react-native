import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { Divider } from '@fluentui-react-native/divider';
import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import { commonTestStyles } from '../Common/styles';

const CustomizedText = Text.customize({
  textAlign: 'right',
  fontSize: 'caption',
  fontWeight: 'bold',
  paddingVertical: 100,
});

const mobileDividerstyles = StyleSheet.create({
  container: { marginVertical: 20, display: 'flex', height: 20, justifyContent: 'space-between' },
});

const RedDivider = Divider.customize({ lineColor: 'red' });
const GreenThickDivider = Divider.customize({ lineColor: 'green', thickness: globalTokens.stroke.width30 });

export const MobileDividers: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.section}>
    <View style={mobileDividerstyles.container}>
      <Divider insetSize={0} />
      <CustomizedText>Inset : 0</CustomizedText>
    </View>

    <View style={mobileDividerstyles.container}>
      <Divider insetSize={16} />
      <CustomizedText>Inset : 16</CustomizedText>
    </View>

    <View style={mobileDividerstyles.container}>
      <Divider insetSize={56} />
      <CustomizedText>Inset : 56</CustomizedText>
    </View>
    <View style={mobileDividerstyles.container}>
      <Divider insetSize={68} />
      <CustomizedText>Inset : 68</CustomizedText>
    </View>
    <View style={mobileDividerstyles.container}>
      <Divider insetSize={72} />
      <CustomizedText>Inset : 72</CustomizedText>
    </View>
    <View style={mobileDividerstyles.container}>
      <Divider insetSize={108} />
      <CustomizedText>Inset : 108</CustomizedText>
    </View>
  </Stack>
);

export const CustomisedMobileDividers: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.section}>
    <View style={mobileDividerstyles.container}>
      <RedDivider />
      <CustomizedText>Inset : 0 | color : red</CustomizedText>
    </View>

    <View style={mobileDividerstyles.container}>
      <GreenThickDivider insetSize={56} />
      <CustomizedText>Inset : 56 | color : green | thickness: width30</CustomizedText>
    </View>
  </Stack>
);
