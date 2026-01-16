import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export type ExportSet = {
  default?: string;
  types?: string;
  import?: string;
  require?: string;
};

export type ExportEntry = string | ExportSet;

export type Exports = {
  '.': ExportEntry;
  [key: string]: ExportEntry;
};

export type PackageType = 'library' | 'component' | 'app' | 'tooling';

export type ResolvedBuildConfig = {
  packageType: PackageType;
  typescript: {
    engine: 'tsc' | 'tsgo';
    cjsDir: string;
    esmDir: string;
  };
  depcheck: {
    ignoreMatches?: string[];
    ignorePatterns?: string[];
  };
};

export type RepoBuildConfig = Partial<Omit<ResolvedBuildConfig, 'typescript'> & { typescript: Partial<ResolvedBuildConfig['typescript']> }>;

export type PackageManifest = {
  name: string;
  version: string;
  description?: string;
  license?: string;
  author?: string;
  private?: boolean;
  main?: string;
  module?: string;
  'react-native'?: string;
  types?: string;
  typings?: string;
  type?: string;
  exports?: Exports;
  bin?: string | Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  depcheck?: RepoBuildConfig['depcheck'];
  furn?: RepoBuildConfig;
  'rnx-kit'?: Record<string, unknown>;
};

const defaultKeyOrder = [
  'name',
  'version',
  'description',
  'license',
  'author',
  'private',
  'main',
  'module',
  'react-native',
  'types',
  'typings',
  'type',
  'exports',
  'bin',
  'scripts',
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'depcheck',
  'furn',
  'rnx-kit',
];

export type PackageRecordKeys = Extract<keyof PackageManifest, 'dependencies' | 'devDependencies' | 'peerDependencies' | 'scripts'>;
const recordKeys: PackageRecordKeys[] = ['dependencies', 'devDependencies', 'peerDependencies', 'scripts'];

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

  private _manifest: PackageManifest;
  private _manifestKeys: string[];

  cachedRequire: ReturnType<typeof Module.createRequire> | undefined = undefined;

  constructor(rootPath: string) {
    const pkgJsonPath = path.join(rootPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      throw new Error(`No package.json found at ${pkgJsonPath}`);
    }
    this._manifest = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')) ?? {};
    this._manifestKeys = Object.keys(this._manifest);
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

  updateRecordEntry(recordKey: PackageRecordKeys, valueKey: string, value: string | undefined) {
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

  get buildConfig(): RepoBuildConfig {
    const config = { ...this._manifest.furn } as RepoBuildConfig;
    if (this._manifest.depcheck) {
      config.depcheck = {
        ...this._manifest.depcheck,
        ...config.depcheck,
      };
    }
    return {
      ...this._manifest.furn,
    };
  }

  get resolvedBuildConfig(): ResolvedBuildConfig {
    const buildConfig = this.buildConfig;
    return {
      packageType: buildConfig.packageType ?? 'library',
      typescript: {
        engine: buildConfig.typescript?.engine ?? 'tsgo',
        cjsDir: buildConfig.typescript?.cjsDir ?? 'lib-commonjs',
        esmDir: buildConfig.typescript?.esmDir ?? 'lib',
      },
      depcheck: buildConfig.depcheck ?? {},
    };
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

  prepRecordEntryForWrite(key: PackageRecordKeys) {
    const existingRecord = this.manifest[key];
    if (existingRecord) {
      const keys = Object.keys(existingRecord);
      if (keys.length === 0) {
        this.clearManifestEntry(key);
        return;
      }
      const orderedKeys = Object.keys(existingRecord).sort((a, b) => a.localeCompare(b));
      this.setManifestEntry(key, Object.fromEntries(orderedKeys.map((key) => [key, existingRecord[key]])));
    }
  }
}
