import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import { SvgIconProps } from '@fluentui-react-native/icon';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import TestSvg from './test.svg';

export const ButtonSizeTest: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      {svgIconsEnabled && (
        <>
          <Button size="small" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin} />
          <Button size="medium" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin} />
          <Button size="large" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin} />
        </>
      )}
      <Button size="small" content="Small" style={commonTestStyles.vmargin} />
      <Button size="medium" content="Medium" style={commonTestStyles.vmargin} />
      <Button size="large" content="Large" style={commonTestStyles.vmargin} />
      <Button loading size="small" content="Loading Button Small" style={commonTestStyles.vmargin} />
      <Button loading size="medium" content="Loading Button Medium" style={commonTestStyles.vmargin} />
      <Button loading size="large" content="Loading Button Large" style={commonTestStyles.vmargin} />
      <CompoundButton size="small" content="Small" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton size="medium" content="Medium" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton size="large" content="Large" secondaryContent="Compound" style={commonTestStyles.vmargin} />
    </View>
  );
};
