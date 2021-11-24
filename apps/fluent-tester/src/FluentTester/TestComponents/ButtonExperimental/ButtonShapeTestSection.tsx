import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonShapeTest: React.FunctionComponent = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button shape="rounded" content="Default Rounded Button" style={commonTestStyles.vmargin} />
      <Button shape="square" content="Square Button" style={commonTestStyles.vmargin} />
      <Button shape="circular" content="Circular Button" style={commonTestStyles.vmargin} />
      <Button appearance="primary" shape="rounded" content="Primary Rounded Button" style={commonTestStyles.vmargin} />
      <Button appearance="primary" shape="square" content="Square Button" style={commonTestStyles.vmargin} />
      <Button appearance="primary" shape="circular" content="Circular Button" style={commonTestStyles.vmargin} />
      <CompoundButton content="Compound Button" secondaryContent="rounded" shape="rounded" style={commonTestStyles.vmargin} />
      <CompoundButton content="Compound Button" secondaryContent="square" shape="square" style={commonTestStyles.vmargin} />
      <CompoundButton content="Compound Button" secondaryContent="circular" shape="circular" style={commonTestStyles.vmargin} />
    </View>
  );
};
