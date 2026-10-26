import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { it } from 'node:test';

it('cleans TypeScript output and package artifacts without rescheduling the root script', async () => {
  const { default: config } = await import(new URL('../../../lage.config.mjs', import.meta.url).href);
  const root = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
  assert.equal(root.scripts.clean, 'tsc -b --clean && lage clean');
  assert.deepEqual(config.pipeline[`${root.name}#clean`], { type: 'noop', cache: false });
  assert.deepEqual(config.pipeline.clean, { cache: false });
});
