import { defaultResolvedThemeAppearance } from '../theming/appearance';
import type { ResolvedThemeAppearance } from '../theming/appearance.types';
import { generatedAppearanceName } from './generated/appearanceNames';
import { generatedDefaultTokenDefinitions } from './generated/defaultTokens';
import type { GeneratedFlexTokenSource } from './generated/generatedFlexTokenSource.types';
import { interactionTokenNames } from './generated/interactionTokenNames';
import { resolveGeneratedValue } from './generated/resolveGeneratedValue';
import type { FlexTokens, InteractiveColorOverrides } from './flex.types';

export { nonFluentFlexTokens } from './nonFluentFlexTokens';

const sourceCache = new Map<keyof typeof generatedDefaultTokenDefinitions, GeneratedFlexTokenSource>();
const defaultTokensCache = new Map<keyof typeof generatedDefaultTokenDefinitions, FlexTokens>();
const materializedSourceCache = new WeakMap<GeneratedFlexTokenSource, FlexTokens>();

function materializeInteractionTokens(source: GeneratedFlexTokenSource, state: 'hover' | 'pressed'): InteractiveColorOverrides {
  return Object.fromEntries(
    interactionTokenNames.map((name) => [name, source.color[state][name] ?? source.color[name]]),
  ) as InteractiveColorOverrides;
}

/**
 * Resolve the generated platform defaults for a structured appearance.
 */
export function getDefaultFlexTokens(appearance: ResolvedThemeAppearance): FlexTokens {
  const name = generatedAppearanceName(appearance);
  const cached = defaultTokensCache.get(name);
  if (cached) {
    return cached;
  }
  const source = resolveGeneratedValue<GeneratedFlexTokenSource, keyof typeof generatedDefaultTokenDefinitions>(
    generatedDefaultTokenDefinitions,
    name,
    sourceCache,
  );
  const materialized = materializedSourceCache.get(source);
  if (materialized) {
    defaultTokensCache.set(name, materialized);
    return materialized;
  }
  const tokens: FlexTokens = {
    ...source,
    color: {
      ...source.color,
      hover: materializeInteractionTokens(source, 'hover'),
      pressed: materializeInteractionTokens(source, 'pressed'),
    },
  };
  materializedSourceCache.set(source, tokens);
  defaultTokensCache.set(name, tokens);
  return tokens;
}

/**
 * Default platform tokens retained for compatibility and testing.
 */
export const defaultFlexTokens = getDefaultFlexTokens(defaultResolvedThemeAppearance);
