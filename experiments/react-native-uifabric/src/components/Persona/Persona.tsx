/** @jsx withSlots */
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { IPersonaType, personaName, IPersonaSlotProps, IPersonaProps, IPersonaRenderData } from './Persona.types';
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
  const tertiaryStyle: TextStyle = size !== undefined ? { ...getTextFont(size) } : {};
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
    tertiary: {
      children: tertiaryText,
      style: tertiaryStyle
    },
    optional: {
      children: optionalText,
      style: optionalStyle
    }
  });

  return {
    slotProps,
    state: {
      text,
      secondaryText,
      tertiaryText,
      optionalText
    }
  };
}

const render = (Slots: ISlots<IPersonaSlotProps>, renderData: IPersonaRenderData): JSX.Element | null => {
  if (!renderData.state) {
    return null;
  }

  const { text, secondaryText, tertiaryText, optionalText } = renderData.state;

  return (
    <Slots.root>
      <Slots.coin />
      <Slots.stack>
        {!!text && <Slots.text>{text}</Slots.text>}
        {!!secondaryText && <Slots.secondary>{secondaryText}</Slots.secondary>}
        {!!tertiaryText && <Slots.tertiary>{tertiaryText}</Slots.tertiary>}
        {!!optionalText && <Slots.optional>{optionalText}</Slots.optional>}
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
    tertiary: Text,
    optional: Text
  },
  styles: {
    root: [buildPersonaRootStyles],
    text: [{ source: 'verticalGap', target: 'marginBottom' }],
    secondary: [{ source: 'verticalGap', target: 'marginBottom' }],
    tertiary: [{ source: 'verticalGap', target: 'marginBottom' }],
    optional: [],
    stack: [{ source: 'horizontalGap', target: 'marginLeft' }]
  }
});
