import type { ViewStyle } from 'react-native';

import type { ICalloutTokens } from './Callout.types';

/**
 * Default token/prop values applied to every Callout.
 *
 * The color values were previously resolved from the theme (`bodyStandoutBackground` /
 * `bodyFrameBackground`); they are inlined here as their default-theme values so the component
 * carries no theme dependency.
 */
export const defaultCalloutTokens: ICalloutTokens = {
  backgroundColor: '#faf9f8',
  beakWidth: 20,
  borderColor: '#ffffff',
  borderWidth: 1,
  directionalHint: 'bottonLeftEdge',
  gapSpace: 0,
  minPadding: 0,
};

/**
 * Additional default style applied to the root native view (beyond what is derived from the
 * style-related tokens above).
 */
export const defaultRootStyle: ViewStyle = {};
