import { Theme } from '@fluentui-react-native/theme-types';
import { composeFactory, ComposeFactoryOptions, ComposeFactoryComponent, UseStyledSlots } from '@fluentui-react-native/composition';
import { themeHelper } from './themeHelper';

/**
 * This is an object used purely for configuring the typings on composable.  It is not necessary to define
 * the type via the IComposableType interface, this is simply the format used to extract the type info.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface ComposeType<TProps, TSlotProps, TTokens, TStatics = object> {
  props: TProps;
  slotProps: TSlotProps;
  tokens: TTokens;
  statics: TStatics;
}

/** fragments used in type extraction */
type PropsFragment<TProps> = { props: TProps };
type SlotPropsFragment<TSlotProps> = { slotProps: TSlotProps };
type TokensFragment<TTokens> = { tokens: TTokens };

// eslint-disable-next-line @typescript-eslint/ban-types
type StaticsFragment<TStatics extends object> = { statics: TStatics };

/** Extraction types that get the various interface types from IComposableType */
export type ExtractProps<T> = T extends PropsFragment<infer U> ? U : never;
export type ExtractSlotProps<T> = T extends SlotPropsFragment<infer U> ? U : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ExtractTokens<T> = T extends TokensFragment<infer U> ? U : object;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ExtractStatics<T> = T extends StaticsFragment<infer U> ? U : object;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ComposeOptions<TProps, TSlotProps, TTokens, TStatics extends object> = ComposeFactoryOptions<
  TProps,
  TSlotProps,
  TTokens,
  Theme,
  TStatics
>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ComposableComponent<TProps, TSlotProps, TTokens, TStatics extends object> = ComposeFactoryComponent<
  TProps,
  TSlotProps,
  TTokens,
  Theme,
  TStatics
>;

export type UseSlots<T> = UseStyledSlots<ExtractProps<T>, ExtractSlotProps<T>>;

export function compose<T>(
  options: ComposeOptions<ExtractProps<T>, ExtractSlotProps<T>, ExtractTokens<T>, ExtractStatics<T>>,
  base?: ComposableComponent<ExtractProps<T>, ExtractSlotProps<T>, ExtractTokens<T>, ExtractStatics<T>>,
): ComposableComponent<ExtractProps<T>, ExtractSlotProps<T>, ExtractTokens<T>, ExtractStatics<T>> {
  return composeFactory(options, themeHelper, base);
}
