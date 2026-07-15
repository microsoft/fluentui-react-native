import type { ViewStyle } from 'react-native';

import type { ICalloutTokens } from './Callout.types';

/**
 * Default token/prop values applied to every Callout on macOS.
 *
 * The background color was previously resolved from the theme (`bodyStandoutBackground`); it is
 * inlined here as its default-theme value so the component carries no theme dependency.
 */
export const defaultCalloutTokens: ICalloutTokens = {
  backgroundColor: '#faf9f8',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 5,
  directionalHint: 'bottonLeftEdge',
};

/**
 * Additional default style applied to the root native view. macOS positions the Callout content
 * absolutely within its floating window.
 */
export const defaultRootStyle: ViewStyle = {
  position: 'absolute',
};
