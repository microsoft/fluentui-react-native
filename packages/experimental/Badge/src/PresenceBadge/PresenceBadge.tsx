/** @jsx withSlots */
import { View } from 'react-native';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, PresenceBadgeStatus } from './PresenceBadge.types';
import { compose, withSlots, mergeProps, UseSlots } from '@fluentui-react-native/framework';
import { presenceIconPaths } from './presenceIconPaths';
import { Svg, Path } from 'react-native-svg';
import { stylingSettings } from './PresenceBadge.styling';
import { useBadge } from '../useBadge';

export const prensenceBadgeLookup = (layer: string, userProps: PresenceBadgeProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['size'] ||
    layer === userProps['shape'] ||
    layer === userProps['status'] ||
    (userProps['status'] === 'away' && userProps.outOfOffice && layer === 'awayOutOfOffice')
  );
};

function getIconPath(status: PresenceBadgeStatus, isOutOfOffice: boolean) {
  switch (status) {
    case 'available':
    default:
      return isOutOfOffice ? presenceIconPaths.availableOutOfOffice : presenceIconPaths.available;
    case 'away':
      return isOutOfOffice ? presenceIconPaths.outOfOffice : presenceIconPaths.away;
    case 'busy':
      return isOutOfOffice ? presenceIconPaths.unknown : presenceIconPaths.busy;
    case 'doNotDisturb':
      return isOutOfOffice ? presenceIconPaths.doNotDisturbOutOfOffice : presenceIconPaths.doNotDisturb;
    case 'offline':
      return presenceIconPaths.offline;
    case 'outOfOffice':
      return presenceIconPaths.outOfOffice;
    case 'unknown':
      return presenceIconPaths.unknown;
    case 'blocked':
      return presenceIconPaths.blocked;
  }
}

export const PresenceBadge = compose<PresenceBadgeType>({
  displayName: presenceBadgeName,
  ...stylingSettings,
  slots: {
    root: View,
    svg: Svg,
  },
  useRender: (userProps: PresenceBadgeProps, useSlots: UseSlots<PresenceBadgeType>) => {
    const badge = useBadge(userProps) as PresenceBadgeProps;
    const Slots = useSlots(badge, (layer) => prensenceBadgeLookup(layer, badge));

    return (final: PresenceBadgeProps) => {
      const { size, status, outOfOffice, ...mergedProps } = mergeProps(badge, final);
      const isOutOfOffice = outOfOffice || false;
      const path = getIconPath(status, isOutOfOffice);

      return (
        <Slots.root {...mergedProps}>
          <Slots.svg viewBox="0 0 16 16" fill="none">
            <Path fill="currentColor" d={path} />
          </Slots.svg>
        </Slots.root>
      );
    };
  },
});
