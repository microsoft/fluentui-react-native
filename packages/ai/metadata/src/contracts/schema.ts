import type { JsonValue } from './metadata.ts';

export interface JsonSchema {
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  required?: readonly string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: readonly JsonValue[];
  additionalProperties?: boolean;
}

export const componentMetadataRecordSchema: JsonSchema = {
  type: 'object',
  required: ['identity', 'states', 'tokens', 'a11y', 'notes', 'extraction'],
  properties: {
    identity: {
      type: 'object',
      required: ['name', 'packageName', 'exportName'],
      properties: {
        name: { type: 'string' },
        packageName: { type: 'string' },
        exportName: { type: 'string' },
        platform: { type: 'string' },
      },
    },
    states: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          props: { type: 'object' },
          interactionSummary: {
            type: 'object',
            required: ['totalInteractions', 'interactionKinds'],
            properties: {
              totalInteractions: { type: 'number' },
              interactionKinds: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    tokens: {
      type: 'object',
      required: ['mappings'],
      properties: {
        mappings: {
          type: 'array',
          items: {
            type: 'object',
            required: ['slot', 'property'],
            properties: {
              slot: { type: 'string' },
              property: { type: 'string' },
              tokenPath: { type: 'string' },
              tokenValue: {},
            },
          },
        },
      },
    },
    a11y: {
      type: 'object',
      required: ['serializedTree', 'issues'],
      properties: {
        serializedTree: {},
        issues: {
          type: 'array',
          items: {
            type: 'object',
            required: ['severity', 'rule', 'message'],
            properties: {
              severity: { enum: ['info', 'warning', 'error'] },
              rule: { type: 'string' },
              message: { type: 'string' },
              path: { type: 'string' },
            },
          },
        },
      },
    },
    notes: {
      type: 'object',
      required: ['notes'],
      properties: {
        notes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['text', 'provenance'],
            properties: {
              text: { type: 'string' },
              provenance: {
                type: 'object',
                required: ['source'],
                properties: {
                  source: { type: 'string' },
                  author: { type: 'string' },
                  updatedAt: { type: 'string' },
                  reference: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    extraction: {
      type: 'object',
      required: ['status', 'errors'],
      properties: {
        status: { enum: ['pending', 'partial', 'complete', 'failed'] },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              stage: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export const metadataEnvelopeSchema: JsonSchema = {
  type: 'object',
  required: ['schemaVersion', 'generatedAt', 'generator', 'components'],
  properties: {
    schemaVersion: { type: 'string' },
    generatedAt: { type: 'string' },
    generator: {
      type: 'object',
      required: ['name', 'version'],
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
      },
    },
    components: {
      type: 'array',
      items: componentMetadataRecordSchema,
    },
  },
};
