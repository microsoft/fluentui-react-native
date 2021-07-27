import { WinUI } from 'react-native-xaml';

export const nativePipsPagerName = 'PipsPager';

export interface PipsPagerTokens {}

export type PipsPagerViewProps = WinUI.PipsPagerProps & PipsPagerTokens;

export interface PipsPagerType {
  props: WinUI.PipsPagerProps;
  tokens: PipsPagerTokens;
  slotProps: {
    root: PipsPagerViewProps;
  };
}
