/** @jsx withSlots */
import { Badge } from '../Badge';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, Presence } from './PresenceBadge.types';
import { compose, withSlots, mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { presenceIcons } from './presenceIcons';
import { SvgXml } from 'react-native-svg';
import { useBadge } from '../useBadge';

function getIcon(presence: Presence, oof: boolean) {
  switch (presence) {
    case 'available':
    default:
      return oof ? presenceIcons.availableOof : presenceIcons.available;
    case 'away':
      return oof ? presenceIcons.oof : presenceIcons.away;
    case 'busy':
      return oof ? presenceIcons.busyOof : presenceIcons.busy;
    case 'DND':
      return oof ? presenceIcons.dndOof : presenceIcons.dnd;
    case 'offline':
      return presenceIcons.offline;
    case 'OOF':
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
    const iconXml = getIcon(userProps.presence, userProps.oof);
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
  const isOurOfOffice = props.oof || false;
  const iconXml = getIcon(presence, isOurOfOffice);
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
