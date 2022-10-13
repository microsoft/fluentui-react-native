import * as React from 'react';
import { HOMEPAGE_CORNERRADIUS_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { View, StyleSheet } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { Text } from '@fluentui/react-native';

const styles = StyleSheet.create({
  root: {
    marginBottom: 20,
  },
  cornerRadiusBox: {},
  cornerRadiusCircle: {},
});

interface CornerRadiusTestComponentProps {
  name: string;
  cornerRadius: number;
}

const CornerRadiusTestComponent: React.FunctionComponent<CornerRadiusTestComponentProps> = (props: CornerRadiusTestComponentProps) => {
  return (
    <View style={styles.root}>
      <Text variant="bodySemibold">{props.name + ': ' + props.cornerRadius + 'px'}</Text>
      <View style={{ height: 60, margin: 16, backgroundColor: 'lightgrey', borderRadius: props.cornerRadius }}>
        <View
          style={{
            height: props.cornerRadius * 2,
            width: props.cornerRadius * 2,
            borderRadius: props.cornerRadius,
            backgroundColor: 'grey',
          }}
        ></View>
      </View>
    </View>
  );
};

const CornerRadiusTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={500}>
        <CornerRadiusTestComponent name="None" cornerRadius={globalTokens.corner.radius.none} />
        <CornerRadiusTestComponent name="Small" cornerRadius={globalTokens.corner.radius.small} />
        <CornerRadiusTestComponent name="Medium" cornerRadius={globalTokens.corner.radius.medium} />
        <CornerRadiusTestComponent name="Large" cornerRadius={globalTokens.corner.radius.large} />
        <CornerRadiusTestComponent name="Extra Large" cornerRadius={globalTokens.corner.radius.extraLarge} />
        <CornerRadiusTestComponent name="Circle" cornerRadius={globalTokens.corner.radius.circle} />
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
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = '';

  return <Test name="Corner Radius Tokens Test" description={description} sections={cornerRadiusSections} status={status} />;
};
