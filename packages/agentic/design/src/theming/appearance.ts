import type { AppearanceOptions, Theme } from './types/Theme.types';
import type {
  ResolvedThemeAppearance,
  ThemeAppearanceOptions,
  ThemeAppearanceRequest,
  ThemeAppearanceSourceSnapshot,
  ThemeAppearanceState,
} from './appearance.types';

export const defaultThemeAppearanceRequest: Readonly<ThemeAppearanceRequest> = Object.freeze({
  colorScheme: 'system',
  contrast: 'system',
  interfaceLevel: 'system',
});

export const defaultResolvedThemeAppearance: Readonly<ResolvedThemeAppearance> = Object.freeze({
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
});

const resolvedAppearances = new Map<string, Readonly<ResolvedThemeAppearance>>([['light|standard|base', defaultResolvedThemeAppearance]]);
const appearanceStates = new Map<string, Readonly<ThemeAppearanceState>>();

export function themeAppearanceKey(appearance: ResolvedThemeAppearance): string {
  return `${appearance.colorScheme}|${appearance.contrast}|${appearance.interfaceLevel}`;
}

function themeAppearanceRequestKey(request: ThemeAppearanceRequest): string {
  return `${request.colorScheme}|${request.contrast}|${request.interfaceLevel}`;
}

export function normalizeThemeAppearanceRequest(options?: ThemeAppearanceOptions): Readonly<ThemeAppearanceRequest> {
  if (!options) {
    return defaultThemeAppearanceRequest;
  }

  return Object.freeze({
    colorScheme: options.colorScheme ?? defaultThemeAppearanceRequest.colorScheme,
    contrast: options.contrast ?? defaultThemeAppearanceRequest.contrast,
    interfaceLevel: options.interfaceLevel ?? defaultThemeAppearanceRequest.interfaceLevel,
  });
}

export function internResolvedThemeAppearance(appearance: ResolvedThemeAppearance): Readonly<ResolvedThemeAppearance> {
  const key = themeAppearanceKey(appearance);
  let interned = resolvedAppearances.get(key);
  if (!interned) {
    interned = Object.freeze({ ...appearance });
    resolvedAppearances.set(key, interned);
  }
  return interned;
}

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
