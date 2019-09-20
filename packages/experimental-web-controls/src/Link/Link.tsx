/** @jsx withSlots */
'use strict';

import { compose } from '@uifabricshared/foundation-compose';
import { ILinkComponent, ILinkSlotProps, ILinkRenderData } from './Link.types';
import { Text } from '../Text';
import { loadLinkSettings } from './Link.settings';
import { useLinkPrepareProps } from './Link.helpers';
import { textTokens } from '../tokens';
import { foregroundColorTokens } from '../tokens/ColorTokens';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';

loadLinkSettings();

export const Link = compose<ILinkComponent>({
  displayName: 'Link',
  settings: ['RNFLink'],
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
