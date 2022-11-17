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
import { useAsPressable, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { Icon, createIconProps } from '@fluentui-react-native/icon';

/**
 * @deprecated This component is deprecated in favor of ButtonV1. This Button will be removed when the package moves to 1.0.0.
 * At that point, ButtonV1 will be renamed to Button. Please see MIGRATION.md for details on how to move to the new Button.
 */
export const Button = compose<IButtonType>({
  displayName: buttonName,
  usePrepareProps: (userProps: IButtonProps, useStyling: IUseComposeStyling<IButtonType>) => {
    const { icon, startIcon, endIcon, content, accessibilityLabel = userProps.content, testID, onClick, ...rest } = userProps;
    // attach the pressable state handlers
    const pressable = useAsPressable({ ...rest, onPress: onClick });
    // set up state
    const state: IButtonState = {
      info: {
        ...pressable.state,
        disabled: !!userProps.disabled,
        content: !!content,
        startIcon: !!startIcon || !!icon,
        endIcon: !!endIcon,
      },
    };

    const buttonRef = useViewCommandFocus(userProps.componentRef);
    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);
    // create the merged slot props

    const slotProps = mergeSettings<IButtonSlotProps>(styleProps, {
      root: {
        ref: buttonRef,
      },
      ripple: {
        ...pressable.props,
        accessibilityLabel: accessibilityLabel,
        accessibilityState: { disabled: state.info.disabled },
        focusable: !state.info.disabled,
        testID,
      },
      content: { children: content },
      startIcon: createIconProps(startIcon || icon),
      endIcon: createIconProps(endIcon),
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
            {info.startIcon && <Slots.startIcon />}
            {info.content && <Slots.content />}
            {children}
            {info.endIcon && <Slots.endIcon />}
          </Slots.stack>
        </Slots.ripple>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    ripple: Pressable,
    stack: { slotType: View, filter: filterViewProps },
    startIcon: { slotType: Icon as React.ComponentType },
    content: Text,
    endIcon: { slotType: Icon as React.ComponentType },
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    ripple: [],
    stack: [],
    startIcon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
    endIcon: [],
  },
});

export default Button;
