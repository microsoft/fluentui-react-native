import { IPersonaCoinProps, IPersonaCoinTokens } from '@fluentui-react-native/persona-coin';
import { ViewProps, TextProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { FontTokens } from '@fluentui-react-native/tokens';

export const personaName = 'RNFPersona';

export interface IPersonaState {
  text?: string;
  secondaryText?: string;
  tertiaryText?: string;
  optionalText?: string;
}

export interface IPersonaProps extends IPersonaCoinProps, IPersonaState {}

export interface IPersonaSlotProps {
  root: ViewProps;
  coin: IPersonaCoinProps;
  stack: ViewProps;
  text: TextProps;
  secondary: TextProps;
  tertiary: TextProps;
  optional: TextProps;
}

export interface IPersonaTokens extends Omit<IPersonaCoinTokens, 'backgroundColor'> {
  verticalGap?: number;
  horizontalGap?: number;

  coinBackgroundColor?: string;

  textFont?: FontTokens;
  secondaryFont?: FontTokens;
  tertiaryFont?: FontTokens;
  optionalFont?: FontTokens;
}

export interface IPersonaType {
  props: IPersonaProps;
  slotProps: IPersonaSlotProps;
  tokens: IPersonaTokens;
  state: IPersonaState;
}

export type IPersonaRenderData = IRenderData<IPersonaSlotProps, IPersonaState>;
