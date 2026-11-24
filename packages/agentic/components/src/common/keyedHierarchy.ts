export type HierarchyNode<T> = {
  entry: T;
  key: string;
  parent?: string;
  children: readonly string[];
  level: number;
  position: number;
  setSize: number;
};

export function buildHierarchy<T>(roots: readonly T[], getKey: (entry: T) => string, getChildren: (entry: T) => readonly T[] | undefined) {
  const nodes = new Map<string, HierarchyNode<T>>();
  const pending: { entries: readonly T[]; parent?: string; level: number }[] = [{ entries: roots, level: 1 }];
  for (const { entries, parent, level } of pending) {
    for (const [index, entry] of entries.entries()) {
      const key = getKey(entry);
      if (!key.trim() || nodes.has(key)) throw new TypeError('Hierarchy keys must be nonblank and unique; cycles are not supported.');
      const children = getChildren(entry) ?? [];
      nodes.set(key, { entry, key, parent, children: children.map(getKey), level, position: index + 1, setSize: entries.length });
      if (children.length) pending.push({ entries: children, parent: key, level: level + 1 });
    }
  }
  return { roots: roots.map(getKey), nodes };
}

export function visibleHierarchy<T>(graph: ReturnType<typeof buildHierarchy<T>>, expanded: ReadonlySet<string>): HierarchyNode<T>[] {
  const pending = [...graph.roots].reverse();
  const ordered: HierarchyNode<T>[] = [];
  while (pending.length) {
    const key = pending.pop()!;
    const node = graph.nodes.get(key);
    if (!node) continue;
    ordered.push(node);
    if (expanded.has(key)) {
      for (let index = node.children.length - 1; index >= 0; index--) pending.push(node.children[index]);
    }
  }
  return ordered;
}

export function hierarchyAncestors<T>(nodes: ReadonlyMap<string, HierarchyNode<T>>, key?: string): string[] {
  const result: string[] = [];
  let parent = key === undefined ? undefined : nodes.get(key)?.parent;
  while (parent !== undefined) {
    result.push(parent);
    parent = nodes.get(parent)?.parent;
  }
  return result;
}
