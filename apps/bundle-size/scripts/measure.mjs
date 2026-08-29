import { readJSONFileSync, writeJSONFileSync } from '@rnx-kit/tools-filesystem';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { formatBundleSizeTable } from './format.mjs';

const workspaceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = dirname(dirname(workspaceRoot));
const yarnVersion = readJSONFileSync(join(repositoryRoot, 'package.json')).packageManager.split('@')[1];
const yarnPath = join(repositoryRoot, '.yarn', 'releases', `yarn-${yarnVersion}.cjs`);
const configPath = join(workspaceRoot, 'scenarios.json');
const defaultBaselinePath = join(workspaceRoot, 'baseline.json');
const outputRoot = join(workspaceRoot, 'dist', 'bundle-size');
const entryRoot = join(outputRoot, 'entries');

function parseArgs(args) {
  const options = { baseline: defaultBaselinePath, config: configPath, platforms: undefined, updateBaseline: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--baseline') {
      options.baseline = resolve(args[++index]);
    } else if (argument === '--config') {
      options.config = args[++index];
    } else if (argument === '--platform') {
      options.platforms ??= [];
      options.platforms.push(args[++index]);
    } else if (argument === '--update-baseline') {
      options.updateBaseline = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function createEntry(scenario) {
  const lines = [];
  const targets = [];

  const imports = scenario.imports ?? (scenario.module ? [scenario] : []);
  for (const [index, moduleImport] of imports.entries()) {
    if (moduleImport.namespace) {
      const target = `bundleSizeTarget${index}`;
      lines.push(`import * as ${target} from ${JSON.stringify(moduleImport.module)};`);
      targets.push(target);
    } else if (moduleImport.exports?.length) {
      const specifiers = moduleImport.exports.map((name) => `${name} as bundleSizeTarget${index}_${name}`);
      lines.push(`import { ${specifiers.join(', ')} } from ${JSON.stringify(moduleImport.module)};`);
      targets.push(...moduleImport.exports.map((name) => `bundleSizeTarget${index}_${name}`));
    } else {
      throw new Error(`Scenario "${scenario.name}" imports must set "namespace" or "exports"`);
    }
  }
  if (targets.length) {
    lines.push(`globalThis.__bundleSizeTarget = [${targets.join(', ')}];`);
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
      return readJSONFileSync(manifestPath).name;
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
  const sourceMap = readJSONFileSync(sourceMapPath);
  const metafile = readJSONFileSync(metafilePath);
  const inputPaths = Object.keys(metafile.inputs).map((source) => source.replaceAll('\\', '/'));
  for (const pattern of scenario.forbiddenInputPatterns ?? []) {
    const match = inputPaths.find((source) => source.includes(pattern));
    if (match) {
      throw new Error(`Scenario "${scenario.name}" unexpectedly includes "${match}" (forbidden by "${pattern}")`);
    }
  }
  for (const pattern of scenario.requiredInputPatterns ?? []) {
    if (!inputPaths.some((source) => source.includes(pattern))) {
      throw new Error(`Scenario "${scenario.name}" does not include a module matching required pattern "${pattern}"`);
    }
  }
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

function baselineResult(measurement) {
  const { platform, scenario, rawBytes, gzipBytes, moduleCount, metroModuleCount, metafileInputCount, workspaceModules, workspaceBytes } =
    measurement;
  return {
    platform,
    scenario,
    rawBytes,
    gzipBytes,
    moduleCount,
    metroModuleCount,
    metafileInputCount,
    workspaceModules,
    workspaceBytes,
  };
}

function resultKey({ platform, scenario }) {
  return `${platform}:${scenario}`;
}

function createComparison(measurement, baseline, baselineShell) {
  const isShell = measurement.scenario === 'shell';
  const currentCost = isShell ? measurement.rawBytes : measurement.deltaBytes;
  const currentModuleCost = isShell ? measurement.moduleCount : measurement.deltaModules;
  if (!baseline || (!isShell && !baselineShell)) {
    return { status: 'new', currentCost, currentModuleCost };
  }

  const baselineCost = isShell ? baseline.rawBytes : baseline.rawBytes - baselineShell.rawBytes;
  const baselineGzipCost = isShell ? baseline.gzipBytes : baseline.gzipBytes - baselineShell.gzipBytes;
  const currentGzipCost = isShell ? measurement.gzipBytes : measurement.deltaGzipBytes;
  const baselineModuleCost = isShell ? baseline.moduleCount : baseline.moduleCount - baselineShell.moduleCount;
  const costDelta = currentCost - baselineCost;
  return {
    status: 'compared',
    baselineCost,
    currentCost,
    currentModuleCost,
    costDelta,
    costPercent: baselineCost === 0 ? 0 : (costDelta / baselineCost) * 100,
    gzipCostDelta: currentGzipCost - baselineGzipCost,
    moduleCostDelta: currentModuleCost - baselineModuleCost,
    absoluteRawDelta: measurement.rawBytes - baseline.rawBytes,
  };
}

function formatBytes(bytes) {
  const sign = bytes > 0 ? '+' : '';
  return `${sign}${(bytes / 1024).toFixed(1)} KiB`;
}

function formatPercent(percent) {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

function createMarkdownReport(results) {
  const lines = [
    '# Bundle size report',
    '',
    'Tree-shaken production Metro bundles. Component costs are relative to their platform shell; shell costs are absolute.',
    '',
    '| Platform | Scenario | Baseline cost | Current cost | Cost delta | Change | Gzip delta | Module delta |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const result of results) {
    const { comparison } = result;
    if (comparison.status === 'new') {
      lines.push(
        `| ${result.platform} | ${result.scenario} | New | ${(comparison.currentCost / 1024).toFixed(1)} KiB | New | New | New | New |`,
      );
    } else {
      lines.push(
        `| ${result.platform} | ${result.scenario} | ${(comparison.baselineCost / 1024).toFixed(1)} KiB | ${(comparison.currentCost / 1024).toFixed(1)} KiB | ${formatBytes(comparison.costDelta)} | ${formatPercent(comparison.costPercent)} | ${formatBytes(comparison.gzipCostDelta)} | ${comparison.moduleCostDelta >= 0 ? '+' : ''}${comparison.moduleCostDelta} |`,
      );
    }
  }

  lines.push(
    '',
    'The job is advisory: size changes are reported but do not fail the pull request. Bundle or analysis errors still fail.',
    '',
  );
  return lines.join('\n');
}

const {
  baseline: selectedBaselinePath,
  config: selectedConfigPath,
  platforms: selectedPlatforms,
  updateBaseline,
} = parseArgs(process.argv.slice(2));
if (updateBaseline && selectedPlatforms) {
  throw new Error('Baseline updates must include every configured platform; omit --platform');
}
const selectedConfig = readJSONFileSync(selectedConfigPath);
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
const currentBaseline = {
  schemaVersion: 1,
  results: measurements.map(baselineResult),
};
if (updateBaseline) {
  writeJSONFileSync(selectedBaselinePath, currentBaseline);
}

const baseline = existsSync(selectedBaselinePath) ? readJSONFileSync(selectedBaselinePath) : { schemaVersion: 1, results: [] };
if (baseline.schemaVersion !== 1) {
  throw new Error(`Unsupported baseline schema version: ${baseline.schemaVersion}`);
}
const baselineResults = new Map(baseline.results.map((result) => [resultKey(result), result]));
const baselineShells = new Map(baseline.results.filter(({ scenario }) => scenario === 'shell').map((result) => [result.platform, result]));

const results = measurements.map((measurement) => {
  const shell = shells.get(measurement.platform);
  const result = {
    ...measurement,
    deltaBytes: measurement.rawBytes - shell.rawBytes,
    deltaGzipBytes: measurement.gzipBytes - shell.gzipBytes,
    deltaModules: measurement.moduleCount - shell.moduleCount,
  };
  return {
    ...result,
    comparison: createComparison(result, baselineResults.get(resultKey(result)), baselineShells.get(result.platform)),
  };
});
const report = {
  node: process.version,
  results,
};
const reportPath = join(outputRoot, 'results.json');
const markdownReportPath = join(outputRoot, 'report.md');
writeJSONFileSync(reportPath, report);
writeFileSync(markdownReportPath, createMarkdownReport(results));

process.stdout.write(`${formatBundleSizeTable(results)}\n`);
process.stdout.write(`Results: ${reportPath}\n`);
process.stdout.write(`Report: ${markdownReportPath}\n`);
