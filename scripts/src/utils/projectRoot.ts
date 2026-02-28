import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import type { KitConfig } from '@rnx-kit/config';

export type ExportSet = {
  default?: string;
  types?: string;
  import?: string;
  require?: string;
};

export type ExportEntry = string | ExportSet;

export type Exports = Record<string, ExportEntry>;

export type PackageType = 'library' | 'component' | 'app' | 'tooling';

export type ResolvedBuildConfig = {
  packageType: PackageType;
  typescript: {
    /** whether to use tsc or tsgo to build this package */
    engine: 'tsc' | 'tsgo';
    /** cjs outDir - defaults to lib-commonjs */
    cjsDir: string;
    /** esm outDir - defaults to lib */
    esmDir: string;
    /** extra arguments to pass to the TypeScript compiler */
    extraArgs?: string;
    /** script to run for cjs build */
    cjsScript: string;
    /** script to run for esm build */
    esmScript: string;
    /** check script */
    checkScript: string;
  };
  depcheck: {
    ignoreMatches?: string[];
    ignorePatterns?: string[];
  };
};

export type RepoBuildConfig = Partial<Omit<ResolvedBuildConfig, 'typescript'> & { typescript: Partial<ResolvedBuildConfig['typescript']> }>;

export type PackageManifest = {
  // Most canonical identity and metadata fields
  name: string;
  version: string;
  private?: boolean;
  description?: string;
  keywords?: string[];
  license?: string;
  author?: string;
  contributors?: string[];
  homepage?: string;

  // Repository and issue tracking
  repository?: string | Record<string, unknown>;
  bugs?: Record<string, unknown> | string;

  // Package type and entry points
  type?: string;
  main?: string;
  module?: string;
  types?: string;
  typings?: string; // deprecated, use types instead
  exports?: Exports;

  // files, side effects, and bin
  files?: string[];
  sideEffects?: boolean;
  bin?: string | Record<string, string>;

  // scripts
  scripts?: Record<string, string>;

  // dependencies
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional: boolean }>;
  devDependencies?: Record<string, string>;

  // package manager, tools and environment
  packageManager?: string;
  engines?: Record<string, string>;
  os?: string[];
  cpu?: string[];

  // monorepo management
  workspaces?: string[] | { packages: string[] };
  resolutions?: Record<string, string>;

  // tool configurations
  furn?: RepoBuildConfig;
  'rnx-kit'?: KitConfig;
  eslintConfig?: Record<string, unknown>;
  jest?: Record<string, unknown>;
  prettier?: Record<string, unknown>;
  babel?: Record<string, unknown>;
  lage?: Record<string, unknown>;

  // publishing and distribution
  publishConfig?: Record<string, unknown>;
};

const defaultKeyOrder: string[] = [
  '$schema',
  'name',
  'displayName',
  'version',
  'stableVersion',
  'private',
  'description',
  'categories',
  'keywords',
  'homepage',
  'bugs',
  'repository',
  'funding',
  'license',
  'qna',
  'author',
  'maintainers',
  'contributors',
  'publisher',
  'sideEffects',
  'type',
  'imports',
  'exports',
  'main',
  'svelte',
  'umd:main',
  'jsdelivr',
  'unpkg',
  'module',
  'source',
  'jsnext:main',
  'browser',
  'react-native',
  'types',
  'typesVersions',
  'typings',
  'style',
  'example',
  'examplestyle',
  'assets',
  'bin',
  'man',
  'directories',
  'files',
  'workspaces',
  'binary',
  'scripts',
  'betterScripts',
  'l10n',
  'contributes',
  'activationEvents',
  'husky',
  'simple-git-hooks',
  'pre-commit',
  'commitlint',
  'lint-staged',
  'nano-staged',
  'config',
  'nodemonConfig',
  'browserify',
  'babel',
  'browserslist',
  'xo',
  'prettier',
  'eslintConfig',
  'eslintIgnore',
  'npmpkgjsonlint',
  'npmPackageJsonLintConfig',
  'npmpackagejsonlint',
  'release',
  'remarkConfig',
  'stylelint',
  'ava',
  'jest',
  'jest-junit',
  'jest-stare',
  'mocha',
  'nyc',
  'c8',
  'tap',
  'oclif',
  'resolutions',
  'overrides',
  'dependencies',
  'devDependencies',
  'dependenciesMeta',
  'peerDependencies',
  'peerDependenciesMeta',
  'optionalDependencies',
  'bundledDependencies',
  'bundleDependencies',
  'extensionPack',
  'extensionDependencies',
  'furn',
  'rnx-kit',
  'lage',
  'flat',
  'packageManager',
  'engines',
  'engineStrict',
  'devEngines',
  'volta',
  'languageName',
  'os',
  'cpu',
  'preferGlobal',
  'publishConfig',
  'icon',
  'badges',
  'galleryBanner',
  'preview',
  'markdown',
  'pnpm',
];

