import { Button } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonShapeTest: React.FunctionComponent = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button shape="rounded" content="Default Rounded Button" />
      <Button shape="square" content="Square Button" />
      <Button shape="circular" content="Circular Button" />
      <Button appearance="primary" shape="rounded" content="Default Rounded Button" />
      <Button appearance="primary" shape="square" content="Square Button" />
      <Button appearance="primary" shape="circular" content="Circular Button" />
    </View>
  );
};
