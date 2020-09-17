/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { ViewProps } from 'react-native';
import * as React from 'react';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const activityIndicatorName = 'MSFActivityIndicatorView';

const NativeActivityIndicatorView = ensureNativeComponent(activityIndicatorName);

export type ActivityIndicatorTokens = {
  color?: string;
};

export type NativeActivityIndicatorViewProps = ViewProps & ActivityIndicatorTokens;

export type ActivityIndicatorProps = ViewProps & {
  hidesWhenStopped?: boolean;
};

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
    const Root = useSlots(props).root;
    return (rest: NativeActivityIndicatorViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});
