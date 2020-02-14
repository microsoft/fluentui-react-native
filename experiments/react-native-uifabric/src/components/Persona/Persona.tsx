/** @jsx withSlots */
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { IPersonaType, personaName, IPersonaSlotProps, IPersonaProps } from './Persona.types';
import { settings } from './Persona.settings';
import { View, Text, TextStyle } from 'react-native';
import { filterViewProps } from '../../utilities/RenderHelpers';
import { PersonaCoin } from '../PersonaCoin/PersonaCoin';
import { ISlots, withSlots, IRenderData } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { buildPersonaRootStyles } from './Persona.tokens';
import { getTextFont } from './Persona.helpers';

function usePrepareForProps(props: IPersonaProps, useStyling: IUseComposeStyling<IPersonaType>): IRenderData<IPersonaSlotProps, {}> {
  const { text, secondaryText, tertiaryText, optionalText, size, ...rootProps } = props;

  const styledProps = useStyling(props);

  const textStyle: TextStyle = size !== undefined ? { ...getTextFont(size) } : {};
  const secondaryStyle: TextStyle = size !== undefined ? { ...getTextFont(size) } : {};
  const tertinaryStyle: TextStyle = size !== undefined ? { ...getTextFont(size) } : {};
  const optionalStyle: TextStyle = size !== undefined ? { ...getTextFont(size) } : {};

  const slotProps = mergeSettings<IPersonaType['slotProps']>(styledProps, {
    root: { ...rootProps },
    coin: { ...rootProps, size },
    text: {
      children: text,
      style: textStyle
    },
    secondary: {
      children: secondaryText,
      style: secondaryStyle
    },
    tertinary: {
      children: tertiaryText,
      style: tertinaryStyle
    },
    optional: {
      children: optionalText,
      style: optionalStyle
    }
  });

  return {
    slotProps
  };
}

const render = (Slots: ISlots<IPersonaSlotProps>): JSX.Element => {
  return (
    <Slots.root>
      <Slots.coin />
      <Slots.stack>
        <Slots.text />
        <Slots.secondary />
        <Slots.tertinary />
        <Slots.optional />
      </Slots.stack>
    </Slots.root>
  );
};

export const Persona = compose<IPersonaType>({
  displayName: personaName,
  settings: settings,
  render: render,
  usePrepareProps: usePrepareForProps,
  slots: {
    root: {
      slotType: View,
      filter: filterViewProps
    },
    coin: PersonaCoin,
    stack: View,
    text: Text,
    secondary: Text,
    tertinary: Text,
    optional: Text
  },
  styles: {
    root: [buildPersonaRootStyles],
    text: [{ source: 'verticalGap', target: 'marginBottom' }],
    secondary: [{ source: 'verticalGap', target: 'marginBottom' }],
    tertinary: [{ source: 'verticalGap', target: 'marginBottom' }],
    optional: [],
    stack: [{ source: 'horizontalGap', target: 'marginLeft' }]
  }
});
