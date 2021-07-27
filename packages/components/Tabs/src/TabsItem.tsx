/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { Icon } from '@fluentui-react-native/icon';
import { settings, tabsItemSelectActionLabel } from './TabsItem.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { TabsContext } from './Tabs';
import { tabsItemName, TabsItemType, TabsItemProps, TabsItemSlotProps, TabsItemRenderData, TabsItemState } from './TabsItem.types';
import {
  useAsPressable,
  useKeyCallback,
  useViewCommandFocus,
  createIconProps,
  useOnPressWithFocus,
} from '@fluentui-react-native/interactive-hooks';

export const TabsItem = compose<TabsItemType>({
  displayName: tabsItemName,

  usePrepareProps: (userProps: TabsItemProps, useStyling: IUseComposeStyling<TabsItemType>) => {
    const {
      icon,
      headerText,
      onAccessibilityTap = userProps.onClick,
      accessibilityLabel = userProps.headerText,
      componentRef = React.useRef(null),
      testID,
      onClick,
      buttonKey,
      ...rest
    } = userProps;

    // Grabs the context information from RadioGroup (currently selected button and client's onTabsClick callback)
    const info = React.useContext(TabsContext);

    // const onPressWithFocus = useOnPressWithFocus(componentRef, onClick);
    /* We don't want to call the user's onTabsClick multiple times on the same selection. */
    const changeSelection = () => {
      if (buttonKey != info.selectedKey) {
        info.onTabsClick && info.onTabsClick(buttonKey);
        info.getTabId && info.getTabId(buttonKey, info.buttonKeys.findIndex((x) => x == buttonKey) + 1);
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    };

    // Ensure focus is placed on button after click
    const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

    const pressable = useAsPressable({
      ...rest,
      onPress: changeSelectionWithFocus,
      onFocus: changeSelection,
    });

    const onKeyUp = useKeyCallback(onClick, ' ', 'Enter');

    // set up state
    const state: TabsItemState = {
      info: {
        ...pressable.state,
        selected: info.selectedKey === userProps.buttonKey,
        disabled: !!userProps.disabled,
        headerText: !!headerText,
        icon: !!icon,
      },
    };

    /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
    React.useEffect(() => {
      if (buttonKey == info.selectedKey) {
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    }, []);

    const buttonRef = useViewCommandFocus(componentRef);

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);

    /* RadioButton changes selection when focus is moved between each RadioButton and on a click */
    // const pressable = useAsPressable({
    //   ...rest,
    //   // onPress: changeSelectionWithFocus,
    //   onFocus: changeSelection,
    // });

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

    const slotProps = mergeSettings<TabsItemSlotProps>(styleProps, {
      root: {
        ...rest,
        ...pressable.props,
        ref: buttonRef,
        onAccessibilityTap: onAccessibilityTap,
        accessibilityRole: 'tab',
        accessibilityLabel: accessibilityLabel,
        accessibilityState: { disabled: state.info.disabled, selected: state.info.selected },
        accessibilityActions: [{ name: 'Select', label: tabsItemSelectActionLabel }],
        accessibilityPositionInSet: info.buttonKeys.findIndex((x) => x == buttonKey) + 1,
        accessibilitySetSize: info.buttonKeys.length,
        onAccessibilityAction: onAccessibilityAction,
        onKeyUp: onKeyUp,
      },
      content: { children: headerText, testID: testID },
      icon: createIconProps(icon),
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<TabsItemSlotProps>, renderData: TabsItemRenderData, ...children: React.ReactNode[]) => {
    const info = renderData.state!.info;
    return (
      <Slots.root>
        <Slots.stack>
          {info.icon && <Slots.icon />}
          {info.headerText && <Slots.content />}
          {children}
        </Slots.stack>
      </Slots.root>
    );
  },

  settings,
  slots: {
    root: View,
    stack: { slotType: View, filter: filterViewProps },
    icon: { slotType: Icon as React.ComponentType<object> },
    content: Text,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    stack: [],
    icon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
  },
});

export default TabsItem;
