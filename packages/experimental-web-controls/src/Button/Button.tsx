import { IButtonComponent } from './Button.types';
import { compose } from '@uifabric/foundation-compose';
// import { Stack } from '../Stack';
import { Text } from '../Text';
import { keyProps, processor, finalizer, themeSettings, usePrepareState, view } from './Button.helpers';
import { loadButtonSettings } from './Button.settings';
import { Stack } from '../Stack';

loadButtonSettings();

export const Button = compose<IButtonComponent>({
  className: 'RNFButton',
  usePrepareState,
  themeSettings,
  tokenProcessors: [{ processor, keyProps }],
  finalizer,
  view,
  slots: {
    root: Stack,
    icon: 'image',
    content: Text
  }
});

export default Button;
