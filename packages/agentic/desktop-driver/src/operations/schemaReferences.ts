import type { z } from 'zod';

type JsonSchemaNode = Record<string, unknown>;

const references = new WeakMap<z.ZodType, string>();

/**
 * Embeds another operation's input or output schema, validating exactly as that operation does, while its catalog
 * entry names the operation instead of repeating the schema. The catalog is context an agent pays for on every session,
 * and the referenced operation's own entry already carries the full schema.
 */
export function operationSchemaReference<T extends z.ZodType>(schema: T, operation: string, io: 'input' | 'output'): T {
  const reference = schema.clone() as T;
  references.set(reference, `The ${operation} operation's ${io}, as in its catalog entry.`);
  return reference;
}

/** A JSON Schema override that replaces each embedded reference with a short description of what it names. */
export function collapseSchemaReferences(context: { jsonSchema: JsonSchemaNode; zodSchema: unknown }): void {
  const description = references.get(context.zodSchema as z.ZodType);
  if (description === undefined) {
    return;
  }
  for (const key of Object.keys(context.jsonSchema)) {
    delete context.jsonSchema[key];
  }
  Object.assign(context.jsonSchema, { description, type: 'object' });
}
