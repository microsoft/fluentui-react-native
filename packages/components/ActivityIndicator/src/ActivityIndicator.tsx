/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { NativeModules, ViewProps } from 'react-native';
import * as React from 'react';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const activityIndicatorName = 'MSFActivityIndicatorView';

const NativeActivityIndicatorView = ensureNativeComponent(activityIndicatorName);

export type Size = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';

interface ExportedConstants {
  sizes: { [key in Size]: number };
}

const ExportedNativeConstants: ExportedConstants = NativeModules.MSFActivityIndicatorViewManager;

export type ActivityIndicatorTokens = {
  /**
   * Color of spinner
   */
  color?: string;
};

export type ActivityIndicatorProps = ViewProps & {
  /**
   * True if the spinner should stop animating when its not visible
   */
  hidesWhenStopped?: boolean;

  /**
   * True if animating (animating as soon as rendered by default)
   */
  animating?: boolean;

  /**
   * Supported spinner sizes (default small)
   */
  size?: Size;
};

export type NativeActivityIndicatorViewProps = ViewProps & ActivityIndicatorProps & ActivityIndicatorTokens;

interface ActivityIndicatorType {
  props: ActivityIndicatorProps;
  slotProps: { root: NativeActivityIndicatorViewProps };
  tokens: ActivityIndicatorTokens;
}

export const ActivityIndicator = compose<ActivityIndicatorType>({
  displayName: activityIndicatorName,
  tokens: [
    {
      color: 'rgb(145,145,145)',
    },
    activityIndicatorName,
  ],
  slotProps: {
    root: buildProps((tokens) => ({ ...tokens }), []),
  },
  slots: { root: NativeActivityIndicatorView },
  render: (props: NativeActivityIndicatorViewProps, useSlots: UseSlots<ActivityIndicatorType>) => {
    const size = ExportedNativeConstants.sizes[props.size || 'small'];
    const Root = useSlots(props).root;
    return (rest: NativeActivityIndicatorViewProps, children: React.ReactNode) => (
      <Root {...mergeProps(props, rest)} style={{ height: size, width: size }}>
        {children}
      </Root>
    );
  },
});
