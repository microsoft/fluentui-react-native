import * as React from 'react';
import { HOMEPAGE_CORNERRADIUS_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { Text } from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';

interface CornerRadiusTestComponentProps {
  name: string;
  cornerRadius: number;
}

const CornerRadiusTestComponent: React.FunctionComponent<CornerRadiusTestComponentProps> = (props: CornerRadiusTestComponentProps) => {
  const theme = useFluentTheme();
  const isLightMode = getCurrentAppearance(theme.host.appearance, 'light') === 'light';

  const outerBoxProps = React.useMemo(
    () => ({
      height: 60,
      margin: 16,
      backgroundColor: isLightMode ? globalTokens.color.grey80 : globalTokens.color.grey10,
      borderRadius: props.cornerRadius,
    }),
    [props.cornerRadius, isLightMode],
  );

  const innerCircleIndicatorProps = React.useMemo(
    () => ({
      height: Math.min(props.cornerRadius * 2, 60),
      width: Math.min(props.cornerRadius * 2, 60),
      borderRadius: props.cornerRadius,
      backgroundColor: isLightMode ? globalTokens.color.grey10 : globalTokens.color.grey80,
    }),
    [props.cornerRadius, isLightMode],
  );

  return (
    <View>
      <Text variant="bodySemibold">{props.name + ': ' + props.cornerRadius + 'px'}</Text>
      <View style={outerBoxProps}>
        <View style={innerCircleIndicatorProps}></View>
      </View>
    </View>
  );
};

const CornerRadiusTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={500}>
        <CornerRadiusTestComponent name="radiusNone" cornerRadius={globalTokens.corner.radiusNone} />
        <CornerRadiusTestComponent name="radius20" cornerRadius={globalTokens.corner.radius20} />
        <CornerRadiusTestComponent name="radius40" cornerRadius={globalTokens.corner.radius40} />
        <CornerRadiusTestComponent name="radius60" cornerRadius={globalTokens.corner.radius60} />
        <CornerRadiusTestComponent name="radius80" cornerRadius={globalTokens.corner.radius80} />
        <CornerRadiusTestComponent name="radius120" cornerRadius={globalTokens.corner.radius120} />
        <CornerRadiusTestComponent name="radiusCircular" cornerRadius={globalTokens.corner.radiusCircular} />
      </Stack>
    </View>
  );
};

const cornerRadiusSections: TestSection[] = [
  {
    name: 'Basic Usage',
    testID: HOMEPAGE_CORNERRADIUS_TESTPAGE,
    component: CornerRadiusTest,
  },
];

export const CornerRadiusTokensTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description = 'The different global corner radius tokens available in Fluent UI.';

  return <Test name="Corner Radius Tokens Test" description={description} sections={cornerRadiusSections} status={status} />;
};
