/** @jsx withSlots */
import { Image, View, ViewStyle, ImageStyle, ImageURISource, TextStyle } from 'react-native';
import {
  IPersonaCoinProps,
  IPersonaCoinType,
  personaCoinName,
  IPersonaCoinSlotProps,
  IPersonaCoinRenderData,
  PersonaSize,
  IPersonaCoinState,
  PersonaCoinColor
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

  const normalizedCoinColor = coinColor === undefined ? PersonaCoinColor.lightBlue : coinColor;

  const { physicalCoinSize, initialsFontSize, iconSize } = getSizeConfig(normalizedSize);

  const { ...rest } = props;
  const rootStyle: ViewStyle = {
    width: physicalCoinSize,
    height: physicalCoinSize
  };

  let personaPhotoSource: ImageURISource | undefined;
  let photoStyle: ImageStyle | undefined;
  let initialsStyle: ViewStyle | undefined;
  let initialsTextStyle: TextStyle | undefined;

  if (imageUrl) {
    personaPhotoSource = {
      uri: imageUrl,
      width: physicalCoinSize,
      height: physicalCoinSize
    };

    photoStyle = {
      borderRadius: physicalCoinSize / 2,
      width: physicalCoinSize,
      height: physicalCoinSize
    };
  } else {
    initialsStyle = {
      borderRadius: physicalCoinSize / 2,
      width: physicalCoinSize,
      height: physicalCoinSize,
      backgroundColor: convertCoinColor(normalizedCoinColor)
    };
    initialsTextStyle = {
      fontSize: initialsFontSize,
      color: 'white'
    };
  }

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

  const stylized = useStyling(props);

  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(stylized, {
      root: { ...rest, style: rootStyle },
      initials: {
        initials,
        style: initialsStyle,
        textStyle: initialsTextStyle
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
    initials: [foregroundColorTokens, backgroundColorTokens, { source: 'initialsFontSize', target: 'fontSize' }],
    photo: []
  }
});
