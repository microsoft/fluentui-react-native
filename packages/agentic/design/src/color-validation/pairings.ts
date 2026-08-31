import { WCAG } from './constants';
import type { ContrastColorToken, ContrastPairing, ContrastTokenReference } from './types';

function upstreamName(token: ContrastColorToken): `--gnrc-color-${string}` {
  return `--gnrc-color-${token.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`;
}

function token(tokenName: ContrastColorToken): ContrastTokenReference {
  return {
    token: tokenName,
    upstream: upstreamName(tokenName),
  };
}

/**
 * Canonical x3 contrast pairings adapted to FURN token names, plus the
 * issue-required FURN visible-stroke pairing.
 *
 * Source: x3-design/fluent-design@d334acf5cbad813f2b7cd554da942b09a7ff8f10.
 */
export const PAIRINGS = [
  {
    label: 'neutral-primary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundNeutralPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('surfaceNeutralNear'),
      token('backgroundNeutralSubtle'),
      token('backgroundNeutralSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'neutral-secondary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundNeutralSecondary'),
    backgrounds: [token('surfaceNeutralNearer'), token('backgroundNeutralSubtle')],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'neutral-tertiary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundNeutralTertiary'),
    backgrounds: [token('surfaceNeutralNearer'), token('surfaceNeutralNear')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'neutral-onloud on neutral loud/heavy',
    source: 'x3',
    foreground: token('foregroundNeutralOnloud'),
    backgrounds: [token('backgroundNeutralLoud'), token('backgroundNeutralHeavy')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'brand-onloud on brand loud/heavy',
    source: 'x3',
    foreground: token('foregroundBrandOnloud'),
    backgrounds: [token('backgroundBrandLoud'), token('backgroundBrandHeavy')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'danger-onloud on danger-loud',
    source: 'x3',
    foreground: token('foregroundDangerOnloud'),
    backgrounds: [token('backgroundDangerLoud')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'warning-onloud on warning-loud',
    source: 'x3',
    foreground: token('foregroundWarningOnloud'),
    backgrounds: [token('backgroundWarningLoud')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'success-onloud on success-loud',
    source: 'x3',
    foreground: token('foregroundSuccessOnloud'),
    backgrounds: [token('backgroundSuccessLoud')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'brand-primary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundBrandPrimary'),
    backgrounds: [token('surfaceNeutralNearer'), token('backgroundNeutralSubtle')],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'danger-primary on neutral + danger soft/subtle',
    source: 'x3',
    foreground: token('foregroundDangerPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('backgroundNeutralSubtle'),
      token('backgroundDangerSubtle'),
      token('backgroundDangerSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'warning-primary on neutral + warning soft/subtle',
    source: 'x3',
    foreground: token('foregroundWarningPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('backgroundNeutralSubtle'),
      token('backgroundWarningSubtle'),
      token('backgroundWarningSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'success-primary on neutral + success soft/subtle',
    source: 'x3',
    foreground: token('foregroundSuccessPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('backgroundNeutralSubtle'),
      token('backgroundSuccessSubtle'),
      token('backgroundSuccessSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'neutral-heavy stroke on neutral-soft background',
    source: 'furn',
    foreground: token('strokeNeutralHeavy'),
    backgrounds: [token('backgroundNeutralSoft')],
    minimumRatio: WCAG.visibleStroke,
  },
] as const satisfies readonly ContrastPairing[];
