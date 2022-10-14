import * as React from 'react';
import { Text } from '@fluentui/react-native';
import { Shadow } from '@fluentui-react-native/experimental-shadow';
import { Theme, useFluentTheme } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { mergeStyles } from '@fluentui-react-native/merge-props';
import { shadowTestPageStyles } from './ShadowTestPageStyles';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  const defaultShadowTestBoxPropsWithoutSpacing = {
    maxWidth: 732,
    minHeight: 64,
    ...shadowTestPageStyles(t).backgroundColor,
  };
  const marginTestProps = {
    marginVertical: 16,
    marginHorizontal: 32,
  };
  const paddingTestProps = {
    padding: 20,
  };

  return {
    headerTextPadding: {
      padding: 16,
    },
    defaultShadowTestBoxPropsWithoutSpacing,
    defaultShadowTestBoxProps: {
      ...defaultShadowTestBoxPropsWithoutSpacing,
      ...marginTestProps,
      ...paddingTestProps,
    },
    marginTestProps,
    paddingTestProps,
    borderRadiusTestProps: {
      borderRadius: 8,
    },
    borderWidthTestProps: {
      borderWidth: 2,
      borderColor: 'black',
    },
    offsetTestProps: { start: 10 },
    alignItemsTestProps: { alignItems: 'flex-start' },
    flexDirectionTestProps: { flexDirection: 'row' },
    flexWrapTestProps: { flexWrap: 'wrap' },
  };
});

export const ShadowWithDifferentPropsTestSection: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  const themedStyles = getThemedStyles(theme);

  return (
    <View style={shadowTestPageStyles(theme).backgroundColor}>
      <Text style={themedStyles.headerTextPadding}>
        The following tests have a Shadow16 set on a child view that has some specific props.
      </Text>
      <View>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={themedStyles.defaultShadowTestBoxProps}>
            <Text variant="bodySemibold">padding: 20, marginVertical: 16, marginHorizontal: 32</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxPropsWithoutSpacing, themedStyles.paddingTestProps)}>
            <Text variant="bodySemibold">padding only</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxPropsWithoutSpacing, themedStyles.marginTestProps)}>
            <Text variant="bodySemibold">margins only</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxProps, themedStyles.borderRadiusTestProps)}>
            <Text variant="bodySemibold">borderRadius: 8</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View
            style={mergeStyles(
              themedStyles.defaultShadowTestBoxProps,
              themedStyles.borderRadiusTestProps,
              themedStyles.borderWidthTestProps,
            )}
          >
            <Text variant="bodySemibold">borderWidth: 2</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxProps, themedStyles.offsetTestProps)}>
            <Text variant="bodySemibold">start: 10</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxProps, themedStyles.alignItemsTestProps)}>
            <Text variant="bodySemibold">alignItems: flex-start</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxProps, themedStyles.flexDirectionTestProps)}>
            <Text variant="bodySemibold">flexDirection: row</Text>
          </View>
        </Shadow>
        <Shadow shadowToken={theme.shadows.shadow16}>
          <View style={mergeStyles(themedStyles.defaultShadowTestBoxProps, themedStyles.flexWrapTestProps)}>
            <Text variant="bodySemibold">flexWrap: wrap</Text>
          </View>
        </Shadow>
      </View>
    </View>
  );
};
