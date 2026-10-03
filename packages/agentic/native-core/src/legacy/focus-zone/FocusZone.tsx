/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import { FocusZoneHost } from '../../internal/FocusZoneHost';
import type { FocusZoneProps } from './FocusZone.types';
import { focusZoneName } from './FocusZone.types';

export const FocusZone = phasedComponent<FocusZoneProps>((baseProps) =>
  directComponent<FocusZoneProps>((props) => <FocusZoneHost {...mergeProps(baseProps, props)} />),
);

FocusZone.displayName = focusZoneName;
