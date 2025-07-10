// @ts-check

import { argv, eslintTask } from 'just-scripts';
export const eslint = eslintTask({
  files: ['src/'],
  ...argv(),
});
