import fs from 'node:fs';
import { URL } from 'node:url';

/**
 * @param {Object} workspace           The package currently being processed
 * @param {string} workspace.cwd       Path of the current package
 * @param {Object} workspace.manifest  The content of `package.json`
 * @returns {{
 *   dependencies?: Record<string, string>;
 *   peerDependencies?: Record<string, string>;
 *   peerDependenciesMeta?: Record<string, { optional?: boolean }>;
 * }}
 */
export default function ({ cwd, manifest }) {
  return {
    dependencies: { ...COMMON_DEPENDENCIES },
  };
}

const COMMON_DEPENDENCIES = pullFromDependencies('devDependencies', ['just-scripts', '@babel/core']);
console.log('COMMON_DEPENDENCIES', COMMON_DEPENDENCIES);

/**
 * Pulls specified values from the given dependencies container from the scripts package.json
 * @param {"dependencies" | "devDependencies"} container
 * @param {string[]} values
 * @returns {Record<string, string>}
 */
function pullFromDependencies(container, values) {
  const url = new URL('package.json', import.meta.url);
  const manifest = JSON.parse(fs.readFileSync(url, { encoding: 'utf-8' }));
  const dependencies = manifest[container] || {};
  return Object.fromEntries(
    values.map((value) => {
      if (dependencies[value]) {
        return [value, dependencies[value]];
      }
      return [];
    }),
  );
}
