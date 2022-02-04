/** @jsx withSlots */
import * as React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import {
  contextualMenuName,
  ContextualMenuProps,
  ContextualMenuSlotProps,
  ContextualMenuType,
  ContextualMenuRenderData,
  ContextualMenuContext,
  ContextualMenuState,
} from './ContextualMenu.types';
import { settings } from './ContextualMenu.settings';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { Callout } from '@fluentui-react-native/callout';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { FocusZone } from '@fluentui-react-native/focus-zone';

export const CMContext = React.createContext<ContextualMenuContext>({
  selectedKey: null,
  onItemClick: (/* key: string */) => {
    return;
  },
  onDismissMenu: () => {
    return;
  },
});

export const ContextualMenu = compose<ContextualMenuType>({
  displayName: contextualMenuName,
  usePrepareProps: (userProps: ContextualMenuProps, useStyling: IUseComposeStyling<ContextualMenuType>) => {
    const { setShowMenu, maxHeight, maxWidth, shouldFocusOnMount = true, shouldFocusOnContainer = false, ...rest } = userProps;

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(null, userProps.onItemClick);

    const dismissCallback = React.useCallback(() => {
      userProps.onDismiss();
      setShowMenu(false);
    }, [setShowMenu, userProps.onDismiss]);

    const [containerFocus, setContainerFocus] = React.useState(true);
    const toggleContainerFocus = React.useCallback(() => {
      setContainerFocus(false);
    }, [setContainerFocus]);

    const state: ContextualMenuState = {
      context: {
        selectedKey: data.selectedKey,
        onItemClick: data.onKeySelect,
        onDismissMenu: dismissCallback,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<ContextualMenuSlotProps>(styleProps, {
      root: {
        accessibilityRole: 'menu',
        setInitialFocus: shouldFocusOnMount,
        ...rest,
      },
      container: Platform.select({
        macos: {},
        default: {
          // win32
          accessible: shouldFocusOnContainer,
          focusable: shouldFocusOnContainer && containerFocus,
          onBlur: toggleContainerFocus,
          style: { maxHeight: maxHeight, width: maxWidth },
        },
      }),
      scrollView: {
        contentContainerStyle: {
          flexDirection: 'column',
          flexGrow: 1,
        },
        showsVerticalScrollIndicator: true,
      },
      focusZone: {
        focusZoneDirection: 'vertical',
      },
    });

    return { slotProps, state };
  },
  settings: settings,
  slots: {
    root: Callout,
    container: View,
    scrollView: ScrollView,
    focusZone: FocusZone,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    container: [],
  },
  render: (Slots: ISlots<ContextualMenuSlotProps>, renderData: ContextualMenuRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state == undefined) {
      return null;
    }

    // On macOS, wrap the children in a FocusZone to allow you to arrow-key through the menu items.
    // Duplicating the JSX trees was the only way I could find to correctly render the optional slot.
    if (Platform.OS === 'macos') {
      return (
        <CMContext.Provider value={renderData.state.context}>
          <Slots.root>
            <Slots.container>
              <Slots.scrollView>
                <Slots.focusZone>{children}</Slots.focusZone>
              </Slots.scrollView>
            </Slots.container>
          </Slots.root>
        </CMContext.Provider>
      );
    } else {
      return (
        <CMContext.Provider value={renderData.state.context}>
          <Slots.root>
            <Slots.container>
              <Slots.scrollView>{children}</Slots.scrollView>
            </Slots.container>
          </Slots.root>
        </CMContext.Provider>
      );
    }
  },
});

export default ContextualMenu;
