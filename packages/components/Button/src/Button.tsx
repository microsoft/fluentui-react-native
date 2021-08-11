/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { IButtonSlotProps, IButtonState, IButtonProps, IButtonRenderData, buttonName, IButtonType } from './Button.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { settings } from './Button.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { SvgXml } from 'react-native-svg';
import {
  useAsPressable,
  useKeyCallback,
  useViewCommandFocus,
  createIconProps,
  useOnPressWithFocus,
} from '@fluentui-react-native/interactive-hooks';
import { Icon } from '@fluentui-react-native/icon';

export const Button = compose<IButtonType>({
  displayName: buttonName,
  usePrepareProps: (userProps: IButtonProps, useStyling: IUseComposeStyling<IButtonType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      icon,
      content,
      onAccessibilityTap = userProps.onClick,
      accessibilityLabel = userProps.content,
      componentRef = defaultComponentRef,
      testID,
      onClick,
      ...rest
    } = userProps;

    // Ensure focus is placed on button after click
    const onPressWithFocus = useOnPressWithFocus(componentRef, onClick);
    // attach the pressable state handlers
    const pressable = useAsPressable({ ...rest, onPress: onPressWithFocus });
    const onKeyUp = useKeyCallback(onClick, ' ', 'Enter');
    // set up state
    const state: IButtonState = {
      info: {
        ...pressable.state,
        disabled: !!userProps.disabled,
        content: !!content,
        icon: !!icon,
        dropdown: !!userProps.dropdown,
      },
    };

    const buttonRef = useViewCommandFocus(componentRef);
    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);
    // create the merged slot props

    const slotProps = mergeSettings<IButtonSlotProps>(styleProps, {
      root: {
        ...pressable.props,
        ref: buttonRef,
        onAccessibilityTap: onAccessibilityTap,
        accessibilityLabel: accessibilityLabel,
        accessibilityState: { disabled: state.info.disabled },
        onKeyUp: onKeyUp,
      },
      content: { children: content, testID: testID },
      icon: createIconProps(icon),
      chevron: {},
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<IButtonSlotProps>, renderData: IButtonRenderData, ...children: React.ReactNode[]) => {
    const info = renderData.state!.info;
    const xml = `
    <svg width="11" height="6" viewBox="0 0 11 6">
      <path fill='currentColor' d="M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z" />
    </svg>`;
    return (
      <Slots.root>
        <Slots.stack>
          {info.icon && <Slots.icon />}
          {info.content && <Slots.content />}
          {children}
          {info.dropdown && <Slots.chevron xml={xml} />}
        </Slots.stack>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    stack: { slotType: View, filter: filterViewProps },
    icon: { slotType: Icon as React.ComponentType },
    content: Text,
    chevron: SvgXml,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    stack: [],
    icon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
  },
});

export default Button;
