'use strict';

import { compose } from '@uifabric/foundation-compose';
import { ILinkComponent } from './Link.types';
import { Text } from '../Text';
import { loadLinkSettings } from './Link.settings';
import { finalizer, themeQueryInputs, usePrepareState, view } from './Link.helpers';
import { textTokens } from '../tokens';
import { foregroundColorTokens } from '../tokens/ColorTokens';

loadLinkSettings();

export const Link = compose<ILinkComponent>({
  className: 'RNFLink',
  usePrepareState,
  themeQueryInputs,
  finalizer,
  view,
  slots: {
    root: {
      slotType: 'a'
    },
    ButtonAsRoot: {
      slotType: 'button'
    },
    content: {
      slotType: Text,
      styleFactories: [textTokens, foregroundColorTokens]
    }
  }
});

export default Link;
