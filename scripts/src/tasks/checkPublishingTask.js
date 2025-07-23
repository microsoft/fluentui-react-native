// @ts-check

import { Command } from 'clipanion';
import { getPackageInfos, findGitRoot } from 'workspace-tools';

import { checkDependencies } from '../utils/checkDependencies.js';

/**
 * @typedef {'dependencies' | 'devDependencies' | 'peerDependencies'} DependencyType
 * @typedef {{ dependencyTypes?: DependencyType[] }} CheckPublishingOptions
 */

export class CheckPublishingCommand extends Command {
  /** @override */
  static paths = [['check-publishing']];

  /** @override */
  static usage = Command.Usage({
    description: 'Check the matrix of packages for publishing errors',
    details: 'This command checks for published packages that have a dependency on a private package.',
    examples: [['Check for publishing errors', '$0 check-publishing']],
  });

  async execute() {
    const dependencyTypes = ['dependencies'];
    const packageInfos = getPackageInfos(findGitRoot(process.cwd()));
    console.info('Starting scan for publishing errors');
    try {
      Object.keys(packageInfos).forEach((pkg) => {
        if (!packageInfos[pkg].private) {
          console.log(`Scanning published package ${pkg} for private dependencies`);
          dependencyTypes.forEach((dependencyType) => {
            const deps = packageInfos[pkg][dependencyType];
            Object.keys(deps || {}).forEach((dep) => {
              if (packageInfos[dep] && packageInfos[dep].private) {
                const errorMsg = `${pkg} has a ${dependencyType} on private package ${dep}`;
                console.error(errorMsg);
                throw new Error(errorMsg);
              }
            });
          });
        }
      });

      checkDependencies();

      console.info('No publishing errors found');
      return 0;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Check publishing failed');
    }
  }
}
