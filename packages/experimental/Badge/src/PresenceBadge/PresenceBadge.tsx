/** @jsx withSlots */
import { View } from 'react-native';
import { badgeLookup } from '../Badge';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, PresenceBadgeStatus } from './PresenceBadge.types';
import { compose, withSlots, mergeProps, UseSlots } from '@fluentui-react-native/framework';
import { presenceIconPaths } from './presenceIconPaths';
import { SvgXml } from 'react-native-svg';
import { useBadge } from '../useBadge';
import { stylingSettings } from './PresenceBadge.styling';

function getIconPath(status: PresenceBadgeStatus, isOutOfOffice: boolean) {
  switch (status) {
    case 'available':
    default:
      return isOutOfOffice ? presenceIconPaths.availableOutOfOffice : presenceIconPaths.available;
    case 'away':
      return isOutOfOffice ? presenceIconPaths.outOfOffice : presenceIconPaths.away;
    case 'busy':
      return isOutOfOffice ? presenceIconPaths.busyOutOfOffice : presenceIconPaths.busy;
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
    svgXml: SvgXml,
  },
  useRender: (userProps: PresenceBadgeProps, useSlots: UseSlots<PresenceBadgeType>) => {
    const badge = useBadge(userProps) as PresenceBadgeProps;
    const Slots = useSlots(badge, (layer) => badgeLookup(layer, badge));

    return (final: PresenceBadgeProps) => {
      const { size, status, outOfOffice, ...mergedProps } = mergeProps(badge, final);
      const isOutOfOffice = outOfOffice || false;
      const iconXml = `<svg viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${getIconPath(status, isOutOfOffice)}
      </svg>`;

      return (
        <Slots.root {...mergedProps}>
          <Slots.svgXml xml={iconXml} />
        </Slots.root>
      );
    };
  },
});
