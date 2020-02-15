/** @jsx withSlots */
import { Image, View, ImageURISource, Text } from 'react-native';
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
import {  getPresenceIconSource } from './PersonaCoin.helpers';
import { buildRootStyles, buildPhotoStyles, buildInitialsStyles, buildInitialsBackgroundStyles, buildIconStyles } from './PersonaCoin.tokens';
import { foregroundColorTokens } from '../../tokens';

function usePrepareForProps(
  props: IPersonaCoinProps,
  useStyling: IUseComposeStyling<IPersonaCoinType>
): IRenderData<IPersonaCoinSlotProps, IPersonaCoinState> {
  const { imageUrl, imageDescription, initials,  presence, ...rest } = props;

  let personaPhotoSource: ImageURISource | undefined = undefined;
  if (imageUrl) {
    personaPhotoSource = {
      uri: imageUrl
    };
  }

  let iconSource: ImageURISource | undefined = undefined;
  if (presence) {
    iconSource = getPresenceIconSource(presence);
  }

  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(useStyling(props), {
      root: { ...rest },
      initials: {
        children: initials,
      },
      photo: {
        accessibilityLabel: imageDescription,
        resizeMode: 'cover',
      },
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
    root: [buildRootStyles],
    initials: [foregroundColorTokens, buildInitialsStyles],
    initialsBackground: [buildInitialsBackgroundStyles],
    photo: [buildPhotoStyles],
    icon: [buildIconStyles],
  }
});
