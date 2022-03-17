/** @jsx withSlots */
import * as React from 'react';
import { drawerName, DrawerTokens, DrawerProps, DrawerType} from './Drawer.types';
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { findNodeHandle} from 'react-native';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const FRNDrawer = ensureNativeComponent('FRNDrawer');

export const Drawer = compose<DrawerType>({
  displayName: drawerName,
  tokens: [drawerName],
  slots: { root: FRNDrawer },
  slotProps: {
    root: buildProps<DrawerProps, DrawerTokens>(() => ({
      style: {
      },
    })),
  },
  render: (props: DrawerProps, useSlots: UseSlots<DrawerType>) => {

    const rootProps = props;
    const Root = useSlots(props).root;
    return (final: DrawerProps, ...children: React.ReactNode[]) => {
      return <Root {...mergeProps(rootProps, final)} >
        {children}
        </Root>;
    };
  },
});
export default Drawer;