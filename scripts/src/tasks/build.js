// @ts-check

const { findNativeComponents, codegenNativeComponents } = require('../utils/codegenNativeComponents');
const path = require('path');
const fs = require('fs');
const { runScript } = require('../utils/runScript.js');
const { readTypeScriptConfig } = require('@rnx-kit/tools-typescript');
const { getPackageInfoFromPath } = require('@rnx-kit/tools-packages');
const { JsxEmit, ModuleKind } = require('typescript');

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
 * @returns {import('../utils/codegenNativeComponents').BuildTarget[]} - The build targets found.
 */
function getBuildTargets(cwd = process.cwd()) {
  /** @type {import('../utils/codegenNativeComponents').BuildTarget[]} */
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
 * @param {import('../utils/codegenNativeComponents').BuildTarget} target - The build target to execute.
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

/**
 * Task to check the matrix of packages for publishing errors. In particular this checks for published packages that
 * have a dependency on a private package
 *
 * @returns {import('just-scripts').TaskFunction}
 */
function build() {
  return async function (done) {
    const cwd = process.cwd();
    const targets = getBuildTargets(cwd);
    if (targets.length === 0) {
      console.log('No build targets found. Skipping build.');
      done();
      return;
    }

    const buildPromises = targets.map((target) => buildTarget(target, cwd));
    const results = await Promise.all(buildPromises);
    for (const result of results) {
      if (result !== 0) {
        done(new Error(`Build failed with exit code: ${result}`));
        return;
      }
    }
    done();
  };
}

module.exports.build = build;
