import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from '@fluentui-react-native/divider';
import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { commonTestStyles } from '../Common/styles';

const DividerWithInset = Divider.customize({ insetSize: 56, thickness: 3 });
const CustomText = Text.customize({ paddingVertical: 8, variant: 'body1Strong' });

const dividerTestStyles = StyleSheet.create({
  setHeightView: { borderStyle: 'solid', borderWidth: 1, borderColor: '#606060', marginVertical: 8, height: 20 },
});

export const DividerDefault: React.FunctionComponent = () => {
  return (
    <Stack style={commonTestStyles.stack}>
      <Divider />
      <CustomText>Regular divider with no content above.</CustomText>
      <DividerWithInset color="purple" text="Colored divider with text + inset." />
      <Divider
        color="blue"
        icon={{
          fontSource: {
            fontFamily: 'Arial',
            codepoint: 0x2663,
            fontSize: 32,
          },
        }}
      />
      <CustomText>Colored divider with an icon above.</CustomText>
      <Divider insetSize={16} appearance="brand" alignContent="start" text="Start-aligned branded divider w inset" />
      <View
        style={{
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: '#606060',
          marginVertical: 8,
          height: 200,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}
      >
        <Divider vertical insetSize={16} />
        <CustomText>Vertical divider with an inset to my left.</CustomText>
      </View>
      <View style={dividerTestStyles.setHeightView}>
        <Divider appearance="strong" alignContent="end" vertical text="End-aligned vertical divider." />
      </View>
    </Stack>
  );
};
