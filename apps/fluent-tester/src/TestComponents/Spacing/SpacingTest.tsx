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
        {spacingExample('None', appleTheme.spacing.sizeNone)}
        {spacingExample('size20', appleTheme.spacing.size20)}
        {spacingExample('size40', appleTheme.spacing.size40)}
        {spacingExample('size60', appleTheme.spacing.size60)}
        {spacingExample('size80', appleTheme.spacing.size80)}
        {spacingExample('size100', appleTheme.spacing.size100)}
        {spacingExample('size120', appleTheme.spacing.size120)}
        {spacingExample('size160', appleTheme.spacing.size160)}
        {spacingExample('size200', appleTheme.spacing.size200)}
        {spacingExample('size240', appleTheme.spacing.size240)}
        {spacingExample('size280', appleTheme.spacing.size280)}
        {spacingExample('size320', appleTheme.spacing.size320)}
        {spacingExample('size360', appleTheme.spacing.size360)}
        {spacingExample('size400', appleTheme.spacing.size400)}
        {spacingExample('size480', appleTheme.spacing.size480)}
        {spacingExample('size560', appleTheme.spacing.size560)}
        {spacingExample('size640', appleTheme.spacing.size640)}
        {spacingExample('size720', appleTheme.spacing.size720)}
        {spacingExample('size800', appleTheme.spacing.size800)}
        {spacingExample('size1200', appleTheme.spacing.size1200)}
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
