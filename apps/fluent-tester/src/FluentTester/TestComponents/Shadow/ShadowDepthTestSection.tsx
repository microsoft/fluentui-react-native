import * as React from 'react';
import { commonTestStyles } from '../Common/styles';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Shadow, ShadowDepth } from '@fluentui-react-native/shadow';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return {
    effectBox: {
      width: 366,
      minHeight: 64,
    },
    shadowColor: {
      shadowColor: 'black',
      backgroundColor: t.colors.background,
    },
    padding: {
      padding: 12,
      paddingHorizontal: 24,
    },
    vmargin: {
      marginVertical: 64,
    },
  };
});

interface ShadowTestBoxProps {
  depth: ShadowDepth;
}

const ShadowTestBox: React.FunctionComponent<ShadowTestBoxProps> = (props: ShadowTestBoxProps) => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
  return (
    <Shadow depth={props.depth}>
      <Text
        style={[commonTestStyles.view, themedStyles.effectBox, themedStyles.vmargin, themedStyles.shadowColor, { padding: 20 }]}
        variant="bodySemibold"
      >
        Shadow Depth: {props.depth}
      </Text>
    </Shadow>
  );
};

export const ShadowDepthTestSection: React.FunctionComponent = () => {
  return (
    <View style={[commonTestStyles.view, getThemedStyles(useTheme()).padding]}>
      <ShadowTestBox depth="2" />
      <ShadowTestBox depth="4" />
      <ShadowTestBox depth="8" />
      <ShadowTestBox depth="16" />
      <ShadowTestBox depth="28" />
      <ShadowTestBox depth="64" />
    </View>
  );
};
