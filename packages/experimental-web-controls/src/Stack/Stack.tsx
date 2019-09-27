/** @jsx withSlots */
import { buildStackRootStyles, buildStackInnerStyles } from './Stack.styles';
import { IStackRenderData, IStackSlotProps, IStackStatics, IStackProps } from './Stack.types';
import { StackItem } from './StackItem/StackItem';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { withSlots, ISlots } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';

export const Stack = compose<IStackProps, IStackSlotProps, object, IStackStatics>({
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
  usePrepareProps: (userProps: IStackProps, useStyling: IUseComposeStyling<IStackSlotProps>) => {
    const { children, ...props } = userProps;
    const styleProps = useStyling(props);
    return {
      slotProps: mergeSettings(styleProps, { root: props }),
      children
    };
  },
  slots: {
    root: { slotType: 'div', styleFactories: [buildStackRootStyles] },
    inner: { slotType: 'div', styleFactories: [buildStackInnerStyles] }
  },
  render: (Slots: ISlots<IStackSlotProps>, renderData: IStackRenderData) => {
    const wrap = renderData.slotProps && renderData.slotProps.root.wrap;
    const children = renderData.children;

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
