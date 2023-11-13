import type { TextProps } from 'react-native';

import type { SpinnerProps, SpinnerTokens } from './Spinner.types.shared';

export type { SpinnerProps, SpinnerTokens };
export type { SpinnerAppearance, SpinnerLabelPosition, SpinnerSize, SpinnerStatus } from './Spinner.types.shared';
export { spinnerName } from './Spinner.types.shared';

export interface SpinnerSvgProps extends SpinnerTokens {
  /**
   * The height and width of the viewBox are internal props used by the SVG to size themselves and
   * set up their viewBox to establish coordinate space for DPI scaling purposes.
   */
  viewBoxHeight?: number;
  viewBoxWidth?: number;
}

export interface SpinnerSlotProps {
  root: SpinnerProps; //SpinnerProps extends ViewProps which is required for win32 native module.
  track?: SpinnerSvgProps;
  tail?: SpinnerSvgProps;
  tailContainer?: React.PropsWithChildren<SpinnerSvgProps>;
  label?: TextProps;
}
export interface SpinnerType {
  props: SpinnerProps;
  slotProps: SpinnerSlotProps;
  tokens: SpinnerTokens;
}
