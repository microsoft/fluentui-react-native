// @ts-check

import path from 'path';
import { cleanTask } from 'just-scripts';

export const clean = cleanTask(
  [
    'lib',
    'temp',
    'dist',
    'lib-amd',
    'lib-commonjs',
    'lib-es2015', // Keep this in clean for actually cleaning up legacy content.
    'coverage',
    'src/**/*.scss.ts',
  ].map((p) => path.join(process.cwd(), p)),
);
