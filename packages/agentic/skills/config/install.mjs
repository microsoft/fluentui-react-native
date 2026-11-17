#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const hash = (content) => createHash('sha256').update(content).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function safePath(value) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('\\') ||
    value.includes(':') ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value === '..' ||
    value.startsWith('../')
  ) {
    throw new Error('Invalid suite file path');
  }
  return value;
}

function assertNoSymlinks(root, relative) {
  let current = root;
  for (const part of safePath(relative).split('/')) {
    current = path.join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error(`Refusing symlinked path: ${relative}`);
  }
}

function managedPath(value) {
  safePath(value);
  if (value === 'furn/installation.json' || (!value.startsWith('furn/') && !/^skills\/furn-[a-z0-9-]+\/SKILL\.md$/.test(value))) {
    throw new Error('Invalid installation ownership path');
  }
  return value;
}

function rebaseSkill(text) {
  let fenced = false;
  return text
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (fenced) return line;
      return line
        .split(/(`[^`]*`)/)
        .map((part, index) =>
          index % 2
            ? part
            : part
                .replace(/(\]\(<?)\.\.\/\.\.\/(references|catalog)\//g, '$1../../furn/$2/')
                .replace(/^(\s{0,3}\[[^\]\n]+\]:[ \t]*<?)\.\.\/\.\.\/(references|catalog)\//, '$1../../furn/$2/'),
        )
        .join('');
    })
    .join('\n');
}

/** Explicit, project-local materialization. No client invocation, global settings, or dependency installation. */
export function installSuite(packageRoot, projectRoot, client) {
  if (!['copilot', 'codex', 'claude'].includes(client)) throw new Error('Choose --client copilot, codex, or claude');
  const source = realpathSync(packageRoot);
  const project = realpathSync(projectRoot);
  const configName = client === 'claude' ? '.claude' : '.agents';
  const target = path.join(project, configName);
  assertNoSymlinks(project, configName);
  const provenanceText = readFileSync(path.join(source, 'provenance.json'), 'utf8');
  const provenance = JSON.parse(provenanceText);
  if (provenance.schema_version !== 1 || provenance.package !== '@fluentui-react-native/skills' || !Array.isArray(provenance.files)) {
    throw new Error('Invalid suite provenance');
  }
  const output = new Map();
  const paths = new Set();
  for (const entry of provenance.files) {
    const file = safePath(entry.path);
    if (paths.has(file)) throw new Error('Duplicate suite file');
    paths.add(file);
    assertNoSymlinks(source, file);
    if (!lstatSync(path.join(source, file)).isFile()) throw new Error(`Not a regular suite file: ${file}`);
    const bytes = readFileSync(path.join(source, file));
    if (!/^[a-f0-9]{64}$/.test(entry.sha256) || hash(bytes) !== entry.sha256) throw new Error(`Suite checksum mismatch: ${file}`);
    if (/^skills\/furn-[a-z0-9-]+\/SKILL\.md$/.test(file)) {
      output.set(file, rebaseSkill(bytes.toString('utf8')));
    } else if (file.startsWith('references/shared/') || file === 'catalog/packages.json' || file === 'LICENSE') {
      output.set(`furn/${file}`, bytes.toString('utf8'));
    }
  }
  if (![...output.keys()].some((file) => file.startsWith('skills/'))) throw new Error('Suite contains no skills');
  output.set('furn/provenance.json', provenanceText);
  const ownershipPath = 'furn/installation.json';
  assertNoSymlinks(target, ownershipPath);
  const recordFile = path.join(target, ownershipPath);
  const previous = new Map();
  if (existsSync(recordFile)) {
    const record = JSON.parse(readFileSync(recordFile, 'utf8'));
    if (record.schema_version !== 1 || record.package !== provenance.package || !Array.isArray(record.files)) {
      throw new Error('Invalid installation ownership record');
    }
    for (const entry of record.files) {
      const file = managedPath(entry.path);
      if (previous.has(file) || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('Invalid installation ownership entry');
      previous.set(file, entry.sha256);
    }
  }

  // Preflight the complete update before touching files, including obsolete files owned by an earlier release.
  for (const file of new Set([...output.keys(), ...previous.keys()])) {
    managedPath(file);
    assertNoSymlinks(target, file);
    const absolute = path.join(target, file);
    if (existsSync(absolute)) {
      if (!lstatSync(absolute).isFile() || !previous.has(file) || hash(readFileSync(absolute)) !== previous.get(file)) {
        throw new Error(`Refusing to overwrite an unmanaged or modified file: ${configName}/${file}`);
      }
    }
  }
  for (const [file, text] of output) {
    const absolute = path.join(target, file);
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, text);
  }
  for (const file of previous.keys()) if (!output.has(file)) rmSync(path.join(target, file), { force: true });
  writeFileSync(
    recordFile,
    json({
      schema_version: 1,
      package: provenance.package,
      version: provenance.version,
      files: [...output].map(([file, text]) => ({ path: file, sha256: hash(text) })),
    }),
  );
  return { directory: target, skills: [...output.keys()].filter((file) => file.startsWith('skills/')).length };
}

if (process.argv[1] && existsSync(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    const { values } = parseArgs({
      options: { client: { type: 'string' }, project: { type: 'string' }, help: { type: 'boolean' } },
    });
    if (values.help) {
      console.log('Usage: furn-skills --client copilot|codex|claude [--project <directory>]');
    } else {
      const result = installSuite(fileURLToPath(new URL('../', import.meta.url)), values.project ?? process.cwd(), values.client);
      console.log(`Installed ${result.skills} FURN skills in ${result.directory}. Reload client skills; enable only one copy.`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Skill installation failed');
    process.exitCode = 1;
  }
}
