/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';

import type { ISlots } from '@uifabricshared/foundation-composable';
import { compose } from '@uifabricshared/foundation-compose';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import NativeRadioButtonView from './MacOSRadioButtonNativeComponent';
import type { IRadioButtonProps, IRadioButtonSlotProps, IRadioButtonType } from './RadioButton.types';
import { radioButtonName } from './RadioButton.types';
import { RadioGroupContext } from './RadioGroup';

export const RadioButton = compose<IRadioButtonType>({
  displayName: radioButtonName,
  usePrepareProps: (userProps: IRadioButtonProps, useStyling: IUseComposeStyling<IRadioButtonType>) => {
    const defaultComponentRef = React.useRef(null);
    const { content, buttonKey, disabled, componentRef = defaultComponentRef } = userProps;
    const info = React.useContext(RadioGroupContext);

    // Reroute the native component's onPress event to RadioGroup's onChange
    const onPressRerouted = () => {
      // Prevent calls to RadioGroup's onChange on the currently selected button
      if (buttonKey != info.selectedKey) {
        info.onChange && info.onChange(buttonKey);
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    };

    /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
    React.useEffect(() => {
      if (buttonKey === info.selectedKey) {
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    }, []);

    const styleProps = useStyling(userProps);
    const isSelected = info.selectedKey === buttonKey;
    const slotProps = mergeSettings<IRadioButtonSlotProps>(styleProps, {
      root: {
        ref: componentRef,
        buttonKey: buttonKey,
        content: content,
        disabled: disabled,
        onPress: onPressRerouted,
        selected: isSelected,
        style: {
          minWidth: '100%',
          minHeight: 20,
        },
      },
    });

    return { slotProps };
  },
  slots: {
    root: NativeRadioButtonView,
  },
  styles: {
    root: [],
  },
  render: (Slots: ISlots<IRadioButtonSlotProps>) => {
    return <Slots.root />;
  },
});

export default RadioButton;
