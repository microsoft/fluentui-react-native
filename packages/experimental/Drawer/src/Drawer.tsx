/** @jsx withSlots */
import * as React from 'react';
import { drawerName, DrawerTokens, DrawerProps, NativeDrawerProps, DrawerType} from './Drawer.types';
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { findNodeHandle} from 'react-native';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const FRNDrawer = ensureNativeComponent('FRNDrawer');

export const Drawer = compose<DrawerType>({
  displayName: drawerName,
  tokens: [drawerName],
  slots: { root: FRNDrawer },
  slotProps: {
    root: buildProps<NativeDrawerProps, DrawerTokens>(() => ({
      style: {
      },
    })),
  },
  render: (props: DrawerProps, useSlots: UseSlots<DrawerType>) => {
    const { ...rest } = props;

    const rootProps = { ...rest };
    const Root = useSlots(props).root;
    return (rest: DrawerProps) => {
      return <Root {...mergeProps(rootProps, rest)} />;
    };
  },
});
export default Drawer;