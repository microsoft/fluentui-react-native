/** @jsx withSlots */
import { View } from 'react-native';
import { badgeLookup } from '../Badge';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, PresenceBadgeStatus } from './PresenceBadge.types';
import { BadgeSize } from '../Badge.types';
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
  }
}

function getIconSize(size: BadgeSize) {
  switch (size) {
    case 'smallest':
      return 6;
    case 'smaller':
      return 10;
    case 'small':
      return 12;
    case 'medium':
    default:
      return 16;
    case 'large':
      return 20;
    case 'largest':
      return 28;
  }
}

export const PresenceBadge = compose<PresenceBadgeType>({
  displayName: presenceBadgeName,
  ...stylingSettings,
  slots: {
    root: View,
  },
  useRender: (userProps: PresenceBadgeProps, useSlots: UseSlots<PresenceBadgeType>) => {
    const badge = useBadge(userProps) as PresenceBadgeProps;
    const Slots = useSlots(badge, (layer) => badgeLookup(layer, badge));

    return (final: PresenceBadgeProps) => {
      const { size, status, isOutOfOffice, ...mergedProps } = mergeProps(badge, final);
      const badgeSize = getIconSize(size);
      const outOfOffice = isOutOfOffice || false;
      const iconXml = `<svg width="${badgeSize}" height="${badgeSize}" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${getIconPath(status, outOfOffice)}
      </svg>`;

      return (
        <Slots.root {...mergedProps}>
          <SvgXml xml={iconXml} />
        </Slots.root>
      );
    };
  },
});
