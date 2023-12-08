import React from 'react';
import { I18nManager, Platform } from 'react-native';

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

  // If we're the selected tab, we style the TabListAnimatedIndicator with the correct token value set by the user
  React.useEffect(() => {
    if (tabKey === selectedKey && updateAnimatedIndicatorStyles) {
      updateAnimatedIndicatorStyles({ backgroundColor: tokens.indicatorColor, borderRadius: tokens.indicatorRadius });
    }
    // Disabling warning because effect does not need to fire on `updateAnimatedIndicatorStyles` being changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, selectedKey, tokens.indicatorColor, tokens.indicatorRadius]);

  /**
   * This checks to see if we have relevant info to calculate the layout position and dimensions of the indicator. If this check fails, we don't
   * want to trigger a re-render by needlessly updating the TabList state.
   *
   * We also check if the info is good. Info can be bad in some weird cases on win32:
   * - Check if width > 0 because there is an on-going issue caused by ScrollViews initially laying out its childrens' width to 0 and height to be a bigger than expected value.
   * - ScrollView also negatively affects the initial height values. For vertical TabLists, the initial height value will lay out incorrectly. Sometimes, the styling of the parent
   *   component combined with the ScrollView issues causes the initial height layout value to be completely unreasonable. Exactly which style that causes this issue isn't known;
   *   more investigation has to be done.
   *
   * Once we finish these checks, for each tab, we calculate the layout information of its indicator consisting of (1) its dimensions and (2) its position (x,y) relative to the tablist.
   * Afterwards, we save these to feed into the Animated Indicator's layout styles.
   */
  const onTabLayout = React.useCallback(
    (e: LayoutEvent) => {
      if (
        (e.nativeEvent.layout &&
          // Following checks are for win32 only, will be removed after addressing scrollview layout bug
          Platform.OS !== ('win32' as any)) ||
        (layout?.tablist &&
          layout.tablist.width > 0 &&
          e.nativeEvent.layout.height <= layout.tablist.height &&
          e.nativeEvent.layout.height < RENDERING_HEIGHT_LIMIT)
      ) {
        const { width: tabWidth, height: tabHeight, x: tabX, y: tabY } = e.nativeEvent.layout;
        let indicatorWidth: number, indicatorHeight: number, indicatorX: number, indicatorY: number;
        // Total Indicator inset consists of the horizontal/vertical margin of the indicator, the space taken up by the tab's focus border, and the
        // existing padding between the focus border and the tab itself.
        const focusBorderPadding = 1;
        const totalIndicatorInset = tokens.indicatorMargin + tokens.borderWidth + focusBorderPadding;
        if (vertical) {
          indicatorWidth = tokens.indicatorThickness;
          indicatorHeight = tabHeight - totalIndicatorInset * 2; // multiply inset by 2 to subtract height from top and bottom
          indicatorY = tabY + totalIndicatorInset;
          if (I18nManager.isRTL) {
            // On RTL, the vertical tab indicator should appear to the right of the text
            indicatorX = tabX + tabWidth - (tokens.borderWidth + focusBorderPadding + indicatorWidth);
          } else {
            indicatorX = tabX + tokens.borderWidth + focusBorderPadding;
          }
        } else {
          indicatorWidth = tabWidth - totalIndicatorInset * 2; // multiply inset by 2 to subtract width from left and right
          indicatorHeight = tokens.indicatorThickness;
          indicatorX = tabX + totalIndicatorInset;
          indicatorY = tabHeight + tabY - indicatorHeight - tokens.borderWidth - focusBorderPadding;
        }
        addTabLayout(tabKey, {
          x: indicatorX,
          y: indicatorY,
          width: indicatorWidth,
          height: indicatorHeight,
        });
      }
    },
    [addTabLayout, layout, tabKey, tokens.borderWidth, tokens.indicatorMargin, tokens.indicatorThickness, vertical],
  );

  return React.useMemo(() => ({ ...rootProps, onLayout: onTabLayout }), [rootProps, onTabLayout]);
}
