import * as React from 'react';

import type { ViewStyle } from '@office-iss/react-native-win32';

import type { TabListAnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import type { TabListContextData } from '../TabList/TabList.types';

export function useTabListAnimatedIndicator(
  props: TabListAnimatedIndicatorProps,
  context: TabListContextData,
): TabListAnimatedIndicatorProps {
  const { selectedKey, animatedIndicatorState, vertical } = context;
  console.log('asdfkk');
  console.log(context);

  const selectedIndicatorLayout = React.useMemo(() => {
    console.log(animatedIndicatorState);
    return animatedIndicatorState?.layout ? animatedIndicatorState?.layout[selectedKey] : null;
  }, [animatedIndicatorState, selectedKey]);

  const indicatorStyle: ViewStyle = React.useMemo(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (!selectedIndicatorLayout || Object.keys(selectedIndicatorLayout).length < 5) {
      console.log(selectedIndicatorLayout);
      return { display: 'none' };
    }
    // calculate indicator styles here
    const styles: ViewStyle = { width: selectedIndicatorLayout.width, height: selectedIndicatorLayout.height };
    if (vertical) {
      styles.marginTop = selectedIndicatorLayout.y + selectedIndicatorLayout.startMargin;
    } else {
      styles.marginLeft = selectedIndicatorLayout.x + selectedIndicatorLayout.startMargin;
    }
    return styles;
  }, [selectedIndicatorLayout, vertical]);

  return { ...props, style: indicatorStyle };
}
