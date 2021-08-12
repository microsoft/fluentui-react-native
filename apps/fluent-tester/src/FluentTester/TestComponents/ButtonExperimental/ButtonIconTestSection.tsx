import { Button } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from './test.svg';

export const ButtonIconTest: React.FunctionComponent = () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 32,
  };

  /* eslint-disable @typescript-eslint/no-var-requires */
  const testImage = require('./icon_24x24.png');

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button
        icon={{ fontSource: fontBuiltInProps, width: 100, height: 100, color: '#060' }}
        content="Font icon"
        style={commonTestStyles.vmargin}
      />
      <Button icon={{ fontSource: fontBuiltInProps, width: 100, height: 100 }} content="Font icon" style={commonTestStyles.vmargin} />
      <Button
        primary
        icon={{ fontSource: fontBuiltInProps, width: 100, height: 100 }}
        content="Font icon"
        style={commonTestStyles.vmargin}
      />
      {svgIconsEnabled ? (
        <Button
          primary
          icon={{ svgSource: svgProps, width: 20, height: 20, color: 'red' }}
          content="SVG"
          style={commonTestStyles.vmargin}
        />
      ) : null}
      {svgIconsEnabled ? (
        <Button icon={{ svgSource: svgProps, width: 20, height: 20 }} content="SVG" style={commonTestStyles.vmargin} />
      ) : null}
      <Button primary icon={testImage} content="PNG" style={commonTestStyles.vmargin} />
      <Button icon={testImage} content="PNG" style={commonTestStyles.vmargin} />
    </View>
  );
};
