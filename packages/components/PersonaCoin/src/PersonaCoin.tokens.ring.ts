import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ViewProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { Theme } from '@fluentui-react-native/framework';
import { getRingThickness, calculateEffectiveSizes } from './PersonaCoin.helpers';

const _ringProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size', 'ring'];

function _buildRingStyles(tokenProps: IPersonaCoinTokens, theme: Theme): ViewProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);
  const { ring } = tokenProps;

  if (!ring) return {};

  const innerGap = ring.innerGap != undefined ? getRingThickness(ring.innerGap) : getRingThickness(ring.ringThickness || 'xxlarge');

  const effectiveRingThickness = 2 * getRingThickness(ring.ringThickness || 'xxlarge') + innerGap;
  const effectiveSize = physicalSize + 2 * effectiveRingThickness;
  const ringColor = ring.ringBackgroundColor || theme.colors.personaActivityRing;

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

function _buildGlowStyles(tokenProps: IPersonaCoinTokens, theme: Theme): ViewProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);
  const { ring } = tokenProps;

  if (!ring) return {};

  const innerGap = ring.innerGap != undefined ? getRingThickness(ring.innerGap) : getRingThickness(ring.ringThickness || 'xxlarge');

  const effectiveRingThickness = getRingThickness(ring.ringThickness || 'xxlarge') + innerGap;
  const effectiveSize = physicalSize + 2 * effectiveRingThickness;
  const glowColor = ring.accent ? theme.colors.accentButtonBackground : ring.ringColor || theme.colors.personaActivityGlow;

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

export const buildRingStyles = styleFunction<ViewProps, IPersonaCoinTokens, Theme>(_buildRingStyles, _ringProps);
export const buildGlowStyles = styleFunction<ViewProps, IPersonaCoinTokens, Theme>(_buildGlowStyles, _ringProps);
