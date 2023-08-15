import * as React from 'react';

import type { LayoutChangeEvent } from '@office-iss/react-native-win32';

import type { TabIndicatorProps } from './TabIndicator.types';
import { TabListContext } from '../TabList/TabListContext';

export function useTabIndicator(props: TabIndicatorProps): TabIndicatorProps {
  const { tabKey } = props;
  const { animatedIndicatorState } = React.useContext(TabListContext);

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      if (e?.nativeEvent?.layout && tabKey) animatedIndicatorState?.addToLayoutMap(tabKey, { ...e.nativeEvent.layout });
    },
    [animatedIndicatorState, tabKey],
  );

  return { ...props, onLayout };
}
