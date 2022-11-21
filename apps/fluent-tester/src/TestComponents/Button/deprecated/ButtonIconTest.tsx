/* eslint-disable @typescript-eslint/no-var-requires */
import { Button, Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { stackStyle } from '../../Common/styles';
import { testImage, svgProps } from '../../Common/iconExamples';

const CustomizedIconButton = Button.customize({
  tokens: { iconColor: 'red' },
  content: { style: { marginStart: 5 } },
});

export const ButtonIconTest_deprecated: React.FunctionComponent = () => {
  /* eslint-disable @typescript-eslint/no-var-requires */

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
