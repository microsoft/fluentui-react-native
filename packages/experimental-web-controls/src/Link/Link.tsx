/** @jsx withSlots */
'use strict';

import { compose } from '@uifabricshared/foundation-compose';
import { ILinkSlotProps, ILinkRenderData, ILinkProps, ILinkState } from './Link.types';
import { Text } from '../Text';
import { settings } from './Link.settings';
import { useLinkPrepareProps } from './Link.helpers';
import { textTokens } from '../tokens';
import { foregroundColorTokens } from '../tokens/ColorTokens';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';

export const Link = compose<ILinkProps, ILinkSlotProps, ILinkState>({
  displayName: 'Link',
  settings,
  usePrepareProps: useLinkPrepareProps,
  render: (Slots: ISlots<ILinkSlotProps>, renderData: ILinkRenderData) => {
    const URL = renderData.state.URL;
    return URL ? (
      <Slots.root>
        <Slots.content />
      </Slots.root>
    ) : (
      <Slots.buttonAsRoot>
        <Slots.content />
      </Slots.buttonAsRoot>
    );
  },
  slots: {
    root: {
      slotType: 'a'
    },
    buttonAsRoot: {
      slotType: 'button'
    },
    content: {
      slotType: Text,
      styleFactories: [textTokens, foregroundColorTokens]
    }
  }
});

export default Link;
