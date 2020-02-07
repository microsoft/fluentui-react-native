/** @jsx withSlots */
import { Image, View } from 'react-native';
import { IPersonaCoinProps, IPersonaCoinType, personaCoinName, IPersonaCoinSlotProps, IPersonaCoinRenderData } from './PersonaCoin.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps, filterImageProps } from '../../utilities/RenderHelpers';
import { settings } from './PersonaCoin.settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Initials } from './PersonaCoinInitials';
import { mergeSettings } from '@uifabricshared/foundation-settings';
// import { getSizeConfig } from './PersonaCoin.helpers';
import { buildPersonaCoinRootStyles } from './PersonaCoin.tokens';

const usePrepareForProps = (props: IPersonaCoinProps, useStyling: IUseComposeStyling<IPersonaCoinType>) => {
  // const { imageUrl, imageDescription, size, initials, coinColor, presence } = props;
  // const normalizedSize = size === undefined ? PersonaSize.size40 : size;

  // const { physicalCoinSize: physicalSize, iconSize, initialsFontSize: initialFontSize } = getSizeConfig(normalizedSize);

  const { ...rest } = props;
  return {
    slotProps: mergeSettings<IPersonaCoinType['slotProps']>(useStyling(props), { root: rest }),
    state: {
      iconSource: undefined,
      personaPhotoSource: undefined
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
      {personaPhotoSource ? <Slots.photo /> : <Slots.initials />}
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
      slotType: View,
      filter: filterViewProps
    },
    initials: {
      slotType: Initials
    },
    icon: {
      slotType: Image,
      filter: filterImageProps
    }
  },
  render: render,
  styles: {
    root: [buildPersonaCoinRootStyles]
    // initials: [buildPersonaCoinInitialsStyles],
    // photo: [buildPersonaCoinPhotoStyles]
  }
});
