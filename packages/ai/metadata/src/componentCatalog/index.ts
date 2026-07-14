export const METADATA_LIST_COMPONENTS_COMMAND = 'metadata list-components' as const;

export interface ComponentCatalogEntry {
  name: string;
  packageName: string;
  exportName: string;
  importPath: string;
  platform?: string;
  overridePath?: string;
}

export interface ComponentCatalogOverride {
  disabled?: boolean;
  overridePath?: string;
}

export interface ComponentCatalogOptions {
  allowlist?: readonly string[];
  denylist?: readonly string[];
  overrides?: Readonly<Record<string, ComponentCatalogOverride>>;
  entries?: readonly ComponentCatalogEntry[];
}

export type ListComponentsOptions = ComponentCatalogOptions;

export interface ListComponentsResult {
  command: typeof METADATA_LIST_COMPONENTS_COMMAND;
  components: readonly ComponentCatalogEntry[];
}

const defaultCatalogEntries: readonly ComponentCatalogEntry[] = [];

export function componentCatalogId(entry: ComponentCatalogEntry): string {
  const platform = entry.platform ?? 'all';
  return `${entry.packageName}:${entry.exportName}:${platform}`;
}

export function getComponentCatalog(options: ComponentCatalogOptions = {}): readonly ComponentCatalogEntry[] {
  const source = [...(options.entries ?? defaultCatalogEntries)];
  const allowlist = toStringSet(options.allowlist);
  const denylist = toStringSet(options.denylist);
  const overrides = options.overrides ?? {};

  const filtered = source.filter((entry) => {
    const id = componentCatalogId(entry);
    if (allowlist.size > 0 && !allowlist.has(id) && !allowlist.has(entry.name)) {
      return false;
    }
    if (denylist.has(id) || denylist.has(entry.name)) {
      return false;
    }
    const override = overrides[id] ?? overrides[entry.name];
    if (override?.disabled) {
      return false;
    }
    return true;
  });

  const withOverrides = filtered.map((entry) => {
    const id = componentCatalogId(entry);
    const override = overrides[id] ?? overrides[entry.name];
    if (!override?.overridePath) {
      return entry;
    }
    return {
      ...entry,
      overridePath: override.overridePath,
    };
  });

  withOverrides.sort((left, right) => {
    const leftKey = `${left.packageName}\u0000${left.name}\u0000${left.exportName}\u0000${left.platform ?? ''}`;
    const rightKey = `${right.packageName}\u0000${right.name}\u0000${right.exportName}\u0000${right.platform ?? ''}`;
    return leftKey.localeCompare(rightKey);
  });

  return withOverrides;
}

export function listMetadataComponents(options: ListComponentsOptions = {}): ListComponentsResult {
  return {
    command: METADATA_LIST_COMPONENTS_COMMAND,
    components: getComponentCatalog(options),
  };
}

function toStringSet(values: readonly string[] | undefined): ReadonlySet<string> {
  return new Set(values ?? []);
}
