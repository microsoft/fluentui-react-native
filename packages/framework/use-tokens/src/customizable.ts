import type React from 'react';

import type { TokenSettings, UseTokens } from './buildUseTokens';

/**
 * A component implementation, with a use tokens hook passed in. Implementing it this way allows the useTokens hook to be
 * modified by the customization handler
 */
export type InjectableComponent<TProps, TTokens, TTheme> = (
  props: TProps,
  useTokens: UseTokens<TTokens, TTheme>,
) => React.JSX.Element | null;

/**
 * A component with an attached customize function, used to create alternatively styled versions of the component
 */
export type CustomizableComponent<TProps, TTokens, TTheme> = React.FunctionComponent<TProps> & {
  customize: (...tokens: TokenSettings<TTokens, TTheme>[]) => CustomizableComponent<TProps, TTokens, TTheme>;
};

/**
 * Function helper for easily creating a customizable component based on the useTokens hook
 *
 * @param injectable - a function component implementation, written in (props, useTokens) => JSX.Element form
 * @param useTokens - a hook function, generally built via buildUseTokens, used to retrieve design tokens for the component
 *
 * @returns - a function component that has a static function called customize attached. Customize will return a
 *            new component (which can also be customized)
 */
export function customizable<TProps, TTokens, TTheme>(
  injectable: InjectableComponent<TProps, TTokens, TTheme>,
  useTokens: UseTokens<TTokens, TTheme>,
): CustomizableComponent<TProps, TTokens, TTheme> {
  const component = (props: TProps) => injectable(props, useTokens);
  component.customize = (...tokens: TokenSettings<TTokens, TTheme>[]) => {
    const useTokensNew = useTokens.customize(...tokens);
    return customizable(injectable, useTokensNew);
  };
  return component;
}
