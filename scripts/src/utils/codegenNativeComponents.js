// @ts-check
const glob = require('glob');

const fs = require('fs');
const path = require('path');

const { configureBabel } = require('../configs/configureBabel.js');

/**
 * @typedef {{ module: string, outDir: string, jsxRuntime?: boolean, nativeComponents?: string[] }} BuildTarget
 */

/**
 * Finds all native components under the specified directory.
 * @param {string} [cwd=process.cwd()] - The current working directory to search in.
 * @returns {string[] | undefined}
 */
function findNativeComponents(cwd = process.cwd()) {
  const results = glob.sync('src/**/*NativeComponent.ts', { cwd });
  return results.length > 0 ? results : undefined;
}

/**
 * Generates code for native components.
 * @param {BuildTarget} target
 * @param {string} [cwd=process.cwd()] - The current working directory.
 */
function codegenNativeComponents(target, cwd = process.cwd()) {
  const { module, outDir, nativeComponents, jsxRuntime } = target;
  if (nativeComponents && nativeComponents.length > 0) {
    const babel = require('@babel/core');
    const configOptions = { esmodule: module === 'esnext', jsxRuntime };
    const optionsBase = configureBabel(configOptions, {
      ast: false,
      babelrc: false,
      cwd: cwd,
      sourceRoot: cwd,
      root: cwd,
    });

    for (const matchedPath of nativeComponents) {
      const relativePath = path.relative(path.resolve(process.cwd(), 'src'), matchedPath);
      const code = fs.readFileSync(matchedPath).toString();
      const filename = path.resolve(process.cwd(), matchedPath);

      const res = babel.transformSync(code, {
        ...optionsBase,
        filename,
      });

      if (res && res.code) {
        const relativeOutputPath = relativePath.replace(/\.ts$/, '.js');
        fs.writeFileSync(path.resolve(cwd, outDir, relativeOutputPath), res.code);
      }
    }
  }
}

module.exports.codegenNativeComponents = codegenNativeComponents;
module.exports.findNativeComponents = findNativeComponents;
