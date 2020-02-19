/** @jsx withSlots */
import * as React from 'react';
import { buildStackRootStyles, buildStackInnerStyles } from './Stack.styles';
import { IStackRenderData, IStackSlotProps, IStackType } from './Stack.types';
import { StackItem } from './StackItem/StackItem';
import { compose } from '@uifabricshared/foundation-compose';
import { withSlots, ISlots, atomicUsePrepareProps } from '@uifabricshared/foundation-composable';

export const Stack = compose<IStackType>({
  displayName: 'Stack',
  settings: [
    {
      root: {
        style: {
          display: 'flex',
          flexWrap: 'nowrap',
          width: 'auto',
          overflow: 'visible',
          height: '100%'
        }
      },
      inner: {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          overflow: 'visible',
          boxSizing: 'border-box',
          maxWidth: '100vw'
        }
      }
    },
    'RNFStack'
  ],
  statics: { Item: StackItem },
  usePrepareProps: atomicUsePrepareProps,
  slots: {
    root: { slotType: 'div' },
    inner: { slotType: 'div' }
  },
  styles: {
    root: buildStackRootStyles,
    inner: buildStackInnerStyles
  },
  render: (Slots: ISlots<IStackSlotProps>, renderData: IStackRenderData, ...children: React.ReactNode[]) => {
    const wrap = renderData.slotProps && renderData.slotProps.root.wrap;

    if (wrap) {
      return (
        <Slots.root>
          <Slots.inner>{children}</Slots.inner>
        </Slots.root>
      );
    }

    return <Slots.root>{children}</Slots.root>;
  }
});

export default Stack;
