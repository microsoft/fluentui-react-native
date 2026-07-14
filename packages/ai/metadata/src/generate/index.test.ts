import { join } from 'node:path';
import { mkdir, readFile, rm } from 'node:fs/promises';

import { METADATA_SCHEMA_VERSION } from '../contracts/metadata.ts';
import { generateMetadata, METADATA_GENERATE_COMMAND, type MetadataGenerateOptions } from './index.ts';

const FIXTURE_COMPONENTS_MODULE = 'packages/ai/metadata/src/generate/__fixtures__/fixtureComponents.ts';
const FIXED_TIMESTAMP = '2025-01-01T00:00:00.000Z';

describe('generateMetadata', () => {
  it('is deterministic and skips unchanged writes with fixed timestamp mode', async () => {
    const outputDirectory = await createOutputDirectory('deterministic');
    const aggregatePath = join(outputDirectory, 'metadata.json');

    const options = buildFixtureGenerateOptions({
      output: {
        aggregateFilePath: aggregatePath,
        includeComponentShards: true,
      },
    });

    const first = await generateMetadata(options);
    const second = await generateMetadata(options);

    expect(first.command).toBe(METADATA_GENERATE_COMMAND);
    expect(first.envelope.schemaVersion).toBe(METADATA_SCHEMA_VERSION);
    expect(first.envelope.generatedAt).toBe(FIXED_TIMESTAMP);
    expect(first.writes?.aggregate.changed).toBe(true);
    expect(second.writes?.aggregate.changed).toBe(false);
    expect(second.writes?.componentShards.every((write) => write.changed === false)).toBe(true);
    expect(second.issues).toEqual([]);
    expect(second.envelope).toEqual(first.envelope);

    const persisted = await readFile(aggregatePath, 'utf8');
    expect(persisted).toMatchSnapshot();

    await rm(outputDirectory, { recursive: true, force: true });
  });

  it('continues after non-fatal per-component failures', async () => {
    const result = await generateMetadata({
      schemaVersion: METADATA_SCHEMA_VERSION,
      timestamp: { mode: 'fixed', value: FIXED_TIMESTAMP },
      cwd: process.cwd(),
      catalog: {
        entries: [
          {
            name: 'Broken',
            packageName: '@fluentui-react-native/test',
            exportName: 'MissingExport',
            importPath: FIXTURE_COMPONENTS_MODULE,
          },
          {
            name: 'Toy',
            packageName: '@fluentui-react-native/test',
            exportName: 'ToyFixture',
            importPath: FIXTURE_COMPONENTS_MODULE,
          },
        ],
      },
      metadataSourceResolvers: {
        Toy: {
          states: [{ id: 'default', props: { label: 'Toy fixture' } }],
        },
      },
    });

    expect(result.envelope.components).toHaveLength(2);
    const broken = result.envelope.components.find((component) => component.identity.name === 'Broken');
    const toy = result.envelope.components.find((component) => component.identity.name === 'Toy');

    expect(broken?.extraction.status).toBe('failed');
    expect(broken?.extraction.errors[0].code).toBe('component/setup-error');
    expect(toy?.extraction.status).toBe('complete');
    expect(result.issues.some((issue) => issue.rule === 'generate/component-extraction-failed')).toBe(true);
  });

  it('integrates analyzer outputs for a small catalog', async () => {
    const result = await generateMetadata(buildFixtureGenerateOptions());
    const byName = new Map(result.envelope.components.map((component) => [component.identity.name, component]));

    const button = byName.get('Button');
    const toy = byName.get('Toy');

    expect(button?.tokens.mappings.length).toBeGreaterThan(0);
    expect(toy?.tokens.mappings.length).toBeGreaterThan(0);
    expect(button?.a11y.serializedTree).not.toBeNull();
    expect(toy?.a11y.serializedTree).not.toBeNull();
    expect(button?.states.map((state) => state.id)).toEqual(['default', 'disabled']);
    expect(toy?.states.map((state) => state.id)).toEqual(['default']);
    expect(result.issues).toEqual([]);
  });
});

function buildFixtureGenerateOptions(overrides: Partial<MetadataGenerateOptions> = {}): MetadataGenerateOptions {
  const base: MetadataGenerateOptions = {
    schemaVersion: METADATA_SCHEMA_VERSION,
    timestamp: { mode: 'fixed', value: FIXED_TIMESTAMP },
    cwd: process.cwd(),
    catalog: {
      entries: [
        {
          name: 'Button',
          packageName: '@fluentui-react-native/test',
          exportName: 'ButtonFixture',
          importPath: FIXTURE_COMPONENTS_MODULE,
        },
        {
          name: 'Toy',
          packageName: '@fluentui-react-native/test',
          exportName: 'ToyFixture',
          importPath: FIXTURE_COMPONENTS_MODULE,
        },
      ],
    },
    metadataSourceResolvers: {
      Button: {
        states: [
          {
            id: 'default',
            props: { children: 'Button fixture' },
          },
          {
            id: 'disabled',
            props: { children: 'Disabled fixture', disabled: true },
          },
        ],
      },
      Toy: {
        states: [{ id: 'default', props: { label: 'Toy fixture' } }],
      },
    },
  };

  return {
    ...base,
    ...overrides,
    catalog: overrides.catalog ?? base.catalog,
    metadataSourceResolvers: overrides.metadataSourceResolvers ?? base.metadataSourceResolvers,
  };
}

async function createOutputDirectory(label: string): Promise<string> {
  const directory = join(
    process.cwd(),
    'packages',
    'ai',
    'metadata',
    '.test-output',
    `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  await mkdir(directory, { recursive: true });
  return directory;
}
