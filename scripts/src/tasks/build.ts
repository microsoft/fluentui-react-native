// @ts-check

import { Command, Option } from 'clipanion';
import path from 'node:path';
import fs from 'node:fs';
import { runYarn } from '../utils/runScript.js';
import { getProjectRoot, type ProjectRoot, type ResolvedBuildConfig } from '../utils/projectRoot.ts';
import { readTypeScriptConfig } from '@rnx-kit/tools-typescript';
import { getPackageInfoFromPath } from '@rnx-kit/tools-packages';
import type ts from 'typescript';

export type TargetType = 'cjs' | 'esm';

export type BuildTarget = {
  module?: string;
  moduleResolution?: string;
  outDir?: string;
  noEmit?: boolean;
};

export type TypescriptBuildInfo = ResolvedBuildConfig['typescript'] & {
  packageType: TargetType;
  options: ts.CompilerOptions;
  cjsTarget: BuildTarget;
  esmTarget: BuildTarget;
};

function isTargetType(value: unknown): value is TargetType {
  return typeof value === 'string' && (value === 'cjs' || value === 'esm' || value === 'check');
}

export class BuildCommand extends Command {
  /** @override */
  static override paths = [['build']];

  /** @override */
  static override usage = Command.Usage({
    description: 'Builds the current package using TypeScript compiler',
    details: 'This command builds the current package based on the tsconfig.json and package.json configuration.',
    examples: [['Build the current package', '$0 build']],
  });

  target = Option.String('--target', {
    description: 'Specify a build target to build (if not specified, both targets will be built)',
    required: false,
  });

  parallel = Option.Boolean('--parallel', true, {
    description: 'Build targets in parallel',
  });

  async execute() {
    const cwd = process.cwd();

    if (this.target && !isTargetType(this.target)) {
      console.error(`Invalid target type specified: ${this.target}. Valid targets are 'cjs', 'esm', or 'check'.`);
      return 1;
    }

    const projRoot = getProjectRoot(cwd);
    const buildInfo = getTypescriptBuildInfo(projRoot);
    if (!buildInfo) {
      console.log('No TypeScript configuration found. Skipping build.');
      return 0;
    }

    const builds = this.target
      ? [this.target === 'cjs' ? buildInfo.cjsTarget : buildInfo.esmTarget]
      : [buildInfo.cjsTarget, buildInfo.esmTarget];

    if (this.parallel) {
      const results = await Promise.all(builds.map((buildTarget) => runBuild(buildTarget, cwd, buildInfo.engine)));
      const failedResult = results.find((result) => result !== 0);
      return failedResult ?? 0;
    }

    for (const buildTarget of builds) {
      const result = await runBuild(buildTarget, cwd, buildInfo.engine);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  }
}

async function runBuild(target: BuildTarget, cwd: string, engine: TypescriptBuildInfo['engine']): Promise<number> {
  const params: string[] = [];
  const start = Date.now();
  if (target.noEmit) {
    params.push('--noEmit');
  } else {
    if (target.outDir) {
      params.push('--outDir', target.outDir);
      const cleanDir = path.join(cwd, target.outDir);
      fs.rmSync(cleanDir, { force: true, recursive: true, maxRetries: 2 });
    }
    if (target.module) {
      params.push('--module', target.module);
    }
    if (target.moduleResolution) {
      params.push('--moduleResolution', target.moduleResolution);
    }
  }
  const result = await runYarn('exec', engine, ...params);
  if (result !== 0) {
    console.error(`Build (${target}) - failed with code ${result}`);
  } else {
    const end = Date.now();
    console.log(`Build (${target}) - succeeded in ${((end - start) / 1000).toFixed(2)}s`);
  }
  return result;
}

function createBuildTarget(options: ts.CompilerOptions, outDir: string, pkgType: TargetType, target: TargetType): BuildTarget {
  if (options.noEmit) {
    return { noEmit: true };
  }
  const buildTarget: BuildTarget = {
    outDir,
  };
  if (pkgType !== target) {
    buildTarget.module = target === 'cjs' ? 'commonjs' : 'esnext';
    buildTarget.moduleResolution = 'bundler';
  }
  return buildTarget;
}

export function getTypescriptBuildInfo(projRoot: ProjectRoot): TypescriptBuildInfo | undefined {
  if (!fs.existsSync(path.join(projRoot.root, 'tsconfig.json'))) {
    return undefined;
  }
  const pkgInfo = getPackageInfoFromPath(projRoot.root);
  const tsConfig = readTypeScriptConfig(pkgInfo);
  const options = tsConfig.options;
  const packageType = pkgInfo.manifest.type === 'module' ? 'esm' : 'cjs';
  const buildConfig = projRoot.resolvedBuildConfig.typescript;
  return {
    ...projRoot.resolvedBuildConfig.typescript,
    options,
    packageType,
    cjsTarget: createBuildTarget(options, buildConfig.cjsDir, packageType, 'cjs'),
    esmTarget: createBuildTarget(options, buildConfig.esmDir, packageType, 'esm'),
  } as TypescriptBuildInfo;
}
