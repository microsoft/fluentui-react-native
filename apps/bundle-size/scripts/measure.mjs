import { readJSONFileSync, writeJSONFileSync } from '@rnx-kit/tools-filesystem';
import { build } from 'esbuild';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { createEsbuildOptions } from './esbuild-config.mjs';
import { formatBundleSizeTable, formatModuleComparison, formatSizeComparison, groupComparisonsByScenario } from './format.mjs';

const workspaceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = dirname(dirname(workspaceRoot));
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

  return `${lines.join('\n')}\n`;
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

async function runBundle(platform, scenario) {
  const entryPath = join(entryRoot, `${scenario.name}.js`);
  const bundlePath = join(outputRoot, platform, `${scenario.name}.bundle`);
  const metafileName = `${scenario.name}.meta.json`;
  const metafilePath = join(dirname(bundlePath), metafileName);
  const metafileOutput = relative(workspaceRoot, metafilePath).replaceAll('\\', '/');
  writeFileSync(entryPath, createEntry(scenario));
  mkdirSync(dirname(bundlePath), { recursive: true });

  const { metafile } = await build(createEsbuildOptions({ bundlePath, entryPath, platform, workspaceRoot }));
  writeJSONFileSync(metafilePath, metafile);

  const bundle = readFileSync(bundlePath);
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
    metafileInputCount: Object.keys(metafile.inputs).length,
    metafile: metafileOutput,
    workspaceModules: contributions.workspaceModules,
    workspaceBytes: contributions.workspaceBytes,
  };
}

function baselineResult(measurement) {
  const { platform, scenario, rawBytes, gzipBytes, moduleCount, metafileInputCount, workspaceModules, workspaceBytes } = measurement;
  return {
    platform,
    scenario,
    rawBytes,
    gzipBytes,
    moduleCount,
    metafileInputCount,
    workspaceModules,
    workspaceBytes,
  };
}

function resultKey({ platform, scenario }) {
  return `${platform}:${scenario}`;
}

function createComparison(measurement, baseline) {
  const currentCost = measurement.rawBytes;
  const currentModuleCost = measurement.moduleCount;
  if (!baseline) {
    return { status: 'new', currentCost, currentModuleCost };
  }

  const baselineCost = baseline.rawBytes;
  const costDelta = currentCost - baselineCost;
  return {
    status: 'compared',
    baselineCost,
    currentCost,
    currentModuleCost,
    costDelta,
    costPercent: baselineCost === 0 ? 0 : (costDelta / baselineCost) * 100,
    gzipCostDelta: measurement.gzipBytes - baseline.gzipBytes,
    moduleCostDelta: currentModuleCost - baseline.moduleCount,
  };
}

function createMarkdownReport(results) {
  const lines = [
    '# Bundle size report',
    '',
    'Tree-shaken, minified production esbuild bundles with React and React Native runtimes externalized.',
    '',
    '| Scenario | Modules-Mac (Δ) | Modules-Win (Δ) | Size-Mac (Δ) | Size-Win (Δ) |',
    '| --- | ---: | ---: | ---: | ---: |',
  ];

  for (const [scenario, platformResults] of groupComparisonsByScenario(results)) {
    const macos = platformResults.get('macos');
    const windows = platformResults.get('windows');
    lines.push(
      `| ${scenario} | ${formatModuleComparison(macos)} | ${formatModuleComparison(windows)} | ${formatSizeComparison(macos)} | ${formatSizeComparison(windows)} |`,
    );
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
  for (const scenario of selectedConfig.scenarios) {
    process.stdout.write(`Bundling ${scenario.name} for ${platform}...\n`);
    measurements.push({ platform, ...(await runBundle(platform, scenario)) });
  }
}

const currentBaseline = {
  schemaVersion: 2,
  results: measurements.map(baselineResult),
};
if (updateBaseline) {
  writeJSONFileSync(selectedBaselinePath, currentBaseline);
}

const baseline = existsSync(selectedBaselinePath) ? readJSONFileSync(selectedBaselinePath) : { schemaVersion: 2, results: [] };
if (baseline.schemaVersion !== 1 && baseline.schemaVersion !== 2) {
  throw new Error(`Unsupported baseline schema version: ${baseline.schemaVersion}`);
}
if (baseline.schemaVersion === 1) {
  process.stderr.write('Baseline schema version 1 contains Metro shell-relative measurements; treating all esbuild scenarios as new.\n');
}
const baselineResults = new Map(baseline.schemaVersion === 2 ? baseline.results.map((result) => [resultKey(result), result]) : []);

const results = measurements.map((measurement) => {
  return {
    ...measurement,
    comparison: createComparison(measurement, baselineResults.get(resultKey(measurement))),
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
