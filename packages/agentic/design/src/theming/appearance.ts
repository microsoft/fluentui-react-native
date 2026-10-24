import type { AppearanceOptions, Theme } from '../fluent/types/Theme.types';
import type {
  ColorTone,
  NormalizedThemeAppearance,
  ResolvedThemeAppearance,
  ThemeAppearanceOptions,
  ThemeAppearanceRequest,
  ThemeAppearanceSourceSnapshot,
  ThemeAppearanceState,
} from '../types/appearance.types';

export const defaultThemeAppearanceRequest: Readonly<ThemeAppearanceRequest> = Object.freeze({
  colorScheme: 'system',
  contrast: 'system',
  interfaceLevel: 'system',
});

export const defaultColorTone: ColorTone = 'cool';

export const defaultResolvedThemeAppearance: Readonly<NormalizedThemeAppearance> = Object.freeze({
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
  colorTone: defaultColorTone,
});

const resolvedAppearances = new Map<string, Readonly<NormalizedThemeAppearance>>([['light|standard|base', defaultResolvedThemeAppearance]]);
const appearanceStates = new Map<string, Readonly<ThemeAppearanceState>>();

/**
 * Key for the scheme, contrast, and interface-level axes only. Legacy Fluent
 * themes do not vary by tone.
 */
export function legacyThemeAppearanceKey(appearance: ResolvedThemeAppearance): string {
  return `${appearance.colorScheme}|${appearance.contrast}|${appearance.interfaceLevel}`;
}

/**
 * Identity key for a resolved appearance. Omitted and cool tones share the
 * historical three-axis key; warm appends a suffix.
 */
export function themeAppearanceKey(appearance: ResolvedThemeAppearance): string {
  const key = legacyThemeAppearanceKey(appearance);
  return appearance.colorTone === 'warm' ? `${key}|warm` : key;
}

function themeAppearanceRequestKey(request: ThemeAppearanceRequest): string {
  const key = `${request.colorScheme}|${request.contrast}|${request.interfaceLevel}`;
  return request.colorTone === undefined ? key : `${key}|${request.colorTone}`;
}

export function normalizeThemeAppearanceRequest(options?: ThemeAppearanceOptions): Readonly<ThemeAppearanceRequest> {
  if (!options) {
    return defaultThemeAppearanceRequest;
  }

  const request: ThemeAppearanceRequest = {
    colorScheme: options.colorScheme ?? defaultThemeAppearanceRequest.colorScheme,
    contrast: options.contrast ?? defaultThemeAppearanceRequest.contrast,
    interfaceLevel: options.interfaceLevel ?? defaultThemeAppearanceRequest.interfaceLevel,
  };
  if (options.colorTone !== undefined) {
    request.colorTone = options.colorTone;
  }
  return Object.freeze(request);
}

/**
 * Return the shared normalized identity for a concrete appearance. A missing
 * tone resolves to cool, so three-field values and explicit cool converge.
 */
export function internResolvedThemeAppearance(appearance: ResolvedThemeAppearance): Readonly<NormalizedThemeAppearance> {
  const key = themeAppearanceKey(appearance);
  let interned = resolvedAppearances.get(key);
  if (!interned) {
    interned = Object.freeze({
      colorScheme: appearance.colorScheme,
      contrast: appearance.contrast,
      interfaceLevel: appearance.interfaceLevel,
      colorTone: appearance.colorTone === 'warm' ? 'warm' : defaultColorTone,
    });
    resolvedAppearances.set(key, interned);
  }
  return interned;
}

/**
 * Resolve requested appearance options. Scheme, contrast, and interface level
 * fall back from the request to the platform snapshot and then the fallback.
 * Tone has no platform source: it falls back from the request to the fallback
 * and then cool.
 */
export function resolveThemeAppearance(
  options?: ThemeAppearanceOptions,
  snapshot: ThemeAppearanceSourceSnapshot = {},
  fallback: Partial<ResolvedThemeAppearance> = defaultResolvedThemeAppearance,
): Readonly<ThemeAppearanceState> {
  const requested = normalizeThemeAppearanceRequest(options);
  const resolved = internResolvedThemeAppearance({
    colorScheme:
      requested.colorScheme === 'system'
        ? (snapshot.colorScheme ?? fallback.colorScheme ?? defaultResolvedThemeAppearance.colorScheme)
        : requested.colorScheme,
    contrast:
      requested.contrast === 'system'
        ? (snapshot.contrast ?? fallback.contrast ?? defaultResolvedThemeAppearance.contrast)
        : requested.contrast,
    interfaceLevel:
      requested.interfaceLevel === 'system'
        ? (snapshot.interfaceLevel ?? fallback.interfaceLevel ?? defaultResolvedThemeAppearance.interfaceLevel)
        : requested.interfaceLevel,
    colorTone: requested.colorTone ?? fallback.colorTone ?? defaultColorTone,
  });
  const key = `${themeAppearanceRequestKey(requested)}>${themeAppearanceKey(resolved)}`;
  let state = appearanceStates.get(key);
  if (!state) {
    state = Object.freeze({ requested, resolved });
    appearanceStates.set(key, state);
  }
  return state;
}

export function appearanceOptionsFromLegacy(appearance: Theme['host']['appearance']): ThemeAppearanceOptions {
  switch (appearance) {
    case 'dark':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' };
    case 'darkElevated':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' };
    case 'highContrast':
      return { colorScheme: 'system', contrast: 'highContrast', interfaceLevel: 'base' };
    case 'dynamic':
      return { colorScheme: 'system', contrast: 'system', interfaceLevel: 'system' };
    case 'light':
    default:
      return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
  }
}

/**
 * Project a resolved appearance onto the legacy appearance union. Tone has no
 * legacy representation and is intentionally dropped.
 */
export function appearanceOptionFromResolved(appearance: ResolvedThemeAppearance): AppearanceOptions {
  if (appearance.contrast === 'highContrast') {
    return 'highContrast';
  }
  if (appearance.colorScheme === 'dark' && appearance.interfaceLevel === 'elevated') {
    return 'darkElevated';
  }
  return appearance.colorScheme;
}

export const defaultThemeAppearanceState = resolveThemeAppearance();
