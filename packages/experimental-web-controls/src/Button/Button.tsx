import { IButtonComponent } from './Button.types';
import { compose } from '@uifabric/foundation-compose';
// import { Stack } from '../Stack';
import { Text } from '../Text/index';
import { finalizer, themeQueryInputs, usePrepareState, view } from './Button.helpers';
import { loadButtonSettings } from './Button.settings';
import { Stack } from '../Stack/index';
import { token } from '@uifabric/foundation-tokens';
import { textTokens, borderTokens } from '../tokens';
import { backgroundColorTokens, foregroundColorTokens, getPaletteFromTheme } from '../tokens/ColorTokens';

loadButtonSettings();

export const Button = compose<IButtonComponent>({
  className: 'RNFButton',
  usePrepareState,
  themeQueryInputs,
  tokens: [
    token(textTokens, 'content'),
    token(backgroundColorTokens, 'root'),
    token(foregroundColorTokens, 'icon', 'content'),
    token(borderTokens, 'root'),
    token([{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'overlayColor' }], 'icon')
  ],
  finalizer,
  view,
  slots: {
    root: Stack,
    icon: 'image',
    content: Text
  }
});

export default Button;
