import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  analyzeComponent,
  createTestTheme,
  type AnalyzerIssue,
  type ComponentMetadata,
  type ComponentStateSpec,
} from '@fluentui-react-native/analyzer';

import type { ComponentCatalogEntry, ComponentCatalogOptions } from '../componentCatalog/index.ts';
import { componentCatalogId, getComponentCatalog } from '../componentCatalog/index.ts';
import { METADATA_SCHEMA_VERSION } from '../contracts/metadata.ts';
import type {
  ComponentA11yIssue,
  ComponentExtractionError,
  ComponentMetadataRecord,
  ComponentStateMetadata,
  ComponentTokenMapping,
  JsonValue,
  MetadataEnvelope,
  MetadataSchemaVersion,
} from '../contracts/metadata.ts';
import type { WriteMetadataArtifactsOptions, WriteMetadataArtifactsResult } from '../io/index.ts';
import { writeMetadataArtifacts } from '../io/index.ts';
import type { MetadataValidationIssue } from '../validate/index.ts';

export const METADATA_GENERATE_COMMAND = 'metadata generate' as const;

export type MetadataSourceDocument = Partial<Omit<ComponentMetadata, 'states'>> & Pick<ComponentMetadata, 'states'>;
export type MetadataSourceResolver = (
  entry: ComponentCatalogEntry,
) => MetadataSourceDocument | Promise<MetadataSourceDocument>;

export type TimestampMode =
  | {
      mode?: 'real';
    }
  | {
      mode: 'fixed';
      value: string;
    };

export interface MetadataGenerateOptions {
  schemaVersion?: MetadataSchemaVersion;
  generatorName?: string;
  generatorVersion?: string;
  catalog?: ComponentCatalogOptions;
  timestamp?: TimestampMode;
  output?: WriteMetadataArtifactsOptions;
  cwd?: string;
  componentLoader?: (entry: ComponentCatalogEntry) => Promise<unknown>;
  metadataSourceResolvers?: Readonly<Record<string, MetadataSourceResolver | MetadataSourceDocument>>;
}

export interface GenerateComponentMetadataOptions {
  cwd?: string;
  componentLoader?: (entry: ComponentCatalogEntry) => Promise<unknown>;
  metadataSourceResolvers?: Readonly<Record<string, MetadataSourceResolver | MetadataSourceDocument>>;
}

export interface MetadataGenerateResult {
  command: typeof METADATA_GENERATE_COMMAND;
  envelope: MetadataEnvelope;
  issues: MetadataValidationIssue[];
  writes?: WriteMetadataArtifactsResult;
}

export async function generateMetadata(options: MetadataGenerateOptions = {}): Promise<MetadataGenerateResult> {
  ensureSchemaVersion(options.schemaVersion);

  const components = getComponentCatalog(options.catalog);
  const issues: MetadataValidationIssue[] = [];
  const records: ComponentMetadataRecord[] = [];

  for (const entry of components) {
    const record = await generateComponentMetadata(entry, options);
    records.push(record);
    if (record.extraction.status !== 'complete') {
      issues.push({
        severity: 'warning',
        rule: 'generate/component-extraction-failed',
        path: `$.components[${records.length - 1}]`,
        message: `${entry.name} extraction completed with status '${record.extraction.status}'.`,
      });
    }
  }

  const envelope: MetadataEnvelope = {
    schemaVersion: options.schemaVersion ?? METADATA_SCHEMA_VERSION,
    generatedAt: resolveTimestamp(options.timestamp),
    generator: {
      name: options.generatorName ?? '@fluentui-react-native/metadata',
      version: options.generatorVersion ?? '0.0.0-stage01',
    },
    components: records,
  };

  let writes: WriteMetadataArtifactsResult | undefined;
  if (options.output !== undefined) {
    writes = await writeMetadataArtifacts(envelope, options.output);
  }

  return {
    command: METADATA_GENERATE_COMMAND,
    envelope,
    issues,
    writes,
  };
}

