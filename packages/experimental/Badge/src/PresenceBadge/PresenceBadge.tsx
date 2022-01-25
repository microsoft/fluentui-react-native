/** @jsx withSlots */
import { Badge } from '../Badge';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, Presence } from './PresenceBadge.types';
import { compose, withSlots, mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { presenceIcons } from './presenceIcons';
import { SvgXml } from 'react-native-svg';
import { useBadge } from '../useBadge';

function getIcon(presence: Presence, isOutOfOffice: boolean) {
  switch (presence) {
    case 'available':
    default:
      return isOutOfOffice ? presenceIcons.availableOof : presenceIcons.available;
    case 'away':
      return isOutOfOffice ? presenceIcons.oof : presenceIcons.away;
    case 'busy':
      return isOutOfOffice ? presenceIcons.busyOof : presenceIcons.busy;
    case 'doNotDisturb':
      return isOutOfOffice ? presenceIcons.dndOof : presenceIcons.dnd;
    case 'offline':
      return presenceIcons.offline;
    case 'outOfOffice':
      return presenceIcons.oof;
  }
}

export const PresenceBadge = compose<PresenceBadgeType>({
  displayName: presenceBadgeName,
  slots: {
    badge: Badge,
  },
  render: (userProps: PresenceBadgeProps) => {
    const badge = useBadge(userProps);
    const iconXml = getIcon(userProps.presence, userProps.isOutOfOffice);
    const CustomBadge = Badge.customize({
      borderWidth: 0,
      padding: 0,
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
  const iconXml = getIcon(presence, isOutOfOffice);
  const CustomBadge = Badge.customize({
    borderWidth: 0,
    padding: 0,
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
