// @ts-check
import * as glob from 'glob';

import fs from 'fs';
import path from 'path';

import { configureBabel } from '../configs/configureBabel.js';
import babel from '@babel/core';

/**
 * @typedef {{ module: string, outDir: string, jsxRuntime?: boolean, nativeComponents?: string[] }} BuildTarget
 */

/**
 * Finds all native components under the specified directory.
 * @param {string} [cwd=process.cwd()] - The current working directory to search in.
 * @returns {string[] | undefined}
 */
export function findNativeComponents(cwd = process.cwd()) {
  const results = glob.sync('src/**/*NativeComponent.ts', { cwd });
  return results.length > 0 ? results : undefined;
}

/**
 * Generates code for native components.
 * @param {BuildTarget} target
 * @param {string} [cwd=process.cwd()] - The current working directory.
 */
export function codegenNativeComponents(target, cwd = process.cwd()) {
  const { module, outDir, nativeComponents, jsxRuntime } = target;
  if (nativeComponents && nativeComponents.length > 0) {
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
