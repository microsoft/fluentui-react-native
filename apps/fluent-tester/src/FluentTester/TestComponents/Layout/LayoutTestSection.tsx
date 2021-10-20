import { Button } from '@fluentui-react-native/experimental-button';
import { Text } from '@fluentui-react-native/experimental-text';
import * as React from 'react';
import { Picker, View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const LayoutPlayArea: React.FunctionComponent = () => {
  const [borderWidthValue, setBorderWidthValue] = React.useState(1);
  const onBorderWidthValueChange = React.useCallback(
    (newValue: number) => {
      setBorderWidthValue(newValue);
    },
    [setBorderWidthValue],
  );

  const [paddingValue, setPaddingValue] = React.useState(2);
  const onPaddingValueChange = React.useCallback(
    (newValue: number) => {
      setPaddingValue(newValue);
    },
    [setPaddingValue],
  );
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button
        content="Default"
        style={[commonTestStyles.vmargin, { borderWidth: borderWidthValue, padding: paddingValue, height: 40, width: 64 }]}
      />
      <Text>Border width:</Text>
      <Picker selectedValue={borderWidthValue} onValueChange={onBorderWidthValueChange}>
        <Picker.Item label={'1'} value={1} key={`entry${1}`} />
        <Picker.Item label={'2'} value={2} key={`entry${2}`} />
        <Picker.Item label={'5'} value={5} key={`entry${3}`} />
        <Picker.Item label={'10'} value={10} key={`entry${4}`} />
      </Picker>
      <Text>Padding:</Text>
      <Picker selectedValue={paddingValue} onValueChange={onPaddingValueChange}>
        <Picker.Item label={'1'} value={1} key={`entry${1}`} />
        <Picker.Item label={'2'} value={2} key={`entry${2}`} />
        <Picker.Item label={'5'} value={5} key={`entry${3}`} />
        <Picker.Item label={'10'} value={10} key={`entry${4}`} />
      </Picker>
    </View>
  );
};
