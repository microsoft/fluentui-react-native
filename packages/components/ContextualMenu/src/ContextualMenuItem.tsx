/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';
import {
  ContextualMenuItemSlotProps,
  ContextualMenuItemState,
  ContextualMenuItemProps,
  ContextualMenuItemRenderData,
  contextualMenuItemName,
  ContextualMenuItemType,
} from './ContextualMenuItem.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { settings } from './ContextualMenuItem.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { usePressableState, useKeyProps, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { CMContext } from './ContextualMenu';
import { Icon, createIconProps } from '@fluentui-react-native/icon';

export const ContextualMenuItem = compose<ContextualMenuItemType>({
  displayName: contextualMenuItemName,
  usePrepareProps: (userProps: ContextualMenuItemProps, useStyling: IUseComposeStyling<ContextualMenuItemType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      disabled,
      itemKey,
      icon,
      text,
      accessibilityLabel = userProps.text,
      onAccessibilityTap,
      onClick,
      testID,
      componentRef = defaultComponentRef,
      ...rest
    } = userProps;

    // Grabs the context information from ContextualMenu (currently selected menuItem and client's onItemClick callback)
    const context = React.useContext(CMContext);

    const onItemClick = React.useCallback(
      (e) => {
        if (!disabled) {
          context?.onDismissMenu();
          onClick && onClick();
          context?.onItemClick && context.onItemClick(itemKey);
          e.stopPropagation();
        }
      },
      [context, disabled, itemKey, onClick],
    );

    const cmRef = useViewCommandFocus(componentRef);

    const onItemHoverIn = React.useCallback(() => {
      if (!disabled) {
        componentRef.current.focus();
        // dismiss submenu
        if (context?.isSubmenuOpen) {
          context?.dismissSubmenu && context.dismissSubmenu();
        }
      }
    }, [componentRef, disabled, context]);

    const pressable = usePressableState({ ...rest, onPress: onItemClick, onHoverIn: onItemHoverIn });

    const onKeyUpProps = useKeyProps(onItemClick, ' ', 'Enter');

    // set up state
    const state: ContextualMenuItemState = {
      ...pressable.state,
      selected: context.selectedKey === userProps.itemKey,
      disabled: userProps.disabled,
      content: !!text,
      icon: !!icon,
    };

    /**
     * On Desktop, focus gets moved to the root of the menu, so hovering off the menu does not automatically call onBlur as we expect it to.
     * onMouseLeave is overridden to explicitly call onBlur to simulate removing focus
     * To achieve this, we override the onMouseLeave handler returned by usePressableState, and replace it with our own. Inside our own
     * onMouseLeave handler, we call usePressableState's onMouseLEave handler,
     */
    const { onBlur, onMouseLeave, ...restPressableProps } = pressable.props;
    const onMouseLeaveModified = React.useCallback(
      (e) => {
        onBlur(e);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore IViewWin32 doesn't have the event as an argument, while macOS does
        onMouseLeave && onMouseLeave(e);
      },
      [onBlur, onMouseLeave],
    );
    const pressablePropsModified = {
      onBlur: onBlur,
      onMouseLeave: onMouseLeaveModified,
      ...restPressableProps,
    };
    const onAccTap = onAccessibilityTap ?? onItemClick;

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    // create the merged slot props
    const slotProps = mergeSettings<ContextualMenuItemSlotProps>(styleProps, {
      root: {
        ref: cmRef,
        ...pressablePropsModified,
        ...onKeyUpProps,
        accessible: true,
        accessibilityLabel: accessibilityLabel,
        accessibilityRole: 'menuitem',
        accessibilityState: { disabled: state.disabled, selected: state.selected },
        accessibilityValue: { text: itemKey },
        onAccessibilityTap: onAccTap,
        disabled,
        focusable: !disabled,
        testID,
        ...rest,
      },
      content: { children: text },
      icon: createIconProps(icon),
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<ContextualMenuItemSlotProps>, renderData: ContextualMenuItemRenderData, ...children: React.ReactNode[]) => {
    // We shouldn't have to specify the source prop on Slots.icon, here, but we need another drop from @uifabricshared
    return (
      <Slots.root>
        <Slots.stack>
          {renderData!.state.icon && <Slots.icon />}
          {renderData!.state.content && <Slots.content />}
          {children}
        </Slots.stack>
      </Slots.root>
    );
  },
  slots: {
    root: Pressable,
    stack: { slotType: View },
    icon: { slotType: Icon as React.ComponentType },
    content: Text,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    stack: [],
    icon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
  },
});

export default ContextualMenuItem;
