import * as React from 'react';
import {
  colorGrey10,
  colorGrey80,
  cornerRadius120,
  cornerRadius20,
  cornerRadius40,
  cornerRadius60,
  cornerRadius80,
  cornerRadiusCircular,
  cornerRadiusNone,
} from '@fluentui-react-native/design/tokens/global';
import { View } from 'react-native';

import { Text } from '@fluentui/react-native';
import { HOMEPAGE_CORNERRADIUS_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Stack } from '@fluentui-react-native/stack';
import { getCurrentAppearance } from '@fluentui-react-native/design/theming';

import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

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
      backgroundColor: isLightMode ? colorGrey80 : colorGrey10,
      borderRadius: props.cornerRadius,
    }),
    [props.cornerRadius, isLightMode],
  );

  const innerCircleIndicatorProps = React.useMemo(
    () => ({
      height: Math.min(props.cornerRadius * 2, 60),
      width: Math.min(props.cornerRadius * 2, 60),
      borderRadius: props.cornerRadius,
      backgroundColor: isLightMode ? colorGrey10 : colorGrey80,
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
        <CornerRadiusTestComponent name="radiusNone" cornerRadius={cornerRadiusNone} />
        <CornerRadiusTestComponent name="radius20" cornerRadius={cornerRadius20} />
        <CornerRadiusTestComponent name="radius40" cornerRadius={cornerRadius40} />
        <CornerRadiusTestComponent name="radius60" cornerRadius={cornerRadius60} />
        <CornerRadiusTestComponent name="radius80" cornerRadius={cornerRadius80} />
        <CornerRadiusTestComponent name="radius120" cornerRadius={cornerRadius120} />
        <CornerRadiusTestComponent name="radiusCircular" cornerRadius={cornerRadiusCircular} />
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
    win32Status: 'Production',
    uwpStatus: 'Production',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'The different global corner radius tokens available in Fluent UI.';

  return <Test name="Corner Radius Tokens Test" description={description} sections={cornerRadiusSections} status={status} />;
};
