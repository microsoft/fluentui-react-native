import type { ColorValue } from 'react-native';

import type { ThemeColorScheme } from '../../types/appearance.types';
import type {
  ColorEntry,
  ColorTuple,
  FlexColorDescription,
  FlexColorInput,
  InteractiveColor,
  InteractiveColorOptions,
  InteractiveColorType,
} from '../tokens.types';
import { createInteractiveColor, isInteractiveColor } from './interactiveColor';

/** The appearance field that selects a light/dark color tuple entry. */
export type ColorSchemeSelector = { readonly colorScheme: ThemeColorScheme };

type MutableDescription = { rest: ColorEntry; hover?: ColorEntry; pressed?: ColorEntry; type: InteractiveColorType };

const colorTypes: ReadonlySet<string> = new Set<InteractiveColorType>(['standard', 'inverted', 'fixed']);
const optionKeys: ReadonlySet<string> = new Set(['rest', 'hover', 'pressed', 'type']);
const descriptions = new WeakSet<object>();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOptionKey(value: Record<string, unknown>): boolean {
  return Object.keys(value).some((key) => optionKeys.has(key));
}

function rejectResolved(value: unknown, label: string): void {
  if (isInteractiveColor(value)) {
    throw new TypeError(
      `${label} is a resolved InteractiveColor. Resolved colors are appearance-bound outputs; author rest and any explicit hover or pressed values instead.`,
    );
  }
}

function validateColorType(type: unknown, label: string): InteractiveColorType {
  if (typeof type !== 'string' || !colorTypes.has(type)) {
    throw new TypeError(`${label} has invalid type ${String(type)}. Expected "standard", "inverted", or "fixed".`);
  }
  return type as InteractiveColorType;
}

function normalizeColorValue(value: unknown, label: string): ColorValue {
  if (typeof value === 'string' || typeof value === 'number') {
    return value as ColorValue;
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    rejectResolved(value, label);
    if (isPlainObject(value) && hasOptionKey(value)) {
      throw new TypeError(`${label} must be a color value, not nested interaction options.`);
    }
    return value as ColorValue;
  }
  throw new TypeError(`${label} must be a color value.`);
}

function normalizeColorEntry(value: unknown, label: string): ColorEntry {
  if (!Array.isArray(value)) {
    return normalizeColorValue(value, label);
  }
  if (value.length !== 2) {
    throw new TypeError(`${label} must be a [light, dark] tuple with exactly two colors.`);
  }
  return Object.freeze([normalizeColorValue(value[0], `${label}[0]`), normalizeColorValue(value[1], `${label}[1]`)]) as ColorTuple;
}

function createDescription(rest: ColorEntry, hover: ColorEntry | undefined, pressed: ColorEntry | undefined, type: InteractiveColorType) {
  const description: MutableDescription = { rest } as MutableDescription;
  if (hover !== undefined) {
    description.hover = hover;
  }
  if (pressed !== undefined) {
    description.pressed = pressed;
  }
  description.type = type;
  Object.freeze(description);
  descriptions.add(description);
  return description as FlexColorDescription;
}

function normalizeOptions(options: Record<string, unknown>, defaultType: InteractiveColorType, label: string): FlexColorDescription {
  for (const key of Object.keys(options)) {
    if (!optionKeys.has(key)) {
      throw new TypeError(`${label} has unknown option "${key}". Expected rest, hover, pressed, or type.`);
    }
  }
  if (options.rest === undefined) {
    throw new TypeError(`${label} must include rest when it supplies interaction options.`);
  }
  return createDescription(
    normalizeColorEntry(options.rest, `${label}.rest`),
    options.hover === undefined ? undefined : normalizeColorEntry(options.hover, `${label}.hover`),
    options.pressed === undefined ? undefined : normalizeColorEntry(options.pressed, `${label}.pressed`),
    options.type === undefined ? defaultType : validateColorType(options.type, label),
  );
}

/**
 * Normalize one authored color into a frozen description with an explicit
 * type. Package-normalized descriptions are returned unchanged.
 * @internal
 */
export function normalizeFlexColor(
  value: FlexColorInput,
  defaultType: InteractiveColorType = 'standard',
  label = 'Flex color',
): FlexColorDescription {
  if (typeof value === 'object' && value !== null && descriptions.has(value)) {
    return value as FlexColorDescription;
  }
  rejectResolved(value, label);
  const type = validateColorType(defaultType, label);
  if (isPlainObject(value) && hasOptionKey(value)) {
    return normalizeOptions(value, type, label);
  }
  return createDescription(normalizeColorEntry(value, label), undefined, undefined, type);
}

/**
 * Normalize an authored Flex color. A single value applies to every scheme,
 * and a tuple selects `[light, dark]`. The second argument sets the
 * interaction type unless `value.type` is supplied. Arguments are never
 * mutated; the result is a new frozen options object.
 */
export function flexColor(value: FlexColorInput, colorType: InteractiveColorType = 'standard'): InteractiveColorOptions {
  return normalizeFlexColor(value, colorType, 'flexColor value');
}

/**
 * Select the color for a scheme from an authored rest or explicit state entry.
 */
export function selectColorEntry(entry: ColorEntry, appearance: ColorSchemeSelector): ColorValue {
  if (!Array.isArray(entry)) {
    return entry as ColorValue;
  }
  if (entry.length !== 2) {
    throw new TypeError('A Flex color tuple must contain exactly [light, dark].');
  }
  return entry[appearance.colorScheme === 'dark' ? 1 : 0];
}

/**
 * Resolve a description without interaction algorithms: omitted states equal
 * rest. Used by defaults and legacy adapters, whose fallback ownership must
 * not change.
 * @internal
 */
export function resolveExplicitFlexColor(description: FlexColorDescription, appearance: ColorSchemeSelector): InteractiveColor {
  const rest = selectColorEntry(description.rest, appearance);
  return createInteractiveColor(
    rest,
    description.hover === undefined ? rest : selectColorEntry(description.hover, appearance),
    description.pressed === undefined ? rest : selectColorEntry(description.pressed, appearance),
  );
}
