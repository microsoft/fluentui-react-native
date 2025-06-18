/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { I18nManager, Platform, View } from 'react-native';

import type { SvgIconProps } from '@fluentui-react-native/icon';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { useKeyDownProps, useViewCommandFocus, useAsPressable } from '@fluentui-react-native/interactive-hooks';
import { Text } from '@fluentui-react-native/text';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import { withSlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import type { SvgProps } from 'react-native-svg';
import { Svg, G, Path } from 'react-native-svg';

import { CMContext } from './ContextualMenu';
import { settings } from './SubmenuItem.settings';
import type { SubmenuItemSlotProps, SubmenuItemState, SubmenuItemProps, SubmenuItemRenderData, SubmenuItemType } from './SubmenuItem.types';
import { submenuItemName } from './SubmenuItem.types';

export const SubmenuItem = compose<SubmenuItemType>({
  displayName: submenuItemName,
  usePrepareProps: (userProps: SubmenuItemProps, useStyling: IUseComposeStyling<SubmenuItemType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      disabled,
      expanded,
      itemKey,
      icon,
      text,
      accessibilityLabel = userProps.text,
      onAccessibilityTap,
      onClick,
      componentRef = defaultComponentRef,
      ...rest
    } = userProps;

    // Grabs the context information from Submenu (currently selected menuItem and client's onItemClick callback)
    const context = React.useContext(CMContext);

    const cmRef = useViewCommandFocus(componentRef);

    const onItemHoverIn = React.useCallback((e) => {
      componentRef.current.focus();
      userProps.onHoverIn && userProps.onHoverIn(e);
    }, []);

    const onHoverInDelay = Platform.select({
      macos: 100,
      default: 500, // win32
    });

    const onItemHoverOut = React.useCallback((e) => {
      context?.dismissSubmenu && context.dismissSubmenu();
      userProps.onHoverOut && userProps.onHoverOut(e);
    }, []);

    const onItemPress = React.useCallback(() => {
      if (!disabled) {
        onClick && onClick();
        context?.onItemClick && context.onItemClick(itemKey);
      }
    }, [context, disabled, itemKey, onClick]);

    const pressable = useAsPressable({
      ...rest,
      onPress: onItemPress,
      onHoverIn: onItemHoverIn,
      delayHoverIn: onHoverInDelay,
      onHoverOut: onItemHoverOut,
    });

    /**
     * GH #1267
     * We want onMouseEnter to fire right away to set focus, and then Pressable's onHoverIn to fire after a delay to show the submenu.
     * To achieve this, we override the onMouseEnter handler returned by useAsPressable, and replace it with our own. Inside our own
     * onMouseEnter handler, we call useAsPressable's onMouseEnter handler, which incorporates the delay passed to delayHoverIn
     * In the future, we can avoid needing to override onMouseEnter by handling submenu rendering internally rather than depending on the
     * client to conditionally render it with onHoverIn.
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore onMouseLeave not in PressableProps but is supported on desktop
    const { onBlur, onMouseEnter, onMouseLeave, ...restPressableProps } = pressable.props;
    const onMouseEnterModified = React.useCallback(
      (e) => {
        componentRef.current.focus();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore IViewWin32 doesn't have the event as an argument, while macOS does
        onMouseEnter && onMouseEnter(e);
      },
      [componentRef, onMouseEnter],
    );
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
      onMouseEnter: onMouseEnterModified,
      onMouseLeave: onMouseLeaveModified,
      ...restPressableProps,
    };

    const state: SubmenuItemState = {
      ...pressable.state,
      selected: context.selectedKey === userProps.itemKey,
      disabled: userProps.disabled,
      content: !!text,
      icon: !!icon,
    };

    const showSubmenuOnKeyDown = React.useCallback(
      (e: any) => {
        const rtlAwareOpenArrowKey = I18nManager.isRTL ? 'ArrowLeft' : 'ArrowRight';

        if (e.nativeEvent.key === rtlAwareOpenArrowKey || e.nativeEvent.key === ' ' || e.nativeEvent.key === 'Enter') {
          onItemHoverIn(e);
        }
      },
      [onItemHoverIn],
    );

    const chevronSvg: React.FunctionComponent<SvgProps> = (props: SvgProps) => {
      return (
        <Svg width={props.width} height={props.height} viewBox="0 0 2048 2048" color={props.color}>
          <G transform={I18nManager.isRTL ? 'translate(2048, 0) scale(-1, 1)' : ''}>
            <Path fill="currentColor" d="M 743 1767 l -121 -121 l 708 -707 l -708 -708 l 121 -121 l 828 829 z"></Path>
          </G>
        </Svg>
      );
    };
    const svgProps: SvgIconProps = {
      src: chevronSvg,
    };

    /**
     * SubmenuItem launches the submenu onMouseEnter event. Submenu should be launched with Spacebar, Enter, or right arrow (flipped for RTL).
     * Explicitly override onKeyDown to override the native windows behavior of moving focus with arrow keys.
     */
    const onKeyDownProps = useKeyDownProps(showSubmenuOnKeyDown, ' ', 'Enter', 'ArrowLeft', 'ArrowRight');
    const onAccTap = onAccessibilityTap ?? onItemPress;

    // Default accessibility actions to help screen readers announce expanded/collapsed state
    // Only provide on win32 to follow platform-specific accessibility patterns
    const defaultAccessibilityActions = React.useMemo(() => {
      if (Platform.OS === ('win32' as any)) {
        return [
          { name: 'Expand', label: 'Expand submenu' },
          { name: 'Collapse', label: 'Collapse submenu' },
        ];
      }
      return [];
    }, []);

    // Merge user accessibility actions with defaults
    const finalAccessibilityActions = React.useMemo(() => {
      const userActions = userProps.accessibilityActions;
      if (userActions && userActions.length > 0) {
        return [...defaultAccessibilityActions, ...userActions];
      }
      return defaultAccessibilityActions;
    }, [userProps.accessibilityActions, defaultAccessibilityActions]);

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    // create the merged slot props
    const slotProps = mergeSettings<SubmenuItemSlotProps>(styleProps, {
      root: {
        ref: cmRef,
        ...pressablePropsModified,
        ...onKeyDownProps,
        ...rest,
        accessible: true,
        accessibilityLabel: accessibilityLabel,
        accessibilityRole: 'menuitem',
        accessibilityState: { disabled: state.disabled ?? false, expanded: expanded ?? false, selected: state.selected },
        accessibilityValue: { text: itemKey },
        accessibilityActions: finalAccessibilityActions,
        disabled,
        focusable: !disabled,
        onAccessibilityTap: onAccTap,
      },
      content: {
        accessible: false,
        children: text,
      },
      icon: {
        ...createIconProps(icon),
        accessible: false,
      },
      chevron: {
        ...createIconProps({ svgSource: svgProps, width: 12, height: 12 }),
        accessible: false,
      },
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<SubmenuItemSlotProps>, renderData: SubmenuItemRenderData, ...children: React.ReactNode[]) => {
    // We shouldn't have to specify the source prop on Slots.icon, here, but we need another drop from @uifabricshared
    return (
      <Slots.root>
        <Slots.startstack>
          {renderData!.state.icon && <Slots.icon />}
          {renderData!.state.content && <Slots.content />}
          {children}
        </Slots.startstack>
        <Slots.endstack>
          <Slots.chevron />
        </Slots.endstack>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    startstack: View,
    icon: Icon as React.ComponentType,
    content: Text,
    endstack: View,
    chevron: Icon as React.ComponentType,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    startstack: [],
    icon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
    endstack: [],
    chevron: [{ source: 'chevronColor', lookup: getPaletteFromTheme, target: 'color' }],
  },
});

export default SubmenuItem;
