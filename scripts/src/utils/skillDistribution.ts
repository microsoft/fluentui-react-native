import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { collectAnchors, extractLinks, extractPrerequisites, parseFrontmatter } from '../tasks/agentInstructions.ts';

export const SKILL_EXPORTS = 'scripts/agent-content/exports.json';

type CatalogEntry = { workspace: string; purpose: string; entry_points: string[]; targets: string[] };
type ExportConfig = {
  schema_version: number;
  package: string;
  skills: string[];
  references: string[];
  host_obligations: string[];
  packages: CatalogEntry[];
};
type SourceFile = { source: string; target: string; content: string; id?: string };
export type SkillDistribution = {
  packagePath: string;
  files: Map<string, string>;
  metrics: { name: string; descriptionCharacters: number; bodyBytes: number; directReferenceBytes: number }[];
};

const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const local = (target: string) => !/^[a-z][a-z0-9+.-]*:/i.test(target);

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
  ) {
    throw new Error(`Invalid distribution path: ${String(value)}`);
  }
  return value;
}

function readSource(root: string, file: string): string {
  const absolute = path.join(root, safePath(file));
  const relative = path.relative(realpathSync(root), realpathSync(absolute));
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !lstatSync(absolute).isFile()) {
    throw new Error(`Source escapes the repository or is not a regular file: ${file}`);
  }
  return readFileSync(absolute, 'utf8');
}

function resolveTarget(from: string, target: string): { file: string; fragment: string } {
  const separator = target.indexOf('#');
  const pathname = separator < 0 ? target : target.slice(0, separator);
  const fragment = separator < 0 ? '' : target.slice(separator);
  if (pathname.startsWith('/')) throw new Error(`Absolute Markdown link in ${from}: ${target}`);
  return {
    file: pathname ? safePath(path.posix.join(path.posix.dirname(from), decodeURIComponent(pathname))) : from,
    fragment,
  };
}

/** Rebase only actual Markdown links, leaving code examples and external URLs unchanged. */
function rewriteLinks(text: string, remap: (target: string) => string): string {
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
                .replace(/(\]\(<?)([^)\s>]+)(>?)/g, (_, start: string, target: string, end: string) => `${start}${remap(target)}${end}`)
                .replace(/^(\s{0,3}\[[^\]\n]+\]:[ \t]*)(\S+)/, (_, start: string, target: string) => `${start}${remap(target)}`),
        )
        .join('');
    })
    .join('\n');
}

