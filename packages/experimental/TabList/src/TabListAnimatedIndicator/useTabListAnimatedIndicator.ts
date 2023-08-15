import * as React from 'react';

import type { ViewStyle } from '@office-iss/react-native-win32';

import type { TabListAnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import { TabListContext } from '../TabList/TabListContext';

export function useTabListAnimatedIndicator(props: TabListAnimatedIndicatorProps): TabListAnimatedIndicatorProps {
  const {
    selectedKey,
    animatedIndicatorState: { layout },
    vertical,
  } = React.useContext(TabListContext);

  const selectedIndicatorLayout = React.useMemo(() => layout[selectedKey], [layout, selectedKey]);

  const indicatorStyle: ViewStyle = React.useMemo(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (Object.keys(selectedIndicatorLayout).length < 5) {
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
