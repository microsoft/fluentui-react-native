import path from 'node:path';

import { writeSkillDistribution } from '../src/utils/skillDistribution.ts';

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--check')) throw new Error('Usage: build.mts [--check]');
const result = writeSkillDistribution(path.resolve(import.meta.dirname, '../..'), args.includes('--check'));
console.log(`FURN skills ${args.includes('--check') ? 'verified' : 'generated'} (${result.files.size} files)`);
