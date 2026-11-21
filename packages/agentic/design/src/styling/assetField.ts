export type AssetField<Protocol extends string, Name extends string, Result> = {
  readonly protocol: Protocol;
  readonly prepare: (name: string) => () => Result;
  readonly assetName?: Name;
};

/** Describe a synchronous asset field backed by a component-local registry of static imports. */
export function assetField<const Protocol extends string, const Registry extends Readonly<Record<string, () => unknown>>, Result>(
  protocol: Protocol,
  registry: Registry,
  parse: (value: unknown) => Result,
): AssetField<Protocol, keyof Registry & string, Result> {
  if (!/^[a-z][a-z0-9-]*$/.test(protocol) || protocol === 'tokens' || protocol === 'literal') {
    throw new TypeError(`Invalid asset protocol "${protocol}"`);
  }
  const readers = new Map<string, () => Result>();
  return {
    protocol,
    prepare(name) {
      const cached = readers.get(name);
      if (cached) return cached;
      const entry = Object.getOwnPropertyDescriptor(registry, name);
      if (!name || name === 'constructor' || name === 'prototype' || name === '__proto__' || typeof entry?.value !== 'function') {
        throw new TypeError(`Unknown ${protocol} asset "${name}"`);
      }
      const load = entry.value as () => unknown;
      let result: { value: Result } | undefined;
      const read = () => (result ??= { value: parse(load()) }).value;
      readers.set(name, read);
      return read;
    },
  };
}
