/** A JSON-compatible primitive value. */
export type JsonPrimitive = boolean | number | string | null;

/** A JSON-compatible array. Array order is significant and is never sorted. */
export type JsonArray = readonly JsonValue[];

/** A JSON-compatible object. */
export type JsonObject = { readonly [key: string]: JsonValue };

/** Any JSON-compatible value. */
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

/**
 * Marks an object property that must be deleted while applying a delta.
 *
 * This sentinel is intentionally not JSON-compatible and is recognized by identity. Apply deltas before serializing
 * checked-in data rather than persisting the sentinel.
 */
export const JSON_DELETION = Symbol('JSON_DELETION');

/** The explicit deletion marker used in structured JSON deltas. */
export type JsonDeletion = typeof JSON_DELETION;

/** A recursively applicable object delta. Arrays and primitive values are atomic replacements. */
export type JsonDeltaValue = JsonPrimitive | JsonArray | JsonDeltaObject | JsonDeletion;

/** A semantic delta between two complete JSON objects. */
export type JsonDeltaObject = { readonly [key: string]: JsonDeltaValue };

/** An explicitly named complete object that may be selected as a delta parent. Candidate keys must be unique. */
export type DeltaParentCandidate = {
  readonly key: string;
  readonly value: JsonObject;
};

/** The selected parent and the delta required to reconstruct the child. */
export type SelectedDeltaParent<TCandidate extends DeltaParentCandidate> = {
  readonly candidate: TCandidate;
  readonly delta: JsonDeltaObject;
  readonly serializedDeltaSize: number;
};

/** Options for deterministic TypeScript literal serialization. */
export type TypeScriptLiteralOptions = {
  /** Number of spaces per indentation level. Use zero for compact output. Defaults to two. */
  readonly indent?: number;
  /**
   * Emit deletion sentinels as the `JSON_DELETION` identifier. This is intended for tests and diagnostics only.
   * Generated data callers should apply the delta and serialize the resulting complete object instead.
   */
  readonly allowDeletionSentinel?: boolean;
};

const NO_CHANGE = Symbol('NO_CHANGE');
type NoChange = typeof NO_CHANGE;

function isJsonArray(value: JsonValue | JsonDeltaValue | undefined): value is JsonArray {
  return Array.isArray(value);
}

function isJsonObject(value: JsonValue | JsonDeltaValue | undefined): value is JsonObject | JsonDeltaObject {
  return typeof value === 'object' && value !== null && !isJsonArray(value);
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sortedKeys(value: object): string[] {
  return Object.keys(value).sort(compareStrings);
}

function assertFiniteNumber(value: number): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`JSON numbers must be finite; received ${String(value)}.`);
  }
}

function cloneAndSortJson(value: JsonValue): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    assertFiniteNumber(value);
    return value;
  }
  if (isJsonArray(value)) {
    return value.map(cloneAndSortJson);
  }
  if (typeof value === 'object') {
    return Object.fromEntries(sortedKeys(value).map((key) => [key, cloneAndSortJson(value[key])]));
  }
  throw new TypeError(`Unsupported JSON value of type ${typeof value}.`);
}

/**
 * Deeply clone a JSON-compatible value without retaining any object or array references.
 */
export function cloneJsonValue(value: JsonValue): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    assertFiniteNumber(value);
    return value;
  }
  if (isJsonArray(value)) {
    return value.map(cloneJsonValue);
  }
  if (typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).map((key) => [key, cloneJsonValue(value[key])]));
  }
  throw new TypeError(`Unsupported JSON value of type ${typeof value}.`);
}

/**
 * Deeply clone a JSON-compatible value while sorting every object's keys. Array order is preserved.
 */
export function sortJsonValue(value: JsonValue): JsonValue {
  return cloneAndSortJson(value);
}

/**
 * Serialize JSON with deterministic object-key ordering. Array order is preserved.
 * @param value The complete JSON-compatible value to serialize.
 * @param indent Number of spaces per indentation level. Defaults to compact output.
 */
export function serializeJson(value: JsonValue, indent: number = 0): string {
  validateIndent(indent);
  return JSON.stringify(sortJsonValue(value), null, indent);
}

function jsonValuesEqual(left: JsonValue, right: JsonValue): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (isJsonArray(left) || isJsonArray(right)) {
    return (
      isJsonArray(left) &&
      isJsonArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonValuesEqual(value, right[index]))
    );
  }
  if (isJsonObject(left) || isJsonObject(right)) {
    if (!isJsonObject(left) || !isJsonObject(right)) {
      return false;
    }
    const leftKeys = sortedKeys(left);
    const rightKeys = sortedKeys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key, index) =>
          key === rightKeys[index] && Object.hasOwn(right, key) && jsonValuesEqual(left[key] as JsonValue, right[key] as JsonValue),
      )
    );
  }
  return false;
}

function createDeltaValue(parent: JsonValue, child: JsonValue): JsonDeltaValue | NoChange {
  if (jsonValuesEqual(parent, child)) {
    return NO_CHANGE;
  }
  if (isJsonObject(parent) && isJsonObject(child)) {
    return createJsonObjectDelta(parent as JsonObject, child as JsonObject);
  }
  return sortJsonValue(child) as JsonPrimitive | JsonArray | JsonDeltaObject;
}

/**
 * Compute a semantic delta from a complete parent object to a complete child object.
 *
 * Changed and new object properties are included recursively, unchanged properties are omitted, and removed properties
 * use {@link JSON_DELETION}. Arrays and primitives are replaced atomically.
 */
