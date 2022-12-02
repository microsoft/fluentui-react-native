import { Stack } from '@fluentui-react-native/stack';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
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

  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        {spacingExample('None', globalTokens.sizeNone)}
        {spacingExample('size20', globalTokens.size20)}
        {spacingExample('size40', globalTokens.size40)}
        {spacingExample('size60', globalTokens.size60)}
        {spacingExample('size80', globalTokens.size80)}
        {spacingExample('size100', globalTokens.size100)}
        {spacingExample('size120', globalTokens.size120)}
        {spacingExample('size160', globalTokens.size160)}
        {spacingExample('size200', globalTokens.size200)}
        {spacingExample('size240', globalTokens.size240)}
        {spacingExample('size280', globalTokens.size280)}
        {spacingExample('size320', globalTokens.size320)}
        {spacingExample('size360', globalTokens.size360)}
        {spacingExample('size400', globalTokens.size400)}
        {spacingExample('size480', globalTokens.size480)}
        {spacingExample('size560', globalTokens.size560)}
        {spacingExample('size640', globalTokens.size640)}
        {spacingExample('size720', globalTokens.size720)}
        {spacingExample('size800', globalTokens.size800)}
        {spacingExample('size1200', globalTokens.size1200)}
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
