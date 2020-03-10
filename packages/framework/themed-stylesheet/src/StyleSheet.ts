import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';

type IWithStyle<TStyles extends INamedStyles<TStyles>> = {
  styles?: INamedStyles<TStyles>;
};

/**
 * Retrieve or create/set a cache value corresponding to this theme
 * @param map - WeakMap to use for value lookups
 * @param theme - theme to use as the key into the map
 */
function getCacheEntry<TStyles extends INamedStyles<TStyles>, TTheme extends object>(
  map: WeakMap<TTheme, IWithStyle<TStyles>>,
  theme: TTheme
): IWithStyle<TStyles> {
  let cache = map.get(theme);
  if (!cache) {
    cache = {};
    map.set(theme, cache);
  }
  return cache;
}

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
export function themedStyleSheet<TStyles extends INamedStyles<TStyles>, TTheme extends object>(
  generator: (theme: TTheme) => INamedStyles<TStyles>
): (theme: TTheme) => INamedStyles<TStyles> {
  const noTheme = {} as TTheme;
  const themeMap = new WeakMap<TTheme, object>();
  return (theme: TTheme) => {
    const cache = getCacheEntry<TStyles, TTheme>(themeMap, theme || noTheme);
    cache.styles = cache.styles || StyleSheet.create(generator(theme));
    return cache.styles;
  };
}
