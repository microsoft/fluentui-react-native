import * as React from 'react';
import { View, Alert, StyleSheet } from 'react-native';

import { LinkV1 as Link, TextV1 as Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';

export const InlineLinks: React.FunctionComponent = () => {
  const doPress = React.useCallback(() => Alert.alert('Alert.', 'You have been alerted.'), []);
  const doAllyTap = React.useCallback(() => Alert.alert('Alert.', 'You have invoked onAllyTap.'), []);

  return (
    <Stack style={stackStyle}>
      <View style={styles.row}>
        <Text>Click </Text>
        <Link inline onPress={doPress} onAccessibilityTap={doAllyTap}>
          this link
        </Link>
        <Text> to alert me.</Text>
      </View>
      <View style={styles.row}>
        <Text>This </Text>
        <Link inline onPress={doPress} disabled focusable>
          link
        </Link>
        <Text> is disabled but focusable.</Text>
      </View>
      <View style={styles.row}>
        <Text>Follow this </Text>
        <Link inline url="https://www.bing.com/">
          link
        </Link>
        <Text> to navigate.</Text>
      </View>
    </Stack>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
