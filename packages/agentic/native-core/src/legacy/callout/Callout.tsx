/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import { CalloutHost } from '../../internal/CalloutHost';
import type { CalloutProps } from './Callout.types';
import { calloutName } from './Callout.types';

export const Callout = phasedComponent<CalloutProps>((baseProps) =>
  directComponent<CalloutProps>((props) => <CalloutHost {...mergeProps(baseProps, props)} />),
);

Callout.displayName = calloutName;
export default Callout;
