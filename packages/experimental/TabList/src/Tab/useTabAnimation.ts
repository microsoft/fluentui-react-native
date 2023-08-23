import React from 'react';

import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

import type { TabProps, TabTokens } from './Tab.types';
import type { TabListContextData } from '../TabList/TabList.types';

/**
 * This hook handles the logic on the tab side to correctly style and animate the TabListAnimatedIndicator.
 *
 * We save the layout information (width, height, x, y) of the Tab component using a LayoutEventHandler attached to the
 * root slot we initialize here, and we color the animated indicator using the user defined tab indicator color token.
 */
export function useTabAnimation(props: TabProps, context: TabListContextData, tokens: TabTokens) {
  const {
    animatedIndicatorState: { addToLayoutMap, tablistLayout, updateStyles },
    selectedKey,
    vertical,
  } = context;
  const { tabKey } = props;

  // If we're the selected tab, we style the TabListAnimatedIndicator with the correct token value set by the user
  React.useEffect(() => {
    if (tabKey === selectedKey) {
      updateStyles({ indicator: { backgroundColor: tokens.indicatorColor } });
    }
  }, [tabKey, selectedKey, tokens.indicatorColor, updateStyles]);

  // onLayout callbacks to help calculate positioning of the animated indicator
  const onTabLayout = React.useCallback(
    (e: LayoutEvent) => {
      // If the layout values of the tab aren't set or are wonky, don't update state
      if (e?.nativeEvent?.layout && tablistLayout.width > 0 && e.nativeEvent.layout.height <= tablistLayout.height) {
        let width: number, height: number;
        // we can calculate the dimensions of the indicator using token values we can access via the compressable framework
        if (vertical) {
          width = tokens.indicatorThickness;
          height = e.nativeEvent.layout.height - 2 * (tokens.indicatorInset + tokens.borderWidth + 1); // the '1' is to account for padding between the focus border and tab
        } else {
          width = e.nativeEvent.layout.width - 2 * (tokens.indicatorInset + tokens.borderWidth + 1);
          height = tokens.indicatorThickness;
        }
        addToLayoutMap(tabKey, {
          x: e.nativeEvent.layout.x,
          y: e.nativeEvent.layout.y,
          width: width,
          height: height,
          tabBorderWidth: tokens.borderWidth,
          startMargin: tokens.indicatorInset,
        });
      }
    },
    [addToLayoutMap, tabKey, tablistLayout, tokens, vertical],
  );

  return onTabLayout;
}
