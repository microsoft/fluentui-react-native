import React from 'react';
import { I18nManager, Platform } from 'react-native';
import type { LayoutRectangle } from 'react-native';

import type { LayoutEvent, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';

import type { TabProps, TabTokens } from './Tab.types';
import type { TabListState } from '../TabList/TabList.types';

/**
 * On win32, when a vertical tablist initially lays out, we sometimes get odd, large height values that cause the
 * indicator to noticably take up the entire screen height before getting a correct layout value that makes sense. This is
 * an arbitrary limit we'll set to keep the indicator from looking weird.
 */
const RENDERING_HEIGHT_LIMIT = 20_000;

/**
 * This hook handles the logic on the tab side to correctly style and animate the TabListAnimatedIndicator.
 *
 * We save the layout information (width, height, x, y) of the Tab component by returning the root's slot props with a
 * LayoutEventHandler attached to track layout info of the tab, and we color the animated indicator using the user
 * defined tab indicator color token.
 */
export function useTabAnimation(
  props: TabProps,
  context: TabListState,
  tokens: TabTokens,
  rootProps: PressablePropsExtended,
): PressablePropsExtended {
  const { addTabLayout, selectedKey, layout, updateAnimatedIndicatorStyles, vertical } = context;
  const { tabKey } = props;

  const [tabLayoutRect, setTabLayoutRect] = React.useState<LayoutRectangle>();

  // If we're the selected tab, we style the TabListAnimatedIndicator with the correct token value set by the user
  React.useEffect(() => {
    if (tabKey === selectedKey && updateAnimatedIndicatorStyles) {
      updateAnimatedIndicatorStyles({ indicator: { backgroundColor: tokens.indicatorColor } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, selectedKey, tokens.indicatorColor]);

  // Function to calculate indicator positioning and dimensions for the animated indicator.
  const calculateAndUpdateAnimationLayoutInfo = React.useCallback(
    (tabLayout: LayoutRectangle, tablistLayout: LayoutRectangle) => {
      const { width: tabWidth, height: tabHeight, y: tabY } = tabLayout;
      let indicatorWidth: number, indicatorHeight: number;
      // Total Indicator inset consists of the horizontal/vertical margin of the indicator, the space taken up by the tab's focus border, and the
      // existing padding between the focus border and the tab itself. Multiply by 2 to account for the start + end margin/border/padding.
      const focusBorderPadding = 1;
      const totalIndicatorInset = 2 * (tokens.indicatorMargin + tokens.borderWidth + focusBorderPadding);
      // we can calculate the dimensions of the indicator using token values we have access to.
      if (vertical) {
        indicatorWidth = tokens.indicatorThickness;
        indicatorHeight = tabHeight - totalIndicatorInset;
      } else {
        indicatorWidth = tabWidth - totalIndicatorInset;
        indicatorHeight = tokens.indicatorThickness;
      }
      let tabX = tabLayout.x;
      // For RTL users on win32 and mac, we adjust the x position of each tab to be relative to the entire tablist starting right to left
      // (e.g. 0 = 0 from the right, 100 = 100 from the right, rather than from the left)
      if (I18nManager.isRTL) {
        tabX = tablistLayout.width - (tabX + tabWidth);
      }
      addTabLayout(tabKey, {
        x: tabX,
        y: tabY,
        width: indicatorWidth,
        height: indicatorHeight,
        tabBorderWidth: tokens.borderWidth,
        startMargin: tokens.indicatorMargin,
      });
    },
    [addTabLayout, tabKey, tokens.borderWidth, tokens.indicatorMargin, tokens.indicatorThickness, vertical],
  );

  /**
   * This checks to see if we have relevant info to calculate the layout position and dimensions of the indicator. If this check fails, we don't
   * want to trigger a re-render by needlessly updating the TabList state.
   *
   * We also check if the info is good. Info can be bad in some weird cases:
   * - Check if width > 0 because there is an on-going issue caused by ScrollViews initially laying out its childrens' width to 0 and height to be a bigger than expected value.
   * - ScrollView also negatively affects the initial height values. For vertical TabLists, the initial height value will lay out incorrectly. Sometimes, the styling of the parent
   *   component combined with the ScrollView issues causes the initial height layout value to be completely unreasonable. Exactly which style that causes this issue isn't known;
   *   more investigation has to be done.
   */
  const onTabLayout = React.useCallback(
    (e: LayoutEvent) => {
      if (
        e.nativeEvent.layout &&
        layout?.tablist &&
        // Following checks are for win32 only, will be removed after addressing scrollview layout bug
        (Platform.OS !== ('win32' as any) ||
          (layout.tablist.width > 0 &&
            e.nativeEvent.layout.height <= layout.tablist.height &&
            e.nativeEvent.layout.height < RENDERING_HEIGHT_LIMIT))
      ) {
        calculateAndUpdateAnimationLayoutInfo(e.nativeEvent.layout, layout.tablist);
      } else if (!layout.tablist) {
        // We need the tablist layout rectangle for the layout calculation, so we save the tab rect given and defer the calculation to the useEffect below
        setTabLayoutRect(e.nativeEvent.layout);
      }
    },
    [calculateAndUpdateAnimationLayoutInfo, layout.tablist],
  );

  React.useEffect(() => {
    if (tabLayoutRect && layout.tablist) {
      calculateAndUpdateAnimationLayoutInfo(tabLayoutRect, layout.tablist);
    }
  }, [layout.tablist]);

  return React.useMemo(() => ({ ...rootProps, onLayout: onTabLayout }), [rootProps, onTabLayout]);
}
