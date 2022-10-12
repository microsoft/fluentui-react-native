import * as React from 'react';
import { HOMEPAGE_STROKEWIDTH_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { View, StyleSheet } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { Text } from '@fluentui/react-native';
import { createAppleTheme } from '@fluentui-react-native/apple-theme';

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
  const appleTheme = createAppleTheme().theme;

  return (
    <View>
      <Stack style={stackStyle}>
        <StrokeWidthTestComponent name="None" strokeWidth={appleTheme.stroke.width.none}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thinnest" strokeWidth={appleTheme.stroke.width.thinnest}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thinner" strokeWidth={appleTheme.stroke.width.thinner}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thin" strokeWidth={appleTheme.stroke.width.thin}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thick" strokeWidth={appleTheme.stroke.width.thick}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thicker" strokeWidth={appleTheme.stroke.width.thicker}></StrokeWidthTestComponent>
        <StrokeWidthTestComponent name="Thickest" strokeWidth={appleTheme.stroke.width.thickest}></StrokeWidthTestComponent>
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
