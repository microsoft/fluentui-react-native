import { PackageValidationContext, type PackageValidationOptions, createYarnWorkspaceValidator } from '@rnx-kit/lint-package';
import { createJSONValidator, type JSONObject, type JSONValidator } from '@rnx-kit/lint-json';
import type { PackageManifest as PackageManifestBase } from '@rnx-kit/types-node';
import type { Yarn } from '@yarnpkg/types';
import path from 'node:path';
import fs from 'node:fs';
import { styleText } from 'util';
import type { NATIVE_PLATFORMS, REACT_PLATFORM } from './const.ts';

export type PackageType = 'library' | 'component' | 'app' | 'tooling';
export type NativeTargets = (typeof NATIVE_PLATFORMS)[number];
export type PlatformTarget = typeof REACT_PLATFORM | NativeTargets;

export type FurnConfig = {
  packageType?: PackageType;
  jestPlatform?: PlatformTarget;
  platforms?: NativeTargets[];
  depcheck?: {
    ignoreMatches?: string[];
    ignorePatterns?: string[];
  };
  knip?: {
    entry?: string[];
    extraEntries?: string[];
    project?: string[];
    extraProject?: string[];
  };
};

export type PackageManifest = PackageManifestBase & {
  furn?: FurnConfig;
};

export class PackageContext extends PackageValidationContext<PackageManifest> {
  /**
   * Create a package validation context for a given package root
   * @param root the root directory of the package
   * @param options optional options for additional configuration
   * @returns a new PackageContext instance
   */
  static init(root: string, options?: PackageValidationOptions<PackageManifest>): PackageContext {
    root = path.resolve(root);
    const { manifest, ...innerOptions } = options || {};
    const jsonPath = path.join(root, 'package.json');
    innerOptions.header ??= `${styleText('red', 'errors')} in package at ${styleText('cyan', path.relative(process.cwd(), root))}:`;
    const validator = createJSONValidator(jsonPath, manifest as JSONObject, innerOptions);
    return new PackageContext(root, validator);
  }
  /**
   * Create a package validation context for a Yarn workspace
   * @param workspace the Yarn workspace to validate
   * @returns a new PackageContext instance
   */
  static initYarn(workspace: Yarn.Constraints.Workspace): PackageContext {
    const validator = createYarnWorkspaceValidator(workspace);
    return new PackageContext(workspace.cwd, validator);
  }

  protected constructor(root: string, validator: JSONValidator) {
    super(root, validator);
  }

  private _files?: string[];

  static BLOCKED_DIRS = new Set(['node_modules', 'dist', 'lib', 'lib-commonjs', 'lib-esm', 'build', '.git', '.vscode', '.idea']);

  get files(): string[] {
    return (this._files ??= getFilesSync(this.root, PackageContext.BLOCKED_DIRS));
  }

  async getFiles(): Promise<string[]> {
    return (this._files ??= await getAllFiles(this.root, PackageContext.BLOCKED_DIRS));
  }
}

async function getAllFiles(dir: string, excludedDirs?: Set<string>): Promise<string[]> {
  const results: string[] = [];

  async function walkDir(current: string, excluded?: Set<string>): Promise<void> {
    const entries = await fs.promises.readdir(current, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        if (entry.isDirectory()) {
          if (!excluded || !excluded.has(entry.name)) {
            await walkDir(path.join(current, entry.name));
          }
        } else {
          results.push(path.join(current, entry.name));
        }
      }),
    );
  }

  await walkDir(dir, excludedDirs);
  return results;
}

function getFilesSync(dir: string, excludedDirs?: Set<string>): string[] {
  const results: string[] = [];

  function walkDir(current: string, excluded?: Set<string>): void {
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!excluded || !excluded.has(entry.name)) {
          walkDir(path.join(current, entry.name));
        }
      } else {
        results.push(path.join(current, entry.name));
      }
    }
  }

  walkDir(dir, excludedDirs);
  return results;
}
