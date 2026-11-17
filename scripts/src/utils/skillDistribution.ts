import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  collectAnchors,
  extractLinks,
  extractPackageSpecifiers,
  extractPrerequisites,
  parseFrontmatter,
} from '../tasks/agentInstructions.ts';

export const SKILL_PACKAGE = 'packages/agentic/skills';
const REGISTRY = 'references/agents/repository/package-guidance-packages.json';
const CATALOG = 'catalog/packages.json';
const GENERATED = ['LICENSE', 'plugin.json', '.claude-plugin/plugin.json', 'provenance.json'];

type CatalogEntry = { name: string; purpose: string; entry_points: string[]; integration_targets: string[]; reference_paths: string[] };
type SourceFile = { source: string; target: string; content: string; id?: string };
export type SkillDistribution = {
  packagePath: string;
  files: Map<string, string>;
  adapters: Map<string, string>;
  metrics: { name: string; descriptionCharacters: number; bodyBytes: number; directReferenceBytes: number }[];
};

const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const local = (target: string) => !/^[a-z][a-z0-9+.-]*:/i.test(target);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');

function safePath(value: string): string {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('\\') ||
    value.includes(':') ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value === '..' ||
    value.startsWith('../')
  )
    throw new Error(`Invalid distribution path: ${String(value)}`);
  return value;
}

function readOwned(root: string, owner: string, file: string): string {
  const absolute = path.join(root, owner, safePath(file));
  const relative = path.relative(realpathSync(path.join(root, owner)), realpathSync(absolute));
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !lstatSync(absolute).isFile()) {
    throw new Error(`Resource escapes its package or is not a regular file: ${owner}/${file}`);
  }
  return readFileSync(absolute, 'utf8');
}

function listOwned(root: string, owner: string, directory: string): string[] {
  const result: string[] = [];
  const walk = (relative: string) => {
    const full = path.join(root, owner, relative);
    const stat = lstatSync(full, { throwIfNoEntry: false });
    if (!stat) return;
    if (stat.isSymbolicLink()) throw new Error(`Symlink in public source: ${relative}`);
    if (stat.isDirectory()) for (const child of readdirSync(full).sort()) walk(`${relative}/${child}`);
    else if (stat.isFile()) result.push(relative);
    else throw new Error(`Not a regular public resource: ${relative}`);
  };
  walk(directory);
  return result;
}

function resolveTarget(from: string, target: string): { file: string; fragment: string } {
  const separator = target.indexOf('#');
  const pathname = separator < 0 ? target : target.slice(0, separator);
  const decoded = decodeURIComponent(pathname);
  if (decoded.startsWith('/')) throw new Error(`Absolute public resource link in ${from}: ${target}`);
  const file = decoded ? path.posix.join(path.posix.dirname(from), decoded) : from;
  try {
    safePath(file);
  } catch {
    throw new Error(`Public resource escapes package in ${from}: ${target}`);
  }
  return { file, fragment: separator < 0 ? '' : target.slice(separator + 1) };
}

