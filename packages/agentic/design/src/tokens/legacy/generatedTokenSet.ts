import type { AppearanceOptions } from '../../theming';
import { generatedAppearanceName } from '../generated/appearanceNames';
import type { ResolvedThemeAppearance } from '../../theming/appearance.types';
import { generatedLegacyTokenDefinitions } from './generated/tokenSets';
import { resolveGeneratedValue } from '../generated/resolveGeneratedValue';
import type { GeneratedAppearanceName } from '../generated/appearanceNames';
import type { GeneratedValueDefinitions } from '../generated/types';
import type { GeneratedLegacyTokenSet } from './generatedTokenSet.types';

type LegacyTokenDefinitions = GeneratedValueDefinitions<GeneratedLegacyTokenSet, GeneratedAppearanceName>;

const cachesByDefinition = new WeakMap<LegacyTokenDefinitions, Map<GeneratedAppearanceName, GeneratedLegacyTokenSet>>();

type WidenLiterals<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer Item)[]
        ? readonly WidenLiterals<Item>[]
        : T extends object
          ? { readonly [Key in keyof T]: WidenLiterals<T[Key]> }
          : T;

type GeneratedBaseValue<Definitions extends LegacyTokenDefinitions> = Definitions['light'] extends {
  readonly value: () => infer Value;
}
  ? WidenLiterals<Value>
  : GeneratedLegacyTokenSet;

/**
 * Resolve raw Fluent alias and shadow tokens for a legacy appearance.
 */
export function getGeneratedLegacyTokenSet(appearance: AppearanceOptions) {
  return getLegacyTokenSetForDefinitions(generatedLegacyTokenDefinitions, {
    colorScheme: appearance === 'light' || appearance === 'highContrast' ? 'light' : 'dark',
    contrast: appearance === 'highContrast' ? 'highContrast' : 'standard',
    interfaceLevel: appearance === 'darkElevated' ? 'elevated' : 'base',
  });
}

/**
 * Resolve raw Fluent alias and shadow tokens for a structured appearance.
 */
export function getLegacyTokenSet(appearance: ResolvedThemeAppearance) {
  return getLegacyTokenSetForDefinitions(generatedLegacyTokenDefinitions, appearance);
}

export function getLegacyTokenSetForDefinitions<Definitions extends LegacyTokenDefinitions>(
  definitions: Definitions,
  appearance: ResolvedThemeAppearance,
): GeneratedBaseValue<Definitions> {
  let cache = cachesByDefinition.get(definitions);
  if (!cache) {
    cache = new Map();
    cachesByDefinition.set(definitions, cache);
  }
  return resolveGeneratedValue<GeneratedLegacyTokenSet, GeneratedAppearanceName>(
    definitions,
    generatedAppearanceName(appearance),
    cache,
  ) as GeneratedBaseValue<Definitions>;
}
