// @ts-check

import { Command, Option } from 'clipanion';
import depcheck from 'depcheck';
import type { ProjectRoot } from '../utils/projectRoot.ts';
import { getProjectRoot } from '../utils/projectRoot.ts';
import getInjectedDeps from '../../dynamic.extensions.mjs';
import { getReporter } from '../utils/getReporter.ts';
import { getToolVersion } from '../preinstall/tool-versions.js';
import micromatch from 'micromatch';
import { isFixMode } from '../utils/env.ts';

type IssueType = 'unused' | 'missing';
type DependencyType = 'dependency' | 'devDependency';
type Issue = {
  issue: IssueType;
  depType?: DependencyType;
  dependency: string;
  files?: string[];
};

/**
 * Merges two objects at one level.
 */
function mergeOneLevel(a: Record<string, unknown>, b: Record<string, unknown> = {}): Record<string, unknown> {
  const result = { ...a, ...b };
  Object.keys(a).forEach((key) => {
    if (Array.isArray(b[key]) && Array.isArray(a[key])) {
      result[key] = [...a[key], ...b[key]];
    }
  });
  return result;
}

export class DepcheckCommand extends Command {
  /** @override */
  static override paths = [['depcheck']];

  /** @override */
  static override usage = Command.Usage({
    description: 'Check for unused dependencies in the project using depcheck',
    details: 'This command analyzes the project to find unused dependencies and missing dependencies.',
    examples: [['Check dependencies in the current package', '$0 depcheck']],
  });

  verbose = Option.Boolean('--verbose', false, {
    description: 'Enable verbose output, showing suppressed warnings and errors',
  });

  fixErrors = Option.Boolean('--fix-errors', false, {
    description: 'Attempt to automatically fix issues found by depcheck',
  });

  fixWarnings = Option.Boolean('--fix-warnings', false, {
    description: 'Attempt to automatically fix warnings found by depcheck',
  });

  dryRun = Option.Boolean('--dry-run', false, {
    description: 'Perform a dry run of fixes without making any changes',
  });

  async execute() {
    const runner = new DepCheckRunner({
      verbose: this.verbose,
      fixErrors: isFixMode(this.fixErrors),
      fixWarnings: this.fixWarnings,
      dryRun: this.dryRun,
    });
    return runner.execute();
  }
}

/**
 * Runner for depcheck task, can be called from the command or from another command
 */
