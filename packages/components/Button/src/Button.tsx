/** @jsx withSlots */
import * as React from 'react';
import { Image, View } from 'react-native';
import { IButtonSlotProps, IButtonState, IButtonProps, IButtonRenderData, buttonName, IButtonType } from './Button.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { settings } from './Button.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useAsPressable, useKeyCallback, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { Icon, RasterImageIconProps, IconProps } from '@fluentui-react-native/icon';

function createIconProps(src: number | string | IconProps) {
  if (src === undefined) return null;

  if (typeof src === 'number') {
    const rasterProps: RasterImageIconProps = { src: src };
    const asset = Image.resolveAssetSource(+src);

    return {
      rasterImageSource: rasterProps,
      width: asset.width,
      height: asset.height,
    };
  } else if (typeof src === 'string') {
    const rasterProps: RasterImageIconProps = { src: { uri: src as string } };
    return { rasterImageSource: rasterProps };
  } else {
    return src as IconProps;
  }
}

export const Button = compose<IButtonType>({
  displayName: buttonName,
  usePrepareProps: (userProps: IButtonProps, useStyling: IUseComposeStyling<IButtonType>) => {
    const {
      icon,
      content,
      onAccessibilityTap = userProps.onClick,
      accessibilityLabel = userProps.content,
      testID,
      onClick,
      ...rest
    } = userProps;
    // attach the pressable state handlers
    const pressable = useAsPressable({ ...rest, onPress: onClick });
    const onKeyUp = useKeyCallback(onClick, ' ', 'Enter');
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

    // Set key focus on the button if it's been pressed.
    React.useEffect(() => {
      if (pressable.state.pressed) {
        userProps.componentRef?.current?.focus();
      }
    }, [pressable.state.pressed]);

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
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<IButtonSlotProps>, renderData: IButtonRenderData, ...children: React.ReactNode[]) => {
    const info = renderData.state!.info;
    return (
      <Slots.root>
        <Slots.stack>
          {info.icon && <Slots.icon />}
          {info.content && <Slots.content />}
          {children}
        </Slots.stack>
      </Slots.root>
    );
  },
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

export default Button;
