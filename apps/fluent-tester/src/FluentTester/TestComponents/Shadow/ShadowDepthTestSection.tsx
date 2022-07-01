import * as React from 'react';
import { commonTestStyles } from '../Common/styles';
import { ColorValue, View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Shadow, ShadowDepth } from '@fluentui-react-native/experimental-shadow';
import { useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { useFluentTheme } from '@fluentui-react-native/framework';

const getThemedStyles = themedStyleSheet(() => {
  return {
    effectBox: {
      width: 366,
      minHeight: 64,
    },
    padding: {
      padding: 20,
      paddingHorizontal: 24,
    },
    vmargin: {
      marginVertical: 32,
      marginHorizontal: 16,
    },
  };
});

interface ShadowTestBoxProps {
  depth: ShadowDepth;
  backgroundColor: ColorValue;
}

const ShadowTestBox: React.FunctionComponent<ShadowTestBoxProps> = (props: ShadowTestBoxProps) => {
  const themedStyles = getThemedStyles();
  return (
    <Shadow depth={props.depth}>
      <Text
        style={[
          commonTestStyles.view,
          themedStyles.effectBox,
          themedStyles.vmargin,
          themedStyles.padding,
          { backgroundColor: props.backgroundColor },
        ]}
        variant="bodySemibold"
      >
        {props.depth}
      </Text>
    </Shadow>
  );
};

export const ShadowDepthTestSection: React.FunctionComponent = () => {
  const theme = useFluentTheme();

  return (
    <View style={{ padding: 20 }}>
      <ShadowTestBox depth="shadow2" backgroundColor={theme.colors.background} />
      <ShadowTestBox depth="shadow4" backgroundColor={theme.colors.background} />
      <ShadowTestBox depth="shadow8" backgroundColor={theme.colors.background} />
      <ShadowTestBox depth="shadow16" backgroundColor={theme.colors.background} />
      <ShadowTestBox depth="shadow28" backgroundColor={theme.colors.background} />
      <ShadowTestBox depth="shadow64" backgroundColor={theme.colors.background} />
      <ShadowTestBox depth="shadow2brand" backgroundColor={theme.colors.brandBackground} />
      <ShadowTestBox depth="shadow4brand" backgroundColor={theme.colors.brandBackground} />
      <ShadowTestBox depth="shadow8brand" backgroundColor={theme.colors.brandBackground} />
      <ShadowTestBox depth="shadow16brand" backgroundColor={theme.colors.brandBackground} />
      <ShadowTestBox depth="shadow28brand" backgroundColor={theme.colors.brandBackground} />
      <ShadowTestBox depth="shadow64brand" backgroundColor={theme.colors.brandBackground} />
    </View>
  );
};
