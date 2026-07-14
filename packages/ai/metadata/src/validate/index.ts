import {
  METADATA_SCHEMA_VERSION,
  type ComponentMetadataRecord,
  type MetadataEnvelope,
  type MetadataSchemaVersion,
} from '../contracts/metadata.ts';
import { componentMetadataRecordSchema, metadataEnvelopeSchema, type JsonSchema } from '../contracts/schema.ts';

export const METADATA_VALIDATE_COMMAND = 'metadata validate' as const;

export interface MetadataValidationIssue {
  severity: 'error' | 'warning';
  rule: string;
  path: string;
  message: string;
  hint?: string;
}

export interface MetadataValidationResult<T> {
  isValid: boolean;
  value: T | null;
  issues: MetadataValidationIssue[];
}

export interface ValidateMetadataOptions {
  expectedSchemaVersion?: MetadataSchemaVersion | string;
}

export interface ValidateMetadataArtifactResult extends MetadataValidationResult<MetadataEnvelope> {
  command: typeof METADATA_VALIDATE_COMMAND;
}

export function validateMetadataEnvelope(
  input: unknown,
  options: ValidateMetadataOptions = {},
): MetadataValidationResult<MetadataEnvelope> {
  const issues: MetadataValidationIssue[] = [];
  validateAgainstSchema(input, metadataEnvelopeSchema, '$', issues);
  if (issues.some((issue) => issue.severity === 'error')) {
    return { isValid: false, value: null, issues };
  }

  const envelope = input as MetadataEnvelope;
  const expectedVersion = options.expectedSchemaVersion ?? METADATA_SCHEMA_VERSION;
  if (envelope.schemaVersion !== expectedVersion) {
    issues.push({
      severity: 'error',
      rule: 'schema/version-mismatch',
      path: '$.schemaVersion',
      message: `Unsupported schemaVersion '${envelope.schemaVersion}'.`,
      hint: `Expected '${expectedVersion}'. Regenerate metadata with the current contract or run migration tooling.`,
    });
  }

  for (let i = 0; i < envelope.components.length; i++) {
    const componentResult = validateComponentMetadataRecord(envelope.components[i], `$.components[${i}]`);
    issues.push(...componentResult.issues);
  }

  if (!isIsoDate(envelope.generatedAt)) {
    issues.push({
      severity: 'error',
      rule: 'envelope/invalid-generated-at',
      path: '$.generatedAt',
      message: `generatedAt must be an ISO-8601 timestamp; received '${envelope.generatedAt}'.`,
      hint: 'Use new Date().toISOString() when writing artifacts.',
    });
  }

  const isValid = issues.every((issue) => issue.severity !== 'error');
  return {
    isValid,
    value: isValid ? envelope : null,
    issues,
  };
}

export function validateComponentMetadataRecord(
  input: unknown,
  basePath: string = '$',
): MetadataValidationResult<ComponentMetadataRecord> {
  const issues: MetadataValidationIssue[] = [];
  validateAgainstSchema(input, componentMetadataRecordSchema, basePath, issues);
  if (issues.some((issue) => issue.severity === 'error')) {
    return { isValid: false, value: null, issues };
  }

  const component = input as ComponentMetadataRecord;
  if (component.states.length === 0) {
    issues.push({
      severity: 'warning',
      rule: 'component/no-states',
      path: `${basePath}.states`,
      message: 'Component has no states recorded yet.',
      hint: 'Stage 01 extraction should populate at least one state per component.',
    });
  }

  const seenStates = new Set<string>();
  for (let i = 0; i < component.states.length; i++) {
    const state = component.states[i];
    if (seenStates.has(state.id)) {
      issues.push({
        severity: 'error',
        rule: 'component/duplicate-state-id',
        path: `${basePath}.states[${i}].id`,
        message: `Duplicate state id '${state.id}'.`,
        hint: 'State ids must be unique within each component record.',
      });
    }
    seenStates.add(state.id);
  }

  const isValid = issues.every((issue) => issue.severity !== 'error');
  return {
    isValid,
    value: isValid ? component : null,
    issues,
  };
}

export function validateMetadataArtifact(
  input: unknown,
  options: ValidateMetadataOptions = {},
): ValidateMetadataArtifactResult {
  const result = validateMetadataEnvelope(input, options);
  return {
    command: METADATA_VALIDATE_COMMAND,
    ...result,
  };
}

function validateAgainstSchema(
  value: unknown,
  schema: JsonSchema,
  path: string,
  issues: MetadataValidationIssue[],
): void {
  if (schema.type) {
    const actualType = getJsonType(value);
    if (actualType !== schema.type) {
      issues.push({
        severity: 'error',
        rule: 'schema/type-mismatch',
        path,
        message: `Expected ${schema.type} but found ${actualType}.`,
      });
      return;
    }
  }

  if (schema.enum && !schema.enum.some((candidate) => deepEqual(candidate, value))) {
    issues.push({
      severity: 'error',
      rule: 'schema/enum-mismatch',
      path,
      message: `Value ${JSON.stringify(value)} is not one of the allowed enum values.`,
    });
    return;
  }

  if (schema.type === 'object' && schema.properties) {
    const record = value as Record<string, unknown>;
    for (const field of schema.required ?? []) {
      if (!(field in record)) {
        issues.push({
          severity: 'error',
          rule: 'schema/missing-required-field',
          path: `${path}.${field}`,
          message: `Missing required field '${field}'.`,
        });
      }
    }

    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      if (field in record) {
        validateAgainstSchema(record[field], fieldSchema, `${path}.${field}`, issues);
      }
    }
    return;
  }

  if (schema.type === 'array' && schema.items) {
    const values = value as unknown[];
    for (let i = 0; i < values.length; i++) {
      validateAgainstSchema(values[i], schema.items, `${path}[${i}]`, issues);
    }
  }
}

function getJsonType(value: unknown): JsonSchema['type'] | 'unknown' {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  switch (typeof value) {
    case 'object':
      return 'object';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'unknown';
  }
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => deepEqual(item, right[index]));
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length && leftKeys.every((key) => key in right && deepEqual(left[key], right[key]))
    );
  }
  return false;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
