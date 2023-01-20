import { Divider } from '@fluentui-react-native/divider';
import { TextV1 as Text } from '@fluentui-react-native/text';
import * as React from 'react';
import { View } from 'react-native';

const DividerWithInset = Divider.customize({ insetSize: 56, thickness: 3 });

export const DividerDefault: React.FunctionComponent = () => {
  return (
    <View style={{ paddingVertical: 8 }}>
      <Divider />
      <Text>Regular divider with no content above.</Text>
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
      <Text>Colored divider with an icon above.</Text>
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
        <Text>Vertical divider with an inset to my left.</Text>
      </View>
      <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#606060', marginVertical: 8, height: 20 }}>
        <Divider appearance="strong" alignContent="end" vertical text="End-aligned vertical divider." />
      </View>
    </View>
  );
};
