import type { Theme } from '@fluentui-react-native/theme-types';
import type { StagedRender } from '@fluentui-react-native/framework-base';
import { stagedComponent } from '@fluentui-react-native/framework-base';
import type { CustomizableComponent } from '@fluentui-react-native/use-tokens';

import type { TokenSettings } from './useStyling';
import type { UseTokens } from './useTokens';

/**
 * Utility function which can create function components that can be tree compressed (using the stagedRender pattern),
 * and also have customize functionality.
 * @param fn StagedRender function that defines your component
 * @param useTokens a hook function to build a set of tokens from a passed in theme as well as a cache object
 * @returns A tree compressed function component with the `.customize` method exposed to it
 */
export function compressible<TProps, TTokens>(
  fn: StagedRender<TProps>,
  useTokens: UseTokens<TTokens>,
): CustomizableComponent<TProps, TTokens, Theme> {
  type ThisComponent = CustomizableComponent<TProps, TTokens, Theme>;

  const injectedWrapper = (props: TProps) => fn(props, useTokens);
  const component = stagedComponent(injectedWrapper) as ThisComponent;

  component.customize = (...tokens: TokenSettings<TTokens>[]) => {
    const useTokensNew = useTokens.customize(...tokens);
    return compressible(fn, useTokensNew);
  };

  return component;
}
