/** @jsx withSlots */
import { Badge } from '../Badge';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, Presence } from './PresenceBadge.types';
import { BadgeSize } from '../Badge.types';
import { compose, withSlots, mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { presenceIconPaths } from './presenceIconPaths';
import { SvgXml } from 'react-native-svg';
import { useBadge } from '../useBadge';

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
  slots: {
    badge: Badge,
  },
  render: (userProps: PresenceBadgeProps) => {
    const badge = useBadge(userProps);
    const size = getIconSize(userProps.size || 'medium');
    const iconXml = `<svg width="${size}" height="${size}" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${getIconPath(userProps.presence, userProps.isOutOfOffice)}
    </svg>`;
    const CustomBadge = Badge.customize({
      borderWidth: 0,
      paddingHorizontal: 0,
    });

    return (final: PresenceBadgeProps) => {
      const { appearance = 'outline', ...mergedProps } = mergeProps(badge, final);
      return (
        <CustomBadge appearance={appearance} {...mergedProps}>
          <SvgXml xml={iconXml} />
        </CustomBadge>
      );
    };
  },
});

export const PresenceBadgeStaged = stagedComponent((props: PresenceBadgeProps) => {
  const presence = props.presence || 'available';
  const isOutOfOffice = props.isOutOfOffice || false;
  const size = getIconSize(props.size || 'medium');
  const iconXml = `<svg width="${size}" height="${size}" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${getIconPath(presence, isOutOfOffice)}
    </svg>`;
  const CustomBadge = Badge.customize({
    borderWidth: 0,
    paddingHorizontal: 0,
  });
  return (rest: PresenceBadgeProps) => {
    const { appearance = 'outline', ...mergedProps } = mergeProps<PresenceBadgeProps>(props, rest);
    return (
      <CustomBadge appearance={appearance} {...mergedProps}>
        <SvgXml xml={iconXml} />
      </CustomBadge>
    );
  };
});
