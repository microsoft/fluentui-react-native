import { getPackageInfoFromPath } from '@rnx-kit/tools-packages';
import { type RepoBuildConfig, type ProjectRoot, type ResolvedBuildConfig } from './projectRoot.ts';
import { readTypeScriptConfig } from '@rnx-kit/tools-typescript';
import fs from 'node:fs';
import path from 'node:path';
import type ts from 'typescript';

/**
 * Get a fully resolved build config for this package.
 * @param projRoot project root for this package
 * @param analyze whether to parse required config files for deeper analysis. Defaults to false.
 */
export function getResolvedConfig(projRoot: ProjectRoot, analyze?: boolean): ResolvedBuildConfig {
  const buildConfig = projRoot.buildConfig;
  return {
    packageType: buildConfig.packageType ?? 'library',
    typescript: getTypescriptBuildConfig(projRoot, buildConfig, analyze),
    depcheck: buildConfig.depcheck ?? {},
  };
}

function getTypescriptBuildConfig(
  projRoot: ProjectRoot,
  buildConfig: RepoBuildConfig,
  analyze?: boolean,
): ResolvedBuildConfig['typescript'] {
  const buildTsConfig = buildConfig.typescript || {};
  const { cjsDir = 'lib-commonjs', esmDir = 'lib', engine = 'tsgo', extraArgs } = buildTsConfig;
  const scripts = projRoot.manifest.scripts || {};
  let cjsScript = scripts['build-cjs'] ?? buildTsConfig.cjsScript ?? '';
  let esmScript = scripts['build-esm'] ?? buildTsConfig.esmScript ?? '';
  let checkScript = scripts['build-check'] ?? buildTsConfig.checkScript ?? '';
  if (analyze) {
    // helper to build up the correct build command
    function getScript(options: ts.CompilerOptions, outDir: string, isDefaultType: boolean, moduleType: 'commonjs' | 'esnext'): string {
      const parts: string[] = [engine];
      if (options.noEmit) {
        return '';
      }
      if (outDir !== options.outDir) {
        parts.push('--outDir', outDir);
      }
      if (!isDefaultType) {
        parts.push('--module', moduleType, '--moduleResolution', 'bundler');
      }
      if (extraArgs) {
        parts.push(extraArgs);
      }
      return parts.join(' ');
    }

    if (!fs.existsSync(path.join(projRoot.root, 'tsconfig.json'))) {
      // no tsconfig.json means no TypeScript build
      cjsScript = '';
      esmScript = '';
      checkScript = '';
    } else {
      const pkgInfo = getPackageInfoFromPath(projRoot.root);
      const tsConfig = readTypeScriptConfig(pkgInfo);
      const options = tsConfig.options;
      const isModule = pkgInfo.manifest.type === 'module';
      cjsScript = getScript(options, cjsDir, !isModule, 'commonjs');
      esmScript = getScript(options, esmDir, isModule, 'esnext');
      checkScript = options.noEmit ? engine : '';
    }
  }
  return { engine, cjsDir, esmDir, cjsScript, esmScript, checkScript, extraArgs };
}
