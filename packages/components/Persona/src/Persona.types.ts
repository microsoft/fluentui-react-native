import { IPersonaCoinProps, IPersonaCoinTokens } from '@fluentui-react-native/persona-coin';
import type { IViewProps, ITextProps } from '@fluentui-react-native/adapters';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { FontTokens } from '@fluentui-react-native/tokens';
import { ColorValue } from 'react-native';

export const personaName = 'RNFPersona';

export interface IPersonaState {
  text?: string;
  secondaryText?: string;
  tertiaryText?: string;
  optionalText?: string;
}

export interface IPersonaProps extends IPersonaCoinProps, IPersonaState {}

export interface IPersonaSlotProps {
  root: IViewProps;
  coin: IPersonaCoinProps;
  stack: IViewProps;
  text: ITextProps;
  secondary: ITextProps;
  tertiary: ITextProps;
  optional: ITextProps;
}

export interface IPersonaTokens extends Omit<IPersonaCoinTokens, 'backgroundColor'> {
  verticalGap?: number;
  horizontalGap?: number;

  coinBackgroundColor?: ColorValue;

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
