import * as React from 'react';
import { commonTestStyles } from '../Common/styles';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Shadow, getShadowTokenStyleSet } from '@fluentui-react-native/experimental-shadow';
import { ShadowToken, useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { useFluentTheme } from '@fluentui-react-native/framework';

const getThemedStyles = themedStyleSheet(() => {
  return {
    effectBox: {
      maxWidth: 732,
      minHeight: 64,
      borderRadius: 8,
    },
    padding: {
      padding: 20,
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
  isBrand?: boolean;
}

const ShadowTestBox: React.FunctionComponent<ShadowTestBoxProps> = (props: ShadowTestBoxProps) => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
  const backgroundColor = props.isBrand ? theme.colors.brandedBackground : theme.colors.background;
  const textColor = props.isBrand ? theme.colors.primaryButtonText : theme.colors.bodyText;

  return (
    <Shadow shadowToken={props.shadowToken}>
      <View
        style={[
          commonTestStyles.view,
          themedStyles.effectBox,
          themedStyles.vmargin,
          themedStyles.padding,
          { backgroundColor: backgroundColor },
        ]}
      >
        <Text variant="bodySemibold" color={textColor}>
          {props.shadowDepthText}
        </Text>
        <Text color={textColor}>{getShadowDescription(props.shadowToken)}</Text>
      </View>
    </Shadow>
  );
};

export const ShadowDepthTestSection: React.FunctionComponent = () => {
  const theme = useFluentTheme();

  return (
    <View>
      <ShadowTestBox shadowDepthText="Shadow 2" shadowToken={theme.shadows.shadow2} />
      <ShadowTestBox shadowDepthText="Shadow 4" shadowToken={theme.shadows.shadow4} />
      <ShadowTestBox shadowDepthText="Shadow 8" shadowToken={theme.shadows.shadow8} />
      <ShadowTestBox shadowDepthText="Shadow 16" shadowToken={theme.shadows.shadow16} />
      <ShadowTestBox shadowDepthText="Shadow 28" shadowToken={theme.shadows.shadow28} />
      <ShadowTestBox shadowDepthText="Shadow 64" shadowToken={theme.shadows.shadow64} />
      <ShadowTestBox shadowDepthText="Brand Shadow 2" shadowToken={theme.shadows.shadow2brand} isBrand={true} />
      <ShadowTestBox shadowDepthText="Brand Shadow 4" shadowToken={theme.shadows.shadow4brand} isBrand={true} />
      <ShadowTestBox shadowDepthText="Brand Shadow 8" shadowToken={theme.shadows.shadow8brand} isBrand={true} />
      <ShadowTestBox shadowDepthText="Brand Shadow 16" shadowToken={theme.shadows.shadow16brand} isBrand={true} />
      <ShadowTestBox shadowDepthText="Brand Shadow 28" shadowToken={theme.shadows.shadow28brand} isBrand={true} />
      <ShadowTestBox shadowDepthText="Brand Shadow 64" shadowToken={theme.shadows.shadow64brand} isBrand={true} />
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
