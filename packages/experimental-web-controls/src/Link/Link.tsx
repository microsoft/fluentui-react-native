/**

 */
'use strict';

import { compose } from '@uifabric/foundation-compose';
import { ILinkComponent } from './Link.types';
import { Text } from '../Text';
import { loadLinkSettings } from './Link.settings';
import { usePrepareState, processor, keyProps, finalizer, themeQueryInputs, tokenKeys, view } from './Link.helpers';

loadLinkSettings();

export const Link = compose<ILinkComponent>({
  className: 'RNFLink',
  usePrepareState,
  themeQueryInputs,
  tokenProcessors: [{ processor, keyProps }],
  finalizer,
  tokenKeys,
  view,
  slots: {
    root: true ? 'a' : 'button',
    content: Text
  }
});

export default Link;
