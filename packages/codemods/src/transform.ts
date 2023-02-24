import { execSync } from 'child_process';
import path from 'path';

import yargs from 'yargs';

const transformerDirectory = path.join(__dirname, 'transforms');
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

interface argsType {
  path: string;
  transform: string;
}

export const yargsParse = (args: string[]): argsType => {
  return yargs([])
    .help()
    .exitProcess(false)
    .option('path', {
      alias: 'p',
      type: 'string',
      description: 'Path that transform should be run over',
      normalize: true,
    })
    .option('transform', {
      alias: 't',
      type: 'string',
      description: 'Name of transform to run',
      choices: ['button-v0-to-v1', 'deprecate-exports'],
    })
    .demandOption(['path', 'transform'])
    .parse(args);
};

export const transform = (args: argsType) => {
  const codeshiftArgs = [];

  codeshiftArgs.push('-t', path.join(transformerDirectory, args.transform + '.js'));
  codeshiftArgs.push('--parser=tsx');
  codeshiftArgs.push('--extensions=tsx');
  codeshiftArgs.push(args.path);

  execSync(jscodeshiftExecutable + ' ' + codeshiftArgs.join(' '));
};
