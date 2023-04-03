import type { PresenceBadgeIconPath, PresenceBadgeStatus } from './PresenceBadge.types';
import type { BadgeSize } from '../Badge.types';

export const presenceIconPaths: PresenceBadgeIconPath = {
  available: 'M8 16A8 8 0 108 0a8 8 0 000 16zm3.7-9.3l-4 4a1 1 0 01-1.41 0l-2-2a1 1 0 111.42-1.4L7 8.58l3.3-3.3a1 1 0 011.4 1.42z',
  away: 'M8 16A8 8 0 108 0a8 8 0 000 16zm.5-11.5v3.02l2.12 1.7a1 1 0 11-1.24 1.56l-2.5-2A1 1 0 016.5 8V4.5a1 1 0 012 0z',
  busy: 'M16 8A8 8 0 110 8a8 8 0 0116 0z',
  doNotDisturb: 'M8 16A8 8 0 108 0a8 8 0 000 16zM5.25 7h5.5a1 1 0 110 2h-5.5a1 1 0 110-2z',
  unknown: 'M8 2a6 6 0 100 12A6 6 0 008 2zM0 8a8 8 0 1116 0A8 8 0 010 8z',
  blocked: 'M16 8A8 8 0 110 8a8 8 0 0116 0zm-2 0c0-1.3-.41-2.5-1.1-3.48L4.51 12.9A6 6 0 0014 8zm-2.52-4.9a6 6 0 00-8.37 8.37l8.37-8.36z',
  offline:
    'M10.7 5.3a1 1 0 010 1.4L9.42 8l1.3 1.3a1 1 0 01-1.42 1.4L8 9.42l-1.3 1.3a1 1 0 01-1.4-1.42L6.58 8l-1.3-1.3a1 1 0 011.42-1.4L8 6.58l1.3-1.3a1 1 0 011.4 0zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-6a6 6 0 100 12A6 6 0 008 2z',
  outOfOffice:
    'M8.2 6.2a1 1 0 10-1.4-1.4L4.3 7.3a1 1 0 000 1.4l2.5 2.5a1 1 0 001.4-1.4L7.42 9H11a1 1 0 100-2H7.41l.8-.8zM8 0a8 8 0 100 16A8 8 0 008 0zM2 8a6 6 0 1112 0A6 6 0 012 8z',
  doNotDisturbOutOfOffice: 'M5.25 7a1 1 0 000 2h5.5a1 1 0 100-2h-5.5zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-6a6 6 0 100 12A6 6 0 008 2z',
  availableOutOfOffice:
    'M11.7 6.7a1 1 0 00-1.4-1.4L7 8.58l-1.3-1.3a1 1 0 00-1.4 1.42l2 2a1 1 0 001.4 0l4-4zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-6a6 6 0 100 12A6 6 0 008 2z',
};

// Mobile requires different svgs based on BadgeSize, _size is not used for other platforms.
export function getIconPath(status: PresenceBadgeStatus, isOutOfOffice: boolean, _size?: BadgeSize): string {
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
