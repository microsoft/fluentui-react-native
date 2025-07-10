// @ts-check

import { logger } from 'just-scripts';
import depcheck from 'depcheck';
import { getProjectRoot, getScriptProjectRoot } from '../utils/projectRoot.js';

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

function scriptsDevDeps() {
  return Object.keys(getScriptProjectRoot().manifest.devDependencies || {});
}

/**
 * Task to check for unused dependencies in the project using depcheck.
 * @returns {import('just-scripts').TaskFunction}
 */
export function depcheckTask() {
  return function (done) {
    const config = getProjectRoot().manifest;
    const depcheckOptions = typeof config.depcheck === 'object' && !Array.isArray(config.depcheck) ? config.depcheck : {};
    const options = mergeOneLevel(
      {
        ignorePatterns: ['*eslint*', '/lib/*', '/lib-commonjs/*'],
        ignoreMatches: [
          '@fluentui-react-native/scripts',
          '@fluentui-react-native/eslint-config-rules',
          'tslib',
          '@react-native/metro-config',
          ...scriptsDevDeps(),
        ],
        specials: [depcheck.special.eslint, depcheck.special.jest],
      },
      depcheckOptions,
    );

    return depcheck(process.cwd(), options, (result) => {
      try {
        if (result.devDependencies.length > 0) {
          logger.warn('Unused devDependencies');
          result.devDependencies.forEach((dependency) => {
            logger.warn(`-- ${dependency}`);
          });
        }
        if (result.dependencies.length > 0 || Object.keys(result.missing).length > 0) {
          if (result.dependencies.length > 0) {
            logger.error('Unused dependencies');
            result.dependencies.forEach((dependency) => {
              logger.error(`-- ${dependency}`);
            });
          }

          Object.keys(result.missing).forEach((dependency) => {
            logger.error(`Missing dependency on ${dependency}`);
            result.missing[dependency].forEach((file) => {
              logger.error(`-- ${file}`);
            });
          });

          throw 'Dependency checking failed';
        }
      } catch (error) {
        done(error);
      }
    });
  };
}
