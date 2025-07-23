// @ts-check

import { Command } from 'clipanion';
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

export class DepcheckCommand extends Command {
  /** @override */
  static paths = [['depcheck']];

  /** @override */
  static usage = Command.Usage({
    description: 'Check for unused dependencies in the project using depcheck',
    details: 'This command analyzes the project to find unused dependencies and missing dependencies.',
    examples: [['Check dependencies in the current package', '$0 depcheck']],
  });

  async execute() {
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

    return new Promise((resolve, reject) => {
      depcheck(process.cwd(), options, (result) => {
        try {
          if (result.devDependencies.length > 0) {
            console.warn('Unused devDependencies');
            result.devDependencies.forEach((dependency) => {
              console.warn(`-- ${dependency}`);
            });
          }
          if (result.dependencies.length > 0 || Object.keys(result.missing).length > 0) {
            if (result.dependencies.length > 0) {
              console.error('Unused dependencies');
              result.dependencies.forEach((dependency) => {
                console.error(`-- ${dependency}`);
              });
            }

            Object.keys(result.missing).forEach((dependency) => {
              console.error(`Missing dependency on ${dependency}`);
              result.missing[dependency].forEach((file) => {
                console.error(`-- ${file}`);
              });
            });

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
}
