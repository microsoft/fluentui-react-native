import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const workspaceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = dirname(dirname(workspaceRoot));
const yarnVersion = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8')).packageManager.split('@')[1];
const yarnPath = join(repositoryRoot, '.yarn', 'releases', `yarn-${yarnVersion}.cjs`);
const configPath = join(workspaceRoot, 'scenarios.json');
const outputRoot = join(workspaceRoot, 'dist', 'bundle-size');
const entryRoot = join(outputRoot, 'entries');

function parseArgs(args) {
  const options = { config: configPath, platforms: undefined };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--config') {
      options.config = args[++index];
    } else if (argument === '--platform') {
      options.platforms ??= [];
      options.platforms.push(args[++index]);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function createEntry(scenario) {
  const lines = [];

  if (scenario.module) {
    if (scenario.namespace) {
      lines.push(`import * as bundleSizeTarget from ${JSON.stringify(scenario.module)};`);
      lines.push('globalThis.__bundleSizeTarget = bundleSizeTarget;');
    } else if (scenario.exports?.length) {
      lines.push(`import { ${scenario.exports.join(', ')} } from ${JSON.stringify(scenario.module)};`);
      lines.push(`globalThis.__bundleSizeTarget = [${scenario.exports.join(', ')}];`);
    } else {
      throw new Error(`Scenario "${scenario.name}" must set "namespace" or "exports"`);
    }
  }

  const bootstrapPath = relative(entryRoot, join(workspaceRoot, 'src', 'bootstrap.js')).replaceAll('\\', '/');
  lines.push(`import ${JSON.stringify(bootstrapPath.startsWith('.') ? bootstrapPath : `./${bootstrapPath}`)};`, '');

  return lines.join('\n');
}

function getWorkspacePackage(source) {
  const packagesRoot = join(repositoryRoot, 'packages');
  const sourcePath = isAbsolute(source) ? source : resolve(workspaceRoot, source);
  if (!sourcePath.startsWith(packagesRoot)) {
    return undefined;
  }

  let directory = dirname(sourcePath);
  while (directory.startsWith(packagesRoot)) {
    const manifestPath = join(directory, 'package.json');
    if (existsSync(manifestPath)) {
      return JSON.parse(readFileSync(manifestPath, 'utf8')).name;
    }
    directory = dirname(directory);
  }

  return undefined;
}

function getWorkspaceContributions(metafile) {
  const packageModules = new Map();
  const packageBytes = new Map();
  const contributingInputs = new Map();

  for (const output of Object.values(metafile.outputs)) {
    for (const [source, contribution] of Object.entries(output.inputs ?? {})) {
      if (contribution.bytesInOutput > 0) {
        contributingInputs.set(source, (contributingInputs.get(source) ?? 0) + contribution.bytesInOutput);
      }
    }
  }

  for (const [source, bytes] of contributingInputs) {
    const packageName = getWorkspacePackage(source);
    if (packageName) {
      packageModules.set(packageName, (packageModules.get(packageName) ?? 0) + 1);
      packageBytes.set(packageName, (packageBytes.get(packageName) ?? 0) + bytes);
    }
  }

  const sortPackages = (entries) => Object.fromEntries([...entries].sort(([left], [right]) => left.localeCompare(right)));
  return {
    moduleCount: contributingInputs.size,
    workspaceModules: sortPackages(packageModules),
    workspaceBytes: sortPackages(packageBytes),
  };
}

function runBundle(platform, scenario, resetCache) {
  const entryPath = join(entryRoot, `${scenario.name}.js`);
  const bundlePath = join(outputRoot, platform, `${scenario.name}.bundle`);
  const sourceMapPath = `${bundlePath}.map`;
  const metafileName = `${scenario.name}.meta.json`;
  const metafilePath = join(dirname(bundlePath), metafileName);
  const metafileOutput = relative(workspaceRoot, metafilePath).replaceAll('\\', '/');
  writeFileSync(entryPath, createEntry(scenario));
  mkdirSync(dirname(bundlePath), { recursive: true });

  const bundleArgs = [
    yarnPath,
    'workspace',
    '@fluentui-react-native/bundle-size',
    'rnx-cli',
    'bundle',
    '--id',
    'measure',
    '--entry-file',
    entryPath,
    '--platform',
    platform,
    '--dev',
    'false',
    '--minify',
    'true',
    '--tree-shake',
    'true',
    '--metafile',
    metafileOutput,
    '--bundle-output',
    bundlePath,
    '--sourcemap-output',
    sourceMapPath,
  ];
  if (resetCache) {
    bundleArgs.push('--reset-cache');
  }

  const result = spawnSync(process.execPath, bundleArgs, { cwd: repositoryRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(`Metro failed for ${scenario.name} on ${platform}: ${result.error?.message ?? `exit ${result.status}`}`);
  }

  const bundle = readFileSync(bundlePath);
  const sourceMap = JSON.parse(readFileSync(sourceMapPath, 'utf8'));
  const metafile = JSON.parse(readFileSync(metafilePath, 'utf8'));
  const contributions = getWorkspaceContributions(metafile);

  return {
    scenario: scenario.name,
    rawBytes: statSync(bundlePath).size,
    gzipBytes: gzipSync(bundle, { level: 9, mtime: 0 }).byteLength,
    moduleCount: contributions.moduleCount,
    metroModuleCount: sourceMap.sources.length,
    metafileInputCount: Object.keys(metafile.inputs).length,
    metafile: metafileOutput,
    workspaceModules: contributions.workspaceModules,
    workspaceBytes: contributions.workspaceBytes,
  };
}

const { config: selectedConfigPath, platforms: selectedPlatforms } = parseArgs(process.argv.slice(2));
const selectedConfig = JSON.parse(readFileSync(selectedConfigPath, 'utf8'));
const platforms = selectedPlatforms ?? selectedConfig.platforms;

await mkdir(entryRoot, { recursive: true });

const measurements = [];
for (const platform of platforms) {
  for (const [scenarioIndex, scenario] of selectedConfig.scenarios.entries()) {
    process.stdout.write(`Bundling ${scenario.name} for ${platform}...\n`);
    measurements.push({ platform, ...runBundle(platform, scenario, scenarioIndex === 0) });
  }
}

const shells = new Map(
  measurements.filter(({ scenario }) => scenario === 'shell').map((measurement) => [measurement.platform, measurement]),
);
const results = measurements.map((measurement) => {
  const shell = shells.get(measurement.platform);
  return {
    ...measurement,
    deltaBytes: measurement.rawBytes - shell.rawBytes,
    deltaGzipBytes: measurement.gzipBytes - shell.gzipBytes,
    deltaModules: measurement.moduleCount - shell.moduleCount,
  };
});
const report = {
  node: process.version,
  results,
};
const reportPath = join(outputRoot, 'results.json');
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.table(results);
process.stdout.write(`Results: ${reportPath}\n`);
