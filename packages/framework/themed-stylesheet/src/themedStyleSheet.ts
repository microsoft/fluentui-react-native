import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import { getMemoCache } from '@fluentui-react-native/framework-base';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

/**
 * Signature for inputs and outputs for StyleSheet.create.  This is a collection of named styles which can
 * be used as inputs for the style property on components and matches what StyleSheet.create accepts
 */
//type IInputStyles = { [key: string]: ViewStyle | TextStyle | ImageStyle };
export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * A convenience wrapper to create style sheets which depend upon values in a theme, and use them in a manner
 * where they are built and cached once per theme.  The return value of this routine will be a function
 * which takes a theme and returns the appropriate style sheet.
 *
 * Note that this can handle a null/undefined theme as long as the functions are written this way.  As an
 * example the following usage requires a theme to exist:
 *
 *  const getStyles = themedStyleSheet(t => {
 *    baseStyle: { color: t.palette.buttonForeground }
 *  });
 *
 * This is fine if the theming methodology will always have a default theme.  If the theming implementation
 * may or may not have a theme the above should be written as:
 *
 *  const getStyles = themedStyleSheet(t => {
 *    baseStyle: {
 *      color: t ? t.palette.buttonForeground : 'blue'
 *    }
 *  });
 *
 * Either way the usage pattern, given either of the above, would be:
 *  const theme = useContext(MyThemeProvider);
 *  const styles = getStyles(theme);
 *
 * @param generator - a function which will get run once per theme to create a cached style sheet.
 *
 */

export function themedStyleSheet<TStyles extends NamedStyles<TStyles>, TTheme extends ObjectBase>(
  generator: (theme: TTheme) => NamedStyles<TStyles>,
): (theme: TTheme) => NamedStyles<TStyles> {
  // create a memo cache for this themed stylesheet
  const cache = getMemoCache();

  // now return a theme => styles function
  return (theme: TTheme) => {
    return cache(() => StyleSheet.create(generator(theme)), [theme])[0];
  };
}
