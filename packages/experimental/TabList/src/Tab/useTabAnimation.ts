import React from 'react';

import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

import type { TabProps, TabTokens } from './Tab.types';
import type { TabListContextData } from '../TabList/TabList.types';

/**
 * On win32, when a vertical tablist initially lays out, we sometimes get odd, large height values that cause the
 * indicator to noticably take up the entire screen height before getting a correct layout value that makes sense. This is
 * an arbitrary limit we'll set to keep the indicator from looking weird.
 */
const RENDERING_HEIGHT_LIMIT = 20_000;

/**
 * This hook handles the logic on the tab side to correctly style and animate the TabListAnimatedIndicator.
 *
 * We save the layout information (width, height, x, y) of the Tab component using a LayoutEventHandler attached to the
 * root slot we initialize here, and we color the animated indicator using the user defined tab indicator color token.
 */
export function useTabAnimation(props: TabProps, context: TabListContextData, tokens: TabTokens) {
  const { animatedIndicatorState, selectedKey, vertical } = context;
  const { tabKey } = props;

  // If we're the selected tab, we style the TabListAnimatedIndicator with the correct token value set by the user
  React.useEffect(() => {
    if (tabKey === selectedKey) {
      animatedIndicatorState?.updateStyles({ indicator: { backgroundColor: tokens.indicatorColor } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, selectedKey, tokens.indicatorColor]);

  // onLayout callbacks to help calculate positioning of the animated indicator
  const onTabLayout = React.useCallback(
    (e: LayoutEvent) => {
      // If the layout values of the tab aren't set or are wonky, don't update state
      if (
        e?.nativeEvent?.layout &&
        animatedIndicatorState?.tablistLayout &&
        animatedIndicatorState.tablistLayout.width > 0 &&
        e.nativeEvent.layout.height <= animatedIndicatorState.tablistLayout.height &&
        e.nativeEvent.layout.height < RENDERING_HEIGHT_LIMIT
      ) {
        let width: number, height: number;
        // we can calculate the dimensions of the indicator using token values we can access via the compressable framework
        if (vertical) {
          width = tokens.indicatorThickness;
          height = e.nativeEvent.layout.height - 2 * (tokens.indicatorInset + tokens.borderWidth + 1); // the '1' is to account for padding between the focus border and tab
        } else {
          width = e.nativeEvent.layout.width - 2 * (tokens.indicatorInset + tokens.borderWidth + 1);
          height = tokens.indicatorThickness;
        }
        animatedIndicatorState?.addToLayoutMap(tabKey, {
          x: e.nativeEvent.layout.x,
          y: e.nativeEvent.layout.y,
          width: width,
          height: height,
          tabBorderWidth: tokens.borderWidth,
          startMargin: tokens.indicatorInset,
        });
      }
    },
    [animatedIndicatorState, tabKey, tokens, vertical],
  );

  return onTabLayout;
}
