import * as React from 'react';
import { stackTokenProcessor } from './Stack.styles';
import { IStackComponent, IStackRenderData } from './Stack.types';
import { StackItem } from './StackItem/StackItem';
import { compose } from '@uifabric/foundation-compose';
import { renderSlot, IAsResolved } from '@uifabric/foundation-composable';

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
  className: 'RNFStack',
  tokens: [stackTokenProcessor],
  statics: StackStatics,
  slots: {
    root: 'div',
    inner: 'div'
  },
  view
});

export default Stack;
