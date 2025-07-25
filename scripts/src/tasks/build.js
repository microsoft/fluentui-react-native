// @ts-check

import { Command } from 'clipanion';
import { findNativeComponents, codegenNativeComponents } from '../utils/codegenNativeComponents.js';
import path from 'node:path';
import fs from 'node:fs';
import { runScript } from '../utils/runScript.js';
import { readTypeScriptConfig } from '@rnx-kit/tools-typescript';
import { getPackageInfoFromPath } from '@rnx-kit/tools-packages';
import { JsxEmit, ModuleKind } from 'typescript';
import { cleanFolder } from './clean.js';

export class BuildCommand extends Command {
  /** @override */
  static paths = [['build']];

  /** @override */
  static usage = Command.Usage({
    description: 'Builds the current package using TypeScript compiler',
    details: 'This command builds the current package based on the tsconfig.json and package.json configuration.',
    examples: [['Build the current package', '$0 build']],
  });

  async execute() {
    const cwd = process.cwd();
    const targets = getBuildTargets(cwd);
    if (targets.length === 0) {
      console.log('No build targets found. Skipping build.');
      return 0;
    }

    // Clean the output directories before building
    cleanFolder();
    const buildPromises = targets.map((target) => buildTarget(target, cwd));
    const results = await Promise.all(buildPromises);
    for (const result of results) {
      if (result !== 0) {
        throw new Error(`Build failed with exit code: ${result}`);
      }
    }
    return 0;
  }
}

/**
 * Get the module string for a given module kind.
 * @param {ModuleKind} [moduleKind] - The module kind to get the string for.
 * @returns {string} - The module string.
 */
function getModuleString(moduleKind) {
  switch (moduleKind) {
    case ModuleKind.CommonJS:
      return 'commonjs';
    case ModuleKind.ESNext:
      return 'esnext';
    default:
      return 'node16';
  }
}

/**
 * Get the build targets for the project.
 * @param {string} cwd - The current working directory to search in.
 * @returns {import('../utils/codegenNativeComponents.js').BuildTarget[]} - The build targets found.
 */
function getBuildTargets(cwd = process.cwd()) {
  /** @type {import('../utils/codegenNativeComponents.js').BuildTarget[]} */
  const targets = [];
  const pkgInfo = getPackageInfoFromPath(cwd);

  // do nothing if no tsconfig.json exists
  if (fs.existsSync(path.join(cwd, 'tsconfig.json'))) {
    const manifest = pkgInfo.manifest;
    const nativeComponents = findNativeComponents(cwd);
    const tsconfig = readTypeScriptConfig(pkgInfo);
    const options = tsconfig.options || {};
    const moduleBase = getModuleString(options.module);
    const jsxRuntime = options.jsx === JsxEmit.ReactJSX || options.jsx === JsxEmit.ReactJSXDev;

    /**
     * @param {string} srcTarget
     * @param {string} module
     */
    function addTarget(srcTarget, module) {
      targets.push({
        module,
        outDir: path.dirname(srcTarget),
        nativeComponents,
        jsxRuntime,
      });
    }

    // now look for a cjs target
    const cjsPath = manifest.main;
    if (cjsPath && typeof cjsPath === 'string') {
      const module = moduleBase && moduleBase !== 'esnext' ? moduleBase : 'node16';
      addTarget(cjsPath, module);
    }

    // look for an esm target
    const esmPath = manifest.module;
    if (esmPath && typeof esmPath === 'string') {
      addTarget(esmPath, 'esnext');
    }
  }

  return targets;
}

/**
 * Execute the build for a given target
 * @param {import('../utils/codegenNativeComponents.js').BuildTarget} target - The build target to execute.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<number>} - The exit code of the build process.
 */
async function buildTarget(target, cwd) {
  const { module, outDir, nativeComponents } = target;
  const extraArgs = ['--outDir', outDir, '--module', module];
  const result = await runScript('tsc', ...extraArgs);

  if (result === 0 && nativeComponents && nativeComponents.length > 0) {
    codegenNativeComponents(target, cwd);
  }

  if (result !== 0) {
    console.error(`Build failed for target: ${cwd}:${outDir}`);
  }

  return result;
}
