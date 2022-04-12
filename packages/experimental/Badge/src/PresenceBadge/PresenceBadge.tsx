/** @jsx withSlots */
import { View } from 'react-native';
import { badgeLookup } from '../Badge';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, Presence } from './PresenceBadge.types';
import { BadgeSize } from '../Badge.types';
import { compose, withSlots, mergeProps, UseSlots } from '@fluentui-react-native/framework';
import { presenceIconPaths } from './presenceIconPaths';
import { SvgXml } from 'react-native-svg';
import { useBadge } from '../useBadge';
import { stylingSettings } from './PresenceBadge.styling';

function getIconPath(presence: Presence, isOutOfOffice: boolean) {
  switch (presence) {
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
    const badge = useBadge(userProps);
    const size = getIconSize(userProps.size || 'medium');
    const iconXml = `<svg width="${size}" height="${size}" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${getIconPath(userProps.presence, userProps.isOutOfOffice)}
    </svg>`;
    const Slots = useSlots(userProps, (layer) => badgeLookup(layer, userProps));

    return (final: PresenceBadgeProps) => {
      const { ...mergedProps } = mergeProps(badge, final);
      return (
        <Slots.root {...mergedProps}>
          <SvgXml xml={iconXml} />
        </Slots.root>
      );
    };
  },
});
