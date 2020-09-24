/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { NativeModules, ViewProps } from 'react-native';
import * as React from 'react';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const spinnerName = 'MSFSpinnerView';

const NativeSpinnerView = ensureNativeComponent(spinnerName);

export type Size = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';

interface ExportedConstants {
  sizes: { [key in Size]: number };
}

const ExportedNativeConstants: ExportedConstants = NativeModules.MSFSpinnerViewManager;

export type SpinnerTokens = {
  /**
   * Color of spinner
   */
  color?: string;

  /**
   * Supported spinner sizes
   */
  size?: Size;
};

export type SpinnerProps = ViewProps & {
  /**
   * True if the spinner should stop animating when its not visible
   */
  hidesWhenStopped?: boolean;

  /**
   * True if animating (animating as soon as rendered by default)
   */
  animating?: boolean;

  /**
   * Supported spinner sizes
   */
  size?: Size;
};

const tokensThatAreAlsoProps: (keyof SpinnerTokens)[] = ['size'];

export type NativeSpinnerViewProps = ViewProps & SpinnerProps & SpinnerTokens;

interface SpinnerType {
  props: SpinnerProps;
  slotProps: { root: NativeSpinnerViewProps };
  tokens: SpinnerTokens;
}

export const Spinner = compose<SpinnerType>({
  displayName: spinnerName,
  tokens: [
    {
      color: 'rgb(145,145,145)',
      size: 'small',
    },
    spinnerName,
  ],
  tokensThatAreAlsoProps,
  slots: { root: NativeSpinnerView },
  slotProps: {
    root: buildProps(
      (tokens) => ({
        color: tokens.color,
        style: {
          height: ExportedNativeConstants.sizes[tokens.size],
          width: ExportedNativeConstants.sizes[tokens.size],
        },
        animating: true,
      }),
      ['color', 'size'],
    ),
  },
  render: (props: NativeSpinnerViewProps, useSlots: UseSlots<SpinnerType>) => {
    const Root = useSlots(props).root;
    return (rest: NativeSpinnerViewProps, children: React.ReactNode) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});