export function createJsonObjectDelta(parent: JsonObject, child: JsonObject): JsonDeltaObject {
  const entries: [string, JsonDeltaValue][] = [];
  const keys = new Set([...Object.keys(parent), ...Object.keys(child)]);

  for (const key of [...keys].sort(compareStrings)) {
    if (!Object.hasOwn(child, key)) {
      entries.push([key, JSON_DELETION]);
    } else if (!Object.hasOwn(parent, key)) {
      entries.push([key, sortJsonValue(child[key]) as JsonPrimitive | JsonArray | JsonDeltaObject]);
    } else {
      const valueDelta = createDeltaValue(parent[key], child[key]);
      if (valueDelta !== NO_CHANGE) {
        entries.push([key, valueDelta]);
      }
    }
  }

  return Object.fromEntries(entries);
}

function applyDeltaValue(parent: JsonValue | undefined, delta: JsonDeltaValue): JsonValue {
  if (delta === JSON_DELETION) {
    throw new TypeError('A JSON deletion sentinel can only be applied to an object property.');
  }
  if (isJsonObject(delta)) {
    const parentObject = isJsonObject(parent as JsonValue) ? (parent as JsonObject) : {};
    return applyJsonObjectDelta(parentObject, delta as JsonDeltaObject);
  }
  return cloneJsonValue(delta);
}

/**
 * Apply a delta to a complete parent object without mutating either input.
 */
export function applyJsonObjectDelta(parent: JsonObject, delta: JsonDeltaObject): JsonObject {
  const values = new Map<string, JsonValue>(Object.keys(parent).map((key) => [key, cloneJsonValue(parent[key])]));

  for (const key of sortedKeys(delta)) {
    const deltaValue = delta[key];
    if (deltaValue === JSON_DELETION) {
      values.delete(key);
    } else {
      values.set(key, applyDeltaValue(values.get(key), deltaValue));
    }
  }

  return Object.fromEntries([...values].sort(([left], [right]) => compareStrings(left, right)));
}

function validateIndent(indent: number): void {
  if (!Number.isSafeInteger(indent) || indent < 0) {
    throw new RangeError(`Indent must be a non-negative safe integer; received ${String(indent)}.`);
  }
}

function quoteString(value: string): string {
  return JSON.stringify(value).replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
}

function serializePropertyKey(value: string): string {
  const quoted = quoteString(value);
  return value === '__proto__' ? `[${quoted}]` : quoted;
}

function serializeLiteral(value: JsonValue | JsonDeltaValue, indent: number, depth: number, allowDeletionSentinel: boolean): string {
  if (value === JSON_DELETION) {
    if (!allowDeletionSentinel) {
      throw new TypeError('Apply JSON deletions before serializing checked-in TypeScript data.');
    }
    return 'JSON_DELETION';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return quoteString(value);
  }
  if (typeof value === 'number') {
    assertFiniteNumber(value);
    return Object.is(value, -0) ? '-0' : String(value);
  }
  if (typeof value === 'boolean') {
    return String(value);
  }

  const compact = indent === 0;
  const currentIndent = ' '.repeat(indent * depth);
  const childIndent = ' '.repeat(indent * (depth + 1));

  if (isJsonArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    const items = value.map((item) => serializeLiteral(item, indent, depth + 1, allowDeletionSentinel));
    return compact ? `[${items.join(',')}]` : `[\n${childIndent}${items.join(`,\n${childIndent}`)}\n${currentIndent}]`;
  }

  const keys = sortedKeys(value);
  if (keys.length === 0) {
    return '{}';
  }
  const properties = keys.map(
    (key) => `${serializePropertyKey(key)}:${compact ? '' : ' '}${serializeLiteral(value[key], indent, depth + 1, allowDeletionSentinel)}`,
  );
  return compact ? `{${properties.join(',')}}` : `{\n${childIndent}${properties.join(`,\n${childIndent}`)}\n${currentIndent}}`;
}

/**
 * Serialize a complete JSON value as a deterministic, safely escaped TypeScript literal.
 *
 * Object keys are always quoted and sorted. Deletion sentinels throw by default; callers generating checked-in data
 * should apply deltas first. Tests and diagnostics may opt into the exported `JSON_DELETION` identifier.
 */
export function serializeTypeScriptLiteral(value: JsonValue | JsonDeltaValue, options: TypeScriptLiteralOptions = {}): string {
  const indent = options.indent ?? 2;
  validateIndent(indent);
  return serializeLiteral(value, indent, 0, options.allowDeletionSentinel ?? false);
}

/**
 * Select the candidate that produces the smallest compact serialized delta for a complete child object.
 *
 * Equal-size deltas are resolved by candidate key using ordinal string ordering, so selection does not depend on input
 * order. Candidate keys must therefore be unique.
 */
export function selectCompactDeltaParent<TCandidate extends DeltaParentCandidate>(
  child: JsonObject,
  candidates: readonly TCandidate[],
): SelectedDeltaParent<TCandidate> | undefined {
  const seenKeys = new Set<string>();
  let selected: SelectedDeltaParent<TCandidate> | undefined;

  for (const candidate of candidates) {
    if (seenKeys.has(candidate.key)) {
      throw new Error(`Delta parent candidate key "${candidate.key}" is duplicated.`);
    }
    seenKeys.add(candidate.key);

    const delta = createJsonObjectDelta(candidate.value, child);
    const serializedDeltaSize = serializeTypeScriptLiteral(delta, { indent: 0, allowDeletionSentinel: true }).length;
    if (
      selected === undefined ||
      serializedDeltaSize < selected.serializedDeltaSize ||
      (serializedDeltaSize === selected.serializedDeltaSize && compareStrings(candidate.key, selected.candidate.key) < 0)
    ) {
      selected = { candidate, delta, serializedDeltaSize };
    }
  }

  return selected;
}