export class DepCheckRunner {
  private verbose: boolean;
  private fixErrors: boolean;
  private fixWarnings: boolean;
  private dryRun: boolean;
  private changes = false;
  private issues: Issue[] = [];
  private errors = 0;
  private projectRoot = getProjectRoot();
  private ignored: Set<string> = new Set<string>(injectedDevDeps(this.projectRoot));
  private removedDevDeps: string[] = [];
  private removedDeps: string[] = [];
  private addedDeps: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } = {};
  private reporter = getReporter();

  constructor(options: { verbose?: boolean; fixErrors?: boolean; fixWarnings?: boolean; dryRun?: boolean } = {}) {
    this.verbose = options.verbose ?? false;
    this.fixErrors = options.fixErrors ?? false;
    this.fixWarnings = options.fixWarnings ?? false;
    this.dryRun = options.dryRun ?? false;
  }

  async execute() {
    const depcheckOptions = this.projectRoot.buildConfig.depcheck ?? {};
    const options = mergeOneLevel(
      {
        ignorePatterns: ['/lib/*', '/lib-commonjs/*'],
        specials: [depcheck.special.eslint, depcheck.special.jest, depcheck.special.ttypescript],
      },
      depcheckOptions,
    );

    return new Promise<number>((resolve, reject) => {
      depcheck(process.cwd(), options, (result) => {
        try {
          // build up the set of found issues
          result.devDependencies.forEach((dependency) => this.issues.push({ issue: 'unused', depType: 'devDependency', dependency }));
          result.dependencies.forEach((dependency) => this.issues.push({ issue: 'unused', depType: 'dependency', dependency }));
          Object.keys(result.missing).forEach((dependency) =>
            this.issues.push({ issue: 'missing', dependency, files: result.missing[dependency] }),
          );

          // handle and/or report the issues
          this.handleIssues();

          if (this.errors > 0) {
            reject(new Error('Dependency checking failed'));
            return;
          }

          resolve(0);
        } catch (error) {
          console.error('Error during depcheck processing:', error);
          resolve(1);
        }
      });
    });
  }

  madeChanges(): boolean {
    return this.changes;
  }

  private handleIssues() {
    for (const issue of this.issues) {
      if (issue.issue === 'unused') {
        this.handleUnused(issue);
      } else if (issue.issue === 'missing') {
        this.handleMissing(issue);
      }
    }

    this.handleFixes();
  }

  private handleFixes() {
    this.changes = this.removedDeps.length > 0 || this.removedDevDeps.length > 0 || Object.keys(this.addedDeps).length > 0;
    const prefix = this.dryRun ? '[dry-run]' : ' -';
    if (this.removedDevDeps.length > 0) {
      if (!this.dryRun) {
        for (const dep of this.removedDevDeps) {
          this.projectRoot.updateRecordEntry('devDependencies', dep, undefined);
        }
      }
      console.warn(
        prefix,
        `Removed unused devDependencies: ${this.removedDevDeps.map((dep) => this.reporter.formatPackage(dep)).join(', ')}`,
      );
    }
    if (this.removedDeps.length > 0) {
      if (!this.dryRun) {
        for (const dep of this.removedDeps) {
          this.projectRoot.updateRecordEntry('dependencies', dep, undefined);
        }
      }
      console.error(prefix, `Removed unused dependencies: ${this.removedDeps.map((dep) => this.reporter.formatPackage(dep)).join(', ')}`);
    }
    if (this.addedDeps.dependencies) {
      for (const [dep, version] of Object.entries(this.addedDeps.dependencies)) {
        if (!this.dryRun) {
          this.projectRoot.updateRecordEntry('dependencies', dep, version);
        }
        console.warn(prefix, `Added dependency: ${this.reporter.formatPackage(dep)}@${version}`);
      }
    }
    if (this.addedDeps.devDependencies) {
      for (const [dep, version] of Object.entries(this.addedDeps.devDependencies)) {
        if (!this.dryRun) {
          this.projectRoot.updateRecordEntry('devDependencies', dep, version);
        }
        console.warn(prefix, `Added devDependency: ${this.reporter.formatPackage(dep)}@${version}`);
      }
    }
  }

  private handleUnused(issue: Issue) {
    const color = this.reporter.color;
    const { dependency, depType = 'dependency' } = issue;
    const prettyDependency = this.reporter.formatPackage(dependency);
    if (this.ignored.has(dependency)) {
      if (this.verbose) {
        console.log(`- [${color('ignored', 'highlight1')}]: unused ${depType}: ${prettyDependency}`);
      }
      return;
    }
    if (depType === 'devDependency') {
      if (this.fixWarnings) {
        this.removedDevDeps.push(dependency);
      } else {
        console.warn(`- [${color('warn', 'warnPrefix')}]: unused ${depType}: ${prettyDependency}`);
      }
    } else {
      if (this.fixErrors) {
        this.removedDeps.push(dependency);
      } else {
        console.error(`- [${color('error', 'errorPrefix')}]: unused ${depType}: ${prettyDependency}`);
        this.errors++;
      }
    }
  }

  private handleMissing(issue: Issue) {
    const color = this.reporter.color;
    const { dependency, files } = issue;
    const prettyDependency = this.reporter.formatPackage(dependency);
    if (files && files.length > 0) {
      const fileNames = files.map((file) => ` - ${color(file, 'highlight3')}`).join('\n');
      const msgEnd = `missing dependency: ${prettyDependency} from files:\n${fileNames}`;
      if (this.ignored.has(dependency)) {
        if (this.verbose) {
          console.log(`- [${color('ignored', 'highlight1')}]: ${msgEnd}`);
        }
        return;
      }
      const toolVersion = getToolVersion(dependency);
      if (this.fixErrors && toolVersion) {
        let isNonTest = false;
        for (const file of files) {
          isNonTest = isNonTest || !isTestFile(file);
        }
        if (isNonTest) {
          this.addedDeps.dependencies ??= {};
          this.addedDeps.dependencies[dependency] = toolVersion;
        } else {
          this.addedDeps.devDependencies ??= {};
          this.addedDeps.devDependencies[dependency] = toolVersion;
        }
      } else {
        console.error(`- [${color('error', 'errorPrefix')}]: ${msgEnd}`);
        this.errors++;
      }
    }

    if (this.ignored.has(dependency)) {
      if (this.verbose) {
        console.log(`- [${color('ignored', 'highlight1')}]: missing ${prettyDependency}`);
      }
      return;
    }
    console.error(`- [${color('error', 'errorPrefix')}]: missing ${prettyDependency}`);
  }
}

function injectedDevDeps(projectRoot: ProjectRoot): string[] {
  const options = { cwd: projectRoot.root, manifest: projectRoot.manifest };
  const injectedDeps = getInjectedDeps(options);
  return Object.keys(injectedDeps);
}

function isTestFile(fileName: string): boolean {
  return micromatch.isMatch(fileName, [
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/__testfixtures__/**',
    '**/babel.config.*',
    '**/jest.config.*',
    '**/eslint.config.*',
  ]);
}
