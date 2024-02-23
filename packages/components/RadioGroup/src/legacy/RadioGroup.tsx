/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';
import { Text } from '@fluentui-react-native/text';
import { foregroundColorTokens, textTokens } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import { withSlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings } from './RadioGroup.settings';
import type {
  IRadioGroupType,
  IRadioGroupProps,
  IRadioGroupState,
  IRadioGroupSlotProps,
  IRadioGroupRenderData,
  IRadioGroupContext,
} from './RadioGroup.types';
import { radioGroupName } from './RadioGroup.types';

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
    const { label, ariaLabel, accessibilityLabel, selectedKey, defaultSelectedKey, ...rest } = userProps;

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(selectedKey || defaultSelectedKey || null, userProps.onChange);

    const [selectedButtonRef, setSelectedButtonRef] = React.useState(React.useRef<View>(null));

    const onSelectButtonRef = React.useCallback(
      (ref: React.RefObject<View>) => {
        setSelectedButtonRef(ref);
      },
      [setSelectedButtonRef],
    );

    const [invoked, setInvoked] = React.useState(false);

    const onInvoked = React.useCallback(
      (check: boolean) => {
        setInvoked(check);
      },
      [setInvoked],
    );

    const [buttonKeys, setButtonKeys] = React.useState([]);

    const onAddRadioButtonKey = React.useCallback(
      (buttonKey: string) => {
        buttonKeys.push(buttonKey);
        setButtonKeys(buttonKeys);
      },
      [setButtonKeys],
    );

    const onRemoveRadioButtonKey = React.useCallback(
      (buttonKey: string) => {
        buttonKeys.filter((item) => item !== buttonKey);
        setButtonKeys(buttonKeys);
      },
      [setButtonKeys],
    );

    const [enabledButtonKeys, setEnabledButtonKeys] = React.useState([]);

    const onAddRadioButtonEnabledKey = React.useCallback(
      (buttonKey: string) => {
        enabledButtonKeys.push(buttonKey);
        setEnabledButtonKeys(enabledButtonKeys);
      },
      [setEnabledButtonKeys],
    );

    const onRemoveRadioButtonEnabledKey = React.useCallback(
      (buttonKey: string) => {
        enabledButtonKeys.filter((item) => item !== buttonKey);
        setEnabledButtonKeys(enabledButtonKeys);
      },
      [setEnabledButtonKeys],
    );

    const state: IRadioGroupState = {
      context: {
        selectedKey: selectedKey ?? data.selectedKey,
        onChange: data.onKeySelect,
        updateSelectedButtonRef: onSelectButtonRef,
        invoked: invoked,
        updateInvoked: onInvoked,
        buttonKeys: buttonKeys,
        enabledButtonKeys: enabledButtonKeys,
        addRadioButtonKey: onAddRadioButtonKey,
        removeRadioButtonKey: onRemoveRadioButtonKey,
        addRadioButtonEnabledKey: onAddRadioButtonEnabledKey,
        removeRadioButtonEnabledKey: onRemoveRadioButtonEnabledKey,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<IRadioGroupSlotProps>(styleProps, {
      root: { accessibilityLabel: accessibilityLabel ?? ariaLabel ?? label, accessibilityRole: 'radiogroup', ...rest },
      label: { children: label },
      container: { isCircularNavigation: true, defaultTabbableElement: selectedButtonRef },
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<IRadioGroupSlotProps>, renderData: IRadioGroupRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state == undefined) {
      return null;
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
