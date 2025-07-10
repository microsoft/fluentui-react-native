// @ts-check

import { jestTask, argv } from 'just-scripts';
import path from 'path';

export const jest = () =>
  jestTask({
    ...(process.env.TF_BUILD && { runInBand: true }),
    ...(argv().u || argv().updateSnapshot ? { updateSnapshot: true } : undefined),
  });

export const jestDom = () =>
  jestTask({
    runInBand: true,
    config: path.join(process.cwd(), 'jest.dom.config.js'),
  });

export const jestWatch = () => {
  const args = argv();
  return jestTask({
    ...(process.env.TF_BUILD && { runInBand: true }),
    ...(args.u || args.updateSnapshot ? { updateSnapshot: true } : undefined),
    watch: true,
    _: ['-i', ...(args._ || []).filter((arg) => arg !== 'jest-watch').map((arg) => arg.toString())],
  });
};
