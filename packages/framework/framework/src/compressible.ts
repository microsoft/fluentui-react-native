import { Theme } from '@fluentui-react-native/theme-types';
import { stagedComponent, StagedRender } from '@fluentui-react-native/use-slot';
import { CustomizableComponent } from '@fluentui-react-native/use-tokens';
import { UseTokens } from './useTokens';
import { TokenSettings } from './useStyling';

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
