/** @jsx withSlots */
import * as React from 'react';
import { Image, View } from 'react-native';
import { IButtonSlotProps, IButtonState, IButtonProps, IButtonRenderData, buttonName, IButtonType } from './Button.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '../Text';
import { settings } from './Button.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '../../tokens';
import { filterViewProps, filterImageProps } from '../../utilities/RenderHelpers';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useAsPressable, useViewCommandFocus } from '../../hooks';

export const Button = compose<IButtonType>({
  displayName: buttonName,
  usePrepareProps: (userProps: IButtonProps, useStyling: IUseComposeStyling<IButtonType>) => {
    const {
      icon,
      content,
      onAccessibilityTap = userProps.onPress,
      accessibilityLabel = userProps.content,
      ...rest
    } = userProps;
    // attach the pressable state handlers
    const pressable = useAsPressable(rest);
    // set up state
    const state: IButtonState = {
      info: {
        ...pressable.state,
        disabled: userProps.disabled,
        content: !!content,
        icon: !!icon
      }
    };

    const buttonRef = useViewCommandFocus(userProps.componentRef);
    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);
    // create the merged slot props
    const slotProps = mergeSettings<IButtonSlotProps>(styleProps, {
      root: {
        ...pressable.props,
        ref: buttonRef,
        onAccessibilityTap: onAccessibilityTap,
        accessibilityLabel: accessibilityLabel,
      },
      content: { children: content },
      icon: { source: icon }
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<IButtonSlotProps>, renderData: IButtonRenderData, ...children: React.ReactNode[]) => {
    const info = renderData.state!.info;

    // We shouldn't have to specify the source prop on Slots.icon, here, but we need another drop from @uifabricshared
    return (
      <Slots.root>
        <Slots.stack>
          { info.icon && <Slots.icon source={ renderData.slotProps!.icon.source } /> }
          { info.content && <Slots.content /> }
          { ...children }
        </Slots.stack>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    stack: { slotType: View, filter: filterViewProps },
    icon: { slotType: Image as React.ComponentType<object>, filter: filterImageProps },
    content: Text
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    stack: [],
    icon: [foregroundColorTokens, [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'overlayColor' }]],
    content: [textTokens, foregroundColorTokens]
  }
});

export default Button;
