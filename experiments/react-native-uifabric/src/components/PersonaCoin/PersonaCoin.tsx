/** @jsx withSlots */
import { Image, View, Text } from 'react-native';
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
import { getPresenceIconSource } from './PersonaCoin.helpers';
import { foregroundColorTokens } from '../../tokens';
import { buildRootStyles } from './PersonaCoin.tokens.root';
import { buildInitialsStyles } from './PersonaCoin.tokens.initials';
import { buildInitialsBackgroundStyles } from './PersonaCoin.tokens.initialsBackground';
import { buildPhotoStyles } from './PersonaCoin.tokens.photo';
import { buildIconStyles } from './PersonaCoin.tokens.icon';

function usePrepareForProps(
  props: IPersonaCoinProps,
  useStyling: IUseComposeStyling<IPersonaCoinType>
): IRenderData<IPersonaCoinSlotProps, IPersonaCoinState> {
  const { imageUrl, imageDescription, initials, presence, ...rest } = props;

  const personaPhotoSource =
    imageUrl === undefined
      ? undefined
      : {
          uri: imageUrl
        };

  const iconSource = presence === undefined ? undefined : getPresenceIconSource(presence);

  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(useStyling(props), {
      root: { ...rest },
      initials: {
        children: initials
      },
      photo: {
        accessibilityLabel: imageDescription,
        resizeMode: 'cover'
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
      {!!iconSource && !!iconSource.uri && <Slots.icon source={iconSource} />}
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
    icon: [buildIconStyles]
  }
});
