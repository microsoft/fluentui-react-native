/** @jsx withSlots */
'use strict';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { tabsItemName, TabsItemType, TabsItemProps, TabsItemSlotProps, TabsItemRenderData } from './TabsItem.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings, tabsItemSelectActionLabel } from './TabsItem.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens, borderTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { useAsPressable, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { TabsContext } from './Tabs';

export const TabsItem = compose<TabsItemType>({
  displayName: tabsItemName,

  usePrepareProps: (userProps: TabsItemProps, useStyling: IUseComposeStyling<TabsItemType>) => {
    const { content, buttonKey, disabled, ariaLabel, componentRef = React.useRef(null), ...rest } = userProps;

    // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
    const info = React.useContext(TabsContext);

    const buttonRef = useViewCommandFocus(componentRef);

    /* We don't want to call the user's onChange multiple times on the same selection. */
    const changeSelection = () => {
      if (buttonKey != info.selectedKey) {
        info.onChange && info.onChange(buttonKey);
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    };

    /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
    React.useEffect(() => {
      if (buttonKey == info.selectedKey) {
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    }, []);

    // Ensure focus is placed on button after click
    const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

    /* RadioButton changes selection when focus is moved between each RadioButton and on a click */
    const pressable = useAsPressable({
      ...rest,
      onPress: changeSelectionWithFocus,
      onFocus: changeSelection,
    });

    // Used when creating accessibility properties in mergeSettings below
    const onAccessibilityAction = React.useCallback(
      (event: { nativeEvent: { actionName: any } }) => {
        switch (event.nativeEvent.actionName) {
          case 'Select':
            changeSelection();
            break;
        }
      },
      [info, buttonKey],
    );

    const state = {
      ...pressable.state,
      selected: info.selectedKey === userProps.buttonKey,
      disabled: disabled || false,
    };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<TabsItemSlotProps>(styleProps, {
      root: {
        ...rest,
        ref: buttonRef,
        ...pressable.props,
        accessibilityRole: 'tab',
        accessibilityLabel: ariaLabel ? ariaLabel : content,
        accessibilityState: { disabled: state.disabled, selected: state.selected },
        accessibilityActions: [{ name: 'Select', label: tabsItemSelectActionLabel }],
        accessibilityPositionInSet: info.buttonKeys.findIndex((x) => x == buttonKey) + 1,
        accessibilitySetSize: info.buttonKeys.length,
        onAccessibilityAction: onAccessibilityAction,
      },
      content: { children: content },
    });

    return { slotProps };
  },

  render: (Slots: ISlots<TabsItemSlotProps>, _renderData: TabsItemRenderData, ...children: React.ReactNode[]) => {
    return (
      <Slots.root>
        <Slots.button></Slots.button>
        <Slots.content />
        {children}
      </Slots.root>
    );
  },

  settings,
  slots: {
    root: View,
    button: { slotType: View, filter: filterViewProps },
    content: Text,
  },
  styles: {
    root: [],
    button: [borderTokens],
    content: [foregroundColorTokens, textTokens, [{ source: 'textBorderColor', lookup: getPaletteFromTheme, target: 'borderColor' }]],
  },
});

export default TabsItem;
