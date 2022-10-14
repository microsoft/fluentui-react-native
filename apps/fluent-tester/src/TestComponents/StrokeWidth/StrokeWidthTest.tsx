import * as React from 'react';
import { HOMEPAGE_STROKEWIDTH_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { View, StyleSheet } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { Text } from '@fluentui/react-native';

const styles = StyleSheet.create({
  root: {
    paddingBottom: 16,
  },
  exampleStrokeBackground: {
    height: 100,
    backgroundColor: '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
  },
});

interface StrokeWidthTestComponentProps {
  name: string;
  strokeWidth: number;
}

const StrokeWidthTestComponent: React.FunctionComponent<StrokeWidthTestComponentProps> = (props: StrokeWidthTestComponentProps) => {
  const exampleStrokeStyle = { height: props.strokeWidth, backgroundColor: 'grey' };

  return (
    <View style={styles.root}>
      <Text variant="bodySemibold">{props.name + ': ' + props.strokeWidth + 'pt'}</Text>
      <View style={styles.exampleStrokeBackground}>
        <View style={exampleStrokeStyle} />
      </View>
    </View>
  );
};

const StrokeWidthTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <StrokeWidthTestComponent name="Thin" strokeWidth={globalTokens.stroke.width.thin}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thick" strokeWidth={globalTokens.stroke.width.thick}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thicker" strokeWidth={globalTokens.stroke.width.thicker}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thickest" strokeWidth={globalTokens.stroke.width.thickest}></StrokeWidthTestComponent>
      </Stack>
    </View>
  );
};

const strokeWidthSections: TestSection[] = [
  {
    name: 'Basic Usage',
    testID: HOMEPAGE_STROKEWIDTH_TESTPAGE,
    component: StrokeWidthTest,
  },
];

export const StrokeWidthTokensTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'This showcases the different stroke width tokens available in Fluent UI.';

  return <Test name="Stroke Width Tokens Test" description={description} sections={strokeWidthSections} status={status} />;
};
