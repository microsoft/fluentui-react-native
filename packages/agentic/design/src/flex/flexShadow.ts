import type { ColorSchemeSelector } from './colors/flexColor';
import type { FlexShadow, FlexShadowEntry, SemanticShadowEntries, SemanticShadows } from './tokens.types';

function isShadowLayer(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const { x, y, blur, color } = value as Record<string, unknown>;
  return typeof x === 'number' && typeof y === 'number' && typeof blur === 'number' && color !== undefined && color !== null;
}

function isFlexShadow(value: unknown): value is FlexShadow {
  return Array.isArray(value) && value.every(isShadowLayer);
}

function isShadowTuple(entry: FlexShadowEntry): entry is readonly [light: FlexShadow, dark: FlexShadow] {
  return Array.isArray(entry[0]);
}

/**
 * Throw unless a value is a layered shadow or a light/dark tuple of layered
 * shadows.
 */
function assertShadowEntry(value: unknown, path: string): asserts value is FlexShadowEntry {
  if (isFlexShadow(value) || (Array.isArray(value) && value.length === 2 && isFlexShadow(value[0]) && isFlexShadow(value[1]))) {
    return;
  }
  const legacy = typeof value === 'object' && value !== null && ('ambient' in value || 'key' in value);
  throw new TypeError(
    `${path} must be an array of { x, y, blur, color } shadow layers or a [light, dark] tuple of them.` +
      (legacy ? ' Author a legacy { ambient, key } shadow as [ambient, key].' : ''),
  );
}

/**
 * Validate authored shadow entries. `undefined` entries are not overrides.
 * @internal
 */
export function assertShadowEntries(shadows: unknown): asserts shadows is Partial<SemanticShadowEntries> {
  if (typeof shadows !== 'object' || shadows === null || Array.isArray(shadows)) {
    throw new TypeError('Flex shadow overrides must be an object keyed by semantic shadow name.');
  }
  for (const [name, value] of Object.entries(shadows)) {
    if (value !== undefined) {
      assertShadowEntry(value, `shadow.${name}`);
    }
  }
}

/**
 * Replace each overridden shadow atomically. `undefined` entries are not
 * overrides, so they keep the base shadow.
 * @internal
 */
export function mergeShadowEntries(base: SemanticShadowEntries, shadows: unknown): SemanticShadowEntries {
  assertShadowEntries(shadows);
  let merged: Record<string, FlexShadowEntry> | undefined;
  for (const [name, value] of Object.entries(shadows)) {
    if (value !== undefined && value !== (base as Record<string, FlexShadowEntry>)[name]) {
      merged ??= { ...base };
      merged[name] = value;
    }
  }
  return merged ? (Object.freeze(merged) as SemanticShadowEntries) : base;
}

/**
 * Select the shadow an authored entry uses for an appearance's color scheme.
 */
export function selectShadowEntry(entry: FlexShadowEntry, appearance: ColorSchemeSelector): FlexShadow {
  return isShadowTuple(entry) ? entry[appearance.colorScheme === 'dark' ? 1 : 0] : entry;
}

/**
 * Select every authored shadow for an appearance.
 * @internal
 */
export function resolveShadowEntries(shadows: SemanticShadowEntries, appearance: ColorSchemeSelector): SemanticShadows {
  const resolved: Record<string, FlexShadow> = {};
  for (const name of Object.keys(shadows)) {
    resolved[name] = selectShadowEntry((shadows as Record<string, FlexShadowEntry>)[name], appearance);
  }
  return Object.freeze(resolved) as SemanticShadows;
}
