import { createAppleTheme } from '@fluentui-react-native/apple-theme';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { Text, View } from 'react-native';
import { stackStyle } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';

const BasicUsage: React.FunctionComponent = () => {
  function spacingExample(tokenName: string, spacing?: number | string) {
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

  const appleTheme = createAppleTheme().theme;

  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        {spacingExample('None', appleTheme.spacing.none)}
        {spacingExample('XXXS', appleTheme.spacing.xxxs)}
        {spacingExample('XXS', appleTheme.spacing.xxs)}
        {spacingExample('XS', appleTheme.spacing.xs)}
        {spacingExample('S', appleTheme.spacing.s)}
        {spacingExample('M', appleTheme.spacing.m)}
        {spacingExample('L', appleTheme.spacing.l)}
        {spacingExample('XL', appleTheme.spacing.xl)}
        {spacingExample('XXL', appleTheme.spacing.xxl)}
        {spacingExample('XXXL', appleTheme.spacing.xxxl)}
        {spacingExample('XXXXL', appleTheme.spacing.xxxxl)}
      </Stack>
    </View>
  );
};

export const SpacingTokensTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'This showcases the different spacing tokens available in Fluent UI.';

  const spacingSections: TestSection[] = [
    {
      name: 'Basic Usage',
      component: BasicUsage,
    },
  ];

  return <Test name="Spacing Tokens Test" description={description} sections={spacingSections} status={status} />;
};
