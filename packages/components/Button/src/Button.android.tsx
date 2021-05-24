/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { IButtonSlotProps, IButtonState, IButtonProps, IButtonRenderData, buttonName, IButtonType } from './Button.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { settings } from './Button.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useAsPressable, useViewCommandFocus, createIconProps } from '@fluentui-react-native/interactive-hooks';
import { Icon } from '@fluentui-react-native/icon';

export const Button = compose<IButtonType>({
  displayName: buttonName,
  usePrepareProps: (userProps: IButtonProps, useStyling: IUseComposeStyling<IButtonType>) => {
    const { icon, content, accessibilityLabel = userProps.content, testID, onClick, ...rest } = userProps;
    // attach the pressable state handlers
    const pressable = useAsPressable({ ...rest, onPress: onClick });
    // set up state
    const state: IButtonState = {
      info: {
        ...pressable.state,
        disabled: !!userProps.disabled,
        content: !!content,
        icon: !!icon,
      },
    };

    const buttonRef = useViewCommandFocus(userProps.componentRef);
    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);
    // create the merged slot props

    const slotProps = mergeSettings<IButtonSlotProps>(styleProps, {
      ripple: {
        ...pressable.props,
        ref: buttonRef,
        accessibilityLabel: accessibilityLabel,
        accessibilityState: { disabled: state.info.disabled },
        focusable: !state.info.disabled,
      },
      content: { children: content, testID: testID },
      icon: createIconProps(icon),
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<IButtonSlotProps>, renderData: IButtonRenderData, ...children: React.ReactNode[]) => {
    const info = renderData.state!.info;
    return (
      <Slots.root>
        <Slots.ripple>
          <Slots.stack>
            {info.icon && <Slots.icon />}
            {info.content && <Slots.content />}
            {children}
          </Slots.stack>
        </Slots.ripple>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    ripple: Pressable,
    stack: { slotType: View, filter: filterViewProps },
    icon: { slotType: Icon as React.ComponentType<object> },
    content: Text,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    ripple: [],
    stack: [],
    icon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
  },
});

export default Button;
