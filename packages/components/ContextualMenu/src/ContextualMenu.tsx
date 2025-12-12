/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { View, ScrollView, Platform } from 'react-native';

import { Callout } from '@fluentui-react-native/callout';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings } from './ContextualMenu.settings';
import type {
  ContextualMenuProps,
  ContextualMenuSlotProps,
  ContextualMenuType,
  ContextualMenuRenderData,
  ContextualMenuContext,
  ContextualMenuState,
} from './ContextualMenu.types';
import { contextualMenuName } from './ContextualMenu.types';

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

    /**
     * On macOS, focus isn't placed by default on the first focusable element. We get around this by focusing on the inner FocusZone
     * hosting the menu. For whatever reason, to get the timing _just_ right to actually focus, we need an additional `setTimeout`
     *  on top of the `useLayoutEffect` hook.
     */
    const focusZoneRef = React.useRef<IFocusable>(null);

    React.useLayoutEffect(() => {
      if (Platform.OS === 'macos' && shouldFocusOnMount) {
        setTimeout(() => {
          focusZoneRef.current?.focus();
        }, 0);
      }
    }, [shouldFocusOnMount]);

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(null, userProps.onItemClick);

    const dismissCallback = React.useCallback(() => {
      userProps.onDismiss();
      setShowMenu?.(false);
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
      container: {
        accessible: shouldFocusOnContainer,
        focusable: shouldFocusOnContainer && containerFocus,
        onBlur: toggleContainerFocus,
        style: { maxHeight: maxHeight, maxWidth: maxWidth },
      },
      scrollView: {
        contentContainerStyle: {
          flexDirection: 'column',
          flexGrow: 1,
        },
        showsVerticalScrollIndicator: maxHeight != undefined,
        showsHorizontalScrollIndicator: maxWidth != undefined,
      },
      focusZone: {
        enableFocusRing: false,
        componentRef: focusZoneRef,
        defaultTabbableElement: focusZoneRef,
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
