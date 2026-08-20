/**
 * Story-test manifest generation.
 *
 * Reads `parameters.desktopTest` statically out of the story modules and emits one executable
 * entry per tested story: a spec path plus an exact Mocha grep. Static extraction is deliberate —
 * it needs no running application, and it means the loopback test service can validate an
 * incoming story id against a manifest the device did not produce.
 *
 * The story sources are React Native TSX and cannot be imported by Node, so the parameters are
 * read with `@babel/parser` and evaluated against a JSON-only literal subset. Anything that is
 * not a JSON literal is rejected rather than interpreted.
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { parse, type ParseResult } from '@babel/parser';

import { DesktopValidationError } from '../errors.ts';
import { STORY_PLAN_SCHEMA_VERSION } from '../protocol.ts';
import { isSpecPlan, validateStoryPlan } from '../story-plan.ts';
import { storyGrep, storyNameFromExport, storyTag, toStoryId } from './story-id.ts';
import type { StoryPlan, StoryTestManifest, StoryTestManifestEntry } from '../types.ts';

export interface GenerateManifestOptions {
  /** Absolute paths of `*.stories.tsx` modules to scan. */
  storyFiles: readonly string[];
  /** Directories a linked spec is allowed to resolve into. */
  specRoots: readonly string[];
  /** Spec that hosts the compiled inline plans. */
  generatedSpecPath: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- the Babel AST is walked structurally */
type Node = any;

/** Evaluates a JSON-only object/array/primitive literal, rejecting everything else. */
function evaluateLiteral(node: Node, file: string): unknown {
  switch (node?.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'UnaryExpression':
      if (node.operator === '-' && node.argument?.type === 'NumericLiteral') {
        return -node.argument.value;
      }
      break;
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
      return evaluateLiteral(node.expression, file);
    case 'ArrayExpression':
      return node.elements.map((element: Node) => evaluateLiteral(element, file));
    case 'ObjectExpression': {
      const output: Record<string, unknown> = {};
      for (const property of node.properties) {
        if (property.type !== 'ObjectProperty' || property.computed) {
          throw new DesktopValidationError(`Unsupported desktopTest syntax in ${file}`, [
            'story test parameters must be plain JSON object literals; spreads, methods, and computed keys are not allowed',
          ]);
        }
        const key = property.key.type === 'Identifier' ? property.key.name : property.key.value;
        output[String(key)] = evaluateLiteral(property.value, file);
      }
      return output;
    }
    default:
      break;
  }
  throw new DesktopValidationError(`Unsupported desktopTest syntax in ${file}`, [
    `story test parameters must be JSON literals, found "${String(node?.type)}"`,
  ]);
}

function findProperty(objectExpression: Node, name: string): Node | undefined {
  if (objectExpression?.type !== 'ObjectExpression') {
    return undefined;
  }
  return objectExpression.properties.find(
    (property: Node) =>
      property.type === 'ObjectProperty' &&
      !property.computed &&
      (property.key.type === 'Identifier' ? property.key.name : property.key.value) === name,
  )?.value;
}

function unwrap(node: Node): Node {
  let current = node;
  while (current?.type === 'TSAsExpression' || current?.type === 'TSSatisfiesExpression') {
    current = current.expression;
  }
  return current;
}

interface ParsedStoryModule {
  /** `meta.title`, used for display and as the id root when `meta.id` is absent. */
  title: string;
  /** `meta.id`, which Storybook prefers over the title when deriving story ids. */
  metaId?: string;
  stories: {
    exportName: string;
    /** Display name: the declared `name`, falling back to the start-cased export key. */
    name: string;
    /** `parameters.__id`, which overrides the derived id entirely. */
    explicitId?: string;
    plan?: StoryPlan;
  }[];
}

