import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Deterministic integrity checks for agent instructions, skills, shared references, and evaluation fixtures.
 * The conventions are documented in references/agents/README.md and references/agents/evals/README.md.
 */

export type Issue = { file: string; line?: number; message: string };

export type CheckResult = {
  issues: Issue[];
  report: { file: string; bytes: number }[];
};

const REFERENCES_DIR = 'references/agents';
const EVAL_CASES_DIR = `${REFERENCES_DIR}/evals/cases`;
const SKILLS_DIR = '.github/skills';
const PACKAGE_GUIDANCE = `${REFERENCES_DIR}/repository/package-guidance-packages.json`;
const ALWAYS_ON = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];

const KINDS = new Set(['index', 'instruction-reference', 'evidence-reference', 'compatibility-reference']);
const INDEXED_KINDS = new Set(['instruction-reference', 'evidence-reference']);
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)*$/;
const RULE_DEFINITION = /^\s*[-*]\s+\*\*([RC]-[A-Z0-9]+-\d{3}):\*\*/;
const RULE_CITATION = /\b[RC]-[A-Z0-9]+-\d{3}\b/g;
const MAX_SKILL_DESCRIPTION_WORDS = 60;
const MAX_PREREQUISITE_DEPTH = 3;
const PREREQUISITE_SENTENCE = /\b(?:read|load)\b[^.]*\bfirst\b|\bstarts? with\b/i;
const ROUTING_COLUMNS = new Set(['skill', 'workflow']);
const SKILL_LINK = /(?:^|\/)\.github\/skills\/([^/]+)\/SKILL\.md$/;
const SKIP_DIRS = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', '.git', 'Pods', 'build', 'DerivedData']);
const REPO_PATH_PREFIXES = ['.github/', 'apps/', 'packages/', 'references/', 'scripts/', 'docs/'];

const TASK_MODES = new Set(['implement', 'maintain', 'review', 'plan', 'contract', 'optimize', 'toolchain', 'security']);
const SPLITS = new Set(['development', 'holdout']);
const MODELS = new Set(['v0', 'v1-compose', 'v1-compressible', 'agentic-higher-order', 'agentic-primitive', 'framework-base', 'none']);
const PLATFORMS = new Set(['ios', 'android', 'macos', 'windows', 'win32']);
const FORBIDDEN_ACTIONS = new Set(['edit-files', 'run-mutating-commands', 'create-component', 'migrate-framework']);

type Frontmatter = { id: string; kind: string; ownerPaths: string[]; bodyStart: number };

/** Lists repository files, preferring Git so ignored output is excluded. Falls back to a filesystem walk. */
export function listFiles(root: string): string[] {
  try {
    const output = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    });
    return output
      .split('\0')
      .filter(Boolean)
      .filter((file) => existsSync(path.join(root, file)));
  } catch {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = dir ? `${dir}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          if (!SKIP_DIRS.has(entry.name)) {
            walk(rel);
          }
        } else if (entry.isFile()) {
          files.push(rel);
        }
      }
    };
    walk('');
    return files;
  }
}

function extractPackageSpecifiers(markdown: string): { packageName: string; packagePath?: string; line: number }[] {
  const paths: { packageName: string; packagePath?: string; line: number }[] = [];
  let fenced = false;
  markdown.split('\n').forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (fenced) return;
    for (const match of line.matchAll(/`(@[^/`\s]+\/[^/`\s]+)(?:\/([^`\s]+))?`/g)) {
      paths.push({ packageName: match[1], packagePath: match[2], line: index + 1 });
    }
  });
  return paths;
}

/** Returns true when a repository-relative path exists with exactly this letter case. */
export function existsExact(root: string, rel: string): boolean {
  const normalized = path.posix.normalize(rel).replace(/\/$/, '');
  if (normalized === '' || normalized === '.') {
    return true;
  }
  if (normalized.startsWith('..')) {
    return false;
  }
  let current = root;
  for (const segment of normalized.split('/')) {
    let entries: string[];
    try {
      entries = readdirSync(current);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) {
      return false;
    }
    current = path.join(current, segment);
  }
  return true;
}

