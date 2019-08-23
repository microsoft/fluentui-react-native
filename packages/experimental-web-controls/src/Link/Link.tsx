/**

 */
'use strict';

import { compose } from '@uifabric/foundation-compose';
import { ILinkComponent } from './Link.types';
import { Text } from '../Text';
import { loadLinkSettings } from './Link.settings';
import { finalizer, keyProps, LinkRoot, processor, themeQueryInputs, tokenKeys, usePrepareState, view } from './Link.helpers';

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
    root: LinkRoot,
    content: Text
  }
});

export default Link;
