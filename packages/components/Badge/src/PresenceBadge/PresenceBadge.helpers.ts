import { isHighContrast } from '@fluentui-react-native/theming-utils';
import type { PresenceBadgeTokens } from './PresenceBadge.types';
import type { Theme } from '@fluentui-react-native/design/theming';

export function getBadgeColor(nonHcColor: string, t?: Theme, oofColor?: string): PresenceBadgeTokens {
  oofColor ??= nonHcColor;
  return {
    iconColor: t && isHighContrast(t) ? t.colors.neutralForeground3 : nonHcColor,
    outOfOffice: {
      iconColor: t && isHighContrast(t) ? t.colors.neutralForeground3 : oofColor,
    },
  };
}
