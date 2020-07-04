import { UseStylingOptions, ThemeHelper, HasLayer, buildUseStyling } from '@fluentui-react-native/use-styling';
import { UseSlotOptions, ComposableFunction, buildUseSlots, Slots, stagedComponent } from '@fluentui-react-native/use-slots';
import { immutableMergeCore, MergeOptions } from '@uifabricshared/immutable-merge';

export type UseStyledSlots<TProps, TSlotProps> = (props: TProps, lookup?: HasLayer) => Slots<TSlotProps>;

export type ComposeOptions<TProps, TSlotProps, TTokens, TTheme> = UseStylingOptions<TProps, TSlotProps, TTokens, TTheme> &
  UseSlotOptions<TSlotProps> & {
    /**
     * Includes from UseStylingOptions:
     *
     */
    displayName?: string;

    /**
     * staged render function that takes props and a useSlots hook as an input
     */
    render: (props: TProps, useSlots: UseStyledSlots<TProps, TSlotProps>) => React.FunctionComponent<TProps>;
  };

export type ComposableComponent<TProps, TSlotProps, TTokens, TTheme> = ComposableFunction<TProps> & {
  __options: ComposeOptions<TProps, TSlotProps, TTokens, TTheme>;
  customize: (
    tokens: UseStylingOptions<TProps, TSlotProps, TTokens, TTheme>['tokens']
  ) => ComposableComponent<TProps, TSlotProps, TTokens, TTheme>;
};

/**
 * options get deep merged except the tokens array gets appended
 */
const mergeOptions: MergeOptions = {
  tokens: 'appendArray',
  object: true
};

export function compose<TProps, TSlotProps, TTokens, TTheme>(
  options: ComposeOptions<TProps, TSlotProps, TTokens, TTheme>,
  themeHelper: ThemeHelper<TTheme>,
  base?: ComposableComponent<TProps, TSlotProps, TTokens, TTheme>
): ComposableComponent<TProps, TSlotProps, TTokens, TTheme> {
  type LocalComponent = ComposableComponent<TProps, TSlotProps, TTokens, TTheme>;
  type LocalOptions = ComposeOptions<TProps, TSlotProps, TTokens, TTheme>;

  // merge options together if a base is specified
  options = base && base.__options ? immutableMergeCore(mergeOptions, base.__options, options) : { ...options };

  // build styling if styling options are specified
  options.useStyling = options.styles || options.tokens ? buildUseStyling(options, themeHelper) : () => ({} as TSlotProps);

  // build the slots hook, which will use the styling hook if it has been built
  const useSlots = buildUseSlots(options) as UseStyledSlots<TProps, TSlotProps>;

  // build the staged component
  const component = stagedComponent<TProps>(props => options.render(props, useSlots)) as LocalComponent;

  // attach additional props to the returned component
  component.displayName = options.displayName;
  component.__options = options;
  component.customize = (tokens: LocalOptions['tokens']) =>
    compose<TProps, TSlotProps, TTokens, TTheme>(
      immutableMergeCore(mergeOptions, options, { tokens: tokens } as LocalOptions),
      themeHelper
    );

  return component;
}
