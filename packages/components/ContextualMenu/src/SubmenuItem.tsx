/** @jsx withSlots */
import * as React from 'react';
import { I18nManager, Platform, Pressable, View } from 'react-native';
import {
  SubmenuItemSlotProps,
  SubmenuItemState,
  SubmenuItemProps,
  SubmenuItemRenderData,
  submenuItemName,
  SubmenuItemType,
} from './SubmenuItem.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { settings } from './SubmenuItem.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { usePressableState, useKeyDownProps, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { CMContext } from './ContextualMenu';
import { Icon, SvgIconProps, createIconProps } from '@fluentui-react-native/icon';
import { Svg, G, Path, SvgProps } from 'react-native-svg';

export const SubmenuItem = compose<SubmenuItemType>({
  displayName: submenuItemName,
  usePrepareProps: (userProps: SubmenuItemProps, useStyling: IUseComposeStyling<SubmenuItemType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      disabled,
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

    const pressable = usePressableState({
      ...rest,
      onPress: onItemPress,
      onHoverIn: onItemHoverIn,
      delayHoverIn: onHoverInDelay,
      onHoverOut: onItemHoverOut,
    });

    /**
     * GH #1267
     * We want onMouseEnter to fire right away to set focus, and then Pressable's onHoverIn to fire after a delay to show the submenu.
     * To achieve this, we override the onMouseEnter handler returned by usePressableState, and replace it with our own. Inside our own
     * onMouseEnter handler, we call usePressableState's onMouseEnter handler, which incorporates the delay passed to delayHoverIn
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

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    // create the merged slot props
    const slotProps = mergeSettings<SubmenuItemSlotProps>(styleProps, {
      root: {
        ref: cmRef,
        ...pressablePropsModified,
        ...onKeyDownProps,
        accessible: true,
        accessibilityLabel: accessibilityLabel,
        accessibilityRole: 'menuitem',
        accessibilityState: { disabled: state.disabled, selected: state.selected },
        accessibilityValue: { text: itemKey },
        disabled,
        focusable: !disabled,
        onAccessibilityTap: onAccTap,
        ...rest,
      },
      content: { children: text },
      icon: createIconProps(icon),
      chevron: createIconProps({ svgSource: svgProps, width: 12, height: 12 }),
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
    root: Pressable,
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
