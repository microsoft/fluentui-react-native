/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
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
import { useAsPressable, useKeyCallback, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SvgXml } from 'react-native-svg';
import { CMContext } from './ContextualMenu';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';

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
      onClick,
      testID,
      componentRef = defaultComponentRef,
      ...rest
    } = userProps;

    // Grabs the context information from Submenu (currently selected menuItem and client's onItemClick callback)
    const context = React.useContext(CMContext);

    const cmRef = useViewCommandFocus(componentRef);

    const onItemHoverIn = React.useCallback(
      (e) => {
        userProps.onHoverIn(e);
      },[]);

    const onItemClick = React.useCallback(
      (e) => {
        if (!disabled) {
          context?.onDismissMenu();
          context?.dismissSubmenu && context.dismissSubmenu();
          onClick ? onClick() : context?.onItemClick(itemKey);
          e.stopPropagation();
        }
      },
      [context, disabled, itemKey, onClick],
    );

    const pressable = useAsPressable({ ...rest, onPress: onItemClick, onHoverIn: onItemHoverIn, delayHoverIn: 500 });

    const [submenuItemHovered, setSubmenuItemHovered] = React.useState(false);
    context.setSubmenuItemHovered = setSubmenuItemHovered;
    // set up state
    const state: SubmenuItemState = {
      ...pressable.state,
      selected: context.selectedKey === userProps.itemKey,
      disabled: userProps.disabled,
      content: !!text,
      icon: !!icon,
      submenuItemHovered: submenuItemHovered,
    };

    const onMouseEnter = React.useCallback(
      (e) => {
        setSubmenuItemHovered(true);
        pressable.props.onMouseEnter && pressable.props.onMouseEnter(e);
        e.stopPropagation();
      },
      [pressable, setSubmenuItemHovered],
    );

    /*
     * SubmenuItem launches the submenu onMouseEnter event. For keyboarding, submenu should be launched with Spacebar, Enter, or right arrow.
     */
    const onKeyUp = useKeyCallback(onMouseEnter, ' ', 'Enter', 'ArrowRight');

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    // create the merged slot props
    const slotProps = mergeSettings<SubmenuItemSlotProps>(styleProps, {
      root: {
        ...pressable.props,
        ref: cmRef,
        onKeyUp,
        onMouseEnter,
        accessibilityLabel,
      },
      content: { children: text, testID },
      icon: createIconProps(icon),
      chevron: {}
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<SubmenuItemSlotProps>, renderData: SubmenuItemRenderData, ...children: React.ReactNode[]) => {
    const xml = `
    <svg width="12" height="12" viewBox="0 0 2048 2048" >
      <path class='OfficeIconColors_HighContrast' fill='currentColor' d='M 743 1767 l -121 -121 l 708 -707 l -708 -708 l 121 -121 l 828 829 z' />
      <path class='OfficeIconColors_m22' fill='currentColor' d='M 743 1767 l -121 -121 l 708 -707 l -708 -708 l 121 -121 l 828 829 z' />
    </svg>`;
    // We shouldn't have to specify the source prop on Slots.icon, here, but we need another drop from @uifabricshared
    return (
      <Slots.root>
        <Slots.leftstack>
          {renderData!.state.icon && <Slots.icon />}
          {renderData!.state.content && <Slots.content />}
          {children}
        </Slots.leftstack>
        <Slots.rightstack>
          <Slots.chevron xml={xml}/>
        </Slots.rightstack>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    leftstack: { slotType: View },
    icon: { slotType: Icon as React.ComponentType },
    content: Text,
    rightstack: { slotType: View },
    chevron: SvgXml
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    leftstack: [],
    icon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
    rightstack: [],
    chevron: [{ source: 'chevronColor', lookup: getPaletteFromTheme, target: 'color' }],
  },
});

export default SubmenuItem;
