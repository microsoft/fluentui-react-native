/** @jsx withSlots */
import * as React from 'react';
import { View, ScrollView, Platform, I18nManager } from 'react-native';
import { submenuName, SubmenuProps, SubmenuSlotProps, SubmenuType, SubmenuRenderData, SubmenuState } from './Submenu.types';
import { settings } from './Submenu.settings';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { IFocusable, useKeyDownProps, useSelectedKey } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { Callout } from '@fluentui-react-native/callout';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { CMContext } from './ContextualMenu';
import { FocusZone } from '@fluentui-react-native/focus-zone';

export const Submenu = compose<SubmenuType>({
  displayName: submenuName,
  usePrepareProps: (userProps: SubmenuProps, useStyling: IUseComposeStyling<SubmenuType>) => {
    const { setShowMenu, maxWidth, maxHeight, shouldFocusOnMount = true, shouldFocusOnContainer = true, ...rest } = userProps;

    /**
     * On macOS, focus isn't placed by default on the first focusable element. We get around this by focusing on the inner FocusZone
     * hosting the menu. For whatever reason, to get the timing _just_ right to actually focus, we need an additional `setTimeout`
     *  on top of the `useLayoutEffect` hook.
     */
    const focusZoneRef = React.useRef<IFocusable>(null);

    React.useLayoutEffect(() => {
      if (Platform.OS === 'macos') {
        setTimeout(() => {
          focusZoneRef.current?.focus();
        }, 0);
      }
    }, []);

    // Grabs the context information from ContextualMenu (onDismissMenu callback)
    const context = React.useContext(CMContext);

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(null, userProps.onItemClick);

    const onShow = React.useCallback(() => {
      userProps?.onShow && userProps.onShow();
      context.isSubmenuOpen = true;
    }, [context]);

    const onDismiss = React.useCallback(() => {
      userProps?.onDismiss();
      setShowMenu(false);
      context.isSubmenuOpen = false;
    }, [context, setShowMenu]);

    const dismissCallback = React.useCallback(() => {
      onDismiss();
      context?.onDismissMenu();
    }, [onDismiss, context]);

    context.dismissSubmenu = onDismiss;

    const [containerFocus, setContainerFocus] = React.useState(true);
    const toggleContainerFocus = React.useCallback(() => {
      setContainerFocus(false);
    }, [setContainerFocus]);

    const state: SubmenuState = {
      context: {
        selectedKey: data.selectedKey,
        onItemClick: data.onKeySelect,
        onDismissMenu: dismissCallback,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const dismissWithArrowKey = React.useCallback(
      (e: any) => {
        const arrowKey = I18nManager.isRTL ? 'ArrowRight' : 'ArrowLeft';
        if (e.nativeEvent.key === arrowKey) {
          onDismiss();
        }
      },
      [onDismiss],
    );

    // Explicitly override onKeyDown to override the native windows behavior of moving focus with arrow keys.
    const onKeyDownProps = useKeyDownProps(dismissWithArrowKey, 'ArrowLeft', 'ArrowRight');

    const slotProps = mergeSettings<SubmenuSlotProps>(styleProps, {
      root: {
        ...rest,
        onShow: onShow,
        onDismiss: onDismiss,
        setInitialFocus: shouldFocusOnMount,
      },
      container: {
        ...onKeyDownProps,
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
        componentRef: focusZoneRef,
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
  render: (Slots: ISlots<SubmenuSlotProps>, renderData: SubmenuRenderData, ...children: React.ReactNode[]) => {
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

export default Submenu;