/** Build the complete public payload in memory. No generated files or installed dependencies are required. */
export function createSkillDistribution(root: string): SkillDistribution {
  const configText = readSource(root, SKILL_EXPORTS);
  const config = JSON.parse(configText) as ExportConfig;
  if (
    config.schema_version !== 1 ||
    !Array.isArray(config.skills) ||
    !Array.isArray(config.references) ||
    !Array.isArray(config.packages) ||
    !Array.isArray(config.host_obligations)
  ) {
    throw new Error('Invalid skill export configuration');
  }
  const packagePath = safePath(config.package);
  const manifest = JSON.parse(readSource(root, `${packagePath}/package.json`)) as { name: string; version: string; description: string };
  if (manifest.name !== '@fluentui-react-native/skills') throw new Error('Unexpected skill distribution package');
  for (const obligation of config.host_obligations) {
    if (!/^R-[A-Z0-9]+-\d{3}$/.test(obligation) || !readSource(root, 'AGENTS.md').includes(obligation)) {
      throw new Error(`Host repository no longer routes required obligation ${obligation}`);
    }
  }

  const sources: SourceFile[] = [];
  for (const name of config.skills) {
    if (!/^furn-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) throw new Error(`Invalid exported skill name: ${name}`);
    const source = `.github/skills/${name}/SKILL.md`;
    const content = readSource(root, source);
    if (!content.startsWith(`---\nname: ${name}\n`)) throw new Error(`Skill identity mismatch: ${name}`);
    const description = /^description: ([^\n]+)$/m.exec(content)?.[1] ?? '';
    if (!description || description.length > 1024 || description.split(/\s+/).length > 60) {
      throw new Error(`Exported skill description exceeds its budget or is missing: ${name}`);
    }
    sources.push({ source, target: `skills/${name}/SKILL.md`, content });
  }
  const ids = new Set<string>();
  for (const source of config.references) {
    if (!source.startsWith('references/agents/') || source.includes('/evals/') || !source.endsWith('.md')) {
      throw new Error(`Not a portable reference source: ${source}`);
    }
    const content = readSource(root, source);
    const meta = parseFrontmatter(content);
    if (typeof meta === 'string' || !['instruction-reference', 'evidence-reference'].includes(meta.kind)) {
      throw new Error(`Invalid exported reference: ${source}`);
    }
    if (ids.has(meta.id)) throw new Error(`Duplicate exported reference ID: ${meta.id}`);
    ids.add(meta.id);
    sources.push({ source, target: `references/shared/${source.slice('references/agents/'.length)}`, content, id: meta.id });
  }
  sources.push({ source: 'LICENSE', target: 'LICENSE', content: readSource(root, 'LICENSE') });

  const catalog = config.packages.map((entry) => {
    const packageManifest = JSON.parse(readSource(root, `${safePath(entry.workspace)}/package.json`)) as {
      name: string;
      version: string;
      private?: boolean;
      exports?: Record<string, unknown>;
    };
    if (packageManifest.private || typeof packageManifest.name !== 'string' || typeof packageManifest.version !== 'string') {
      throw new Error(`Catalog must identify a published package: ${entry.workspace}`);
    }
    if (
      typeof entry.purpose !== 'string' ||
      !Array.isArray(entry.entry_points) ||
      entry.entry_points.some((point) => !Object.hasOwn(packageManifest.exports ?? {}, point)) ||
      !Array.isArray(entry.targets) ||
      entry.targets.some((target) => !['ios', 'android', 'macos', 'windows', 'win32'].includes(target))
    ) {
      throw new Error(`Invalid catalog capabilities: ${entry.workspace}`);
    }
    return {
      name: packageManifest.name,
      version: packageManifest.version,
      purpose: entry.purpose,
      entry_points: entry.entry_points,
      integration_targets: entry.targets,
    };
  });
  if (new Set(catalog.map(({ name }) => name)).size !== catalog.length) throw new Error('Duplicate catalog package');
  sources.push({ source: SKILL_EXPORTS, target: 'catalog/packages.json', content: json({ schema_version: 1, packages: catalog }) });
  const targets = new Map(sources.map((source) => [source.source, source]));
  if (targets.size !== sources.length || new Set(sources.map(({ target }) => target)).size !== sources.length) {
    throw new Error('Duplicate distribution source or destination');
  }
  const files = new Map<string, string>();
  for (const source of sources) {
    files.set(
      source.target,
      source.source.endsWith('.md')
        ? rewriteLinks(source.content, (target) => {
            if (!local(target)) return target;
            const resolved = resolveTarget(source.source, target);
            const destination = targets.get(resolved.file);
            if (!destination) throw new Error(`Unbundled reference from ${source.source}: ${target}`);
            if (resolved.fragment && !collectAnchors(destination.content).has(decodeURIComponent(resolved.fragment.slice(1)))) {
              throw new Error(`Missing exported anchor from ${source.source}: ${target}`);
            }
            return `${path.posix.relative(path.posix.dirname(source.target), destination.target) || path.posix.basename(source.target)}${resolved.fragment}`;
          })
        : source.content,
    );
  }

  // Bundled rule references and explicit prerequisites must close over the selected public subset.
  const rules = new Set<string>();
  for (const text of files.values()) {
    for (const match of text.matchAll(/^\s*[-*]\s+\*\*([RC]-[A-Z0-9]+-\d{3}):\*\*/gm)) rules.add(match[1]);
  }
  for (const [file, text] of files) {
    if (!file.endsWith('.md')) continue;
    for (const match of text.matchAll(/\b[RC]-[A-Z0-9]+-\d{3}\b/g)) {
      if (!rules.has(match[0])) throw new Error(`Unbundled rule ${match[0]} in ${file}`);
    }
  }
  const prerequisiteFiles = (file: string) =>
    extractPrerequisites(files.get(file) ?? '')
      .filter(({ target }) => local(target))
      .map(({ target }) => resolveTarget(file, target).file);
  const depth = (file: string, stack: string[]): number => {
    if (stack.includes(file)) throw new Error(`Exported prerequisite cycle at ${file}`);
    const next = prerequisiteFiles(file);
    const result = next.length ? 1 + Math.max(...next.map((nextFile) => depth(nextFile, [...stack, file]))) : 0;
    if (result > 3) throw new Error(`Exported prerequisite depth exceeds three at ${file}`);
    return result;
  };
  for (const file of files.keys()) if (file.endsWith('.md')) depth(file, []);

  const plugin = { name: 'furn', version: manifest.version, description: manifest.description };
  files.set('plugin.json', json({ $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', ...plugin }));
  files.set('.claude-plugin/plugin.json', json(plugin));
  let commit: string | null = null;
  let dirty: boolean | null = null;
  const inputs = [
    ...new Set([
      ...sources.map(({ source }) => source),
      `${packagePath}/package.json`,
      ...config.packages.map(({ workspace }) => `${workspace}/package.json`),
    ]),
  ].sort();
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
    // Filesystem fixtures and source archives have no Git metadata; content hashes still identify every input.
  }
  const sourceHashes = sources.map(({ source, target, id }) => ({
    source,
    path: target,
    ...(id ? { id } : {}),
    source_sha256: hash(readSource(root, source)),
    sha256: hash(files.get(target)!),
  }));
  const generated = ['plugin.json', '.claude-plugin/plugin.json'].map((file) => ({ path: file, sha256: hash(files.get(file)!) }));
  files.set(
    'provenance.json',
    json({
      schema_version: 1,
      package: manifest.name,
      version: manifest.version,
      source_commit: commit,
      source_dirty: dirty,
      export_sha256: hash(configText),
      inputs: inputs.map((source) => ({ source, sha256: hash(readSource(root, source)) })),
      files: [...sourceHashes, ...generated],
    }),
  );
  const metrics = config.skills.map((name) => {
    const text = files.get(`skills/${name}/SKILL.md`)!;
    const dependencies = new Set<string>();
    const addPrerequisites = (file: string) => {
      if (dependencies.has(file)) return;
      dependencies.add(file);
      prerequisiteFiles(file).forEach(addPrerequisites);
    };
    for (const { target } of extractLinks(text).filter(({ target }) => local(target))) {
      const file = resolveTarget(`skills/${name}/SKILL.md`, target).file;
      if (file.startsWith('references/')) addPrerequisites(file);
    }
    return {
      name,
      descriptionCharacters: (/^description: ([^\n]+)$/m.exec(text)?.[1] ?? '').length,
      bodyBytes: Buffer.byteLength(text.slice(text.indexOf('\n---\n') + 5)),
      directReferenceBytes: [...dependencies].reduce((total, file) => total + Buffer.byteLength(files.get(file) ?? ''), 0),
    };
  });
  return { packagePath, files, metrics };
}

function generatedPaths(packageRoot: string): string[] {
  const result: string[] = [];
  const walk = (relative: string) => {
    const full = path.join(packageRoot, relative);
    const stat = lstatSync(full, { throwIfNoEntry: false });
    if (!stat) return;
    if (stat.isSymbolicLink()) throw new Error(`Symlink in generated skill output: ${relative}`);
    if (stat.isDirectory()) {
      for (const child of readdirSync(full).sort()) walk(`${relative}/${child}`);
    } else result.push(relative);
  };
  for (const file of ['skills', 'references/shared', 'catalog', 'provenance.json', 'plugin.json', '.claude-plugin', 'LICENSE']) walk(file);
  return result;
}

/** Check-only detects stale/extra outputs; generation removes only named files in the owned output directories. */
export function writeSkillDistribution(root: string, check = false): SkillDistribution {
  const result = createSkillDistribution(root);
  const packageRoot = path.join(root, result.packagePath);
  const existing = generatedPaths(packageRoot);
  const stale = existing.filter((file) => !result.files.has(file));
  const changed = [...result.files].filter(
    ([file, text]) => !existsSync(path.join(packageRoot, file)) || readFileSync(path.join(packageRoot, file), 'utf8') !== text,
  );
  if (check) {
    if (stale.length || changed.length)
      throw new Error(`Stale skill distribution: ${[...stale, ...changed.map(([file]) => file)].join(', ')}`);
    return result;
  }
  for (const file of stale) rmSync(path.join(packageRoot, file));
  for (const [file, text] of changed) {
    const target = path.join(packageRoot, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  return result;
}
