/** @jsxRuntime classic */
import * as React from 'react';

import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { Tab } from '@fluentui-react-native/tablist';

import type { OverflowTabProps } from './OverflowTab.types';
import { overflowItemName } from '../OverflowItem/OverflowItem.types';
import { useOverflowItem } from '../OverflowItem/useOverflowItem';

export const OverflowTab = stagedComponent<OverflowTabProps>((userProps: OverflowTabProps) => {
  const { props, state } = useOverflowItem(userProps);
  return (final: OverflowTabProps, ...children: React.ReactNode[]) => {
    const merged = mergeProps(props, final) as OverflowTabProps;
    if (!state.visible) {
      return null;
    }
    return <Tab {...merged}>{children}</Tab>;
  };
});
OverflowTab.displayName = overflowItemName;

export default OverflowTab;
