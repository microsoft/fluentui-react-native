import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';

/**
 * Style sheets will be cached in the theme itself under a unique symbol value.  Note that the requirement
 * here is that if theme values (such as colors) change, a new theme object will be created.
 *
 * This uses a symbol to avoid conflicts.  This also ensures that when the theme is copied via assign or spread
 * the cache values don't come with it.
 */
const _keyForSheetsInTheme = Symbol('StyleSheets');

/**
 * If a user has a system where there may or may not be a theme then this is a fallback cache to create
 * style sheets and cache them for the no-theme case
 */
const _cacheForNoTheme = {};

/**
 * Signature for inputs and outputs for StyleSheet.create.  This is a collection of named styles which can
 * be used as inputs for the style property on components and matches what StyleSheet.create accepts
 */
//type IInputStyles = { [key: string]: ViewStyle | TextStyle | ImageStyle };
export type INamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

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
 */
export function themedStyleSheet<TStyles extends INamedStyles<TStyles>, TTheme>(
  generator: (theme: TTheme) => INamedStyles<TStyles>
): (theme: TTheme) => INamedStyles<TStyles> {
  const _keyForThisSheet = Symbol();
  return (theme: TTheme) => {
    const cache = theme ? (theme[_keyForSheetsInTheme] = theme[_keyForSheetsInTheme] || {}) : _cacheForNoTheme;
    cache[_keyForThisSheet] = cache[_keyForThisSheet] || StyleSheet.create(generator(theme));
    return cache[_keyForThisSheet];
  };
}
