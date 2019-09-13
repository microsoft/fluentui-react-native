import { IButtonComponent } from './Button.types';
import { compose } from '@uifabric/foundation-compose';
// import { Stack } from '../Stack';
import { Text } from '../Text/index';
import { finalizer, themeQueryInputs, usePrepareState, view } from './Button.helpers';
import { loadButtonSettings } from './Button.settings';
import { Stack } from '../Stack/index';
import { textTokens, borderTokens } from '../tokens';
import { backgroundColorTokens, foregroundColorTokens, getPaletteFromTheme } from '../tokens/ColorTokens';

loadButtonSettings();

export const Button = compose<IButtonComponent>({
  displayName: 'Button',
  settings: ['RNFButton'],
  usePrepareState,
  themeQueryInputs,
  finalizer,
  view,
  // this is an alternative to the above, it moves the declarations to be slot by slot.  This is kind of what is built up
  // internally in the automatic processor function and has the advantage of being able to easily add a slot and define additional
  // mappings.  There is a question of how a custom processor like above would fit in but maybe that isn't even needed in most
  // cases
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
