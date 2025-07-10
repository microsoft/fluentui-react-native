// @ts-check

import { logger } from 'just-task';
import { getPackageInfos, findGitRoot } from 'workspace-tools';

import { checkDependencies } from '../utils/checkDependencies.js';

/**
 * @typedef {'dependencies' | 'devDependencies' | 'peerDependencies'} DependencyType
 * @typedef {{ dependencyTypes?: DependencyType[] }} CheckPublishingOptions
 */

/**
 * Task to check the matrix of packages for publishing errors. In particular this checks for published packages that
 * have a dependency on a private package
 *
 * @return {import('just-task').TaskFunction} - the task function
 */
export function checkPublishingTask() {
  const dependencyTypes = ['dependencies'];
  return function (done) {
    const packageInfos = getPackageInfos(findGitRoot(process.cwd()));
    logger.info('Starting scan for publishing errors');
    try {
      Object.keys(packageInfos).forEach((pkg) => {
        if (!packageInfos[pkg].private) {
          logger.verbose(`Scanning published package ${pkg} for private dependenies`);
          dependencyTypes.forEach((dependencyType) => {
            const deps = packageInfos[pkg][dependencyType];
            Object.keys(deps || {}).forEach((dep) => {
              if (packageInfos[dep] && packageInfos[dep].private) {
                const errorMsg = `${pkg} has a ${dependencyType} on private package ${dep}`;
                logger.error(errorMsg);
                throw errorMsg;
              }
            });
          });
        }
      });

      checkDependencies();
    } catch (err) {
      done(err instanceof Error ? err : new Error());
    }
    logger.info('No publishing errors found');
    done();
  };
}