/** Returns true when Git ignores the path, such as documented personal configuration files. */
function isGitIgnored(root: string, rel: string): boolean {
  try {
    execFileSync('git', ['check-ignore', '-q', '--no-index', rel], { cwd: root, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Removes inline HTML tags from heading text by scanning, so nested or malformed markup cannot survive. */
function removeTags(text: string): string {
  let result = '';
  let depth = 0;
  for (const character of text) {
    if (character === '<') {
      depth++;
    } else if (character === '>' && depth > 0) {
      depth--;
    } else if (depth === 0) {
      result += character;
    }
  }
  return result;
}

/** GitHub-style heading anchor. */
export function slugify(heading: string): string {
  return removeTags(heading.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'))
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

/** Collects heading anchors and explicit HTML anchors from Markdown, ignoring fenced code. */
export function collectAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  const counts = new Map<string, number>();
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) {
      continue;
    }
    const heading = /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      const base = slugify(heading[1]);
      const count = counts.get(base) ?? 0;
      counts.set(base, count + 1);
      anchors.add(count === 0 ? base : `${base}-${count}`);
    }
    for (const match of line.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) {
      anchors.add(match[1]);
    }
  }
  return anchors;
}

type Link = { target: string; line: number };

/** Extracts inline and reference-style link targets, ignoring fenced code and inline code spans. */
export function extractLinks(markdown: string): Link[] {
  const links: Link[] = [];
  let fenced = false;
  markdown.split('\n').forEach((raw, index) => {
    if (/^\s*(```|~~~)/.test(raw)) {
      fenced = !fenced;
      return;
    }
    if (fenced) {
      return;
    }
    const line = raw.replace(/`[^`]*`/g, '``');
    for (const match of line.matchAll(/\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g)) {
      links.push({ target: match[1], line: index + 1 });
    }
    const definition = /^\s*\[[^\]]+\]:\s*(\S+)/.exec(line);
    if (definition) {
      links.push({ target: definition[1], line: index + 1 });
    }
  });
  return links;
}

/** Extracts inline code spans that look like repository paths. */
export function extractCodePaths(markdown: string): Link[] {
  const paths: Link[] = [];
  let fenced = false;
  markdown.split('\n').forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (fenced) {
      return;
    }
    for (const match of line.matchAll(/`([^`\s]+)`/g)) {
      const value = match[1];
      if (REPO_PATH_PREFIXES.some((prefix) => value.startsWith(prefix)) && !/[<>*{}|$]|\.\.\./.test(value)) {
        paths.push({ target: value.replace(/[#:].*$/, ''), line: index + 1 });
      }
    }
  });
  return paths;
}

function extractPackageCodePaths(markdown: string): Link[] {
  const paths: Link[] = [];
  let fenced = false;
  markdown.split('\n').forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (fenced) return;
    for (const match of line.matchAll(/`((?:config|lib|native|references|src)\/[^`\s]+)`/g)) {
      if (!/[<>*{}|$]|\.\.\./.test(match[1])) {
        paths.push({ target: match[1].replace(/[#:].*$/, ''), line: index + 1 });
      }
    }
  });
  return paths;
}

/**
 * Extracts explicit prerequisites: the first link in a sentence such as "Read [X](x.md) first" or
 * "Focus work starts with [X](x.md)", and every link in a "Read first" section.
 */
export function extractPrerequisites(markdown: string): Link[] {
  const prerequisites: Link[] = [];
  let fenced = false;
  let readFirstSection = false;
  let paragraph: { text: string; line: number } | undefined;
  const flush = () => {
    if (!paragraph) {
      return;
    }
    for (const sentence of paragraph.text.split(/(?<=[.!?])\s+(?=[A-Z[`*])/)) {
      if (PREREQUISITE_SENTENCE.test(sentence.replace(/\[[^\]]*\]\([^)]*\)/g, 'LINK'))) {
        const [first] = extractLinks(sentence);
        if (first) {
          prerequisites.push({ target: first.target, line: paragraph.line });
        }
      }
    }
    paragraph = undefined;
  };
  markdown.split('\n').forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      flush();
      fenced = !fenced;
      return;
    }
    if (fenced) {
      return;
    }
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      readFirstSection = /^read first$/i.test(heading[1].trim());
      return;
    }
    if (readFirstSection) {
      for (const link of extractLinks(line)) {
        prerequisites.push({ target: link.target, line: index + 1 });
      }
    }
    if (line.trim() === '' || line.trimStart().startsWith('|')) {
      flush();
      return;
    }
    if (/^\s*(?:[-*]|\d+\.)\s+/.test(line)) {
      flush();
    }
    paragraph = paragraph ? { text: `${paragraph.text} ${line.trim()}`, line: paragraph.line } : { text: line.trim(), line: index + 1 };
  });
  flush();
  return prerequisites;
}

type RoutingRow = { line: number; task: string; skills: string[] };

/** Extracts rows of Markdown tables whose header has a Skill or Workflow column. */
export function extractRoutingRows(markdown: string, fromFile: string): RoutingRow[] {
  const rows: RoutingRow[] = [];
  const lines = markdown.split('\n');
  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].trimStart().startsWith('|') || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[index + 1] ?? '')) {
      continue;
    }
    const header = cells(lines[index]).map((cell) => cell.toLowerCase());
    const column = header.findIndex((cell) => ROUTING_COLUMNS.has(cell));
    if (column <= 0) {
      continue;
    }
    for (let row = index + 2; row < lines.length && lines[row].trimStart().startsWith('|'); row++) {
      const values = cells(lines[row]);
      const skills = extractLinks(values[column] ?? '')
        .map((link) => resolveLink(fromFile, link.target)?.file ?? '')
        .map((file) => SKILL_LINK.exec(file)?.[1])
        .filter((skill): skill is string => Boolean(skill));
      rows.push({ line: row + 1, task: values[0].toLowerCase().replace(/\s+/g, ' '), skills });
    }
  }
  return rows;
}

/** Parses the standardized reference frontmatter. Returns an error message for any deviation. */
export function parseFrontmatter(markdown: string): Frontmatter | string {
  const lines = markdown.split('\n');
  if (lines[0] !== '---') {
    return 'missing frontmatter; the first line must be ---';
  }
  const idLine = /^id: (\S+)$/.exec(lines[1] ?? '');
  const kindLine = /^kind: (\S+)$/.exec(lines[2] ?? '');
  if (!idLine || !kindLine || lines[3] !== 'owner_paths:') {
    return 'frontmatter must contain exactly id, kind, and owner_paths in that order';
  }
  const ownerPaths: string[] = [];
  let index = 4;
  while (index < lines.length && /^ {2}- \S+$/.test(lines[index])) {
    ownerPaths.push(lines[index].slice(4));
    index++;
  }
  if (lines[index] !== '---') {
    return 'frontmatter must end after the owner_paths list; no other keys are allowed';
  }
  if (ownerPaths.length === 0) {
    return 'owner_paths must list at least one path';
  }
  return { id: idLine[1], kind: kindLine[1], ownerPaths, bodyStart: index + 1 };
}

function parseSkillFrontmatter(markdown: string): Record<string, string> | undefined {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  if (!match) {
    return undefined;
  }
  const fields: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const field = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (field) {
      fields[field[1]] = field[2].trim();
    }
  }
  return fields;
}

type GuidedPackage = { path: string; name: string; npmName: string };

function packageForFile(file: string, packages: GuidedPackage[]): GuidedPackage | undefined {
  return packages.find(({ path: packagePath }) => file.startsWith(`${packagePath}/`));
}

function isInstructionSurface(file: string, packages: GuidedPackage[]): boolean {
  return (
    path.posix.basename(file) === 'AGENTS.md' ||
    file === 'CLAUDE.md' ||
    file === '.github/copilot-instructions.md' ||
    (file.startsWith(`${SKILLS_DIR}/`) && file.endsWith('.md')) ||
    (file.startsWith(`${REFERENCES_DIR}/`) && file.endsWith('.md')) ||
    packages.some(({ path: packagePath }) => file.startsWith(`${packagePath}/references/`) && file.endsWith('.md'))
  );
}

function requiresFrontmatter(file: string, packages: GuidedPackage[]): boolean {
  return (
    file.endsWith('.md') &&
    (file.startsWith(`${REFERENCES_DIR}/`) ||
      new RegExp(`^${SKILLS_DIR.replace('.', '\\.')}/[^/]+/references/`).test(file) ||
      packages.some(({ path: packagePath }) => file.startsWith(`${packagePath}/references/`)))
  );
}

function resolveLink(fromFile: string, target: string): { file: string; fragment?: string } | undefined {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
    return undefined;
  }
  const [rawPath, fragment] = target.split('#', 2);
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    decoded = rawPath;
  }
  const file = !decoded
    ? fromFile
    : decoded.startsWith('/')
      ? path.posix.normalize(decoded.slice(1))
      : path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), decoded));
  return { file, fragment: fragment || undefined };
}

/** Runs every check against the repository at `root`. */
export function checkAgentInstructions(root: string): CheckResult {
  const issues: Issue[] = [];
  const files = listFiles(root);
  const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
  let packages: GuidedPackage[] = [];
  if (files.includes(PACKAGE_GUIDANCE)) {
    try {
      const registry = JSON.parse(read(PACKAGE_GUIDANCE)) as { schema_version?: number; packages?: unknown };
      if (
        registry.schema_version !== 1 ||
        !Array.isArray(registry.packages) ||
        registry.packages.some((entry) => typeof entry !== 'string')
      ) {
        issues.push({ file: PACKAGE_GUIDANCE, message: 'expected schema_version 1 and a packages array of workspace paths' });
      } else {
        packages = registry.packages.map((packagePath) => {
          const manifestPath = `${packagePath}/package.json`;
          if (!files.includes(manifestPath)) {
            issues.push({ file: PACKAGE_GUIDANCE, message: `guided package manifest does not exist: ${manifestPath}` });
            return { path: packagePath, name: '', npmName: '' };
          }
          const manifest = JSON.parse(read(manifestPath)) as { name?: unknown };
          if (typeof manifest.name !== 'string') {
            issues.push({ file: manifestPath, message: 'package name must be a string' });
            return { path: packagePath, name: '', npmName: '' };
          }
          return { path: packagePath, name: manifest.name.replace(/^@[^/]+\//, ''), npmName: manifest.name };
        });
        const paths = packages.map(({ path: packagePath }) => packagePath);
        if (new Set(paths).size !== paths.length) {
          issues.push({ file: PACKAGE_GUIDANCE, message: 'guided package paths must be unique' });
        }
      }
    } catch (error) {
      issues.push({ file: PACKAGE_GUIDANCE, message: `could not read package registry: ${String(error)}` });
    }
  }
  const surfaces = files.filter((file) => isInstructionSurface(file, packages)).sort();
  const packageReadmes = packages.map(({ path: packagePath }) => `${packagePath}/README.md`).filter((file) => files.includes(file));
  const linkSurfaces = [...new Set([...surfaces, ...packageReadmes])].sort();
  const anchorCache = new Map<string, Set<string>>();
  const anchorsOf = (file: string) => {
    let anchors = anchorCache.get(file);
    if (!anchors) {
      anchors = collectAnchors(read(file));
      anchorCache.set(file, anchors);
    }
    return anchors;
  };

  // Frontmatter, IDs, and kinds.
  const frontmatter = new Map<string, Frontmatter>();
  const ids = new Map<string, string>();
  for (const file of surfaces.filter((surface) => requiresFrontmatter(surface, packages))) {
    const parsed = parseFrontmatter(read(file));
    if (typeof parsed === 'string') {
      issues.push({ file, line: 1, message: parsed });
      continue;
    }
    frontmatter.set(file, parsed);
    if (!ID_PATTERN.test(parsed.id)) {
      issues.push({ file, line: 2, message: `invalid id "${parsed.id}"` });
    }
    const ownerPackage = packageForFile(file, packages);
    if (ownerPackage && file.startsWith(`${ownerPackage.path}/references/`) && !parsed.id.startsWith(`${ownerPackage.name}.`)) {
      issues.push({ file, line: 2, message: `package reference ID must start with "${ownerPackage.name}."` });
    }
    const previous = ids.get(parsed.id);
    if (previous) {
      issues.push({ file, line: 2, message: `duplicate id "${parsed.id}" (also in ${previous})` });
    }
    ids.set(parsed.id, file);
    if (!KINDS.has(parsed.kind)) {
      issues.push({ file, line: 3, message: `unknown kind "${parsed.kind}"` });
    }
    for (const owner of parsed.ownerPaths) {
      if (!existsExact(root, owner)) {
        issues.push({ file, message: `owner path does not exist: ${owner}` });
      }
    }
  }

  // Index completeness.
  const indexFiles = [
    `${REFERENCES_DIR}/README.md`,
    ...packages.map(({ path: packagePath }) => `${packagePath}/references/README.md`).filter((file) => files.includes(file)),
  ];
  for (const indexFile of indexFiles) {
    if (!files.includes(indexFile)) {
      continue;
    }
    const index = read(indexFile);
    if (packageForFile(indexFile, packages) && !/^\|\s*ID\s*\|\s*Document\s*\|\s*Read when\s*\|$/m.test(index)) {
      issues.push({ file: indexFile, message: 'package reference index must have ID, Document, and Read when columns' });
    }
    if (packageForFile(indexFile, packages) && frontmatter.get(indexFile)?.kind !== 'index') {
      issues.push({ file: indexFile, message: 'package reference index must use kind: index' });
    }
    const indexed = new Set(
      extractLinks(index)
        .map((link) => resolveLink(indexFile, link.target)?.file)
        .filter(Boolean),
    );
    for (const [file, meta] of frontmatter) {
      const packageRoot = packageForFile(file, packages)?.path;
      const belongsToIndex =
        (indexFile === `${REFERENCES_DIR}/README.md` && file.startsWith(`${REFERENCES_DIR}/`)) ||
        (packageRoot !== undefined && indexFile === `${packageRoot}/references/README.md`);
      if (belongsToIndex && file !== indexFile && INDEXED_KINDS.has(meta.kind)) {
        if (!indexed.has(file)) {
          issues.push({ file, message: `not linked from ${indexFile}` });
        }
        if (!index.includes(`\`${meta.id}\``)) {
          issues.push({ file, message: `id "${meta.id}" is missing from the ${indexFile} document index` });
        }
      }
    }
  }
  if (!files.includes(`${REFERENCES_DIR}/README.md`) && [...frontmatter.keys()].some((file) => file.startsWith(`${REFERENCES_DIR}/`))) {
    issues.push({ file: `${REFERENCES_DIR}/README.md`, message: 'missing reference index' });
  }
  for (const { path: packagePath } of packages) {
    const readme = `${packagePath}/README.md`;
    const agents = `${packagePath}/AGENTS.md`;
    const index = `${packagePath}/references/README.md`;
    for (const required of [readme, agents, index]) {
      if (!files.includes(required)) issues.push({ file: required, message: 'guided package entry point or reference index is missing' });
    }
    for (const [source, target] of [
      [readme, agents],
      [agents, index],
    ] as const) {
      if (!files.includes(source) || !files.includes(target)) continue;
      const linked = extractLinks(read(source)).some((link) => resolveLink(source, link.target)?.file === target);
      if (!linked) issues.push({ file: source, message: `must link to ${target}` });
    }
    for (const file of files.filter(
      (candidate) =>
        candidate.startsWith(`${packagePath}/`) &&
        !candidate.startsWith(`${packagePath}/references/`) &&
        /(?:^|[-_.])plan\.md$/i.test(path.posix.basename(candidate)),
    )) {
      issues.push({ file, message: 'guided package plans belong in references/remaining-work.md (R-PKGDOC-009)' });
    }
  }
  for (const file of files.filter(
    (candidate) => (candidate === 'SKILL.md' || candidate.endsWith('/SKILL.md')) && !candidate.startsWith(`${SKILLS_DIR}/`),
  )) {
    issues.push({ file, message: 'project skills must be located under the root .github/skills directory' });
  }

  // Agent maps describe app-local source paths; other values are policy or commands. Paths are checked against the
  // Git-aware file list, not the file system, so ignored build output cannot pass locally and fail in a clean checkout.
  // A nested entry whose `policy` starts with `generated` names build output, which only its directory must contain.
  const inRepository = (target: string) => files.includes(target) || files.some((candidate) => candidate.startsWith(`${target}/`));
  for (const file of files.filter((candidate) => /^apps\/[^/]+\/agent-map\.yaml$/.test(candidate))) {
    const sources: { line: number; value: string; generated: boolean }[] = [];
    let block: { line: number; value: string; generated: boolean } | undefined;
    let inSources = false;
    for (const [index, line] of read(file).split('\n').entries()) {
      if (/^sources:\s*$/.test(line)) {
        inSources = true;
        continue;
      }
      if (inSources && /^\S/.test(line)) inSources = false;
      if (!inSources) continue;
      const entry = /^(\s+)([\w-]+):(.*)$/.exec(line);
      if (!entry) continue;
      const [, indent, key, raw] = entry;
      const value = raw.trim().replace(/^['"]|['"]$/g, '');
      if (indent.length === 2) {
        block = { line: index + 1, value, generated: false };
        sources.push(block);
      } else if (block && key === 'path') {
        block.line = index + 1;
        block.value = value;
      } else if (block && key === 'policy') {
        block.generated = value.startsWith('generated');
      }
    }
    for (const { line, value, generated } of sources) {
      if (value === '' || value === '|' || value === '>' || value.startsWith('[') || value.startsWith('{')) continue;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), value));
      if (generated ? !inRepository(path.posix.dirname(target)) : !inRepository(target)) {
        const message = generated
          ? `generated source directory does not exist: ${path.posix.dirname(value)}`
          : `source path does not exist or is ignored by Git: ${value}`;
        issues.push({ file, line, message });
      }
    }
  }

  // Compatibility references must point directly at a live document.
  for (const [file, meta] of frontmatter) {
    if (meta.kind !== 'compatibility-reference') {
      continue;
    }
    const targets = extractLinks(read(file))
      .map((link) => resolveLink(file, link.target)?.file)
      .filter((target): target is string => target !== undefined && target.endsWith('.md') && existsExact(root, target));
    if (targets.length === 0) {
      issues.push({ file, message: 'compatibility reference must link to its replacement' });
    } else if (targets.every((target) => frontmatter.get(target)?.kind === 'compatibility-reference')) {
      issues.push({ file, message: 'compatibility reference links only to another compatibility reference' });
    }
  }

  // Skills.
  const skillNames = new Map<string, string>();
  for (const file of surfaces.filter((f) => /^\.github\/skills\/[^/]+\/SKILL\.md$/.test(f))) {
    const dir = file.split('/')[2];
    const fields = parseSkillFrontmatter(read(file));
    if (!fields) {
      issues.push({ file, line: 1, message: 'missing skill frontmatter' });
      continue;
    }
    if (fields.name !== dir) {
      issues.push({ file, line: 2, message: `skill name "${fields.name}" must match its directory "${dir}"` });
    }
    const yamlHeader = /^---\n([\s\S]*?)\n---\n/.exec(read(file))?.[1] ?? '';
    for (const line of yamlHeader.split('\n')) {
      const scalar = /^(?:name|description):\s*(.*)$/.exec(line)?.[1];
      if (scalar && !/^["']/.test(scalar) && /:\s/.test(scalar)) {
        issues.push({ file, message: 'skill name and description values containing colon-space must be quoted YAML scalars' });
      }
    }
    if (skillNames.has(fields.name)) {
      issues.push({ file, message: `duplicate skill name "${fields.name}"` });
    }
    skillNames.set(fields.name, file);
    const words = (fields.description ?? '').split(/\s+/).filter(Boolean).length;
    if (words === 0) {
      issues.push({ file, message: 'skill description is empty' });
    } else if (words > MAX_SKILL_DESCRIPTION_WORDS) {
      issues.push({ file, message: `skill description has ${words} words; the limit is ${MAX_SKILL_DESCRIPTION_WORDS}` });
    }
  }

  // Skills may link only to package entry points or indexed package guidance.
  for (const file of surfaces.filter((surface) => surface.startsWith(`${SKILLS_DIR}/`) && surface.endsWith('/SKILL.md'))) {
    for (const link of extractLinks(read(file))) {
      const target = resolveLink(file, link.target)?.file;
      const owner = target && packageForFile(target, packages);
      if (!owner) continue;
      const allowed =
        target === `${owner.path}/AGENTS.md` ||
        target === `${owner.path}/README.md` ||
        (target.startsWith(`${owner.path}/references/`) &&
          target.endsWith('.md') &&
          ['index', 'instruction-reference'].includes(frontmatter.get(target)?.kind ?? ''));
      if (!allowed) issues.push({ file, line: link.line, message: `skill links to non-guidance package file ${target}` });
    }
  }

  // Outbound links and code paths from instruction surfaces.
  for (const file of linkSurfaces) {
    const text = read(file);
    const packageRoot = packageForFile(file, packages)?.path;
    for (const link of extractLinks(text)) {
      const resolved = resolveLink(file, link.target);
      if (!resolved) {
        continue;
      }
      if (packageRoot && !resolved.file.startsWith(`${packageRoot}/`)) {
        issues.push({ file, line: link.line, message: `package guidance link escapes its package: ${link.target}` });
        continue;
      }
      if (!existsExact(root, resolved.file)) {
        issues.push({ file, line: link.line, message: `broken link: ${link.target}` });
        continue;
      }
      if (resolved.fragment && resolved.file.endsWith('.md') && !anchorsOf(resolved.file).has(resolved.fragment)) {
        issues.push({ file, line: link.line, message: `missing anchor: ${link.target}` });
      }
    }
    const codePaths = [...extractCodePaths(text), ...(packageRoot ? extractPackageCodePaths(text) : [])];
    for (const codePath of codePaths) {
      const packageRelative = packageRoot && /^(?:config|lib|native|references|src)\//.test(codePath.target);
      const resolvedPath = packageRelative ? `${packageRoot}/${codePath.target}` : codePath.target;
      if (!existsExact(root, resolvedPath) && !isGitIgnored(root, resolvedPath)) {
        issues.push({ file, line: codePath.line, message: `path in code span does not exist: ${codePath.target}` });
      }
    }
    for (const specifier of extractPackageSpecifiers(text)) {
      const targetPackage = packages.find(({ npmName }) => npmName === specifier.packageName);
      if (
        targetPackage &&
        specifier.packagePath &&
        (specifier.packagePath.startsWith('references/') || ['AGENTS.md', 'README.md'].includes(specifier.packagePath)) &&
        !existsExact(root, `${targetPackage.path}/${specifier.packagePath}`)
      ) {
        issues.push({
          file,
          line: specifier.line,
          message: `package guide path does not exist: ${specifier.packageName}/${specifier.packagePath}`,
        });
      }
    }
  }

  // Inbound fragments from any Markdown into instruction surfaces.
  const surfaceSet = new Set(surfaces);
  for (const file of files) {
    if (!file.endsWith('.md') || surfaceSet.has(file) || path.posix.basename(file) === 'CHANGELOG.md') {
      continue;
    }
    for (const link of extractLinks(read(file))) {
      const resolved = resolveLink(file, link.target);
      if (resolved?.fragment && surfaceSet.has(resolved.file) && !anchorsOf(resolved.file).has(resolved.fragment)) {
        issues.push({ file, line: link.line, message: `missing anchor in instruction file: ${link.target}` });
      }
    }
  }

  // Compatibility references are terminal: nothing links to them except the redirects themselves.
  const compatibility = new Set([...frontmatter].filter(([, meta]) => meta.kind === 'compatibility-reference').map(([file]) => file));
  for (const file of files) {
    if (!file.endsWith('.md') || compatibility.has(file) || path.posix.basename(file) === 'CHANGELOG.md') {
      continue;
    }
    for (const link of extractLinks(read(file))) {
      const target = resolveLink(file, link.target)?.file;
      if (target && compatibility.has(target)) {
        issues.push({ file, line: link.line, message: `links to compatibility reference ${target}; link to its replacement instead` });
      }
    }
  }

  // Explicit prerequisites must be acyclic and shallow.
  const prerequisites = new Map<string, string[]>();
  for (const file of surfaces) {
    const targets: string[] = [];
    for (const link of extractPrerequisites(read(file))) {
      const target = resolveLink(file, link.target)?.file;
      if (target && target.endsWith('.md') && existsExact(root, target)) {
        if (target === file) {
          issues.push({ file, line: link.line, message: 'document lists itself as a prerequisite' });
        } else {
          targets.push(target);
        }
      }
    }
    prerequisites.set(file, [...new Set(targets)]);
  }
  const depthMemo = new Map<string, number>();
  const reportedCycles = new Set<string>();
  const depth = (file: string, stack: string[]): number => {
    const loop = stack.indexOf(file);
    if (loop >= 0) {
      const cycle = [...stack.slice(loop), file];
      const key = cycle.slice(0, -1).sort().join('|');
      if (!reportedCycles.has(key)) {
        reportedCycles.add(key);
        issues.push({ file, message: `prerequisite cycle: ${cycle.join(' -> ')}` });
      }
      return 0;
    }
    const cached = depthMemo.get(file);
    if (cached !== undefined) {
      return cached;
    }
    const next = prerequisites.get(file) ?? [];
    const result = next.length === 0 ? 0 : 1 + Math.max(...next.map((target) => depth(target, [...stack, file])));
    depthMemo.set(file, result);
    return result;
  };
  for (const file of surfaces) {
    const chain = depth(file, []);
    if (chain > MAX_PREREQUISITE_DEPTH) {
      issues.push({ file, message: `prerequisite chain is ${chain} reads deep; the limit is ${MAX_PREREQUISITE_DEPTH}` });
    }
  }

  // Routing tables send each task to exactly one skill, agree across routers, and cover every skill from the root.
  const routedTasks = new Map<string, { skills: string; file: string }>();
  for (const file of surfaces) {
    for (const row of extractRoutingRows(read(file), file)) {
      if (row.skills.length !== 1) {
        issues.push({ file, line: row.line, message: `routing row "${row.task}" must link exactly one skill; found ${row.skills.length}` });
        continue;
      }
      const previous = routedTasks.get(row.task);
      if (previous && previous.skills !== row.skills[0]) {
        issues.push({
          file,
          line: row.line,
          message: `task "${row.task}" routes to ${row.skills[0]} here but to ${previous.skills} in ${previous.file}`,
        });
      } else if (!previous) {
        routedTasks.set(row.task, { skills: row.skills[0], file });
      }
    }
  }
  if (files.includes('AGENTS.md')) {
    const rootRouted = new Set(extractRoutingRows(read('AGENTS.md'), 'AGENTS.md').flatMap((row) => row.skills));
    for (const [skill, file] of skillNames) {
      if (!rootRouted.has(skill)) {
        issues.push({ file, message: `skill "${skill}" is not routed from the root AGENTS.md routing table` });
      }
    }
  }

  // Rule definitions and citations.
  const rules = new Map<string, string>();
  for (const file of surfaces) {
    read(file)
      .split('\n')
      .forEach((line, index) => {
        const match = RULE_DEFINITION.exec(line);
        if (match) {
          const previous = rules.get(match[1]);
          if (previous) {
            issues.push({ file, line: index + 1, message: `rule ${match[1]} is already defined in ${previous}` });
          } else {
            rules.set(match[1], `${file}:${index + 1}`);
          }
        }
      });
  }
  for (const file of surfaces) {
    read(file)
      .split('\n')
      .forEach((line, index) => {
        for (const match of line.matchAll(RULE_CITATION)) {
          if (!rules.has(match[0])) {
            issues.push({ file, line: index + 1, message: `undefined rule ID ${match[0]}` });
          }
        }
      });
  }

  // Evaluation fixtures.
  const caseIds = new Set<string>();
  for (const file of files.filter((f) => f.startsWith(`${EVAL_CASES_DIR}/`))) {
    issues.push(...checkEvalCase(root, file, read(file), { caseIds, rules, skills: skillNames }));
  }

  const report = [...ALWAYS_ON, ...skillNames.values(), ...packages.map(({ path: packagePath }) => `${packagePath}/AGENTS.md`)]
    .filter((file) => files.includes(file))
    .map((file) => ({ file, bytes: statSync(path.join(root, file)).size }));
  return { issues, report };
}

function checkEvalCase(
  root: string,
  file: string,
  text: string,
  context: { caseIds: Set<string>; rules: Map<string, string>; skills: Map<string, string> },
): Issue[] {
  const issues: Issue[] = [];
  const fail = (message: string) => issues.push({ file, message });
  if (!file.endsWith('.json')) {
    fail('evaluation cases must be JSON files');
    return issues;
  }
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON: ${(error as Error).message}`);
    return issues;
  }
  const stem = path.posix.basename(file, '.json');
  const strings = (value: unknown): string[] | undefined =>
    Array.isArray(value) && value.every((item) => typeof item === 'string') ? (value as string[]) : undefined;
  const checkPaths = (label: string, value: unknown) => {
    const list = strings(value);
    if (!list) {
      fail(`${label} must be an array of strings`);
      return [];
    }
    for (const item of list) {
      if (!existsExact(root, item)) {
        fail(`${label} path does not exist: ${item}`);
      }
    }
    return list;
  };

  if (data.schema_version !== 1) fail('schema_version must be 1');
  if (data.case_id !== stem) fail(`case_id must match the file name "${stem}"`);
  if (context.caseIds.has(stem)) fail(`duplicate case_id "${stem}"`);
  context.caseIds.add(stem);
  if (!SPLITS.has(data.split as string)) fail('split must be development or holdout');
  if (!TASK_MODES.has(data.task_mode as string)) fail(`unknown task_mode "${String(data.task_mode)}"`);
  if (typeof data.prompt !== 'string' || data.prompt.trim() === '') fail('prompt must be a non-empty string');

  const expected = (data.expected ?? {}) as Record<string, unknown>;
  const skills = strings(expected.skills);
  if (!skills || skills.length === 0) {
    fail('expected.skills must list at least one skill');
  } else {
    for (const skill of skills) {
      if (!context.skills.has(skill)) fail(`unknown skill "${skill}"`);
    }
  }
  const classification = (expected.classification ?? {}) as Record<string, unknown>;
  if (!MODELS.has(classification.implementation_model as string)) {
    fail(`unknown implementation_model "${String(classification.implementation_model)}"`);
  }
  if (!strings(classification.public_compatibility)) fail('expected.classification.public_compatibility must be an array of strings');
  const platforms = strings(classification.native_platforms);
  if (!platforms) {
    fail('expected.classification.native_platforms must be an array of strings');
  } else {
    for (const platform of platforms) {
      if (!PLATFORMS.has(platform)) fail(`unknown native platform "${platform}"`);
    }
  }
  checkPaths('expected.required_reads', expected.required_reads);
  const forbidden = strings(expected.forbidden_actions);
  if (!forbidden) {
    fail('expected.forbidden_actions must be an array of strings');
  } else {
    for (const action of forbidden) {
      if (!FORBIDDEN_ACTIONS.has(action)) fail(`unknown forbidden action "${action}"`);
    }
  }

  const assertions = data.assertions;
  if (!Array.isArray(assertions) || assertions.length === 0) {
    fail('assertions must be a non-empty array');
    return issues;
  }
  const assertionIds = new Set<string>();
  for (const assertion of assertions as Record<string, unknown>[]) {
    const id = assertion.id as string;
    if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) fail(`invalid assertion id "${String(id)}"`);
    if (assertionIds.has(id)) fail(`duplicate assertion id "${id}"`);
    assertionIds.add(id);
    if (typeof assertion.description !== 'string' || assertion.description.trim() === '') {
      fail(`assertion "${id}" needs a description`);
    }
    const ruleIds = strings(assertion.rule_ids) ?? [];
    for (const rule of ruleIds) {
      if (!context.rules.has(rule)) fail(`assertion "${id}" cites undefined rule ${rule}`);
    }
    const refs = checkPaths(`assertion "${id}" source_refs`, assertion.source_refs);
    if (ruleIds.length === 0 && refs.length === 0) fail(`assertion "${id}" must cite a rule ID or a source path`);
  }
  return issues;
}
