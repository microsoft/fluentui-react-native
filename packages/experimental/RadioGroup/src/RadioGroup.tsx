/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import {
  radioGroupName,
  RadioGroupType,
  RadioGroupProps,
  RadioGroupState,
  RadioGroupSlotProps,
  RadioGroupRenderData,
  RadioGroupContextType,
} from './RadioGroup.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings } from './RadioGroup.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens } from '@fluentui-react-native/tokens';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

export const RadioGroupContext = React.createContext<RadioGroupContextType>({
  value: null,
  onChange: (/* key: string */) => {
    return;
  },
  updateSelectedButtonRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  buttonKeys: [],
});

export const RadioGroup = compose<RadioGroupType>({
  displayName: radioGroupName,

  usePrepareProps: (userProps: RadioGroupProps, useStyling: IUseComposeStyling<RadioGroupType>) => {
    const { label, accessibilityLabel, value, defaultValue, ...rest } = userProps;

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(value || defaultValue || null, userProps.onChange);

    const [selectedButtonRef, setSelectedButtonRef] = React.useState(React.useRef<View>(null));

    const onSelectButtonRef = React.useCallback(
      (ref: React.RefObject<View>) => {
        setSelectedButtonRef(ref);
      },
      [setSelectedButtonRef],
    );

    const state: RadioGroupState = {
      context: {
        value: value ?? data.selectedKey,
        onChange: data.onKeySelect,
        updateSelectedButtonRef: onSelectButtonRef,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<RadioGroupSlotProps>(styleProps, {
      root: { accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: 'radiogroup', ...rest },
      label: { children: label },
      container: { isCircularNavigation: true, defaultTabbableElement: selectedButtonRef },
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<RadioGroupSlotProps>, renderData: RadioGroupRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state == undefined) {
      return null;
    }

    // Populate the buttonKeys array
    if (children) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
