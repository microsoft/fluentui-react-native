import type { GetMemoValue } from '@fluentui-react-native/framework-base/memo-cache';
import type { HasLayer, TokenSettings } from '@fluentui-react-native/use-tokens';
import { applyPropsToTokens, applyTokenLayers, buildUseTokens } from '@fluentui-react-native/use-tokens';

import type { TokensThatAreAlsoProps, BuildSlotProps } from './buildProps';
import { refinePropsFunctions } from './buildProps';

/**
 * Options used to build up a useStyling hook
 */
export type UseStylingOptions<TProps, TSlotProps, TTokens, TTheme> = {
  /**
   * Baseline tokens for this component
   */
  tokens?: TokenSettings<TTokens, TTheme>[];

  /**
   * States that might be applied for the component like disabled or hovered, these should be listed
   * in the order that they should be applied
   */
  states?: (keyof TTokens)[];

  /**
   * Functions which build up the props for each slot
   */
  slotProps?: BuildSlotProps<TSlotProps, TTokens, TTheme>;

  /**
   * Which props should be considered to be tokens.
   * - If an array of keys this will ensure these props are promoted to tokens
   * - If true all props will be added to tokens, if false or not specified no props will be treated as tokens
   */
  tokensThatAreAlsoProps?: TokensThatAreAlsoProps<TTokens>;

  /** purely used to make type inferencing work correctly so the hook builder can pick up TProps from this type */
  _propsType?: TProps;
};

/**
 * Signature for the use styling hook
 */
export type UseStyling<TProps, TSlotProps> = (props: TProps, lookup?: HasLayer) => TSlotProps;

/**
 * Helper object which injects theme specific functionality
 */
export type ThemeHelper<TTheme> = {
  /** query the theme from the context, or from a global if your system doesn't use theming */
  useTheme: () => TTheme;

  /** lookup info for the component in the theme */
  getComponentInfo: (theme: TTheme, name: string) => any;
};

/**
 * Produce the final slot props for the styled hook
 *
 * @param styles - refined style functions or props to use for processing
 * @param tokens - token inputs for the style functions
 * @param theme - theme to resolve against
 * @param cache - cache to use for the base of slot caching
 */
function resolveToSlotProps<TSlotProps, TTokens, TTheme>(
  styles: BuildSlotProps<TSlotProps, TTokens, TTheme>,
  tokens: TTokens,
  theme: TTheme,
  cache: GetMemoValue<TTokens>,
): TSlotProps {
  const slotProps = {};
  Object.keys(styles).forEach((key) => {
    const style = styles[key];
    slotProps[key] = typeof style === 'function' ? style(tokens, theme, cache(null, [key])[1]) : style;
  });
  return slotProps as TSlotProps;
}

/**
 * Construct a useStyling hook which returns styled slot props based on props and tokens defined in options and in the theme
 *
 * @param options - options which drive behavior for the generated styling hook
 * @param themeHelper - injected theme functionality
 */
export function buildUseStyling<TProps, TSlotProps, TTokens, TTheme>(
  options: UseStylingOptions<TProps, TSlotProps, TTokens, TTheme>,
  themeHelper: ThemeHelper<TTheme>,
): UseStyling<TProps, TSlotProps> {
  // create a cache instance for this use styling implementation
  const { useTheme, getComponentInfo } = themeHelper;
  const { tokens, tokensThatAreAlsoProps: tokenProps } = options;
  const styles = refinePropsFunctions(options.slotProps || {}, tokenProps);
  const useTokens = buildUseTokens<TTokens, TTheme>(getComponentInfo, ...tokens);

  return (props: TProps, lookup?: HasLayer) => {
    // query the theme
    const theme = useTheme();

    // get the merged tokens from the theme
    let [mergedTokens, cache] = useTokens(theme);

    // resolve overrides as appropriate
    if (options.states) {
      [mergedTokens, cache] = applyTokenLayers(mergedTokens, options.states as string[], cache, lookup || ((val) => props[val]));
    }

    // now resolve tokens
    if (typeof tokenProps === 'object' && Array.isArray(tokenProps)) {
      [mergedTokens, cache] = applyPropsToTokens(props, mergedTokens, cache, tokenProps);
    } else if (tokenProps === 'all') {
      mergedTokens = { ...mergedTokens, ...props };
    }

    // finally produce slotProps from calling the style functions on each entry
    return resolveToSlotProps(styles, mergedTokens, theme, cache);
  };
}
