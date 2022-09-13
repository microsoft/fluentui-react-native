import * as React from 'react';
import { Text } from '@fluentui/react-native';
import { Shadow } from '@fluentui-react-native/experimental-shadow';
import { Theme, useFluentTheme } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { mergeStyles } from '@fluentui-react-native/merge-props';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return {
    defaultShadowTestBoxProps: {
      maxWidth: 732,
      minHeight: 64,
      padding: 20,
      marginVertical: 16,
      marginHorizontal: 32,
      backgroundColor: t.colors.background,
    },
  };
});

export const ShadowWithDifferentPropsTestSection: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  const themedStyles = getThemedStyles(theme);

  return (
    <View>
      <Text style={{ padding: 16 }}>The following tests have a Shadow16 set on a child view that has some specific props.</Text>
      <View>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={themedStyles.defaultShadowTestBoxProps}>
            <Text variant="bodySemibold">padding: 20, marginVertical: 16, marginHorizontal: 32</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxProps, { borderRadius: 8 })}>
            <Text variant="bodySemibold">borderRadius: 8</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxProps, { borderRadius: 8, borderWidth: 2, borderColor: 'black' })}>
            <Text variant="bodySemibold">borderWidth: 2</Text>
          </View>
        </Shadow>
      </View>
    </View>
  );
};
