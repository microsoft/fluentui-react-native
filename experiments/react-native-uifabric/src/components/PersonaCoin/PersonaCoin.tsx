/** @jsx withSlots */
import { Image, View, ImageStyle, ImageURISource, TextStyle, ViewStyle, Text } from 'react-native';
import {
  IPersonaCoinProps,
  IPersonaCoinType,
  IPersonaCoinSlotProps,
  IPersonaCoinRenderData,
  IPersonaCoinState,
  personaCoinName
} from './PersonaCoin.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps, filterImageProps } from '../../utilities/RenderHelpers';
import { settings } from './PersonaCoin.settings';
import { ISlots, withSlots, IRenderData } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { getSizeConfig, convertCoinColor, getPresenceIconSource } from './PersonaCoin.helpers';
import { buildPersonaCoinRootStyles, buildPersonaCoinContentStyles } from './PersonaCoin.tokens';
import { foregroundColorTokens, backgroundColorTokens } from '../../tokens';

function usePrepareForProps(
  props: IPersonaCoinProps,
  useStyling: IUseComposeStyling<IPersonaCoinType>
): IRenderData<IPersonaCoinSlotProps, IPersonaCoinState> {
  const { imageUrl, imageDescription, size, initials, coinColor, presence, ...rest } = props;

  const useSizeFromProps = size !== undefined;
  
  const normalizedSize = size || 'size40';
  const { physicalSize: physicalSize, initialsSize, iconSize } = getSizeConfig(normalizedSize);

  const sizeStyle: ImageStyle = {};
  if (useSizeFromProps) {
    sizeStyle.width = physicalSize;
    sizeStyle.height = physicalSize;
  }

  let personaPhotoSource: ImageURISource | undefined;
  let photoStyle: ImageStyle | undefined;
  let initialsStyle: TextStyle | undefined;
  let initialsBackgroundStyle: ViewStyle | undefined;

  if (imageUrl) {
    personaPhotoSource = {
      uri: imageUrl
    };

    photoStyle = { ...sizeStyle };
    if (useSizeFromProps) {
      photoStyle.borderRadius = physicalSize / 2;
    }
  } else {
    initialsStyle = {};
    initialsBackgroundStyle = { flexGrow: 1, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' };

    if (useSizeFromProps) {
      initialsBackgroundStyle.borderRadius = physicalSize / 2;
      initialsStyle.fontSize = initialsSize;
    }

    if (coinColor !== undefined) {
      initialsBackgroundStyle.backgroundColor = convertCoinColor(coinColor);
    }
  }

  let iconSource: ImageURISource | undefined = undefined;
  let iconStyle: ImageStyle | undefined = undefined;
  if (presence) {
    iconSource = getPresenceIconSource(presence);
    iconStyle = {
      position: 'absolute'
    };

    if (useSizeFromProps && iconSize > 0) {
      iconStyle.width = iconSize;
      iconStyle.height = iconSize;
    }
  }

  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(useStyling(props), {
      root: { ...rest, style: sizeStyle },
      initials: {
        children: initials,
        style: initialsStyle
      },
      initialsBackground: {
        style: initialsBackgroundStyle
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
      {personaPhotoSource ? (
        <Slots.photo source={personaPhotoSource} />
      ) : (
        <Slots.initialsBackground>
          <Slots.initials />
        </Slots.initialsBackground>
      )}
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
    initials: Text,
    initialsBackground: {
      slotType: View,
      filter: filterViewProps
    },
    icon: {
      slotType: Image,
      filter: filterImageProps
    }
  },
  render: render,
  styles: {
    root: [buildPersonaCoinRootStyles],
    initials: [foregroundColorTokens, { source: 'initialsSize', target: 'fontSize' }],
    initialsBackground: [backgroundColorTokens, buildPersonaCoinContentStyles],
    photo: [{ source: 'coinSize', target: 'width' }, { source: 'coinSize', target: 'height' }, buildPersonaCoinContentStyles],
    icon: [
      { source: 'iconSize', target: 'width' },
      { source: 'iconSize', target: 'height' }
    ],
  }
});
