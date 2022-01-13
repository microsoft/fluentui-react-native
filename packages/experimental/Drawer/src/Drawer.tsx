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
    const { target, showDrawer, toggleShow, /*contentRef,*/ ...rest} = props;
    const [nativeTarget, setNativeTarget] = React.useState<number>(undefined);
    //const [contentId, setContentId] = React.useState<number | null>(null);

    React.useLayoutEffect(() => {
      if (target?.current) {
        // Pass the tagID for a valid ref `target`
        const node = findNodeHandle(target.current);
        setNativeTarget(node);
      }
    }, [target]);

    React.useEffect(() => {
        if(showDrawer) {
          // After rendering, setShowDrawer back to false
          toggleShow();
        }
    }, [showDrawer, toggleShow]);

    const rootProps = { ...rest };
    const Root = useSlots(props).root;
    return (final: DrawerProps, ...children: React.ReactNode[]) => {
      return <Root {...mergeProps(rootProps, final)} showDrawer {...(nativeTarget && {target : nativeTarget})}>
        {children}
        </Root>;
    };
  },
});
export default Drawer;