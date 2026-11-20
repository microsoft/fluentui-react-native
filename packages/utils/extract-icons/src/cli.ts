#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const require = createRequire(import.meta.url);
// The published import target is typeless ESM; the require target also works under Yarn PnP.
const {
  generateIconModule,
  ICON_STYLES,
}: typeof import('@fluentui/react-native-icons/codegen') = require('@fluentui/react-native-icons/codegen');
const configKey = 'extractIcons';
const usage = `Usage:
  extract-icons --output <file.tsx> <icon-name> [<icon-name> ...]
  extract-icons --config <path>

Icon names use <name>_<size>_<style>, e.g. access_time_20_regular.
The config module must expose an "${configKey}" key with one { output, icons } entry or an array of entries.`;

type Job = { output: string; icons: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJob(value: unknown, base: string, label: string): Job {
  if (!isRecord(value) || typeof value.output !== 'string' || value.output.trim() === '' || !value.output.endsWith('.tsx')) {
    throw new Error(`${label}: output must be a path ending in .tsx.`);
  }
  const { icons } = value;
  if (!Array.isArray(icons) || !icons.length) {
    throw new Error(`${label}: icons must be a non-empty array of icon names.`);
  }
  const names = Array.from(icons, (name: unknown, index) => {
    if (typeof name !== 'string' || !/^[a-z0-9_]+$/.test(name)) {
      throw new Error(`${label}: icons[${index}] must be a Fluent SVG icon name, without a path or extension.`);
    }
    const parts = name.split('_');
    const style = parts.pop();
    const size = parts.pop();
    if (!parts.join('_') || !/^[0-9]+$/.test(size ?? '') || !ICON_STYLES.some((candidate) => candidate === style)) {
      throw new Error(`${label}: invalid icon name "${name}"; expected <name>_<size>_<style>.`);
    }
    return name;
  });
  return { output: resolve(base, value.output), icons: names };
}

function loadConfig(path: string): Job[] {
  if (!path.trim()) {
    throw new Error('--config requires a path.');
  }
  const file = require.resolve(resolve(path));
  const config: unknown = require(file);
  const settings = isRecord(config)
    ? Object.hasOwn(config, configKey)
      ? config[configKey]
      : isRecord(config.default)
        ? config.default[configKey]
        : undefined
    : undefined;
  const entries = Array.isArray(settings) ? settings : [settings];
  if (settings === undefined || !entries.length) {
    throw new Error(`${file}: "${configKey}" must contain one job or a non-empty array of jobs.`);
  }
  return entries.map((entry, index) =>
    parseJob(entry, dirname(file), `${file}: ${configKey}${Array.isArray(settings) ? `[${index}]` : ''}`),
  );
}

function generate(jobs: Job[]): void {
  const outputs = new Map<string, string>();
  // Resolve the CLI's dependency rather than asking upstream to resolve it from the caller's directory.
  const svgDir = join(dirname(require.resolve('@fluentui/svg-icons/package.json')), 'icons');
  for (const { output, icons } of jobs) {
    if (outputs.has(output)) {
      throw new Error(`Duplicate output path: ${output}`);
    }
    try {
      outputs.set(output, generateIconModule(icons, { svgDir }));
    } catch (error) {
      throw new Error(`Cannot generate ${output}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }
  for (const [output, source] of outputs) {
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, source);
  }
}

function main(): void {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      output: { type: 'string', short: 'o' },
      config: { type: 'string', short: 'c' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  if (values.config !== undefined) {
    if (values.output !== undefined || positionals.length) {
      throw new Error('--config cannot be combined with --output or icon names.');
    }
    generate(loadConfig(values.config));
  } else {
    generate([parseJob({ output: values.output, icons: positionals }, process.cwd(), 'Command line')]);
  }
}

try {
  main();
} catch (error) {
  console.error(`extract-icons: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
