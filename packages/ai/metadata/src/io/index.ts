import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import type { ComponentMetadataRecord, MetadataEnvelope } from '../contracts/metadata.ts';
import type { ValidateMetadataOptions } from '../validate/index.ts';
import { validateMetadataArtifact } from '../validate/index.ts';

export interface WriteMetadataOptions {
  pretty?: boolean;
  trailingNewline?: boolean;
  skipUnchanged?: boolean;
}

export interface MetadataArtifactFileWrite {
  filePath: string;
  hash: string;
  changed: boolean;
}

export interface WriteMetadataArtifactsOptions extends WriteMetadataOptions {
  aggregateFilePath: string;
  includeComponentShards?: boolean;
  componentShardDirectory?: string;
}

export interface WriteMetadataArtifactsResult {
  aggregate: MetadataArtifactFileWrite;
  componentShards: readonly MetadataArtifactFileWrite[];
}

export async function readMetadataEnvelope(filePath: string): Promise<MetadataEnvelope> {
  const text = await readFile(filePath, 'utf8');
  return JSON.parse(text) as MetadataEnvelope;
}

export async function readAndValidateMetadataEnvelope(
  filePath: string,
  options: ValidateMetadataOptions = {},
): Promise<ReturnType<typeof validateMetadataArtifact>> {
  const envelope = await readMetadataEnvelope(filePath);
  return validateMetadataArtifact(envelope, options);
}

export async function writeMetadataEnvelope(
  filePath: string,
  envelope: MetadataEnvelope,
  options: WriteMetadataOptions = {},
): Promise<void> {
  const content = serializeMetadataEnvelope(envelope, options);
  await writeContentIfChanged(filePath, content, options.skipUnchanged === true);
}

export async function writeMetadataArtifacts(
  envelope: MetadataEnvelope,
  options: WriteMetadataArtifactsOptions,
): Promise<WriteMetadataArtifactsResult> {
  const aggregateContent = serializeMetadataEnvelope(envelope, options);
  const aggregate = await writeContentIfChanged(options.aggregateFilePath, aggregateContent, options.skipUnchanged !== false);
  const componentShards: MetadataArtifactFileWrite[] = [];

  if (options.includeComponentShards === true) {
    const directory = options.componentShardDirectory ?? join(dirname(options.aggregateFilePath), 'components');
    const names = buildStableShardNames(envelope.components);
    for (let index = 0; index < envelope.components.length; index++) {
      const component = envelope.components[index];
      const shardFilePath = join(directory, `${names[index]}.json`);
      const shardContent = serializeStableJson(component, options);
      const shardWrite = await writeContentIfChanged(shardFilePath, shardContent, options.skipUnchanged !== false);
      componentShards.push(shardWrite);
    }
  }

  return {
    aggregate,
    componentShards,
  };
}

export function serializeMetadataEnvelope(envelope: MetadataEnvelope, options: WriteMetadataOptions = {}): string {
  return serializeStableJson(envelope, options);
}

function serializeStableJson(value: unknown, options: WriteMetadataOptions): string {
  const normalized = normalizeForStableJson(value);
  const spacing = options.pretty === false ? undefined : 2;
  const suffix = options.trailingNewline === false ? '' : '\n';
  return `${JSON.stringify(normalized, null, spacing)}${suffix}`;
}

async function writeContentIfChanged(filePath: string, content: string, skipUnchanged: boolean): Promise<MetadataArtifactFileWrite> {
  const nextHash = hashContent(content);
  if (skipUnchanged) {
    const current = await tryReadFile(filePath);
    if (current !== null && hashContent(current) === nextHash) {
      return {
        filePath,
        hash: nextHash,
        changed: false,
      };
    }
  }

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');

  return {
    filePath,
    hash: nextHash,
    changed: true,
  };
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

async function tryReadFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

function normalizeForStableJson(value: unknown): unknown {
  if (value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForStableJson(item));
  }
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return value;
    case 'number':
      return Number.isFinite(value) ? value : null;
    case 'bigint':
      return String(value);
    case 'object': {
      const record = value as Record<string, unknown>;
      const output: Record<string, unknown> = {};
      const keys = Object.keys(record).sort((left, right) => left.localeCompare(right));
      for (const key of keys) {
        const normalized = normalizeForStableJson(record[key]);
        if (normalized !== undefined) {
          output[key] = normalized;
        }
      }
      return output;
    }
    default:
      return undefined;
  }
}

function buildStableShardNames(components: readonly ComponentMetadataRecord[]): string[] {
  const used = new Set<string>();
  const names: string[] = [];
  for (const component of components) {
    const baseName = sanitizeShardName(component.identity.name);
    let name = baseName;
    let counter = 2;
    while (used.has(name)) {
      name = `${baseName}-${counter}`;
      counter++;
    }
    used.add(name);
    names.push(name);
  }
  return names;
}

function sanitizeShardName(name: string): string {
  const trimmed = name.trim();
  const normalized = trimmed.length === 0 ? 'component' : trimmed;
  return normalized.replace(/[^a-zA-Z0-9._-]+/g, '-');
}
