export function uniqueByKey<T>(entries: readonly T[], getKey: (entry: T) => string): T[] {
  const keys = new Set<string>();
  const result: T[] = [];
  for (const entry of entries) {
    const key = getKey(entry);
    if (!key.trim() || keys.has(key)) continue;
    result.push(entry);
    keys.add(key);
  }
  return result;
}

export function chooseAdjacentKey(key: string, previous: readonly string[], eligible: ReadonlySet<string>): string | undefined {
  const index = previous.indexOf(key);
  if (index < 0) return undefined;
  for (let cursor = index + 1; cursor < previous.length; cursor++) {
    if (eligible.has(previous[cursor])) return previous[cursor];
  }
  for (let cursor = index - 1; cursor >= 0; cursor--) {
    if (eligible.has(previous[cursor])) return previous[cursor];
  }
  return undefined;
}
