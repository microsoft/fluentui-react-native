import { Command } from 'clipanion';
import path from 'node:path';
import fs from 'node:fs';
import { runScript } from '../utils/runScript.js';
import { readTypeScriptConfig } from '@rnx-kit/tools-typescript';
import { getPackageInfoFromPath } from '@rnx-kit/tools-packages';
import { cleanFolder } from './clean.js';
import esbuild from 'esbuild';
import { ModuleKind } from 'typescript';
import chalk from 'chalk';

export class HybridBuildCommand extends Command {
  static override paths = [['hybrid-build']];

  static override usage = Command.Usage({
    description:
      'Builds the current package using TypeScript compiler, then uses esbuild to bundle the additional module format if present',
    details: 'This command builds the current package based on the tsconfig.json and package.json configuration.',
    examples: [['Build the current package', '$0 build']],
  });

  /**
   * Executes a hybrid build: first compiles with tsc, then uses esbuild to create the alternate module format without minification
   */
  async execute() {
    const cwd = process.cwd();
    const pkgInfo = getPackageInfoFromPath(cwd);

    // do nothing if no tsconfig.json exists
    if (!fs.existsSync(path.join(cwd, 'tsconfig.json'))) {
      console.log('No tsconfig.json found. Skipping build.');
      return 0;
    }

    // validate we are in a modern node mode
    const tsconfig = readTypeScriptConfig(pkgInfo);
    const module = tsconfig.options.module;
    if (module !== ModuleKind.Node16 && module !== ModuleKind.NodeNext && module !== ModuleKind.Node18) {
      throw new Error(`Hybrid build requires "module" to be set to "Node16", "Node18", or "NodeNext" in tsconfig.json`);
    }

    // determine whether we are an esm package or cjs package
    const manifest = pkgInfo.manifest;
    const isModule = Boolean(manifest.type && String(manifest.type).toLowerCase() === 'module');
    const esmEntry = manifest.module;
    const cjsEntry = manifest.main;

    // main and module must be set and different
    if (!esmEntry || typeof esmEntry !== 'string' || !cjsEntry || typeof cjsEntry !== 'string') {
      throw new Error(`Hybrid build requires both "main" and "module" fields to be set in package.json`);
    }

    // Clean the output directories before building
    cleanFolder();

    const result = await runScript('tsc');
    if (result !== 0) {
      console.error(`Typescript build failed with exit code: ${result}`);
      return result;
    }
    console.log(`${chalk.green('SUCCESS')}: TypeScript Build (${chalk.cyan(isModule ? 'ESM' : 'CommonJS')})`);

    // if both entries point to the same file, no need to build further, otherwise bundle with esbuild
    if (esmEntry !== cjsEntry) {
      const external = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });
      const bundleResult = await esbuild.build({
        entryPoints: [isModule ? esmEntry : cjsEntry],
        outfile: isModule ? cjsEntry : esmEntry,
        format: isModule ? 'cjs' : 'esm',
        platform: 'neutral',
        target: 'node16',
        sourcemap: true,
        minify: false,
        bundle: true,
        external,
      });
      if (bundleResult?.errors.length > 0) {
        console.error(`esbuild bundling failed with errors:`, bundleResult.errors);
        return 1;
      }
      console.log(`${chalk.green('SUCCESS')}: Produced Bundle (${chalk.cyan(isModule ? 'CommonJS' : 'ESM')})`);
    }

    return 0;
  }
}
