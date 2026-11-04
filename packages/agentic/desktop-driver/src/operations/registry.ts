import { z } from 'zod';

import { actOperation } from './act.js';
import { artifactOperation, captureOperation } from './capture.js';
import { checkOperation } from './check.js';
import { findElementsOperation } from './find.js';
import { readJournalOperation } from './journalOperation.js';
import { operationSchemaVersion } from './limits.js';
import { observeOperation } from './observe.js';
import type { OperationCapabilities, OperationEffect, RegisteredOperation } from './runtime.js';
import { collapseSchemaReferences } from './schemaReferences.js';
import { sequenceOperation } from './sequence.js';
import { storiesOperation, storyOperation } from './story.js';

export type JsonSchema = Record<string, unknown>;

export type OperationCatalogEntry = {
  available: boolean;
  effect: OperationEffect;
  input: JsonSchema;
  name: string;
  output: JsonSchema;
  summary: string;
  unavailableReason?: string;
};

export type OperationCatalog = {
  operations: OperationCatalogEntry[];
  schemaVersion: number;
};

const operations: readonly RegisteredOperation[] = [
  observeOperation,
  findElementsOperation,
  actOperation,
  checkOperation,
  sequenceOperation,
  captureOperation,
  artifactOperation,
  storiesOperation,
  storyOperation,
  readJournalOperation,
];
const operationsByName = new Map(operations.map((definition) => [definition.name, definition]));
const schemaCache = new Map<string, { input: JsonSchema; output: JsonSchema }>();

export function lookupOperation(name: string): RegisteredOperation | undefined {
  return operationsByName.get(name);
}

/** A JSON Schema without the `$schema` marker, which every catalog entry would otherwise repeat. */
function describeSchema(schema: z.ZodType, io: 'input' | 'output'): JsonSchema {
  const { $schema: _marker, ...rest } = z.toJSONSchema(schema, { io, override: collapseSchemaReferences }) as JsonSchema;
  return rest;
}

/**
 * Results may gain optional fields within a schema version, so their published schemas must not forbid unknown fields.
 * The strict Zod schemas stay strict, so tests still catch a field a result should not carry.
 */
function openObjects(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(openObjects);
  }
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (key !== 'additionalProperties' || child !== false) {
        result[key] = openObjects(child);
      }
    }
    return result;
  }
  return value;
}

/** The cached schemas are shared by every caller, so they are frozen: a consumer that edits one fails loudly. */
function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

function schemasOf(definition: RegisteredOperation): { input: JsonSchema; output: JsonSchema } {
  let schemas = schemaCache.get(definition.name);
  if (!schemas) {
    schemas = deepFreeze({
      input: describeSchema(definition.input, 'input'),
      output: openObjects(describeSchema(definition.output, 'output')) as JsonSchema,
    });
    schemaCache.set(definition.name, schemas);
  }
  return schemas;
}

/** What an agent may call on this session, with the JSON Schemas of each operation's input and result. */
export function describeOperations(capabilities: OperationCapabilities): OperationCatalog {
  return {
    schemaVersion: operationSchemaVersion,
    operations: operations.map((definition) => {
      const availability = definition.availability(capabilities);
      return {
        name: definition.name,
        summary: definition.summary,
        effect: definition.effect,
        available: availability.available,
        ...(availability.available === false ? { unavailableReason: availability.reason } : {}),
        ...schemasOf(definition),
      };
    }),
  };
}
