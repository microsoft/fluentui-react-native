import type { RenderNode } from '../types.ts';

/**
 * Stable JSON serialization for a `RenderNode` tree. The output is
 * suitable for checking into a snapshot directory:
 *
 * - Object keys are emitted in alphabetical order.
 * - Properties whose value is `undefined` are skipped.
 * - Arrays preserve their natural order (children, etc.).
 * - String children appear inline in the children array.
 * - Indentation is two spaces; lines end with `\n`.
 *
 * Mirrors `serializeA11yTree` in shape and indentation so both kinds of
 * snapshots diff cleanly side-by-side. Functions, symbols, and other
 * non-JSON values are serialized as `null` to keep output well-formed
 * even if a renderer prop leaks one in.
 */
export function serializeRenderTree(root: RenderNode): string {
  return stringify(root, 0) + '\n';
}

function stringify(value: unknown, indentLevel: number): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return stringifyArray(value, indentLevel);
  if (typeof value === 'object') return stringifyObject(value as Record<string, unknown>, indentLevel);
  // Functions, undefined, symbols — not legal JSON; emit `null` so the
  // output stays parseable.
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
  const lines = keys.map((key) => inner + JSON.stringify(key) + ': ' + stringify(value[key], indentLevel + 1));
  return '{\n' + lines.join(',\n') + '\n' + outer + '}';
}
