/** @jsx withSlots */
import { Image, View } from 'react-native';
import {
  IPersonaCoinProps,
  IPersonaCoinType,
  personaCoinName,
  IPersonaCoinSlotProps,
  IPersonaCoinRenderData,
  PersonaSize
} from './PersonaCoin.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps, filterImageProps } from '../../utilities/RenderHelpers';
import { settings } from './PersonaCoin.settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Initials } from './PersonaCoinInitials';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { getSizeConfig, convertCoinColor } from './PersonaCoin.helpers';
import { buildPersonaCoinRootStyles } from './PersonaCoin.tokens';
import { foregroundColorTokens, backgroundColorTokens } from '../../tokens';

const usePrepareForProps = (props: IPersonaCoinProps, useStyling: IUseComposeStyling<IPersonaCoinType>) => {
  const { imageUrl, imageDescription, size, initials, coinColor } = props;
  const normalizedSize = size === undefined ? PersonaSize.size40 : size;

  const { physicalCoinSize, initialsFontSize: initialFontSize } = getSizeConfig(normalizedSize);

  const personaPhotoSource = imageUrl
    ? {
        uri: imageUrl,
        width: physicalCoinSize,
        height: physicalCoinSize
      }
    : undefined;

  const { ...rest } = props;
  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(useStyling(props), {
      root: rest,
      intials: {
        size: physicalCoinSize,
        initials,
        fontSize: initialFontSize,
        backgroundColor: convertCoinColor(coinColor),
        color: 'white' // for initials, we always render it as white
      },
      photo: {
        accessibilityLabel: imageDescription,
        resizeMode: 'cover'
      },
      icon: {}
    }),
    state: {
      iconSource: undefined,
      personaPhotoSource
    }
  };
};

const render = (Slots: ISlots<IPersonaCoinSlotProps>, renderData: IPersonaCoinRenderData): JSX.Element | null => {
  if (!renderData.state) {
    return null;
  }

  const { personaPhotoSource, iconSource } = renderData.state;

  return (
    <Slots.root>
      {personaPhotoSource ? <Slots.photo source={personaPhotoSource} /> : <Slots.initials />}
      {!!iconSource && <Slots.icon source={iconSource} />}
    </Slots.root>
  );
};

export const PersonaCoin = compose<IPersonaCoinType>({
  displayName: personaCoinName,
  usePrepareProps: usePrepareForProps,
  settings: settings,
  slots: {
    root: {
      slotType: View,
      filter: filterViewProps
    },
    photo: {
      slotType: Image,
      filter: filterImageProps
    },
    initials: Initials,
    icon: {
      slotType: Image as React.ComponentType<object>,
      filter: filterImageProps
    }
  },
  render: render,
  styles: {
    root: [buildPersonaCoinRootStyles],
    icon: [
      { source: 'iconSize', target: 'width' },
      { source: 'iconSize', target: 'height' }
    ],
    initials: [foregroundColorTokens, { source: 'initialsFontSize', target: 'fontSize' }],
    photo: [backgroundColorTokens]
  }
});
