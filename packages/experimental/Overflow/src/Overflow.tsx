/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './Overflow.styling';
import type { OverflowProps, OverflowType } from './Overflow.types';
import { overflowName } from './Overflow.types';
import { OverflowContext } from './OverflowContext';
import { OverflowMenu } from './OverflowMenu';
import { useOverflow } from './useOverflow';

export const Overflow = compose<OverflowType>({
  displayName: overflowName,
  ...stylingSettings,
  slots: {
    root: View,
  },
  useRender: (userProps: OverflowProps, useSlots: UseSlots<OverflowType>) => {
    const overflow = useOverflow(userProps);
    const Slots = useSlots(
      overflow.props,
      (layer) => layer === 'hidden' && !overflow.props.dontHideBeforeReady && !overflow.state.initialOverflowLayoutDone,
    );

    return (final: OverflowProps, ...children: React.ReactNode[]) => {
      const merged = mergeProps(overflow.props, final) as IViewProps;
      return (
        <OverflowContext.Provider value={overflow.state}>
          <Slots.root {...merged}>
            {children}
            <OverflowMenu />
          </Slots.root>
        </OverflowContext.Provider>
      );
    };
  },
});

export default Overflow;
