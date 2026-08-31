import { parseColorValue, resolveContrastColors } from '../color-lib';
import type { ColorDiagnostic, ColorMode } from '../color-lib';
import type { SemanticColorTokenValues } from '../tokens/flex.types';
import { MODE_SURFACE } from './constants';
import { PAIRINGS } from './pairings';
import type {
  ContrastColorDiagnostic,
  ContrastColorToken,
  ContrastPairing,
  ContrastPairResult,
  ResolvedContrastPairResult,
  UnresolvableContrastPairResult,
} from './types';

function diagnosticFor(
  diagnostic: ColorDiagnostic,
  tokenName: ContrastColorToken,
  role: ContrastColorDiagnostic['role'],
): ContrastColorDiagnostic {
  return {
    ...diagnostic,
    token: tokenName,
    role,
  };
}

/**
 * Audit semantic colors against canonical or caller-supplied contrast
 * pairings. This helper is intended for tests and design validation tooling,
 * not component render paths.
 */
export function validateContrastPairs(
  colors: SemanticColorTokenValues,
  mode: ColorMode,
  pairings: readonly ContrastPairing[] = PAIRINGS,
): ContrastPairResult[] {
  const results: ContrastPairResult[] = [];

  for (const pairing of pairings) {
    const foregroundValue = colors[pairing.foreground.token];
    const foreground = parseColorValue(foregroundValue);
    for (const backgroundReference of pairing.backgrounds) {
      const backgroundValue = colors[backgroundReference.token];
      const background = parseColorValue(backgroundValue);
      const base = {
        pairing,
        foreground: pairing.foreground,
        background: backgroundReference,
        foregroundValue,
        backgroundValue,
        mode,
      };
      const diagnostics: ContrastColorDiagnostic[] = [];
      if (foreground.status === 'unresolvable') {
        diagnostics.push(diagnosticFor(foreground.diagnostic, pairing.foreground.token, 'foreground'));
      }
      if (background.status === 'unresolvable') {
        diagnostics.push(diagnosticFor(background.diagnostic, backgroundReference.token, 'background'));
      }

      if (diagnostics.length > 0 || foreground.status === 'unresolvable' || background.status === 'unresolvable') {
        results.push({
          ...base,
          status: 'unresolvable',
          ratio: null,
          foregroundResolved: null,
          backgroundResolved: null,
          diagnostics,
        });
        continue;
      }

      const resolved = resolveContrastColors(foregroundValue, backgroundValue, MODE_SURFACE[mode]);
      results.push({
        ...base,
        status: resolved.ratio >= pairing.minimumRatio ? 'pass' : 'fail',
        diagnostics: [],
        ...resolved,
      });
    }
  }

  return results;
}

/** Return only resolved contrast pairs that do not meet their threshold. */
export function getContrastFailures(results: readonly ContrastPairResult[]): ResolvedContrastPairResult[] {
  return results.filter((result): result is ResolvedContrastPairResult => result.status === 'fail');
}

/** Return only contrast pairs whose native or unsupported colors cannot be audited in JavaScript. */
export function getUnresolvableContrastPairs(results: readonly ContrastPairResult[]): UnresolvableContrastPairResult[] {
  return results.filter((result): result is UnresolvableContrastPairResult => result.status === 'unresolvable');
}
