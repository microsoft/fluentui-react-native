/* eslint-disable @typescript-eslint/no-var-requires */
import { Button, Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { stackStyle } from '../../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from '../test.svg';

const CustomizedIconButton = Button.customize({
  tokens: { iconColor: 'red' },
  content: { style: { marginStart: 5 } },
});

export const ButtonIconTest_deprecated: React.FunctionComponent = () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const testImage = require('../../../../../assets/icon_24x24.png');

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  // SVG-based icons are not available on all platforms yet
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
  const iconProps = { svgSource: svgProps, width: 20, height: 20 };

  return (
    <View>
      <Stack style={stackStyle}>
        <Button startIcon={testImage} content="Button with png Icon" tooltip="button tooltip" />
        {svgIconsEnabled ? (
          <Button startIcon={{ ...iconProps, color: 'red' }} content="Button with svg Icon" tooltip="button tooltip" />
        ) : null}
        {svgIconsEnabled ? (
          <CustomizedIconButton startIcon={iconProps} content="Button with Customized Icon" tooltip="button tooltip" />
        ) : null}
        <Text>End Button icon</Text>
        {svgIconsEnabled ? <CustomizedIconButton endIcon={iconProps} content="Button with Right Icon" tooltip="button tooltip" /> : null}
      </Stack>
    </View>
  );
};
