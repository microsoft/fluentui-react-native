import fs from 'node:fs';
import path from 'node:path';
import type { SpawnOptions } from 'node:child_process';
import { Command, Option } from 'clipanion';
import { findGitRoot } from 'workspace-tools';
import { captureScript, runScript } from '../utils/runScript.ts';
import { hasJestConfig } from '../preinstall/tool-versions.ts';
import { PackageContext, type PlatformTarget } from '../pkgContext.ts';
import { PLATFORM_ENV_VAR, DEFULT_WIN_PLATFORM } from '../const.mts';
import { getFileMetadata } from '../utils/fileData.ts';
import {
  buildJestOptionTable,
  matchTestFiles,
  normalizeSelector,
  parseJestArgs,
  parseListedTests,
  toPosixPath,
  type JestOptionTable,
  type JestYargsOptions,
  type ParsedJestArgs,
  type SelectorContext,
} from '../utils/jestSelection.ts';

type PlatformFiles = Partial<Record<PlatformTarget, string[]>>;

/** A problem with the requested test selection that the user can fix. */
class TestSelectionError extends Error {}

/** Packages with at least this many test files get a reminder that a subset can run. */
const SUBSET_TIP_MIN_FILES = 10;

export class JestCommand extends Command {
  static override paths = [['jest']];

  static override usage = Command.Usage({
    description: 'Tests the current package using jest',
    details: `
      This command tests the current package, running Jest once for each platform that has test files.

      Bare arguments select test files. Each is a case-insensitive pattern matched against the test path relative to the package, so "menu" also selects the menu-item and menu-button tests, and "src/components/menu/" selects one directory. A pattern that matches no test file is an error.

      To run the tests that depend on source files, use "--findRelatedTests <source files>". "--onlyChanged" and "--changedSince <ref>" select tests related to changed files. Other Jest options, such as "-t <test name pattern>" and "-u", apply as usual.
    `,
    examples: [
      ['Test the current package', '$0 jest'],
      ['Test the files for one component', '$0 jest popover'],
      ['Test one named test in a component', '$0 jest popover -t "opens on press"'],
      ['Test everything that depends on a source file', '$0 jest --findRelatedTests src/common/useFocusVisuals.ts'],
    ],
  });

  args = Option.Proxy();

  async execute() {
    const context = PackageContext.init(process.cwd());
    if (!hasJestConfig(process.cwd())) {
      console.warn('No jest configuration found, skipping jest.');
      return;
    }
    const args = ['--passWithNoTests', '--runTestsByPath'];
    if (process.env.TF_BUILD) {
      args.push('--runInBand');
    }

    const defaultPlatform = getBaseJestPlatform(context);
    const targetFiles = getJestTargetFiles(context, defaultPlatform);
    if (!targetFiles) {
      console.warn('No test files found for any platform, skipping jest.');
      return 0;
    }

    const parsed = parseJestArgs(this.args, loadJestOptionTable(context));
    const isSubset = parsed.selectors.length > 0 || parsed.changeSelection.length > 0 || parsed.relatedFiles !== undefined;
    let selectedFiles = targetFiles;
    if (isSubset) {
      try {
        selectedFiles = await selectTestFiles(context, defaultPlatform, targetFiles, parsed);
      } catch (error) {
        if (error instanceof TestSelectionError) {
          console.error(error.message);
          return 1;
        }
        throw error;
      }
    }

    const total = countFiles(targetFiles);
    const selected = countFiles(selectedFiles);
    if (isSubset) {
      console.log(`Selected ${selected} of ${total} test files.`);
      if (selected === 0) {
        console.log('The selection matches no test files, so there is nothing to run.');
      }
    } else if (total >= SUBSET_TIP_MIN_FILES && !process.env.CI && !process.env.TF_BUILD) {
      console.log(
        'Tip: while iterating, run a subset. "yarn test <name>" selects test files by path and "yarn test --findRelatedTests <source files>" selects the tests that depend on them. Reserve the full run for final acceptance.',
      );
    }

    for (const key in selectedFiles) {
      const platform = key as PlatformTarget;
      const files = selectedFiles[platform];
      if (files && files.length > 0) {
        console.log(`Running jest for platform ${platform} with ${files.length} test files.`);
        const options = getPlatformOptions(platform, defaultPlatform);
        const result = await runScript('jest', [...args, ...parsed.passthrough, ...files], options);
        if (result !== 0) {
          return result;
        }
      }
    }
    return 0;
  }
}

export function getBaseJestPlatform(context: PackageContext): PlatformTarget {
  return context.manifest.furn?.jestPlatform ?? 'ios';
}

/**
 * Get the list of test files for the given package context, defaulting to the base jest platform but allowing other platforms to
 * execute in parallel if they have platform-specific test files.
 */
export function getJestTargetFiles(
  context: PackageContext,
  defaultPlatform: PlatformTarget,
): Partial<Record<PlatformTarget, string[]>> | undefined {
  let results: Partial<Record<PlatformTarget, string[]>> | undefined = undefined;

  const files = context.files;
  for (const file of files) {
    const metadata = getFileMetadata(file);
    // we only care about source test files
    if (!metadata.isSource || !metadata.isTest) {
      continue;
    }
    results ??= {};
    let platform: string | undefined = undefined;
    if (defaultPlatform !== 'react') {
      // If the default platform is not 'react', check for platform-specific suffixes to multiplex the tests.
      // A concrete platform suffix (e.g. `.macos`, `.ios`) maps directly to that platform, while the
      // intermediate `win` suffix maps to the default Windows platform.
      platform = metadata.platformSuffix ?? (metadata.intermediateSuffix === 'win' ? DEFULT_WIN_PLATFORM : undefined);
    }
    // fall through to the default platform
    platform ??= defaultPlatform;
    const fileList = (results[platform as PlatformTarget] ??= []);
    fileList.push(file);
  }
  return results;
}