export type PackageRecordKeys = Extract<
  keyof PackageManifest,
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
  | 'scripts'
  | 'optionalDependencies'
  | 'resolutions'
  | 'exports'
>;

const recordKeys: PackageRecordKeys[] = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'peerDependenciesMeta',
  'scripts',
  'optionalDependencies',
  'resolutions',
  'exports',
] as const;
type RecordValueType<T> = T extends Record<string, infer TValue> ? TValue : never;

const scriptPath = normalizePath(path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
const rootPath = path.dirname(scriptPath);

const rootCache: Record<string, ProjectRoot> = {};

/**
 * Normalize a file path by replacing backslashes with forward slashes.
 */
export function normalizePath(p: string): string {
  return path.normalize(p).replaceAll('\\', '/');
}

/**
 * Returns a project root for the given path. This will load from a cache if available, and will throw if a package.json
 * cannot be found at the given path.
 * @param {string} [rootPath=process.cwd()]
 * @returns {ProjectRoot}
 */
export function getProjectRoot(rootPath: string = process.cwd()): ProjectRoot {
  const normalized = normalizePath(rootPath);
  return (rootCache[normalized] ??= new ProjectRoot(normalized));
}

/**
 * @returns {ProjectRoot}
 */
export function getScriptProjectRoot() {
  return getProjectRoot(scriptPath);
}

/**
 * @returns {ProjectRoot}
 */
export function getRepoProjectRoot() {
  return getProjectRoot(rootPath);
}

/**
 * Utilities for looking up information about a given package. This helps loading things like package.json multiple times
 * in a single process and centralizes some functionality.
 */
export class ProjectRoot {
  root: string;

  private _manifestText: string;
  private _manifest: PackageManifest;
  private _manifestKeys: string[];

  cachedRequire: ReturnType<typeof Module.createRequire> | undefined = undefined;

  constructor(rootPath: string) {
    const pkgJsonPath = path.join(rootPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      throw new Error(`No package.json found at ${pkgJsonPath}`);
    }
    this._manifestText = fs.readFileSync(pkgJsonPath, 'utf-8');
    this._manifest = JSON.parse(this._manifestText) ?? {};
    this._manifestKeys = this.initKeys(this._manifest);
    this.root = rootPath;
  }

  get manifest(): Readonly<PackageManifest> {
    return this._manifest;
  }

  /** @returns {NodeRequire} - built on demand and cached require function */
  get require() {
    return (this.cachedRequire ??= Module.createRequire(this.root));
  }

  /**
   * Reload the manifest from disk. Returns true if the manifest changed since the last reload.
   */
  reloadManifest(): boolean {
    const pkgJsonPath = path.join(this.root, 'package.json');
    const newText = fs.readFileSync(pkgJsonPath, 'utf-8');
    const changed = newText !== this._manifestText;
    if (changed) {
      this._manifestText = newText;
      this._manifest = JSON.parse(this._manifestText) ?? {};
      this._manifestKeys = this.initKeys(this._manifest);
    }
    return changed;
  }

  /**
   * Add or update an entry in the project manifest, maintaining key order.
   */
  setManifestEntry<K extends keyof PackageManifest>(key: K, value: Required<PackageManifest>[K]): Required<PackageManifest>[K] {
    this._manifest[key] = value;
    if (!this._manifestKeys.includes(key)) {
      const idealIndex = defaultKeyOrder.indexOf(key as string);
      if (idealIndex >= 0) {
        // find the first key after idealIndex that exists in _manifestKeys
        for (let i = idealIndex + 1; i < defaultKeyOrder.length; i++) {
          const nextKey = defaultKeyOrder[i];
          const existingIndex = this._manifestKeys.indexOf(nextKey);
          if (existingIndex >= 0) {
            // insert before existingIndex
            this._manifestKeys.splice(existingIndex, 0, key);
            return value;
          }
        }
      }
      // otherwise add the key to the end
      this._manifestKeys.push(key);
    }
    return value;
  }

  /**
   * Remove an entry in the project manifest
   */
  clearManifestEntry<K extends keyof PackageManifest>(key: K) {
    delete this._manifest[key];
    const index = this._manifestKeys.indexOf(key);
    if (index >= 0) {
      this._manifestKeys.splice(index, 1);
    }
  }

  updateRecordEntry<K extends PackageRecordKeys>(recordKey: K, valueKey: string, value: RecordValueType<PackageManifest[K]> | undefined) {
    if (value !== undefined) {
      const record = this.manifest[recordKey] ?? this.setManifestEntry(recordKey, {});
      record[valueKey] = value;
    } else {
      const existing = this.manifest[recordKey];
      if (existing && valueKey in existing) {
        delete existing[valueKey];
      }
    }
  }

  writeManifest() {
    // write the manifest to disk
    const pkgJsonPath = path.join(this.root, 'package.json');
    this.prepManifestForWrite();
    fs.writeFileSync(pkgJsonPath, JSON.stringify(this._manifest, null, 2) + '\n', 'utf-8');
  }

  /**
   * Open a module relative to this project root
   */
  openModule(moduleName: string): ProjectRoot {
    const pkgJsonPath = this.require.resolve(`${moduleName}/package.json`, { paths: [this.root] });
    return getProjectRoot(path.dirname(pkgJsonPath));
  }

  /**
   * Get the path to a bin entry for a js package.
   */
  getBinPath(command: string): string | undefined {
    const bin = this.manifest.bin;
    if (bin) {
      const binRelative = typeof bin === 'string' ? bin : bin[command];
      if (binRelative) {
        return normalizePath(path.join(this.root, binRelative));
      }
    }
    return undefined;
  }

  private initKeys(manifest: PackageManifest) {
    const keys: string[] = [];
    for (const key of defaultKeyOrder) {
      if (key in manifest) {
        keys.push(key);
      }
    }
    let prevIndex = -1;
    for (const key of Object.keys(manifest)) {
      const currentIndex = keys.indexOf(key);
      if (!keys.includes(key)) {
        // insert key in the first position after prevIndex
        prevIndex++;
        keys.splice(prevIndex, 0, key);
      } else {
        prevIndex = currentIndex;
      }
    }
    return keys;
  }

  get buildConfig(): RepoBuildConfig {
    return { ...this.manifest.furn };
  }

  private prepManifestForWrite() {
    for (const key of recordKeys) {
      this.prepRecordEntryForWrite(key);
    }
    const reordered: Record<string, unknown> = {};
    for (const key of this._manifestKeys) {
      reordered[key] = this._manifest[key as keyof PackageManifest];
    }
    this._manifest = reordered as PackageManifest;
  }

  prepRecordEntryForWrite<K extends PackageRecordKeys>(key: K) {
    const existingRecord = this.manifest[key];
    if (existingRecord) {
      const keys = Object.keys(existingRecord);
      if (keys.length === 0) {
        this.clearManifestEntry(key);
        return;
      }
      const orderedKeys = Object.keys(existingRecord).sort((a, b) => a.localeCompare(b));
      const newObj = Object.fromEntries(orderedKeys.map((key) => [key, existingRecord[key]])) as Required<PackageManifest>[K];
      this.setManifestEntry<K>(key, newObj);
    }
  }
}
