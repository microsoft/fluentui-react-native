import path from 'path';
import yargs from 'yargs';
import { spawnSync } from 'child_process';

const transformerDirectory = path.join(__dirname, 'transforms');
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

const yargsParse = () => {
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
      choices: ['button-v0-to-v1'],
    })
    .demandOption(['path', 'transform']).argv;
};

export const transform = () => {
  const parsedArgs = yargsParse();

  const args = [];

  args.push('-t', path.join(transformerDirectory, parsedArgs.transform));
  args.push('--parser=tsx');
  args.push('--extensions=tsx');
  args.push(parsedArgs.path);

  spawnSync(jscodeshiftExecutable, args);
};
