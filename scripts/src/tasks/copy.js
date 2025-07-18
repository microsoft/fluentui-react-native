// @ts-check

import fs from 'fs';
import path from 'path';
import { series, resolveCwd, copyTask } from 'just-scripts';

/**
 * Expands the source path for a given pattern.
 * @param {string} pattern - The pattern to expand.
 * @returns {string | null} - The expanded source path or null if the pattern is invalid.
 */
function expandSourcePath(pattern) {
  if (!pattern) {
    return null;
  }

  // just returns the relative paths
  if (pattern.startsWith('.')) {
    return pattern;
  }

  // tries to resolve the packages, handling scoped packages
  const splitPattern = pattern.split('/');
  const packageName = pattern[0] == '@' ? `${splitPattern[0]}/${splitPattern[1]}` : splitPattern[0];

  try {
    const resolvedPackageJson = resolveCwd(`${packageName}/package.json`);

    if (!resolvedPackageJson) {
      // returns pattern if the packageName didn't contain a package.json (not really a package)
      return pattern;
    }

    return pattern.replace(packageName, path.dirname(resolvedPackageJson));
  } catch (e) {
    console.error(e);
  }
  return null;
}

export const copy = () => {
  let tasks = [];
  let configPath = path.resolve(process.cwd(), 'config/pre-copy.json');

  if (!fs.existsSync(configPath)) {
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  if (config && config.copyTo) {
    for (let destination in config.copyTo) {
      /** @type {string[]} */
      const sources = config.copyTo[destination];
      destination = path.resolve(process.cwd(), destination);
      tasks.push(
        copyTask(
          sources.map((src) => expandSourcePath(src)).filter((src) => src !== null),
          destination,
        ),
      );
    }
  }

  return series.apply(null, tasks);
};
