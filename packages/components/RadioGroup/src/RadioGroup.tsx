/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import {
  radioGroupName,
  IRadioGroupType,
  IRadioGroupProps,
  IRadioGroupState,
  IRadioGroupSlotProps,
  IRadioGroupRenderData,
  IRadioGroupContext,
} from './RadioGroup.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings } from './RadioGroup.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens } from '@fluentui-react-native/tokens';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

export const RadioGroupContext = React.createContext<IRadioGroupContext>({
  selectedKey: null,
  onChange: (/* key: string */) => {
    return;
  },
  updateSelectedButtonRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  buttonKeys: [],
});

export const RadioGroup = compose<IRadioGroupType>({
  displayName: radioGroupName,

  usePrepareProps: (userProps: IRadioGroupProps, useStyling: IUseComposeStyling<IRadioGroupType>) => {
    const { label, ariaLabel, selectedKey, defaultSelectedKey, ...rest } = userProps;

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(selectedKey || defaultSelectedKey || null, userProps.onChange);

    const [selectedButtonRef, setSelectedButtonRef] = React.useState(React.useRef<View>(null));

    const onSelectButtonRef = React.useCallback(
      (ref: React.RefObject<View>) => {
        setSelectedButtonRef(ref);
      },
      [setSelectedButtonRef],
    );

    const state: IRadioGroupState = {
      context: {
        selectedKey: selectedKey ?? data.selectedKey,
        onChange: data.onKeySelect,
        updateSelectedButtonRef: onSelectButtonRef,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const ariaRoles = {
      accessibilityRole: 'radiogroup',
      accessibilityLabel: ariaLabel || label,
    };

    const slotProps = mergeSettings<IRadioGroupSlotProps>(styleProps, {
      root: { rest, ...ariaRoles },
      label: { children: label },
      container: { isCircularNavigation: true, defaultTabbableElement: selectedButtonRef },
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<IRadioGroupSlotProps>, renderData: IRadioGroupRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state == undefined) {
      return null;
    }

    // Populate the buttonKeys array
    if (children) {
      /* eslint-disable @typescript-eslint/ban-ts-ignore */
      // @ts-ignore - TODO, fix typing error
      renderData.state.context.buttonKeys = React.Children.map(children, (child: React.ReactChild) => {
        if (React.isValidElement(child)) {
          return child.props.buttonKey;
        }
      });
    }

    return (
      <RadioGroupContext.Provider
        // Passes in the selected key and a hook function to update the newly selected button and call the client's onChange callback
        value={renderData.state.context}
      >
        <Slots.root>
          <Slots.label />
          <Slots.container>{children}</Slots.container>
        </Slots.root>
      </RadioGroupContext.Provider>
    );
  },

  settings,
  slots: {
    root: View,
    label: Text,
    container: FocusZone,
  },
  styles: {
    root: [],
    label: [foregroundColorTokens, textTokens],
    container: [],
  },
});

export default RadioGroup;
