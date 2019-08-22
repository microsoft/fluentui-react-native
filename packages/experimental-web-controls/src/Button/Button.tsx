import { IButtonComponent } from './Button.types';
import { compose } from '@uifabric/foundation-compose';
// import { Stack } from '../Stack';
import { Text } from '../Text/index';
import { keyProps, processor, finalizer, themeQueryInputs, usePrepareState, view } from './Button.helpers';
import { loadButtonSettings } from './Button.settings';
import { Stack } from '../Stack/index';

loadButtonSettings();

export const Button = compose<IButtonComponent>({
  className: 'RNFButton',
  usePrepareState,
  themeQueryInputs,
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
