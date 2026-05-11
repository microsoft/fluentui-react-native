import type { A11yNode } from './extractA11yTree.ts';

/**
 * Stable JSON serialization for an `A11yNode` tree. The output is
 * suitable for checking into a snapshot directory:
 *
 * - Object keys are emitted in alphabetical order.
 * - Properties whose value is `undefined` are skipped.
 * - Arrays preserve their natural order (children, actions).
 * - Indentation is two spaces; lines end with `\n`.
 *
 * Calling the function twice on the same input always returns the same
 * string, regardless of how the input was constructed (e.g., whether
 * a property was assigned before or after siblings).
 */
export function serializeA11yTree(tree: A11yNode): string {
  return stringify(tree, 0) + '\n';
}

function stringify(value: unknown, indentLevel: number): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return stringifyArray(value, indentLevel);
  if (typeof value === 'object') return stringifyObject(value as Record<string, unknown>, indentLevel);
  // `undefined`, functions, symbols — should not appear after filtering,
  // but emit `null` to keep JSON well-formed if they ever leak in.
  return 'null';
}

function stringifyArray(value: unknown[], indentLevel: number): string {
  const items: unknown[] = [];
  for (const entry of value) {
    if (entry !== undefined) {
      items.push(entry);
    }
  }
  if (items.length === 0) return '[]';
  const inner = ' '.repeat((indentLevel + 1) * 2);
  const outer = ' '.repeat(indentLevel * 2);
  const lines = items.map((entry) => inner + stringify(entry, indentLevel + 1));
  return '[\n' + lines.join(',\n') + '\n' + outer + ']';
}

function stringifyObject(value: Record<string, unknown>, indentLevel: number): string {
  const keys: string[] = [];
  for (const key of Object.keys(value)) {
    if (value[key] !== undefined) {
      keys.push(key);
    }
  }
  if (keys.length === 0) return '{}';
  keys.sort();
  const inner = ' '.repeat((indentLevel + 1) * 2);
  const outer = ' '.repeat(indentLevel * 2);
  const lines = keys.map((key) => `${inner}${JSON.stringify(key)}: ${stringify(value[key], indentLevel + 1)}`);
  return '{\n' + lines.join(',\n') + '\n' + outer + '}';
}
