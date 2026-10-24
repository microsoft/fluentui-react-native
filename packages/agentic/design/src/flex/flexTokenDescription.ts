import { immutableMerge } from '@fluentui-react-native/framework-base';

import type {
  CompleteFlexTokenInput,
  FlexColorDescription,
  FlexTokenDescription,
  FlexTokens,
  InteractiveColor,
  PartialFlexTokens,
  SemanticColorDescriptions,
  SemanticColors,
} from './tokens.types';
import { normalizeFlexColor, resolveExplicitFlexColor } from './colors/flexColor';
import type { ColorSchemeSelector } from './colors/flexColor';

/** Resolve one normalized color for an appearance. */
export type FlexColorResolver<TAppearance extends ColorSchemeSelector> = (
  token: string,
  description: FlexColorDescription,
  appearance: TAppearance,
) => InteractiveColor;

const emptyColors = Object.freeze({}) as SemanticColorDescriptions;

function mergeColors(base: SemanticColorDescriptions, colors: unknown): SemanticColorDescriptions {
  if (typeof colors !== 'object' || colors === null || Array.isArray(colors)) {
    throw new TypeError('Flex color overrides must be an object keyed by semantic color name.');
  }

  let merged: Record<string, FlexColorDescription> | undefined;
  for (const name of Object.keys(colors)) {
    const value = (colors as Record<string, unknown>)[name];
    if (value === undefined) {
      continue;
    }
    if (name === 'hover' || name === 'pressed') {
      throw new TypeError(`color.${name} maps are no longer supported. Author { rest, ${name} } on each color instead.`);
    }
    const description = normalizeFlexColor(value as never, 'standard', `color.${name}`);
    if (description !== (base as Record<string, FlexColorDescription>)[name]) {
      merged ??= { ...base };
      merged[name] = description;
    }
  }
  return merged ? (Object.freeze(merged) as SemanticColorDescriptions) : base;
}

/**
 * Merge authored overrides into a description. Each color replaces the
 * previous description atomically, so omitted states never inherit stale
 * explicit values. `undefined` colors are not overrides. Non-color groups keep
 * deep-merge semantics.
 * @internal
 */
export function mergeFlexTokenDescription(base: FlexTokenDescription, overrides: PartialFlexTokens | undefined): FlexTokenDescription {
  if (overrides === undefined) {
    return base;
  }
  if (typeof overrides !== 'object' || overrides === null || Array.isArray(overrides)) {
    throw new TypeError('Flex token overrides must be an object.');
  }

  const { color, ...groups } = overrides;
  const mergedColors = color === undefined ? base.color : mergeColors(base.color, color);
  const hasGroups = Object.keys(groups).length > 0;
  if (mergedColors === base.color && !hasGroups) {
    return base;
  }

  const { color: _baseColor, ...baseGroups } = base;
  const mergedGroups = hasGroups ? immutableMerge(baseGroups as object, groups as object) : baseGroups;
  return Object.freeze({ color: mergedColors, ...mergedGroups }) as FlexTokenDescription;
}

/**
 * Normalize a complete authored token set.
 * @internal
 */
export function createFlexTokenDescription(tokens: CompleteFlexTokenInput): FlexTokenDescription {
  const { color, ...groups } = tokens;
  return Object.freeze({ color: mergeColors(emptyColors, color), ...groups }) as FlexTokenDescription;
}

/**
 * Resolve every color in a description with a color policy. Non-color groups
 * are shared with the description.
 * @internal
 */
export function resolveFlexTokenDescriptionWith<TAppearance extends ColorSchemeSelector>(
  description: FlexTokenDescription,
  appearance: TAppearance,
  resolveColor: FlexColorResolver<TAppearance>,
): FlexTokens {
  const color: Record<string, InteractiveColor> = {};
  for (const name of Object.keys(description.color)) {
    color[name] = resolveColor(name, (description.color as Record<string, FlexColorDescription>)[name], appearance);
  }
  const { color: _descriptionColor, ...groups } = description;
  return Object.freeze({ color: Object.freeze(color) as SemanticColors, ...groups }) as FlexTokens;
}

/**
 * Resolve a description without interaction algorithms; omitted states equal
 * rest.
 * @internal
 */
export function resolveExplicitFlexTokenDescription(description: FlexTokenDescription, appearance: ColorSchemeSelector): FlexTokens {
  return resolveFlexTokenDescriptionWith(description, appearance, (_token, color, selected) => resolveExplicitFlexColor(color, selected));
}
