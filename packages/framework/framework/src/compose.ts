import type { ComposeFactoryOptions, ComposeFactoryComponent, UseStyledSlots } from '@fluentui-react-native/composition';
import { composeFactory } from '@fluentui-react-native/composition';
import type { Theme } from '@fluentui-react-native/theme-types';
import type { ObjectBase } from '@fluentui-react-native/framework-base';

import { themeHelper } from './themeHelper';

/**
 * This is an object used purely for configuring the typings on composable.  It is not necessary to define
 * the type via the IComposableType interface, this is simply the format used to extract the type info.
 */
export interface ComposeType<TProps, TSlotProps, TTokens, TStatics = ObjectBase> {
  props: TProps;
  slotProps: TSlotProps;
  tokens: TTokens;
  statics: TStatics;
}

/** fragments used in type extraction */
type PropsFragment<TProps> = { props: TProps };
type SlotPropsFragment<TSlotProps> = { slotProps: TSlotProps };
type TokensFragment<TTokens> = { tokens: TTokens };

type StaticsFragment<TStatics extends ObjectBase> = { statics: TStatics };

/** Extraction types that get the various interface types from IComposableType */
export type ExtractProps<T> = T extends PropsFragment<infer U> ? U : never;
export type ExtractSlotProps<T> = T extends SlotPropsFragment<infer U> ? U : never;

export type ExtractTokens<T> = T extends TokensFragment<infer U> ? U : ObjectBase;

export type ExtractStatics<T> = T extends StaticsFragment<infer U> ? U : ObjectBase;

export type ComposeOptions<TProps, TSlotProps, TTokens, TStatics extends ObjectBase> = ComposeFactoryOptions<
  TProps,
  TSlotProps,
  TTokens,
  Theme,
  TStatics
>;

export type ComposableComponent<TProps, TSlotProps, TTokens, TStatics extends ObjectBase> = ComposeFactoryComponent<
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
