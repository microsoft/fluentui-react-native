import { immutableMerge } from '@fluentui-react-native/framework-base';

import type { GeneratedValueDefinitions } from './types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deleteAtPath(value: UnknownRecord, segments: readonly string[]): UnknownRecord {
  const [segment, ...remaining] = segments;
  const result = { ...value };
  if (remaining.length === 0) {
    delete result[segment];
    return result;
  }

  const child = result[segment];
  if (isRecord(child)) {
    result[segment] = deleteAtPath(child, remaining);
  }
  return result;
}

export function resolveGeneratedValue<T extends object, Name extends string>(
  definitions: GeneratedValueDefinitions<T, Name>,
  name: Name,
  cache: Map<Name, T>,
  resolving: Set<Name> = new Set<Name>(),
): T {
  const cached = cache.get(name);
  if (cached) {
    return cached;
  }
  if (resolving.has(name)) {
    throw new Error(`Generated token definition cycle at "${name}".`);
  }

  resolving.add(name);
  const definition = definitions[name];
  let value: T;
  if ('value' in definition) {
    value = definition.value();
  } else {
    const parent = resolveGeneratedValue(definitions, definition.parent, cache, resolving);
    const delta = definition.delta();
    value = Object.keys(delta).length === 0 && !definition.deletedPaths?.length ? parent : (immutableMerge(parent, delta) as T);
    for (const deletedPath of definition.deletedPaths ?? []) {
      value = deleteAtPath(value as UnknownRecord, deletedPath.split('.')) as T;
    }
  }
  resolving.delete(name);
  cache.set(name, value);
  return value;
}
