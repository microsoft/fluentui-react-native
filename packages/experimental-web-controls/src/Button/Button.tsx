/** @jsx withSlots */
import { IButtonComponent, IButtonSlots, IButtonRenderData, IButtonCustomizableProps, IButtonState } from './Button.types';
import { compose, IUseOpinionatedStyling } from '@uifabric/foundation-compose';
// import { Stack } from '../Stack';
import { Text } from '../Text/index';
import { loadButtonSettings } from './Button.settings';
import { Stack } from '../Stack/index';
import { textTokens, borderTokens } from '../tokens';
import { backgroundColorTokens, foregroundColorTokens, getPaletteFromTheme } from '../tokens/ColorTokens';
import { ISlots, withSlots } from '@uifabric/foundation-composable';
import { useAsPressable } from '../Pressable';
import { mergeSettings } from '@uifabric/foundation-settings';

loadButtonSettings();

export const Button = compose<IButtonComponent>({
  displayName: 'Button',
  settings: ['RNFButton'],
  usePrepareProps: (userProps: IButtonCustomizableProps, useStyling: IUseOpinionatedStyling<IButtonCustomizableProps, IButtonSlots>) => {
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
