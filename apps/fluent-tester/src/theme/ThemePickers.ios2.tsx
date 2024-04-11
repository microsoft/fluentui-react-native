import * as React from 'react';
import { View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import type { Theme } from '@fluentui-react-native/framework';
import { useTheme } from '@fluentui-react-native/framework';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { MenuView } from '@react-native-menu/menu';
import type { MenuAction } from '@react-native-menu/menu';

import { themeChoices } from './applyTheme';
import type { ThemeNames } from './applyTheme';
import { testerTheme } from './CustomThemes';

export const themePickerStyles = themedStyleSheet((t: Theme) => {
  // picker, pickerItem, dropdown used in iOS dark mode
  return {
    pickerRoot: {
      flexDirection: 'row',
    },
    picker: {
      flexDirection: 'column',
      alignItems: 'center',
      padding: 4,
      flexShrink: 0,
    },
    pickerItem: {
      color: t.colors.bodyText,
    },
    dropdown: {
      height: 200,
      width: 90,
      fontSize: 12,
    },
  };
});

export const ThemePickers: React.FunctionComponent = () => {
  const themedStyles = themePickerStyles(useTheme());

  const onThemeSelected = React.useCallback((newTheme: string) => {
    testerTheme.themeName = newTheme as ThemeNames;
  }, []);

  const themeMenuOptions: MenuAction[] = themeChoices.map((themeChoice) => ({
    id: themeChoice.value,
    title: themeChoice.label,
    state: testerTheme.themeName === themeChoice.value ? 'on' : 'off',
  }));

  return (
    <View style={themedStyles.pickerRoot}>
      <MenuView
        title="Theme"
        onPressAction={({ nativeEvent }) => {
          onThemeSelected(nativeEvent.event);
        }}
        actions={themeMenuOptions}
      >
        <Button appearance="subtle">Theme</Button>
      </MenuView>
    </View>
  );
};
