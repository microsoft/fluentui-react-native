/** @jsx withSlots */
import * as React from 'react';
import StackItem from './StackItem/StackItem';
import { IStackRenderData, IStackProps, IStackSlotProps, stackName, IStackType } from './Stack.types';
import { View } from 'react-native';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { settings } from './Stack.settings';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { buildStackRootStyles, buildStackInnerStyles } from './Stack.tokens';
import { StyleProp, ViewStyle } from 'react-native';

function _mixinStyle(style: StyleProp<object> | undefined, mixin: object): StyleProp<object> {
  return style ? [style, mixin] : mixin;
}

const _styleKey = 'style';

const render = (Slots: ISlots<IStackSlotProps>, renderData: IStackRenderData, ...children: React.ReactNode[]): JSX.Element => {
  const { gap, horizontal, wrap } = renderData.state!;

  if (gap && gap > 0 && children) {
    const extraStyle: ViewStyle = horizontal ? { marginLeft: gap } : { marginTop: gap };
    /* eslint-disable @typescript-eslint/ban-ts-ignore */
    // @ts-ignore - TODO, fix typing error
    children = React.Children.map(children, (child: React.ReactChild, index: number) => {
      if (React.isValidElement(child) && index > 0) {
        const childProps = child.props;
        const extraProps = { style: _mixinStyle(childProps[_styleKey], extraStyle) };
        return React.cloneElement(child, {
          ...childProps,
          ...extraProps,
        });
      }
      return child;
    });
  }

  if (wrap) {
    return (
      <Slots.root>
        <Slots.inner>{children}</Slots.inner>
      </Slots.root>
    );
  }
  return <Slots.root>{children}</Slots.root>;
};

export const Stack = compose<IStackType>({
  displayName: stackName,
  settings,
  statics: {
    Item: StackItem,
  },
  usePrepareProps: (props: IStackProps, useStyling: IUseComposeStyling<IStackType>) => {
    const { gap, horizontal, wrap, ...rest } = props;
    return {
      slotProps: mergeSettings<IStackType['slotProps']>(useStyling(props), { root: rest }),
      state: { gap, horizontal, wrap },
    };
  },
  render: render,
  slots: {
    root: { slotType: View, filter: filterViewProps },
    inner: { slotType: View, filter: filterViewProps },
  },
  styles: {
    root: [buildStackRootStyles, backgroundColorTokens, borderTokens],
    inner: [buildStackInnerStyles],
  },
});

export default Stack;
