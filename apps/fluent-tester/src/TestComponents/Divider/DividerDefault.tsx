import { Divider } from '@fluentui-react-native/divider';
import * as React from 'react';
import { View } from 'react-native';

const DividerWithInset = Divider.customize({ insetSize: 56, thickness: 3 });

export const DividerDefault: React.FunctionComponent = () => {
  return (
    <View style={{ paddingVertical: 8 }}>
      <DividerWithInset color="purple" text="Test Test" />
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
      <Divider insetSize={16} appearance="brand" alignContent="start" text="Goodbye World" />
      <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#606060', marginVertical: 8, height: 200 }}>
        <Divider vertical insetSize={16} alignContent="end" text="Hello World!" />
      </View>
      <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#606060', marginVertical: 8, height: 20 }}>
        <Divider appearance="strong" alignContent="end" vertical text="Hi!" />
      </View>
    </View>
  );
};
