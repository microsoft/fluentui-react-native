/** @jsx withSlots */
import { View, Platform } from 'react-native';
import { badgeLookup } from '../Badge';
import { presenceBadgeName, PresenceBadgeType, PresenceBadgeProps, PresenceBadgeStatus } from './PresenceBadge.types';
import { compose, withSlots, mergeProps, UseSlots, Theme } from '@fluentui-react-native/framework';
import { presenceIconPaths } from './presenceIconPaths';
import { SvgXml } from 'react-native-svg';
import { useBadge } from '../useBadge';
import { stylingSettings } from './PresenceBadge.styling';
import { useTheme } from '@fluentui-react-native/theme-types';

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

function getIconPathHC(status: PresenceBadgeStatus, isOutOfOffice: boolean) {
  switch (status) {
    case 'available':
    default:
      return isOutOfOffice ? presenceIconPaths.availableOutOfOfficeHC : presenceIconPaths.availableHC;
    case 'away':
      return isOutOfOffice ? presenceIconPaths.outOfOfficeHC : presenceIconPaths.awayHC;
    case 'busy':
      return isOutOfOffice ? presenceIconPaths.unknownHC : presenceIconPaths.busyHC;
    case 'doNotDisturb':
      return isOutOfOffice ? presenceIconPaths.doNotDisturbOutOfOfficeHC : presenceIconPaths.doNotDisturbHC;
    case 'offline':
      return presenceIconPaths.offlineHC;
    case 'outOfOffice':
      return presenceIconPaths.outOfOfficeHC;
    case 'unknown':
      return presenceIconPaths.unknownHC;
    case 'blocked':
      return presenceIconPaths.blockedHC;
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
    const theme = useTheme();
    return (final: PresenceBadgeProps) => {
      const { size, status, outOfOffice, ...mergedProps } = mergeProps(badge, final);
      const isHighContrast = isHighContrastEnabled(Platform.OS, theme);

      const isOutOfOffice = outOfOffice || false;
      const iconXml = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${isHighContrast ? getIconPathHC(status, isOutOfOffice) : getIconPath(status, isOutOfOffice)}
      </svg>`;

      return (
        <Slots.root {...mergedProps}>
          <Slots.svgXml xml={iconXml} />
        </Slots.root>
      );
    };
  },
});

function isHighContrastEnabled(platformOS: string, theme: Theme) {
  switch (platformOS) {
    case 'windows':
      return theme.host.appearance === 'highContrast';
    default:
      return theme.name === 'HighContrast';
  }
}
