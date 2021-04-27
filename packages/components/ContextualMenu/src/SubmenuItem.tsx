/** @jsx withSlots */
import * as React from 'react';
import { Image, View } from 'react-native';
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
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens } from '@fluentui-react-native/tokens';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useAsPressable, useKeyCallback, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { CMContext } from './ContextualMenu';

export const SubmenuItem = compose<SubmenuItemType>({
  displayName: submenuItemName,
  usePrepareProps: (userProps: SubmenuItemProps, useStyling: IUseComposeStyling<SubmenuItemType>) => {
    const {
      disabled,
      itemKey,
      icon,
      text,
      accessibilityLabel = userProps.text,
      onClick,
      onHoverIn,
      testID,
      componentRef = React.useRef(null),
      ...rest
    } = userProps;

    // Grabs the context information from Submenu (currently selected menuItem and client's onItemClick callback)
    const context = React.useContext(CMContext);

    const onItemClick = React.useCallback(
      (e) => {
        if (!disabled && (onClick || context.onItemClick)) {
          context ?.onDismissMenu();
          if (onClick) {
            onClick();
          } else {
            context.onItemClick && context.onItemClick(itemKey);
          }
          e.stopPropagation();
        }
      },
      [context, disabled, itemKey, onClick],
    );

    const cmRef = useViewCommandFocus(componentRef);
    //const cmRef = React.useRef(null);
    const onItemHoverIn = React.useCallback(
      (e) => {
        componentRef.current.focus();
        onHoverIn(e);
      }, [componentRef, onHoverIn]);

    const pressable = useAsPressable({ ...rest, onPress: onItemClick, onHoverIn: onItemHoverIn });

    // set up state
    const state: SubmenuItemState = {
      ...pressable.state,
      selected: context.selectedKey === userProps.itemKey,
      disabled: userProps.disabled,
      content: !!text,
      icon: !!icon,
    };

    /*
    * On Desktop, focus gets moved to the root of the menu, so hovering off the menu does not automatically call onBlur as we expect it to.
    * OnMouseEnter and onMouseLeave are overridden with the below callbacks that calls onFocus and onBlur explicitly
    *
    */
    const onMouseEnter = React.useCallback(
      e => {
        pressable.props.onMouseEnter && pressable.props.onMouseEnter(e);
        pressable.props.onFocus && pressable.props.onFocus(e);
        e.stopPropagation();
      },
      [pressable]);

    const onMouseLeave = React.useCallback(
      e => {
        pressable.props.onMouseLeave && pressable.props.onMouseLeave(e);
        pressable.props.onBlur && pressable.props.onBlur(e);
        e.stopPropagation();
      },
      [pressable]);

    /*
    * For SubmenuItem, menu is shown on hover. onMouseEnter will handle the showMenu callback
    */
    const onKeyUp = useKeyCallback(onItemHoverIn, ' ', 'Enter', 'ArrowRight');

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    // create the merged slot props
    const slotProps = mergeSettings<SubmenuItemSlotProps>(styleProps, {
      root: {
        ...pressable.props,
        ref: cmRef,
        onKeyUp: onKeyUp,
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        accessibilityLabel: accessibilityLabel
      },
      content: { children: text, testID },
      icon: { source: icon },
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<SubmenuItemSlotProps>, renderData: SubmenuItemRenderData, ...children: React.ReactNode[]) => {
    // We shouldn't have to specify the source prop on Slots.icon, here, but we need another drop from @uifabricshared
    return (
      <Slots.root>
        <Slots.stack>
          {renderData!.state.icon && <Slots.icon source={renderData.slotProps!.icon.source} />}
          {renderData!.state.content && <Slots.content />}
          {children}
        </Slots.stack>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    stack: { slotType: View },
    icon: { slotType: Image as React.ComponentType<object> },
    content: Text,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    stack: [],
    icon: [foregroundColorTokens],
    content: [textTokens, foregroundColorTokens],
  },
});

export default SubmenuItem;