/** Validate canonical package sources without transforming or writing their contents. */
export function createSkillDistribution(root: string): SkillDistribution {
  if (lstatSync(path.join(root, SKILL_PACKAGE)).isSymbolicLink()) throw new Error('Skills package source must not be a symlink');
  const read = (file: string) => readOwned(root, SKILL_PACKAGE, file);
  const manifest = JSON.parse(read('package.json')) as { name: string; version: string; description: string };
  if (manifest.name !== '@fluentui-react-native/skills') throw new Error('Unexpected skill distribution package');
  for (const obligation of ['R-REPO-003', 'R-VALID-003']) {
    if (!readOwned(root, '.', 'AGENTS.md').includes(obligation))
      throw new Error(`Host repository no longer routes required obligation ${obligation}`);
  }
  const catalogText = read(CATALOG);
  const catalog = JSON.parse(catalogText) as { schema_version: number; packages: CatalogEntry[] };
  if (catalog.schema_version !== 1 || !Array.isArray(catalog.packages)) throw new Error('Invalid public package catalog');
  const registry = JSON.parse(readOwned(root, '.', REGISTRY)) as { packages: string[] };
  if (!strings(registry.packages)) throw new Error('Invalid workspace documentation registry');
  const owners = new Map(
    registry.packages.map((workspace) => {
      const content = readOwned(root, workspace, 'package.json');
      const pkg = JSON.parse(content) as { name: string; version: string; private?: boolean; exports?: Record<string, unknown> };
      return [pkg.name, { workspace, pkg, content }] as const;
    }),
  );
  const allowedReferences = new Map<string, Set<string>>();
  const packageVersions = catalog.packages.map((entry) => {
    const owner = owners.get(entry.name);
    if (
      !owner ||
      owner.pkg.private ||
      typeof entry.purpose !== 'string' ||
      !strings(entry.entry_points) ||
      entry.entry_points.some((point) => !Object.hasOwn(owner.pkg.exports ?? {}, point)) ||
      !strings(entry.integration_targets) ||
      entry.integration_targets.some((target) => !['ios', 'android', 'macos', 'windows', 'win32'].includes(target)) ||
      !strings(entry.reference_paths) ||
      allowedReferences.has(entry.name)
    )
      throw new Error(`Invalid catalog capabilities: ${entry.name}`);
    for (const reference of entry.reference_paths) {
      if (
        !reference.startsWith('references/') ||
        !reference.endsWith('.md') ||
        /(?:^|\/)(?:contributing|current-status|remaining-work)\.md$/.test(reference)
      ) {
        throw new Error(`Repository-only or invalid documentation dependency: ${entry.name}/${reference}`);
      }
      readOwned(root, owner.workspace, reference);
    }
    allowedReferences.set(entry.name, new Set(entry.reference_paths));
    return { name: owner.pkg.name, version: owner.pkg.version, source_manifest_sha256: hash(owner.content) };
  });

  const sources: SourceFile[] = [];
  const adapters = new Map<string, string>();
  const skills = listOwned(root, SKILL_PACKAGE, 'skills');
  if (!skills.length) throw new Error('Public suite contains no skills');
  for (const target of skills) {
    const name = /^skills\/(furn-[a-z0-9]+(?:-[a-z0-9]+)*)\/SKILL\.md$/.exec(target)?.[1];
    if (!name || name.length > 64) throw new Error(`Invalid public skill source: ${target}`);
    const content = read(target);
    if (!content.startsWith(`---\nname: ${name}\n`)) throw new Error(`Skill identity mismatch: ${name}`);
    const description = /^description: ([^\n]+)$/m.exec(content)?.[1] ?? '';
    if (!description || description.length > 1024 || description.split(/\s+/).length > 60)
      throw new Error(`Skill description exceeds its budget or is missing: ${name}`);
    const header = /^---\n[\s\S]*?\n---\n/.exec(content)![0];
    const source = `${SKILL_PACKAGE}/${target}`;
    sources.push({ source, target, content });
    adapters.set(
      `.github/skills/${name}/SKILL.md`,
      `${header}\n<!-- Generated by scripts/agent-content/build.mts. Do not edit. -->\n\n## Read first\n\n[Canonical workflow](../../../${source}).\n\nFollow its instructions for this task.\n`,
    );
  }
  const ids = new Set<string>();
  for (const target of listOwned(root, SKILL_PACKAGE, 'references/shared')) {
    const content = read(target);
    const meta = parseFrontmatter(content);
    if (!target.endsWith('.md') || typeof meta === 'string' || !['instruction-reference', 'evidence-reference'].includes(meta.kind)) {
      throw new Error(`Invalid public reference: ${target}`);
    }
    if (ids.has(meta.id)) throw new Error(`Duplicate public reference ID: ${meta.id}`);
    ids.add(meta.id);
    sources.push({ source: `${SKILL_PACKAGE}/${target}`, target, content, id: meta.id });
  }
  sources.push({ source: `${SKILL_PACKAGE}/${CATALOG}`, target: CATALOG, content: catalogText });
  const files = new Map(sources.map(({ target, content }) => [target, content]));

  for (const { target: file, content: text } of sources.filter(({ target }) => target.endsWith('.md'))) {
    const metadata = file.startsWith('references/') ? parseFrontmatter(text) : undefined;
    const evidence = metadata && typeof metadata !== 'string' && metadata.kind === 'evidence-reference';
    const body = text.slice(text.indexOf('\n---\n') + 5);
    if (!evidence && /(?:^|[\s(`])(?:\.github\/|packages\/|apps\/|scripts\/|references\/agents\/)/m.test(body)) {
      throw new Error(`Repository-only prerequisite in public source: ${file}`);
    }
    const resourceLinks = [
      ...extractLinks(text),
      ...[...body.matchAll(/\b(?:href|src)[ \t]*=[ \t]*["']([^"']+)["']/gi)].map((match) => ({ target: match[1] })),
    ];
    for (const link of resourceLinks) {
      if (!local(link.target)) {
        if (!/^https?:\/\//i.test(link.target)) throw new Error(`Unsupported public resource scheme in ${file}: ${link.target}`);
        continue;
      }
      const resolved = resolveTarget(file, link.target);
      if (!files.has(resolved.file)) throw new Error(`Unbundled reference from ${file}: ${link.target}`);
      if (resolved.fragment && !collectAnchors(files.get(resolved.file)!).has(decodeURIComponent(resolved.fragment))) {
        throw new Error(`Missing public anchor from ${file}: ${link.target}`);
      }
      read(resolved.file);
    }
    if (!evidence) {
      for (const match of body.matchAll(/`((?:\.\.?\/)[^`\s]+)`/g)) {
        const resource = resolveTarget(file, match[1]);
        if (!files.has(resource.file)) throw new Error(`Unbundled code-span resource in ${file}: ${match[1]}`);
        read(resource.file);
      }
    }
    for (const reference of extractPackageSpecifiers(text)) {
      if (reference.packagePath && !allowedReferences.get(reference.packageName)?.has(reference.packagePath)) {
        throw new Error(`Undeclared documentation dependency in ${file}: ${reference.packageName}/${reference.packagePath}`);
      }
    }
  }
  const rules = new Set<string>();
  for (const text of files.values()) {
    for (const match of text.matchAll(/^\s*[-*]\s+\*\*([RC]-[A-Z0-9]+-\d{3}):\*\*/gm)) rules.add(match[1]);
  }
  for (const [file, text] of files) {
    if (file.endsWith('.md'))
      for (const match of text.matchAll(/\b[RC]-[A-Z0-9]+-\d{3}\b/g)) {
        if (!rules.has(match[0])) throw new Error(`Unbundled rule ${match[0]} in ${file}`);
      }
  }
  const prerequisiteFiles = (file: string) =>
    extractPrerequisites(files.get(file) ?? '')
      .filter(({ target }) => local(target))
      .map(({ target }) => resolveTarget(file, target).file);
  const depth = (file: string, stack: string[]): number => {
    if (stack.includes(file)) throw new Error(`Public prerequisite cycle at ${file}`);
    const next = prerequisiteFiles(file);
    const result = next.length ? 1 + Math.max(...next.map((nextFile) => depth(nextFile, [...stack, file]))) : 0;
    if (result > 3) throw new Error(`Public prerequisite depth exceeds three at ${file}`);
    return result;
  };
  for (const file of files.keys()) if (file.endsWith('.md')) depth(file, []);
  files.set('LICENSE', readOwned(root, '.', 'LICENSE'));
  const plugin = { name: 'furn', version: manifest.version, description: manifest.description };
  files.set('plugin.json', json({ $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', ...plugin }));
  files.set('.claude-plugin/plugin.json', json(plugin));
  const inputs = [
    ...sources.map(({ source }) => source),
    `${SKILL_PACKAGE}/package.json`,
    'LICENSE',
    ...catalog.packages.map(({ name }) => `${owners.get(name)!.workspace}/package.json`),
  ].sort();
  let commit: string | null = null;
  let dirty: boolean | null = null;
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    dirty = Boolean(
      execFileSync('git', ['status', '--porcelain', '--untracked-files=all', '--', ...inputs], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim(),
    );
  } catch {
    // Source archives have no Git metadata; content hashes still identify every input.
  }
  const sourceByTarget = new Map(sources.map((source) => [source.target, source]));
  files.set(
    'provenance.json',
    json({
      schema_version: 1,
      package: manifest.name,
      version: manifest.version,
      source_commit: commit,
      source_dirty: dirty,
      catalog_sha256: hash(catalogText),
      packages: packageVersions,
      inputs: inputs.map((source) => ({ source, sha256: hash(readOwned(root, '.', source)) })),
      files: [...files].map(([file, text]) => {
        const source = sourceByTarget.get(file);
        return {
          path: file,
          ...(source ? { source: source.source, source_sha256: hash(source.content), ...(source.id ? { id: source.id } : {}) } : {}),
          sha256: hash(text),
        };
      }),
    }),
  );
  const metrics = sources
    .filter(({ target }) => target.startsWith('skills/'))
    .map(({ target, content }) => {
      const dependencies = new Set<string>();
      const addPrerequisites = (file: string) => {
        if (dependencies.has(file)) return;
        dependencies.add(file);
        prerequisiteFiles(file).forEach(addPrerequisites);
      };
      for (const link of extractLinks(content).filter(({ target }) => local(target))) {
        const file = resolveTarget(target, link.target).file;
        if (file.startsWith('references/')) addPrerequisites(file);
      }
      return {
        name: target.split('/')[1],
        descriptionCharacters: (/^description: ([^\n]+)$/m.exec(content)?.[1] ?? '').length,
        bodyBytes: Buffer.byteLength(content.slice(content.indexOf('\n---\n') + 5)),
        directReferenceBytes: [...dependencies].reduce((total, file) => total + Buffer.byteLength(files.get(file) ?? ''), 0),
      };
    });
  return { packagePath: SKILL_PACKAGE, files, adapters, metrics };
}

export function checkSkillAdapters(root: string, result = createSkillDistribution(root)): void {
  for (const [file, text] of result.adapters) {
    if (!existsSync(path.join(root, file)) || readOwned(root, '.', file) !== text)
      throw new Error(`Stale skill discovery adapter: ${file}`);
  }
}

/** Write only derived metadata and discovery adapters. Canonical skills, references, and catalog are never rewritten. */
export function writeSkillDistribution(root: string, check = false): SkillDistribution {
  const result = createSkillDistribution(root);
  const generated = new Map(GENERATED.map((file) => [`${SKILL_PACKAGE}/${file}`, result.files.get(file)!]));
  const stale = listOwned(root, SKILL_PACKAGE, '.claude-plugin').filter((file) => file !== '.claude-plugin/plugin.json');
  const output = new Map([...generated, ...result.adapters]);
  const changed = [...output].filter(([file, text]) => !existsSync(path.join(root, file)) || readOwned(root, '.', file) !== text);
  if (check) {
    if (stale.length || changed.length)
      throw new Error(`Stale skill metadata or adapter: ${[...stale, ...changed.map(([file]) => file)].join(', ')}`);
    return result;
  }
  for (const file of stale) rmSync(path.join(root, SKILL_PACKAGE, file));
  for (const [file, text] of changed) {
    const target = path.join(root, file);
    // Existing generated directories/files cannot redirect writes through symlinks.
    let parent = root;
    for (const part of file.split('/')) {
      parent = path.join(parent, part);
      if (lstatSync(parent, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error(`Symlink in derived output: ${file}`);
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  return result;
}
