/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings } from './Stack.settings';
import { buildStackRootStyles, buildStackInnerStyles } from './Stack.tokens';
import { stackName } from './Stack.types';
import type { IStackRenderData, IStackProps, IStackSlotProps, IStackType } from './Stack.types';
import StackItem from './StackItem/StackItem';

// Needed for TS to understand that __jsiExecutorDescription exists.
declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace*/
  namespace NodeJS {
    interface Global {
      __jsiExecutorDescription: any;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

function _mixinStyle(style: StyleProp<ObjectBase> | undefined, mixin: ObjectBase): StyleProp<ObjectBase> {
  return style ? [style, mixin] : mixin;
}

const _styleKey = 'style';

const render = (Slots: ISlots<IStackSlotProps>, renderData: IStackRenderData, ...children: React.ReactNode[]): React.JSX.Element => {
  const { gap, horizontal, wrap } = renderData.state!;

  if (gap && gap > 0 && children && globalThis.__jsiExecutorDescription !== 'ChakraRuntime') {
    const extraStyle: ViewStyle = horizontal ? { marginLeft: gap } : { marginTop: gap };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TODO, fix typing error
    children = React.Children.map(children, (child: React.ReactChild, index: number) => {
      if (React.isValidElement(child) && index > 0) {
        const childProps = child.props as ObjectBase;
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
