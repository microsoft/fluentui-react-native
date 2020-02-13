/** @jsx withSlots */
import { Image, View, ViewStyle, ImageStyle, ImageURISource, TextStyle } from 'react-native';
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
import { buildPersonaCoinRootStyles, buildPersonaCoinContentStyles } from './PersonaCoin.tokens';
import { colorTokens } from '../../tokens';

function usePrepareForProps(
  props: IPersonaCoinProps,
  useStyling: IUseComposeStyling<IPersonaCoinType>
): IRenderData<IPersonaCoinSlotProps, IPersonaCoinState> {

  const { imageUrl, imageDescription, size, initials, coinColor, presence } = props;

  const useSizeFromProps = size !== undefined;
  const normalizedSize = size === undefined ? PersonaSize.size40 : size;
  const { physicalCoinSize, initialsFontSize, iconSize } = getSizeConfig(normalizedSize);

  const sizeStyle: ImageStyle = {};
  if (useSizeFromProps) { 
    sizeStyle.width = physicalCoinSize;
    sizeStyle.height = physicalCoinSize;
  }

  const { ...rest } = props;
  const rootStyle: ViewStyle = sizeStyle;

  let personaPhotoSource: ImageURISource | undefined;
  let photoStyle: ImageStyle | undefined;
  let initialsStyle: TextStyle | undefined;

  if (imageUrl) {
    personaPhotoSource = {
      uri: imageUrl
    };

    photoStyle = {...sizeStyle};
    if (useSizeFromProps) {
      photoStyle.borderRadius = physicalCoinSize / 2;
    }
  } else {
    initialsStyle = {};

    if (useSizeFromProps) {
      initialsStyle.borderRadius = physicalCoinSize / 2;
      initialsStyle.fontSize = initialsFontSize;
    }

    if (coinColor !== undefined) {
      initialsStyle.backgroundColor = convertCoinColor(coinColor);
    }
  }

  let iconSource: ImageURISource | undefined = undefined;
  let iconStyle: ImageStyle | undefined = undefined;
  if (presence) {
    iconSource = getPresenceIconSource(presence);
    iconStyle = {
      position: 'absolute',
    };

    if (useSizeFromProps && iconSize > 0 ) {
      iconStyle.width = iconSize;
      iconStyle.height = iconSize;
    }
  }

  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(useStyling(props), {
      root: { ...rest, style: rootStyle },
      initials: {
        initials,
        style: initialsStyle
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
    initials: [
      colorTokens,
      { source: 'initialsFontSize', target: 'fontSize' },
      buildPersonaCoinContentStyles
    ],
    photo: [
      { source: 'coinSize', target: 'width' },
      { source: 'coinSize', target: 'height' },
      buildPersonaCoinContentStyles
    ]
  }
});
