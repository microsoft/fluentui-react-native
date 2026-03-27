import { execSync } from 'child_process';
import path from 'path';
import { parseArgs } from 'util';

import { findPackageJson, migratePackageJson } from './transforms/migrate-package-json';

const transformerDirectory = path.join(__dirname, 'transforms');
const jscodeshiftExecutable = path.join(path.dirname(require.resolve('jscodeshift/package.json')), 'bin', 'jscodeshift.js');

const VALID_TRANSFORMS = ['button-v0-to-v1', 'deprecate-exports', 'migrate-to-mono-package'] as const;

interface ArgsType {
  path: string;
  transform: string;
}

export const parseCliArgs = (argv: string[]): ArgsType => {
  const { values } = parseArgs({
    args: argv.slice(2),
    options: {
      path: { type: 'string', short: 'p' },
      transform: { type: 'string', short: 't' },
    },
    strict: true,
  });

  if (!values.path) {
    throw new Error('Missing required option: --path (-p)');
  }
  if (!values.transform) {
    throw new Error('Missing required option: --transform (-t)');
  }
  if (!(VALID_TRANSFORMS as readonly string[]).includes(values.transform)) {
    throw new Error(`Invalid transform "${values.transform}". Valid choices: ${VALID_TRANSFORMS.join(', ')}`);
  }

  return { path: values.path, transform: values.transform };
};

export const transform = (args: ArgsType) => {
  const codeshiftArgs = [];

  codeshiftArgs.push('-t', path.join(transformerDirectory, args.transform + '.js'));
  codeshiftArgs.push('--parser=tsx');
  codeshiftArgs.push('--extensions=tsx,ts,js');
  codeshiftArgs.push(args.path);

  execSync(jscodeshiftExecutable + ' ' + codeshiftArgs.join(' '), { stdio: 'inherit' });

  // For migrate-to-mono-package, also update the nearest package.json
  if (args.transform === 'migrate-to-mono-package') {
    const pkgJsonPath = findPackageJson(args.path);
    if (pkgJsonPath) {
      console.log(`\nMigrating ${pkgJsonPath}...`);
      const result = migratePackageJson(pkgJsonPath);
      console.log(`  Removed ${result.removed.length} dependencies`);
      if (result.monoPackageAdded) {
        console.log(`  Added fluentui-react-native dependency`);
      }
    } else {
      console.warn(`\nWarning: No package.json found near ${args.path}`);
    }
  }
};
