/** @jsx withSlots */
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { IPersonaType, personaName, IPersonaSlotProps, IPersonaProps, IPersonaRenderData } from './Persona.types';
import { settings } from './Persona.settings';
import { View, Text } from 'react-native';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { PersonaCoin } from '@fluentui-react-native/persona-coin';
import { ISlots, withSlots, IRenderData } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { buildRootStyle } from './Persona.tokens.root';
import { buildTextStyle, buildTertiaryStyle, buildOptionalStyle, buildSecondaryStyle } from './Persona.tokens.texts';
import { buildCoinStyle } from './Persona.tokens.coin';
import { foregroundColorTokens } from '@fluentui-react-native/tokens';
import { buildStackStyle } from './Persona.tokens.stack';

function usePrepareForProps(props: IPersonaProps, useStyling: IUseComposeStyling<IPersonaType>): IRenderData<IPersonaSlotProps, {}> {
  const {
    text,
    secondaryText,
    tertiaryText,
    optionalText,
    size,
    coinColor,
    imageUrl,
    imageDescription,
    initials,
    presence,
    isOutOfOffice,
    ...rootProps
  } = props;

  const slotProps = mergeSettings<IPersonaType['slotProps']>(useStyling(props), {
    root: { ...rootProps },
    coin: { size, coinColor, imageUrl, imageDescription, initials, presence, isOutOfOffice },
  });

  return {
    slotProps,
    state: {
      text,
      secondaryText,
      tertiaryText,
      optionalText,
    },
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
      filter: filterViewProps,
    },
    coin: PersonaCoin,
    stack: View,
    text: Text,
    secondary: Text,
    tertiary: Text,
    optional: Text,
  },
  styles: {
    root: [buildRootStyle],
    coin: [foregroundColorTokens, { source: 'coinBackgroundColor', target: 'backgroundColor' }, buildCoinStyle],
    text: [buildTextStyle],
    secondary: [buildSecondaryStyle],
    tertiary: [buildTertiaryStyle],
    optional: [buildOptionalStyle],
    stack: [buildStackStyle],
  },
});
