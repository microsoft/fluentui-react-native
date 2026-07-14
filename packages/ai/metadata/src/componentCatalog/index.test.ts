import {
  componentCatalogId,
  getComponentCatalog,
  listMetadataComponents,
  METADATA_LIST_COMPONENTS_COMMAND,
  type ComponentCatalogEntry,
} from './index.ts';

describe('component catalog', () => {
  const unsortedEntries: readonly ComponentCatalogEntry[] = [
    {
      name: 'Text',
      packageName: '@fluentui-react-native/text',
      exportName: 'Text',
      importPath: '@fluentui-react-native/text',
    },
    {
      name: 'Button',
      packageName: '@fluentui-react-native/button',
      exportName: 'Button',
      importPath: '@fluentui-react-native/button',
    },
  ];

  it('returns stable ordering', () => {
    const catalog = getComponentCatalog({ entries: unsortedEntries });
    expect(catalog.map((entry) => entry.name)).toEqual(['Button', 'Text']);
  });

  it('applies allowlist and denylist deterministically', () => {
    const buttonId = componentCatalogId(unsortedEntries[1]);
    const catalog = getComponentCatalog({
      entries: unsortedEntries,
      allowlist: [buttonId],
      denylist: ['Text'],
    });
    expect(catalog).toHaveLength(1);
    expect(catalog[0].name).toBe('Button');
  });

  it('applies per-component override path support', () => {
    const buttonId = componentCatalogId(unsortedEntries[1]);
    const catalog = getComponentCatalog({
      entries: unsortedEntries,
      overrides: {
        [buttonId]: {
          overridePath: 'packages/ai/metadata/overrides/button.json',
        },
      },
    });
    expect(catalog[0].overridePath).toBe('packages/ai/metadata/overrides/button.json');
  });

  it('exposes the stable list-components command surface', () => {
    const result = listMetadataComponents({ entries: unsortedEntries });
    expect(result.command).toBe(METADATA_LIST_COMPONENTS_COMMAND);
    expect(result.components).toHaveLength(2);
  });
});
