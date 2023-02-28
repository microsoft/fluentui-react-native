'use strict';

import * as React from 'react';
import { Platform } from 'react-native';
import { Theme } from '@fluentui-react-native/framework';
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
        colors: { brandBackground2: 'red' }, // overrides the buttonBackground color token, all other colors are kept in-tact
      };
    },
    (theme: Theme) => {
      return {
        colors: {
          neutralForeground1: theme.colors.brandBackground2, // neutralBackground1 is 'red' in theme here because of previous recipe applied..
          hostColorPink: 'pink', // new custom color key.
          hostColorBrandText: 'purple', // new custom color key.
          hostColorButtonBackground: 'yellow', // new custom color key.
        },
        spacing: {
          s1: '10px',
        },
      };
    },
    () => {
      // another recipe.
      return {
        colors: {
          yellowBrandColor: 'yellow', // new custom color key.
          hostColorButtonBackground: 'green', // Overrides custom color key 'hostColorButtonBackground' - it is green in theme now.
        },
      };
    },
  );

  const fluentTesterTheme: ThemeReference = isMobile ? customTheme : testerTheme;

  return (
    <ThemeProvider theme={fluentTesterTheme}>
      <FluentTester enableSinglePaneView={shouldShowSinglePane} {...props} />
    </ThemeProvider>
  );
};
