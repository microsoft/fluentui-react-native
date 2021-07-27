import { UseStylingOptions, TokenSettings, ThemeHelper, HasLayer, buildUseStyling } from '@fluentui-react-native/use-styling';
import { ComposableFunction, stagedComponent } from '@fluentui-react-native/use-slot';
import { UseSlotOptions, buildUseSlots, Slots } from '@fluentui-react-native/use-slots';
import { immutableMergeCore, MergeOptions } from '@fluentui-react-native/immutable-merge';

export type UseStyledSlots<TProps, TSlotProps> = (props: TProps, lookup?: HasLayer) => Slots<TSlotProps>;

export type ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics extends object = object> = UseStylingOptions<
  TProps,
  TSlotProps,
  TTokens,
  TTheme
> &
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

    /**
     * optional statics to attach to the component
     */
    statics?: TStatics;
  };

export type ComposeFactoryComponent<TProps, TSlotProps, TTokens, TTheme, TStatics extends object = object> = ComposableFunction<TProps> & {
  __options: ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics>;
  customize: (...tokens: TokenSettings<TTokens, TTheme>[]) => ComposeFactoryComponent<TProps, TSlotProps, TTokens, TTheme, TStatics>;
  compose: (
    options: Partial<ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics>>,
  ) => ComposeFactoryComponent<TProps, TSlotProps, TTokens, TTheme, TStatics>;
} & TStatics;

/**
 * options get deep merged except the tokens array gets appended
 */
const mergeOptions: MergeOptions = {
  tokens: 'appendArray',
  object: true,
};

export function composeFactory<TProps, TSlotProps, TTokens, TTheme, TStatics extends object = object>(
  options: ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics>,
  themeHelper: ThemeHelper<TTheme>,
  base?: ComposeFactoryComponent<TProps, TSlotProps, TTokens, TTheme, TStatics>,
): ComposeFactoryComponent<TProps, TSlotProps, TTokens, TTheme, TStatics> {
  type LocalComponent = ComposeFactoryComponent<TProps, TSlotProps, TTokens, TTheme, TStatics>;
  type LocalOptions = ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics>;

  // merge options together if a base is specified
  const baseOptions: LocalOptions = base?.__options as LocalOptions;
  options = baseOptions ? immutableMergeCore<LocalOptions>(mergeOptions, baseOptions, options) : { ...options };

  // build styling if styling options are specified
  options.useStyling = options.slotProps || options.tokens ? buildUseStyling(options, themeHelper) : () => ({} as TSlotProps);

  // build the slots hook, which will use the styling hook if it has been built
  const useSlots = buildUseSlots(options) as UseStyledSlots<TProps, TSlotProps>;

  // build the staged component
  const component = stagedComponent<TProps>((props) => options.render(props, useSlots)) as LocalComponent;

  // attach additional props to the returned component
  component.displayName = options.displayName;
  component.__options = options;
  component.customize = (...tokens: LocalOptions['tokens']) =>
    composeFactory<TProps, TSlotProps, TTokens, TTheme, TStatics>(
      immutableMergeCore(mergeOptions, options, { tokens: tokens } as LocalOptions),
      themeHelper,
    );

  component.compose = (customOptions: Partial<LocalOptions>) =>
    composeFactory<TProps, TSlotProps, TTokens, TTheme, TStatics>(
      immutableMergeCore(mergeOptions, options, customOptions) as LocalOptions,
      themeHelper,
    );

  // attach statics if specified
  if (options.statics) {
    Object.assign(component, options.statics);
  }

  return component;
}
