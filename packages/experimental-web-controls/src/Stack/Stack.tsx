import * as React from 'react';
import { buildStackRootStyles, buildStackInnerStyles } from './Stack.styles';
import { IStackComponent, IStackRenderData } from './Stack.types';
import { StackItem } from './StackItem/StackItem';
import { compose } from '@uifabricshared/foundation-compose';
import { renderSlot, IAsResolved } from '@uifabricshared/foundation-composable';

const view: IStackComponent['view'] = (renderData: IAsResolved<IStackRenderData>, ...children: React.ReactNode[]) => {
  const { props, slots } = renderData;
  const { wrap } = props;
  const inputChildren = children || props.children;

  if (wrap) {
    return renderSlot(slots.root, renderSlot(slots.inner, inputChildren));
  }

  return renderSlot(slots.root, inputChildren);
};

const StackStatics = {
  Item: StackItem
};

export const Stack = compose<IStackComponent>({
  displayName: 'Stack',
  settings: ['RNFStack'],
  statics: StackStatics,
  slots: {
    root: { slotType: 'div', styleFactories: [buildStackRootStyles] },
    inner: { slotType: 'div', styleFactories: [buildStackInnerStyles] }
  },
  view
});

export default Stack;