export async function generateComponentMetadata(
  entry: ComponentCatalogEntry,
  options: GenerateComponentMetadataOptions = {},
): Promise<ComponentMetadataRecord> {
  const identity: ComponentMetadataRecord['identity'] = {
    name: entry.name,
    packageName: entry.packageName,
    exportName: entry.exportName,
    platform: entry.platform,
  };

  try {
    const metadata = await resolveComponentMetadata(entry, options);
    const Component = (await resolveComponent(entry, options)) as Parameters<typeof analyzeComponent>[0]['Component'];
    const analysis = await analyzeComponent({
      Component,
      metadata,
      options: {
        themeBundle: createTestTheme(),
      },
    });

    const states = buildStateMetadata(analysis.matrix.data.snapshots);
    const tokens = buildTokenMappings(analysis.matrix.data.snapshots);
    const a11yIssues = analysis.issues.filter((issue) => issue.rule.startsWith('a11y/')).map(toComponentA11yIssue);
    const extractionErrors = collectExtractionErrors(analysis.issues, analysis.matrix.data.snapshots);
    const status = determineStatus(analysis.matrix.data.snapshots, extractionErrors);

    return {
      identity,
      states,
      tokens: {
        mappings: tokens,
      },
      a11y: {
        serializedTree: {
          states: analysis.matrix.data.snapshots.map((snapshot) => ({
            id: snapshot.state.id,
            tree: toJsonValue(snapshot.a11yTree),
          })),
        },
        issues: a11yIssues,
      },
      notes: { notes: [] },
      extraction: {
        status,
        errors: extractionErrors,
      },
    };
  } catch (error) {
    const extractionError: ComponentExtractionError = {
      code: 'component/setup-error',
      stage: 'setup',
      message: describeError(error),
    };
    return {
      identity,
      states: [],
      tokens: { mappings: [] },
      a11y: { serializedTree: null, issues: [] },
      notes: { notes: [] },
      extraction: {
        status: 'failed',
        errors: [extractionError],
      },
    };
  }
}

async function resolveComponentMetadata(
  entry: ComponentCatalogEntry,
  options: GenerateComponentMetadataOptions,
): Promise<ComponentMetadata> {
  const base: ComponentMetadata = createDefaultComponentMetadata(entry);
  const source = await resolveMetadataSource(entry, options);
  if (source === undefined) {
    return base;
  }

  const mergedBaseProps = {
    ...(base.baseProps ?? {}),
    ...(source.baseProps ?? {}),
  };

  return {
    name: source.name ?? base.name,
    importPath: source.importPath ?? base.importPath,
    exportName: source.exportName ?? base.exportName,
    baseProps: mergedBaseProps,
    states: source.states ?? base.states,
  };
}

async function resolveMetadataSource(
  entry: ComponentCatalogEntry,
  options: GenerateComponentMetadataOptions,
): Promise<MetadataSourceDocument | undefined> {
  const resolvers = options.metadataSourceResolvers ?? {};
  const id = componentCatalogId(entry);
  const source = resolvers[id] ?? resolvers[entry.name];
  if (source !== undefined) {
    if (typeof source === 'function') {
      return await source(entry);
    }
    return source;
  }

  if (entry.overridePath === undefined) {
    return undefined;
  }

  const imported = await import(resolveModuleSpecifier(entry.overridePath, options.cwd));
  return extractMetadataSource(imported);
}

function extractMetadataSource(imported: Record<string, unknown>): MetadataSourceDocument | undefined {
  const candidate = imported.componentMetadata ?? imported.default;
  if (candidate === undefined || candidate === null || typeof candidate !== 'object') {
    return undefined;
  }
  return candidate as MetadataSourceDocument;
}

async function resolveComponent(entry: ComponentCatalogEntry, options: GenerateComponentMetadataOptions): Promise<unknown> {
  if (options.componentLoader !== undefined) {
    return options.componentLoader(entry);
  }

  const imported = (await import(resolveModuleSpecifier(entry.importPath, options.cwd))) as Record<string, unknown>;
  const candidate = imported[entry.exportName];
  if (candidate === undefined) {
    throw new Error(`Unable to resolve export '${entry.exportName}' from '${entry.importPath}'.`);
  }
  return candidate;
}

function resolveModuleSpecifier(importPath: string, cwd: string | undefined): string {
  const baseDirectory = cwd ?? process.cwd();
  if (importPath.startsWith('.') || isAbsolute(importPath)) {
    return pathToFileURL(resolve(baseDirectory, importPath)).href;
  }
  return importPath;
}

function createDefaultComponentMetadata(entry: ComponentCatalogEntry): ComponentMetadata {
  const testID = `${entry.name.toLowerCase()}-root`;
  return {
    name: entry.name,
    importPath: entry.importPath,
    exportName: entry.exportName,
    baseProps: {
      testID,
      accessibilityLabel: entry.name,
      children: entry.name,
    },
    states: [{ id: 'default' }],
  };
}

function buildStateMetadata(snapshots: readonly { state: ComponentStateSpec }[]): ComponentStateMetadata[] {
  return snapshots.map((snapshot) => {
    const interactions = snapshot.state.interactions ?? [];
    const interactionKinds = Array.from(new Set(interactions.map((interaction) => interaction.kind))).sort((left, right) =>
      left.localeCompare(right),
    );
    return {
      id: snapshot.state.id,
      props: toJsonValue(snapshot.state.props) as Record<string, JsonValue> | undefined,
      interactionSummary: {
        totalInteractions: interactions.length,
        interactionKinds,
      },
    };
  });
}

