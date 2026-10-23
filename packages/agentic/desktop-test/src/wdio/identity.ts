import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function wdioGroupId(specs: readonly string[]): string {
  const files = specs.map((spec) => path.resolve(spec.startsWith('file:') ? fileURLToPath(spec) : spec));
  return `wdio-${createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0, 20)}`;
}
