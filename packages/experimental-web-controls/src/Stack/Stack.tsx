/** @jsx withSlots */
import * as React from 'react';
import { buildStackRootStyles, buildStackInnerStyles } from './Stack.styles';
import { IStackComponent, IStackRenderData, IStackSlotProps } from './Stack.types';
import { StackItem } from './StackItem/StackItem';
import { compose } from '@uifabricshared/foundation-compose';
import { withSlots, ISlots, atomicUsePrepareProps } from '@uifabricshared/foundation-composable';

const render: IStackComponent['render'] = (
  Slots: ISlots<IStackSlotProps>,
  renderData: IStackRenderData,
  ...children: React.ReactNode[]
) => {
  const wrap = renderData.slotProps && renderData.slotProps.root.wrap;

  if (wrap) {
    return (
      <Slots.root>
        <Slots.inner>{children}</Slots.inner>
      </Slots.root>
    );
  }

  return <Slots.root>{children}</Slots.root>;
};

const StackStatics = {
  Item: StackItem
};

export const Stack = compose<IStackComponent>({
  displayName: 'Stack',
  settings: ['RNFStack'],
  statics: StackStatics,
  usePrepareProps: atomicUsePrepareProps,
  slots: {
    root: { slotType: 'div', styleFactories: [buildStackRootStyles] },
    inner: { slotType: 'div', styleFactories: [buildStackInnerStyles] }
  },
  render
});

export default Stack;
