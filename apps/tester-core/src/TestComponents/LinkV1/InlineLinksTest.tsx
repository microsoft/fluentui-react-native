import * as React from 'react';
import { Alert } from 'react-native';

import { LinkV1 as Link, TextV1 as Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';

export const InlineLinks: React.FunctionComponent = () => {
  const doPress = React.useCallback(() => Alert.alert('Alert.', 'You have been alerted.'), []);
  const doA11yTap = React.useCallback(() => Alert.alert('Alert.', 'You have invoked onA11yTap.'), []);

  return (
    <Stack style={stackStyle}>
      <Text>
        Click{' '}
        <Link inline onPress={doPress} onAccessibilityTap={doA11yTap}>
          this link
        </Link>{' '}
        to alert me.
      </Text>
      <Text>
        This{' '}
        <Link inline onPress={doPress} disabled focusable>
          link
        </Link>{' '}
        is disabled and not focusable.
      </Text>
      <Text>
        Follow this{' '}
        <Link inline url="https://www.bing.com/">
          link
        </Link>{' '}
        to navigate.
      </Text>
    </Stack>
  );
};
