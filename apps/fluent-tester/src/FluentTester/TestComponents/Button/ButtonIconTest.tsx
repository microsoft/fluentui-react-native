/* eslint-disable @typescript-eslint/no-var-requires */
import { Button } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import { FontIconProps } from '@fluentui-react-native/icon';

const testImage = require('./icon_24x24.png');
const testTtf = require('./Font Awesome 5 Free-Solid-900.otf');

const fontProps: FontIconProps = {
  fontFamily: `Font Awesome 5 Free`,
  fontSrcFile: testTtf,
  codepoint: 0xf083,
  fontSize: 16,
};

export const ButtonIconTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <Button icon={testImage} content="Button with png Icon" tooltip="button tooltip" />
        <Button icon={{ fontSource: fontProps, color: 'blue' }} content="Button with font Icon" tooltip="button tooltip" />
      </Stack>
    </View>
  );
};
