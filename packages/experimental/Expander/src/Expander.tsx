/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, buildProps } from '@fluentui-react-native/framework';

import type { ExpanderType, ExpanderProps, ExpanderViewProps } from './Expander.types';
import { expanderName } from './Expander.types';
import ExpanderComponent from './ExpanderNativeComponent';

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const Expander = compose<ExpanderType>({
  displayName: expanderName,
  tokens: [{}, expanderName],
  slotProps: {
    root: buildProps((tokens) => ({ ...tokens })),
  },
  slots: { root: ExpanderComponent },
  useRender: (userProps: ExpanderProps, useSlots: UseSlots<ExpanderType>) => {
    const Root = useSlots(userProps).root;
    const [expandedState, setExpandedState] = React.useState(userProps.expanded);
    const expanderHeight = expandedState ? userProps.expandedHeight : userProps.collapsedHeight;

    const _onCollapsing = async () => {
      userProps.onCollapsing?.();
      // Need to delay the height change so that the animation runs
      await delay(175);
      setExpandedState(false);
    };

    const _onExpanding = () => {
      setExpandedState(true);
      userProps.onExpanding?.();
    };

    return (rest: ExpanderViewProps, ...children: React.ReactNode[]) => (
      <Root {...mergeProps(userProps, rest)} height={expanderHeight} onCollapsing={_onCollapsing} onExpanding={_onExpanding}>
        {children}
      </Root>
    );
  },
});
