import * as React from 'react';
import {
  size100,
  size120,
  size160,
  size20,
  size200,
  size240,
  size280,
  size320,
  size360,
  size40,
  size400,
  size480,
  size560,
  size60,
  size80,
  sizeNone,
} from '@fluentui-react-native/design/tokens/global';
import { Text, View } from 'react-native';

import { SPACING_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const BasicUsage: React.FunctionComponent = () => {
  function spacingExample(tokenName: string, spacing?: number) {
    return (
      <View>
        <Text>
          {tokenName} ({spacing})
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ padding: spacing, backgroundColor: '#f80' }}>First</Text>
          <Text style={{ padding: spacing, backgroundColor: '#0af' }}>Second</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        {spacingExample('None', sizeNone)}
        {spacingExample('size20', size20)}
        {spacingExample('size40', size40)}
        {spacingExample('size60', size60)}
        {spacingExample('size80', size80)}
        {spacingExample('size100', size100)}
        {spacingExample('size120', size120)}
        {spacingExample('size160', size160)}
        {spacingExample('size200', size200)}
        {spacingExample('size240', size240)}
        {spacingExample('size280', size280)}
        {spacingExample('size320', size320)}
        {spacingExample('size360', size360)}
        {spacingExample('size400', size400)}
        {spacingExample('size480', size480)}
        {spacingExample('size560', size560)}
      </Stack>
    </View>
  );
};

export const SpacingTokensTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Production',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'This showcases the different spacing tokens available in Fluent UI.';

  const spacingSections: TestSection[] = [
    {
      name: 'Basic Usage',
      testID: SPACING_TESTPAGE,
      component: BasicUsage,
    },
  ];

  return <Test name="Spacing Tokens Test" description={description} sections={spacingSections} status={status} />;
};
