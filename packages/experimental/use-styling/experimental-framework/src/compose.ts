import { ITheme } from '@uifabricshared/theming-ramp';
import {
  compose as composeBase,
  ComposeOptions as ComposeOptionsBase,
  ComposableComponent as ComposableComponentBase
} from '@fluentui-react-native/composition';
import { themeHelper } from './themeHelper';

/**
 * This is an object used purely for configuring the typings on composable.  It is not necessary to define
 * the type via the IComposableType interface, this is simply the format used to extract the type info.
 */
export interface ComposeType<TProps, TSlotProps, TTokens, TStatics = object> {
  props: TProps;
  slotProps: TSlotProps;
  tokens: TTokens;
}

/** fragments used in type extraction */
type PropsFragment<TProps> = { props: TProps };
type SlotPropsFragment<TSlotProps> = { slotProps: TSlotProps };
type TokensFragment<TTokens> = { tokens: TTokens };
type StaticsFragment<TStatics extends object> = { statics: TStatics };

/** Extraction types that get the various interface types from IComposableType */
export type ExtractProps<T> = T extends PropsFragment<infer U> ? U : never;
export type ExtractSlotProps<T> = T extends SlotPropsFragment<infer U> ? U : never;
export type ExtractTokens<T> = T extends TokensFragment<infer U> ? U : object;
export type ExtractStatics<T> = T extends StaticsFragment<infer U> ? U : object;

export type ComposeOptions<TProps, TSlotProps, TTokens> = ComposeOptionsBase<TProps, TSlotProps, TTokens, ITheme>;
export type ComposableComponent<TProps, TSlotProps, TTokens> = ComposableComponentBase<TProps, TSlotProps, TTokens, ITheme>;

export function compose<T>(
  options: ComposeOptions<ExtractProps<T>, ExtractSlotProps<T>, ExtractTokens<T>> & { statics?: ExtractStatics<T> },
  base?: ComposableComponent<ExtractProps<T>, ExtractSlotProps<T>, ExtractTokens<T>>
): ComposableComponent<ExtractProps<T>, ExtractSlotProps<T>, ExtractTokens<T>> & ExtractStatics<T> {
  const result = composeBase(options, themeHelper, base);
  if (options.statics) {
    Object.assign(result, options.statics);
  }
  return result as any;
}
