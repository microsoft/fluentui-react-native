/** @jsx withSlots */
import { Image, View, ViewStyle, ImageStyle, ImageURISource } from 'react-native';
import {
  IPersonaCoinProps,
  IPersonaCoinType,
  personaCoinName,
  IPersonaCoinSlotProps,
  IPersonaCoinRenderData,
  PersonaSize,
  IPersonaCoinState
} from './PersonaCoin.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps, filterImageProps } from '../../utilities/RenderHelpers';
import { settings } from './PersonaCoin.settings';
import { ISlots, withSlots, IRenderData } from '@uifabricshared/foundation-composable';
import { Initials } from './PersonaCoinInitials';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { getSizeConfig, convertCoinColor, getPresenceIconSource } from './PersonaCoin.helpers';
import { buildPersonaCoinRootStyles } from './PersonaCoin.tokens';
import { foregroundColorTokens, backgroundColorTokens } from '../../tokens';

function usePrepareForProps(
  props: IPersonaCoinProps,
  useStyling: IUseComposeStyling<IPersonaCoinType>
): IRenderData<IPersonaCoinSlotProps, IPersonaCoinState> {
  const { imageUrl, imageDescription, size, initials, coinColor, presence } = props;
  const normalizedSize = size === undefined ? PersonaSize.size40 : size;

  const { physicalCoinSize, initialsFontSize, iconSize } = getSizeConfig(normalizedSize);

  const { ...rest } = props;
  const rootStyle: ViewStyle = {
    width: physicalCoinSize,
    height: physicalCoinSize
  };

  const personaPhotoSource: ImageURISource | undefined = imageUrl
    ? {
        uri: imageUrl,
        width: physicalCoinSize,
        height: physicalCoinSize
      }
    : undefined;
  const photoStyle: ImageStyle | undefined = imageUrl
    ? {
        borderRadius: physicalCoinSize / 2,
        width: physicalCoinSize,
        height: physicalCoinSize
      }
    : undefined;

  let iconSource: ImageURISource | undefined = undefined;
  let iconStyle: ImageStyle | undefined = undefined;
  if (!!presence && iconSize > 0) {
    iconSource = getPresenceIconSource(presence);
    iconStyle = {
      position: 'absolute',
      width: iconSize,
      height: iconSize
    };
  }

  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(useStyling(props), {
      root: { ...rest, style: rootStyle },
      initials: {
        size: physicalCoinSize,
        initials,
        fontSize: initialsFontSize,
        backgroundColor: convertCoinColor(coinColor),
        color: 'white' // for initials, we always render it as white, unless it is customized
      },
      photo: {
        accessibilityLabel: imageDescription,
        resizeMode: 'cover',
        style: photoStyle
      },
      icon: {
        style: iconStyle
      }
    }),
    state: {
      iconSource,
      personaPhotoSource
    }
  };
}

const render = (Slots: ISlots<IPersonaCoinSlotProps>, renderData: IPersonaCoinRenderData): JSX.Element | null => {
  if (!renderData.state) {
    return null;
  }

  const { personaPhotoSource, iconSource } = renderData.state;

  return (
    <Slots.root>
      {personaPhotoSource ? <Slots.photo source={personaPhotoSource} /> : <Slots.initials {...renderData.slotProps!.initials} />}
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
