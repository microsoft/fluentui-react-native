import { spawnSync } from 'node:child_process';
import path from 'node:path';
import * as nodeModule from 'node:module';

const generatorPath = path.resolve(__dirname, '../../../scripts/flex-defaults/generate-defaults.mjs');

// The generator loads TypeScript sources through module hooks and type stripping (Node 22.18+).
const generatorSupported = typeof nodeModule.registerHooks === 'function' && Boolean(process.features.typescript);

describe('generated Flex defaults', () => {
  (generatorSupported ? it : it.skip)('match the pinned x3 sources and mapping', () => {
    const result = spawnSync(process.execPath, [generatorPath, '--check'], { encoding: 'utf8' });

    expect({ status: result.status, stderr: result.stderr }).toEqual({ status: 0, stderr: '' });
  });
});
