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
const ALWAYS_ON = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];

const KINDS = new Set(['index', 'instruction-reference', 'evidence-reference', 'compatibility-reference']);
const INDEXED_KINDS = new Set(['instruction-reference', 'evidence-reference']);
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)*$/;
const RULE_DEFINITION = /^\s*[-*]\s+\*\*([RC]-[A-Z0-9]+-\d{3}):\*\*/;
const RULE_CITATION = /\b[RC]-[A-Z0-9]+-\d{3}\b/g;
const MAX_SKILL_DESCRIPTION_WORDS = 60;
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

/** GitHub-style heading anchor. */
export function slugify(heading: string): string {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
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

function isInstructionSurface(file: string): boolean {
  return (
    path.posix.basename(file) === 'AGENTS.md' ||
    file === 'CLAUDE.md' ||
    file === '.github/copilot-instructions.md' ||
    (file.startsWith(`${SKILLS_DIR}/`) && file.endsWith('.md')) ||
    (file.startsWith(`${REFERENCES_DIR}/`) && file.endsWith('.md'))
  );
}

function requiresFrontmatter(file: string): boolean {
  return (
    file.endsWith('.md') &&
    (file.startsWith(`${REFERENCES_DIR}/`) || new RegExp(`^${SKILLS_DIR.replace('.', '\\.')}/[^/]+/references/`).test(file))
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
  const surfaces = files.filter(isInstructionSurface).sort();
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
  for (const file of surfaces.filter(requiresFrontmatter)) {
    const parsed = parseFrontmatter(read(file));
    if (typeof parsed === 'string') {
      issues.push({ file, line: 1, message: parsed });
      continue;
    }
    frontmatter.set(file, parsed);
    if (!ID_PATTERN.test(parsed.id)) {
      issues.push({ file, line: 2, message: `invalid id "${parsed.id}"` });
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
  const indexFile = `${REFERENCES_DIR}/README.md`;
  if (files.includes(indexFile)) {
    const index = read(indexFile);
    const indexed = new Set(
      extractLinks(index)
        .map((link) => resolveLink(indexFile, link.target)?.file)
        .filter(Boolean),
    );
    for (const [file, meta] of frontmatter) {
      if (file.startsWith(`${REFERENCES_DIR}/`) && INDEXED_KINDS.has(meta.kind)) {
        if (!indexed.has(file)) {
          issues.push({ file, message: `not linked from ${indexFile}` });
        }
        if (!index.includes(`\`${meta.id}\``)) {
          issues.push({ file, message: `id "${meta.id}" is missing from the ${indexFile} document index` });
        }
      }
    }
  } else if (frontmatter.size > 0) {
    issues.push({ file: indexFile, message: 'missing reference index' });
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

  // Outbound links and code paths from instruction surfaces.
  for (const file of surfaces) {
    const text = read(file);
    for (const link of extractLinks(text)) {
      const resolved = resolveLink(file, link.target);
      if (!resolved) {
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
    for (const codePath of extractCodePaths(text)) {
      if (!existsExact(root, codePath.target) && !isGitIgnored(root, codePath.target)) {
        issues.push({ file, line: codePath.line, message: `path in code span does not exist: ${codePath.target}` });
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

  const report = [...ALWAYS_ON, ...skillNames.values()]
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
