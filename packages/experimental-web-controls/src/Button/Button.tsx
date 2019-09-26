/** @jsx withSlots */
import { IButtonSlots, IButtonRenderData, IButtonCustomizableProps, IButtonState, IButtonProps } from './Button.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
// import { Stack } from '../Stack';
import { Text } from '../Text/index';
import { settings } from './Button.settings';
import { Stack } from '../Stack/index';
import { textTokens, borderTokens } from '../tokens';
import { backgroundColorTokens, foregroundColorTokens, getPaletteFromTheme } from '../tokens/ColorTokens';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { useAsPressable } from '../Pressable';
import { mergeSettings } from '@uifabricshared/foundation-settings';

export const Button = compose<IButtonProps, IButtonSlots, IButtonState>({
  displayName: 'Button',
  settings,
  usePrepareProps: (userProps: IButtonCustomizableProps, useStyling: IUseComposeStyling<IButtonSlots>) => {
    const { icon, content, ...rest } = userProps;
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

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, override => state.info[override] || userProps[override]);

    // create the merged slot props
    const slotProps = mergeSettings<IButtonSlots>(styleProps, {
      root: pressable.props,
      content: { children: content },
      icon: { children: icon }
    });

    return { slotProps, state };
  },
  render: (Slots: ISlots<IButtonSlots>, renderData: IButtonRenderData, ...children: React.ReactNode[]) => {
    const info = renderData.state.info;
    return (
      <Slots.root>
        {info.icon && <Slots.icon />}
        {info.content && <Slots.content />}
        {...children}
      </Slots.root>
    );
  },
  slots: {
    root: {
      slotType: Stack,
      styleFactories: [backgroundColorTokens, borderTokens]
    },
    icon: {
      slotType: 'image',
      styleFactories: [foregroundColorTokens, [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'overlayColor' }]]
    },
    content: {
      slotType: Text,
      styleFactories: [textTokens, foregroundColorTokens]
    }
  }
});

export default Button;
