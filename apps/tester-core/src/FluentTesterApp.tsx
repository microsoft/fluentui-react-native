/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */
'use strict';

import * as React from 'react';
import { Platform } from 'react-native';

import { useHorizontalSizeClass } from '@fluentui-react-native/experimental-appearance-additions';
import { ThemeReference, ThemeProvider } from '@fluentui-react-native/theme';

import type { FluentTesterProps } from './FluentTester';
import { FluentTester } from './FluentTester';
import { testerTheme } from './theme/index';

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  const sizeClass = useHorizontalSizeClass();
  const isMobile = Platform.OS === 'android' || (Platform.OS === 'ios' && Platform.isPad === false);

  // If on iPad we are presented in a Split View or Slide Over context, show the single pane view.
  const shouldShowSinglePane = isMobile || (!isMobile && sizeClass === 'compact');

  const customTheme = new ThemeReference(
    testerTheme,
    () => {
      return {
        colors: { brandBackground2: 'red' }, // Overrides the buttonBackground color token, all other colors are kept in-tact.
      };
    },
    () => {
      return {
        colors: {
          hostColorPink: 'pink', // New custom color key.
          hostColorBrandText: 'purple', // New custom color key.
          hostColorButtonBackground: 'yellow', // New custom color key.
        },
        spacing: {
          s1: '10px',
        },
      };
    },
    () => {
      // Any other recipe.
      return {
        colors: {
          yellowBrandColor: 'yellow', // New custom color key.
          hostColorButtonBackground: 'green', // Overrides custom color key 'hostColorButtonBackground' - it is green in theme now.
        },
      };
    },
  );

  // Use the custom colors for Android and iOS.
  const fluentTesterTheme: ThemeReference = isMobile ? customTheme : testerTheme;

  return (
    <ThemeProvider theme={fluentTesterTheme}>
      <FluentTester enableSinglePaneView={shouldShowSinglePane} {...props} />
    </ThemeProvider>
  );
};
