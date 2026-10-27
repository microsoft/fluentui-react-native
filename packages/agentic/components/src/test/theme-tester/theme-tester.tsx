/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { FlexThemeReference, ThemedRoot, themedStyleSheetFactory, useThemeState } from '@fluentui-react-native/design';
import type { ResolvedThemeAppearance } from '@fluentui-react-native/design/theming';
import { getDefaultLegacyTheme } from '@fluentui-react-native/design/theming/compat/defaults';
import { ThemeReference } from '@fluentui-react-native/design/theming/legacy-source';

import { ThemePicker } from '../theme-picker/theme-picker';
import type { TestThemeSelection, ThemeTesterProps } from './theme-tester.types';

const inheritedSelection: TestThemeSelection = { source: 'inherit' };
const defaultAppearance: ResolvedThemeAppearance = {
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
};
const defaultFlexTheme = new FlexThemeReference();
const defaultFluentTheme = new ThemeReference(getDefaultLegacyTheme(defaultAppearance), (_theme, appearance) =>
  getDefaultLegacyTheme(appearance ?? defaultAppearance),
);

function sameSelection(left: TestThemeSelection | undefined, right: TestThemeSelection): boolean {
  if (!left || left.source !== right.source) {
    return false;
  }
  if (left.source === 'inherit' || right.source === 'inherit') {
    return left.source === right.source;
  }
  return (
    left.appearance.colorScheme === right.appearance.colorScheme &&
    left.appearance.contrast === right.appearance.contrast &&
    left.appearance.interfaceLevel === right.appearance.interfaceLevel
  );
}

export function ThemeTester({
  children,
  selection: controlledSelection,
  defaultSelection,
  onSelectionChange,
  testID,
  testIDPrefix = testID ?? 'theme-tester',
  style,
  ref,
  ...rootProps
}: ThemeTesterProps) {
  const [uncontrolledSelection, setUncontrolledSelection] = React.useState(defaultSelection ?? inheritedSelection);
  const controlled = controlledSelection !== undefined;
  const selection = controlled ? controlledSelection : uncontrolledSelection;

  const changeSelection = React.useCallback(
    (next: TestThemeSelection) => {
      if (sameSelection(selection, next)) {
        return;
      }
      onSelectionChange?.(next);
      if (!controlled) {
        setUncontrolledSelection(next);
      }
    },
    [controlled, onSelectionChange, selection],
  );

  const theme = selection.source === 'inherit' ? undefined : selection.source === 'flex' ? defaultFlexTheme : defaultFluentTheme;
  const appearance = selection.source === 'inherit' ? undefined : selection.appearance;

  return (
    <ThemedRoot {...rootProps} appearance={appearance} ref={ref} style={[styles.root, style]} testID={testID} theme={theme}>
      <ThemeTesterContent onSelectionChange={changeSelection} selection={selection} testIDPrefix={testIDPrefix}>
        {children}
      </ThemeTesterContent>
    </ThemedRoot>
  );
}

ThemeTester.displayName = 'ThemeTester';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

function ThemeTesterContent({
  children,
  onSelectionChange,
  selection,
  testIDPrefix,
}: React.PropsWithChildren<{
  onSelectionChange: (selection: TestThemeSelection) => void;
  selection: TestThemeSelection;
  testIDPrefix: string;
}>) {
  const contentStyles = getContentStyles(useThemeState());
  return (
    <View style={contentStyles.root}>
      <ThemePicker onSelectionChange={onSelectionChange} selection={selection} testIDPrefix={testIDPrefix} />
      <View style={contentStyles.children}>{children}</View>
    </View>
  );
}

const getContentStyles = themedStyleSheetFactory('ThemeTesterContent', ({ tokens }) =>
  StyleSheet.create({
    root: {
      backgroundColor: tokens.color.surfaceNeutralFar,
      flex: 1,
    },
    children: {
      flex: 1,
    },
  }),
);
