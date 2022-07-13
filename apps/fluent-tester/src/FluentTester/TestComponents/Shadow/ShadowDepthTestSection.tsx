import * as React from 'react';
import { commonTestStyles } from '../Common/styles';
import { ColorValue, View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Shadow, getShadowTokenStyleSet } from '@fluentui-react-native/experimental-shadow';
import { ShadowToken, useTheme } from '@fluentui-react-native/theme-types';
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
      marginVertical: 16,
      marginHorizontal: 32,
    },
  };
});

interface ShadowTestBoxProps {
  shadowDepthText: string;
  shadowToken: ShadowToken;
  backgroundColor: ColorValue;
}

const ShadowTestBox: React.FunctionComponent<ShadowTestBoxProps> = (props: ShadowTestBoxProps) => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);

  return (
    <Shadow shadowToken={props.shadowToken}>
      <View
        style={[
          commonTestStyles.view,
          themedStyles.effectBox,
          themedStyles.vmargin,
          themedStyles.padding,
          { backgroundColor: props.backgroundColor },
        ]}
      >
        <Text variant="bodySemibold">{props.shadowDepthText}</Text>
        <Text>{getShadowDescription(props.shadowToken)}</Text>
      </View>
    </Shadow>
  );
};

export const ShadowDepthTestSection: React.FunctionComponent = () => {
  const theme = useFluentTheme();

  return (
    <View>
      <ShadowTestBox shadowDepthText="Shadow 2" shadowToken={theme.shadows.shadow2} backgroundColor={theme.colors.background} />
      <ShadowTestBox shadowDepthText="Shadow 4" shadowToken={theme.shadows.shadow4} backgroundColor={theme.colors.background} />
      <ShadowTestBox shadowDepthText="Shadow 8" shadowToken={theme.shadows.shadow8} backgroundColor={theme.colors.background} />
      <ShadowTestBox shadowDepthText="Shadow 16" shadowToken={theme.shadows.shadow16} backgroundColor={theme.colors.background} />
      <ShadowTestBox shadowDepthText="Shadow 28" shadowToken={theme.shadows.shadow28} backgroundColor={theme.colors.background} />
      <ShadowTestBox shadowDepthText="Shadow 64" shadowToken={theme.shadows.shadow64} backgroundColor={theme.colors.background} />
      <ShadowTestBox
        shadowDepthText="Brand Shadow 2"
        shadowToken={theme.shadows.shadow2brand}
        backgroundColor={theme.colors.brandBackground}
      />
      <ShadowTestBox
        shadowDepthText="Brand Shadow 4"
        shadowToken={theme.shadows.shadow4brand}
        backgroundColor={theme.colors.brandBackground}
      />
      <ShadowTestBox
        shadowDepthText="Brand Shadow 8"
        shadowToken={theme.shadows.shadow8brand}
        backgroundColor={theme.colors.brandBackground}
      />
      <ShadowTestBox
        shadowDepthText="Brand Shadow 16"
        shadowToken={theme.shadows.shadow16brand}
        backgroundColor={theme.colors.brandBackground}
      />
      <ShadowTestBox
        shadowDepthText="Brand Shadow 28"
        shadowToken={theme.shadows.shadow28brand}
        backgroundColor={theme.colors.brandBackground}
      />
      <ShadowTestBox
        shadowDepthText="Brand Shadow 64"
        shadowToken={theme.shadows.shadow64brand}
        backgroundColor={theme.colors.brandBackground}
      />
    </View>
  );
};

function getShadowDescription(shadowToken: ShadowToken): string {
  const shadowStyle = getShadowTokenStyleSet(shadowToken);

  return (
    '\nAmbient: ' +
    JSON.stringify(shadowStyle.ambient, undefined, ' ').split('\n').join('').replace(/['"]+/g, '') +
    '\n\nKey: ' +
    JSON.stringify(shadowStyle.key, undefined, ' ').split('\n').join('').replace(/['"]+/g, '')
  );
}
