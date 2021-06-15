import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ViewProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { getRingThickness, calculateEffectiveSizes } from './PersonaCoin.helpers';

const _activityRingProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size', 'activityRing'];

function _buildActivityRingStyles(tokenProps: IPersonaCoinTokens, theme: ITheme): ViewProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);
  const { activityRing } = tokenProps;

  if (!activityRing) return {};

  const innerGap =
    activityRing.innerGap != undefined
      ? getRingThickness(activityRing.innerGap)
      : getRingThickness(activityRing.ringThickness || 'xxlarge');

  const effectiveRingThickness = 2 * getRingThickness(activityRing.ringThickness || 'xxlarge') + innerGap;
  const effectiveSize = physicalSize + 2 * effectiveRingThickness;
  const ringColor = activityRing.transparent ? 'transparent' : activityRing.ringBackgroundColor || theme.colors.personaActivityRing;

  return {
    style: {
      borderStyle: 'solid',
      borderColor: ringColor,
      borderWidth: effectiveRingThickness,
      borderRadius: effectiveSize / 2,
      width: effectiveSize,
      height: effectiveSize,
      position: 'absolute',
      top: -effectiveRingThickness,
      left: -effectiveRingThickness,
    },
  };
}

function _buildActivityGlowStyles(tokenProps: IPersonaCoinTokens, theme: ITheme): ViewProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);
  const { activityRing } = tokenProps;

  if (!activityRing) return {};

  const innerGap =
    activityRing.innerGap != undefined
      ? getRingThickness(activityRing.innerGap)
      : getRingThickness(activityRing.ringThickness || 'xxlarge');

  const effectiveRingThickness = getRingThickness(activityRing.ringThickness || 'xxlarge') + innerGap;
  const effectiveSize = physicalSize + 2 * effectiveRingThickness;
  const glowColor = activityRing.accent ? theme.colors.accentButtonBackground : activityRing.ringColor || theme.colors.personaActivityGlow;

  return {
    style: {
      borderStyle: 'solid',
      borderColor: glowColor,
      borderWidth: effectiveRingThickness - innerGap,
      borderRadius: effectiveSize / 2,
      width: effectiveSize,
      height: effectiveSize,
      position: 'absolute',
      top: -effectiveRingThickness,
      left: -effectiveRingThickness,
    },
  };
}

export const buildActivityRingStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(_buildActivityRingStyles, _activityRingProps);
export const buildActivityGlowStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(_buildActivityGlowStyles, _activityRingProps);
