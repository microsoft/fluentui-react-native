/** @jsx withSlots */
import { IButtonComponent, IButtonSlots, IButtonRenderData } from './Button.types';
import { compose } from '@uifabric/foundation-compose';
// import { Stack } from '../Stack';
import { Text } from '../Text/index';
import { finalizer, themeQueryInputs, usePrepareState, view } from './Button.helpers';
import { loadButtonSettings } from './Button.settings';
import { Stack } from '../Stack/index';
import { textTokens, borderTokens } from '../tokens';
import { backgroundColorTokens, foregroundColorTokens, getPaletteFromTheme } from '../tokens/ColorTokens';
import { ISlots, withSlots } from '@uifabric/foundation-composable';

loadButtonSettings();

export function view(result: IAsResolved<IButtonRenderData>, ...children: React.ReactNode[]): JSX.Element | null {
  const slots = result.slots!;
  const info = result.state.info;
  const additionalChildren = children || [result.props.children];

  return renderSlot(slots.root, info.icon && renderSlot(slots.icon), info.content && renderSlot(slots.content), ...additionalChildren);
}

export const Button = compose<IButtonComponent>({
  displayName: 'Button',
  settings: ['RNFButton'],
  usePrepareState,
  themeQueryInputs,
  finalizer,
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