function getPlatformOptions(platform: PlatformTarget, defaultPlatform: PlatformTarget): SpawnOptions | undefined {
  return platform !== defaultPlatform ? { env: { ...process.env, [PLATFORM_ENV_VAR]: platform } } : undefined;
}

function countFiles(files: PlatformFiles): number {
  return Object.values(files).reduce((count, list) => count + (list?.length ?? 0), 0);
}

function isFile(candidate: string): boolean {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

/** Describe how Jest's options consume arguments, so values of options are not mistaken for test selectors. */
function loadJestOptionTable(context: PackageContext): JestOptionTable | undefined {
  try {
    const { yargsOptions } = context.openModule('jest').require('jest-cli') as { yargsOptions?: JestYargsOptions };
    return yargsOptions && buildJestOptionTable(yargsOptions);
  } catch {
    // Without Jest's option definitions only leading bare arguments are treated as selectors.
    return undefined;
  }
}

function getSelectorContext(context: PackageContext): SelectorContext {
  let repoRelativeRoot = '';
  try {
    repoRelativeRoot = toPosixPath(path.relative(findGitRoot(context.root), context.root));
  } catch {
    // Not inside a git repository, so repository-relative selectors cannot be recognized.
  }
  return { root: context.root, repoRelativeRoot, windows: process.platform === 'win32' };
}

/** Compare paths reported by different tools, which may differ in case or symbolic links. */
function canonicalPath(file: string): string {
  try {
    return fs.realpathSync.native(file);
  } catch {
    return path.normalize(file);
  }
}

/**
 * Narrow the discovered test files to the requested subset. Test path selectors match the file paths directly. Change-based
 * selection is resolved by Jest, which knows the module graph, and then intersected with the files for each platform so
 * platform-specific tests still run only on their platform.
 */
async function selectTestFiles(
  context: PackageContext,
  defaultPlatform: PlatformTarget,
  targetFiles: PlatformFiles,
  parsed: ParsedJestArgs,
): Promise<PlatformFiles> {
  let selected = targetFiles;

  if (parsed.selectors.length > 0) {
    const allFiles = Object.values(targetFiles).flatMap((list) => list ?? []);
    const selectorContext = getSelectorContext(context);
    const { matched, unmatched } = matchTestFiles(allFiles, parsed.selectors, selectorContext);
    if (unmatched.length > 0) {
      const sourceFiles = unmatched.filter((selector) => isFile(path.resolve(context.root, normalizeSelector(selector, selectorContext))));
      throw new TestSelectionError(
        `No test files match: ${unmatched.join(', ')}\n` +
          `Selectors are case-insensitive patterns matched against test paths relative to the package, such as "src/components/popover/". ` +
          `There are ${countFiles(targetFiles)} test files; run with --listTests to list them.` +
          (sourceFiles.length > 0
            ? `\nTo run the tests that depend on a source file, use --findRelatedTests ${sourceFiles.join(' ')}`
            : ''),
      );
    }
    selected = filterFiles(selected, (file) => matched.has(file));
  }

  if (parsed.relatedFiles !== undefined) {
    if (parsed.relatedFiles.length === 0) {
      throw new TestSelectionError('--findRelatedTests needs the source files whose dependent tests should run.');
    }
    const missing = parsed.relatedFiles.filter((file) => !fs.existsSync(path.resolve(file)));
    if (missing.length > 0) {
      throw new TestSelectionError(`Source files not found: ${missing.join(', ')}\nPaths are relative to the package directory.`);
    }
  }

  if (parsed.changeSelection.length > 0) {
    selected = await selectChangedTests(defaultPlatform, targetFiles, selected, parsed.changeSelection);
  }
  return selected;
}

function filterFiles(files: PlatformFiles, keep: (file: string) => boolean): PlatformFiles {
  const result: PlatformFiles = {};
  for (const [platform, list] of Object.entries(files) as [PlatformTarget, string[]][]) {
    result[platform] = list.filter(keep);
  }
  return result;
}

/**
 * Keep only the tests Jest relates to the requested changes, resolving them once for each platform. The tests Jest lists
 * are checked against every discovered file, so a selector that legitimately excludes them is not mistaken for a
 * mismatch between the paths Jest reports and the ones the runner found.
 */
async function selectChangedTests(
  defaultPlatform: PlatformTarget,
  discovered: PlatformFiles,
  narrowed: PlatformFiles,
  changeSelection: string[],
): Promise<PlatformFiles> {
  const result: PlatformFiles = {};
  let listedByJest = 0;
  let knownToRunner = 0;
  for (const [platform, list] of Object.entries(discovered) as [PlatformTarget, string[]][]) {
    if (list.length === 0) {
      result[platform] = [];
      continue;
    }
    const listArgs = ['--listTests', '--json', ...changeSelection];
    const { code, stdout } = await captureScript('jest', listArgs, getPlatformOptions(platform, defaultPlatform));
    if (code !== 0) {
      throw new TestSelectionError(`Jest could not resolve the tests for the requested changes (exit code ${code}).`);
    }
    const related = new Set(parseListedTests(stdout).map(canonicalPath));
    listedByJest += related.size;
    const relatedFiles = list.filter((file) => related.has(canonicalPath(file)));
    knownToRunner += relatedFiles.length;
    const wanted = new Set(narrowed[platform]);
    result[platform] = relatedFiles.filter((file) => wanted.has(file));
  }
  if (listedByJest > 0 && knownToRunner === 0) {
    throw new TestSelectionError('Jest selected tests that are not among the test files discovered for this package, so none were run.');
  }
  return result;
}