function parseModule(file: string): ParsedStoryModule | undefined {
  const source = fs.readFileSync(file, 'utf8');
  let ast: ParseResult<Node>;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    }) as ParseResult<Node>;
  } catch (error) {
    throw new DesktopValidationError(`Failed to parse story module ${file}`, [(error as Error).message]);
  }

  const declarations = new Map<string, Node>();
  let meta: Node | undefined;

  for (const statement of ast.program.body as Node[]) {
    if (statement.type === 'VariableDeclaration') {
      for (const declarator of statement.declarations) {
        if (declarator.id.type === 'Identifier' && declarator.init) {
          declarations.set(declarator.id.name, unwrap(declarator.init));
        }
      }
    }
    if (statement.type === 'ExportDefaultDeclaration') {
      const declaration = unwrap(statement.declaration);
      meta = declaration.type === 'Identifier' ? declarations.get(declaration.name) : declaration;
    }
  }

  const titleNode = meta ? findProperty(meta, 'title') : undefined;
  const metaIdNode = meta ? findProperty(meta, 'id') : undefined;
  const title = titleNode?.type === 'StringLiteral' ? (titleNode.value as string) : undefined;

  if (title === undefined) {
    return undefined;
  }

  const stories: ParsedStoryModule['stories'] = [];

  for (const statement of ast.program.body as Node[]) {
    if (statement.type !== 'ExportNamedDeclaration' || statement.declaration?.type !== 'VariableDeclaration') {
      continue;
    }
    for (const declarator of statement.declaration.declarations) {
      if (declarator.id.type !== 'Identifier' || !declarator.init) {
        continue;
      }
      const exportName = declarator.id.name;
      const storyObject = unwrap(declarator.init);
      const nameNode = findProperty(storyObject, 'name');
      const parameters = findProperty(storyObject, 'parameters');
      const desktopTest = parameters ? findProperty(parameters, 'desktopTest') : undefined;
      const explicitIdNode = parameters ? findProperty(parameters, '__id') : undefined;

      stories.push({
        exportName,
        name: nameNode?.type === 'StringLiteral' ? (nameNode.value as string) : storyNameFromExport(exportName),
        explicitId: explicitIdNode?.type === 'StringLiteral' ? (explicitIdNode.value as string) : undefined,
        plan: desktopTest
          ? validateStoryPlan(evaluateLiteral(desktopTest, file), `${path.basename(file)} ${exportName} desktopTest`)
          : undefined,
      });
    }
  }

  return { title, metaId: metaIdNode?.type === 'StringLiteral' ? (metaIdNode.value as string) : undefined, stories };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Resolves a linked spec inside the configured roots, rejecting traversal. */
export function resolveLinkedSpec(storyPath: string, spec: string, specRoots: readonly string[]): string {
  const resolved = path.resolve(path.dirname(storyPath), spec);
  if (!fs.existsSync(resolved)) {
    throw new DesktopValidationError(`Linked desktop spec does not exist`, [`${spec} (resolved to ${resolved})`]);
  }
  const roots = specRoots.length > 0 ? specRoots : [path.dirname(storyPath)];
  const permitted = roots.some((root) => {
    const relative = path.relative(path.resolve(root), resolved);
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
  });
  if (!permitted) {
    throw new DesktopValidationError(`Linked desktop spec escapes the configured spec roots`, [
      `${resolved} is not inside ${roots.join(', ')}`,
    ]);
  }
  return resolved;
}

/** Builds the manifest from a set of story modules. */
export function generateStoryTestManifest(options: GenerateManifestOptions): StoryTestManifest {
  const entries: StoryTestManifestEntry[] = [];
  const seenPlanIds = new Map<string, string>();

  for (const storyFile of [...options.storyFiles].sort()) {
    const parsed = parseModule(storyFile);
    if (!parsed) {
      continue;
    }
    for (const story of parsed.stories) {
      if (!story.plan) {
        continue;
      }
      // Storybook derives a story id from the *export key*, never from the declared `name`:
      // `parameters.__id || toId(meta.id || meta.title, storyNameFromExport(exportKey))`. The
      // declared name is display text only. Deriving the id any other way produces a manifest the
      // running application disagrees with.
      const storyId = story.explicitId ?? toStoryId(parsed.metaId ?? parsed.title, storyNameFromExport(story.exportName));
      const previous = seenPlanIds.get(story.plan.id);
      if (previous) {
        throw new DesktopValidationError('Duplicate desktop story-test id', [
          `"${story.plan.id}" is declared by both ${previous} and ${storyId}`,
        ]);
      }
      seenPlanIds.set(story.plan.id, storyId);

      entries.push({
        storyId,
        title: parsed.title,
        name: story.name,
        tag: storyTag(storyId),
        spec: isSpecPlan(story.plan) ? resolveLinkedSpec(storyFile, story.plan.spec, options.specRoots) : options.generatedSpecPath,
        grep: storyGrep(storyId),
        plan: story.plan,
        storyPath: storyFile,
      });
    }
  }

  entries.sort((left, right) => left.storyId.localeCompare(right.storyId));

  return {
    version: STORY_PLAN_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    digest: digestEntries(entries),
    entries,
  };
}

/** Stable digest over the executable content of the manifest, recorded in `run.json`. */
export function digestEntries(entries: readonly StoryTestManifestEntry[]): string {
  const normalized = entries.map((entry) => ({ storyId: entry.storyId, tag: entry.tag, plan: entry.plan }));
  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

/** Recursively finds `*.stories.ts(x)` modules under the given roots. */
export function findStoryFiles(roots: readonly string[]): readonly string[] {
  const found: string[] = [];
  const visit = (directory: string): void => {
    let dirents: fs.Dirent[];
    try {
      dirents = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const dirent of dirents) {
      const full = path.join(directory, dirent.name);
      if (dirent.isDirectory()) {
        if (dirent.name === 'node_modules' || dirent.name === 'lib' || dirent.name.startsWith('.')) {
          continue;
        }
        visit(full);
        continue;
      }
      if (/\.stories\.tsx?$/.test(dirent.name)) {
        found.push(full);
      }
    }
  };
  for (const root of roots) {
    visit(path.resolve(root));
  }
  return found.sort();
}
