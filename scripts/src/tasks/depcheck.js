// @ts-check

import { Command, Option } from 'clipanion';
import depcheck from 'depcheck';
import { getProjectRoot } from '../utils/projectRoot.js';
import getInjectedDeps from '../../dynamic.extensions.mjs';
import { getReporter } from '../utils/getReporter.js';
import { getToolVersion } from '../preinstall/tool-versions.js';
import micromatch from 'micromatch';

/**
 * @typedef {'unused' | 'missing'} IssueType
 * @typedef {'dependency' | 'devDependency'} DependencyType
 * @typedef {{issue: IssueType, depType?: DependencyType, dependency: string, files?: string[]}} Issue
 */

/**
 * Merges two objects at one level.
 * @param {Record<string, unknown>} a
 * @param {Record<string, unknown>} b
 * @returns {Record<string, unknown>}
 */
function mergeOneLevel(a, b = {}) {
  const result = { ...a, ...b };
  Object.keys(a).forEach((key) => {
    if (Array.isArray(b[key]) && Array.isArray(a[key])) {
      result[key] = [...a[key], ...b[key]];
    }
  });
  return result;
}

/*
function scriptsDevDeps() {
  return Object.keys(getScriptProjectRoot().manifest.devDependencies || {});
}
*/

export class DepcheckCommand extends Command {
  /** @override */
  static paths = [['depcheck']];

  /** @override */
  static usage = Command.Usage({
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

  /** @type {import('@rnx-kit/reporter').Reporter} */
  reporter = getReporter();

  projectRoot = getProjectRoot();
  ignored = new Set(injectedDevDeps(this.projectRoot));

  /** @type {Issue[]} */
  issues = [];

  /** @type {number} */
  errors = 0;

  /** @type {string[]} */
  removedDevDeps = [];

  /** @type {string[]} */
  removedDeps = [];

  /** @type {{dependencies?: Record<string, string>, devDependencies?: Record<string, string>}} */
  addedDeps = {};

  async execute() {
    const config = this.projectRoot.manifest;
    const depcheckOptions = typeof config.depcheck === 'object' && !Array.isArray(config.depcheck) ? config.depcheck : {};
    const options = mergeOneLevel(
      {
        ignorePatterns: ['/lib/*', '/lib-commonjs/*'],
        specials: [depcheck.special.eslint, depcheck.special.jest, depcheck.special.ttypescript],
      },
      depcheckOptions,
    );

    return new Promise((resolve, reject) => {
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
          reject(error);
        }
      });
    });
  }

  handleIssues() {
    for (const issue of this.issues) {
      if (issue.issue === 'unused') {
        this.handleUnused(issue);
      } else if (issue.issue === 'missing') {
        this.handleMissing(issue);
      }
    }

    this.handleFixes();
  }

  handleFixes() {
    let hasFixes = this.removedDeps.length > 0 || this.removedDevDeps.length > 0 || Object.keys(this.addedDeps).length > 0;
    const prefix = this.dryRun ? '[dry-run]' : ' -';
    if (this.removedDevDeps.length > 0) {
      if (!this.dryRun) {
        this.projectRoot.removeDependencies(this.removedDevDeps, 'devDependencies');
      }
      console.warn(
        prefix,
        `Removed unused devDependencies: ${this.removedDevDeps.map((dep) => this.reporter.formatPackage(dep)).join(', ')}`,
      );
    }
    if (this.removedDeps.length > 0) {
      if (!this.dryRun) {
        this.projectRoot.removeDependencies(this.removedDeps, 'dependencies');
      }
      console.error(prefix, `Removed unused dependencies: ${this.removedDeps.map((dep) => this.reporter.formatPackage(dep)).join(', ')}`);
    }
    if (this.addedDeps.dependencies) {
      for (const [dep, version] of Object.entries(this.addedDeps.dependencies)) {
        if (!this.dryRun) {
          this.projectRoot.addDependencies({ [dep]: version }, 'dependencies');
        }
        console.warn(prefix, `Added dependency: ${this.reporter.formatPackage(dep)}@${version}`);
      }
    }
    if (this.addedDeps.devDependencies) {
      for (const [dep, version] of Object.entries(this.addedDeps.devDependencies)) {
        if (!this.dryRun) {
          this.projectRoot.addDependencies({ [dep]: version }, 'devDependencies');
        }
        console.warn(prefix, `Added devDependency: ${this.reporter.formatPackage(dep)}@${version}`);
      }
    }
    if (hasFixes && !this.dryRun) {
      this.projectRoot.writeManifest();
    }
  }

  /**
   * @param {Issue} issue
   */
  handleUnused(issue) {
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

  /**
   * Handle a missing dependency issue.
   * @param {Issue} issue
   */
  handleMissing(issue) {
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

/**
 * @param {import('../utils/projectRoot.js').ProjectRoot} projectRoot
 * @returns {string[]}
 */
function injectedDevDeps(projectRoot) {
  const options = { cwd: projectRoot.root, manifest: projectRoot.manifest };
  const injectedDeps = getInjectedDeps(options);
  return Object.keys(injectedDeps);
}

/**
 * @param {string} fileName
 * @returns {boolean}
 */
function isTestFile(fileName) {
  return micromatch.isMatch(fileName, ['**/*.test.*', '**/*.spec.*', '**/__tests__/**', '**/__testfixtures__/**']);
}
