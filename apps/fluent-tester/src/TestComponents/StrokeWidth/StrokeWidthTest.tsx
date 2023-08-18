import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@fluentui/react-native';
import type { Theme } from '@fluentui-react-native/framework';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Stack } from '@fluentui-react-native/stack';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';

import { STROKEWIDTH_TESTPAGE } from '../../../../E2E/src/StrokeWidthTokens/consts';
import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  const isLightMode = getCurrentAppearance(t.host.appearance, 'light') === 'light';
  return {
    root: {
      paddingBottom: 16,
    },
    exampleStrokeBackground: {
      height: 100,
      backgroundColor: isLightMode ? globalTokens.color.grey80 : globalTokens.color.grey10,
      display: 'flex',
      marginTop: 8,
    },
  };
});

interface StrokeWidthTestComponentProps {
  name: string;
  strokeWidth: number;
}

const StrokeWidthTestComponent: React.FunctionComponent<StrokeWidthTestComponentProps> = (props: StrokeWidthTestComponentProps) => {
  const theme = useFluentTheme();
  const styles = getThemedStyles(theme);
  const isLightMode = getCurrentAppearance(theme.host.appearance, 'light') === 'light';
  const exampleStrokeStyle = React.useMemo(
    () => ({
      height: 50,
      borderBottomWidth: props.strokeWidth,
      borderColor: isLightMode ? globalTokens.color.grey10 : globalTokens.color.grey80,
    }),
    [props.strokeWidth, isLightMode],
  );

  return (
    <View style={styles.root}>
      <Text variant="bodySemibold">{props.name + ': ' + props.strokeWidth + 'pt'}</Text>
      <View style={styles.exampleStrokeBackground}>
        <View style={exampleStrokeStyle} />
      </View>
    </View>
  );
};

const StrokeWidthTestRamp: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <StrokeWidthTestComponent name="widthNone" strokeWidth={globalTokens.stroke.widthNone}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="width05" strokeWidth={globalTokens.stroke.width05}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="width10" strokeWidth={globalTokens.stroke.width10}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="width15" strokeWidth={globalTokens.stroke.width15}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="width20" strokeWidth={globalTokens.stroke.width20}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="width30" strokeWidth={globalTokens.stroke.width30}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="width40" strokeWidth={globalTokens.stroke.width40}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="width60" strokeWidth={globalTokens.stroke.width60}></StrokeWidthTestComponent>
      </Stack>
    </View>
  );
};

const strokeWidthSections: TestSection[] = [
  {
    name: 'Basic Usage',
    testID: STROKEWIDTH_TESTPAGE,
    component: StrokeWidthTestRamp,
  },
];

export const StrokeWidthTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description = 'This showcases the different global stroke width tokens available in Fluent UI.';

  return <Test name="Stroke Width Tokens Test" description={description} sections={strokeWidthSections} status={status} />;
};