function buildTokenMappings(
  snapshots: readonly {
    state: ComponentStateSpec;
    tokenMap?: {
      slots: readonly {
        path: readonly (string | number)[];
        entries: readonly {
          property: string;
          value: unknown;
          tokenPath?: string;
          children?: readonly unknown[];
        }[];
      }[];
    };
  }[],
): ComponentTokenMapping[] {
  const mappings: ComponentTokenMapping[] = [];
  for (const snapshot of snapshots) {
    if (snapshot.tokenMap === undefined) {
      continue;
    }
    for (const slot of snapshot.tokenMap.slots) {
      const slotPath = slot.path.length === 0 ? 'root' : slot.path.join('.');
      const slotId = `${snapshot.state.id}:${slotPath}`;
      for (const entry of slot.entries) {
        collectTokenEntry(slotId, entry, mappings);
      }
    }
  }

  mappings.sort((left, right) => {
    const leftValue = JSON.stringify(left.tokenValue ?? null);
    const rightValue = JSON.stringify(right.tokenValue ?? null);
    return (
      left.slot.localeCompare(right.slot) ||
      left.property.localeCompare(right.property) ||
      (left.tokenPath ?? '').localeCompare(right.tokenPath ?? '') ||
      leftValue.localeCompare(rightValue)
    );
  });
  return mappings;
}

function collectTokenEntry(
  slot: string,
  entry: {
    property: string;
    value: unknown;
    tokenPath?: string;
    children?: readonly unknown[];
  },
  mappings: ComponentTokenMapping[],
  parentProperty?: string,
): void {
  const property = parentProperty === undefined ? entry.property : `${parentProperty}.${entry.property}`;
  mappings.push({
    slot,
    property,
    tokenPath: entry.tokenPath,
    tokenValue: toJsonValue(entry.value),
  });

  if (entry.children === undefined) {
    return;
  }
  for (const child of entry.children) {
    const typed = child as {
      property: string;
      value: unknown;
      tokenPath?: string;
      children?: readonly unknown[];
    };
    collectTokenEntry(slot, typed, mappings, property);
  }
}

function collectExtractionErrors(
  issues: readonly AnalyzerIssue[],
  snapshots: readonly {
    state: ComponentStateSpec;
    error?: AnalyzerIssue;
  }[],
): ComponentExtractionError[] {
  const out: ComponentExtractionError[] = [];
  for (const snapshot of snapshots) {
    if (snapshot.error === undefined) {
      continue;
    }
    out.push({
      code: snapshot.error.rule,
      stage: `state:${snapshot.state.id}`,
      message: snapshot.error.message,
    });
  }

  for (const issue of issues) {
    if (issue.severity !== 'error') {
      continue;
    }
    if (out.some((error) => error.code === issue.rule && error.message === issue.message)) {
      continue;
    }
    out.push({
      code: issue.rule,
      stage: 'analysis',
      message: issue.message,
    });
  }

  return out;
}

function determineStatus(
  snapshots: readonly {
    error?: AnalyzerIssue;
  }[],
  errors: readonly ComponentExtractionError[],
): ComponentMetadataRecord['extraction']['status'] {
  if (errors.length === 0) {
    return 'complete';
  }
  const successfulSnapshots = snapshots.filter((snapshot) => snapshot.error === undefined).length;
  if (successfulSnapshots === 0) {
    return 'failed';
  }
  return 'partial';
}

function toComponentA11yIssue(issue: AnalyzerIssue): ComponentA11yIssue {
  return {
    severity: issue.severity,
    rule: issue.rule,
    message: issue.message,
    path: issue.path === undefined ? undefined : issue.path.join('.'),
  };
}

function toJsonValue(value: unknown): JsonValue {
  if (value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item));
  }
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
      return value;
    case 'object': {
      const record = value as Record<string, unknown>;
      const out: { [key: string]: JsonValue } = {};
      const keys = Object.keys(record).sort((left, right) => left.localeCompare(right));
      for (const key of keys) {
        const current = record[key];
        if (current === undefined) {
          continue;
        }
        out[key] = toJsonValue(current);
      }
      return out;
    }
    default:
      return String(value);
  }
}

function resolveTimestamp(mode: TimestampMode | undefined): string {
  if (mode === undefined || mode.mode === undefined || mode.mode === 'real') {
    return new Date().toISOString();
  }
  if (mode.mode === 'fixed') {
    if (!/^\d{4}-\d{2}-\d{2}T/.test(mode.value)) {
      throw new Error(`Invalid fixed timestamp '${mode.value}'. Expected ISO-8601.`);
    }
    return mode.value;
  }
  throw new Error('Unsupported timestamp mode.');
}

function ensureSchemaVersion(version: MetadataSchemaVersion | undefined): void {
  if (version !== undefined && version !== METADATA_SCHEMA_VERSION) {
    throw new Error(`Unsupported schemaVersion '${version}'. Expected '${METADATA_SCHEMA_VERSION}'.`);
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
