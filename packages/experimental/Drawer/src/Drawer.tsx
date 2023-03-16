/** @jsx withSlots */
import * as React from 'react';

import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';

import type { DrawerTokens, DrawerProps, DrawerType } from './Drawer.types';
import { drawerName } from './Drawer.types';

const FRNDrawer = ensureNativeComponent('FRNDrawer');

export const Drawer = compose<DrawerType>({
  displayName: drawerName,
  tokens: [drawerName],
  slots: { root: FRNDrawer },
  slotProps: {
    root: buildProps<DrawerProps, DrawerTokens>(() => ({})),
  },
  useRender: (props: DrawerProps, useSlots: UseSlots<DrawerType>) => {
    const rootProps = props;
    const Root = useSlots(props).root;
    return (final: DrawerProps, ...children: React.ReactNode[]) => {
      return <Root {...mergeProps(rootProps, final)}>{children}</Root>;
    };
  },
});
export default Drawer;
