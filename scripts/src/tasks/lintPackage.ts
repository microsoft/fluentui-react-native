import { Command, Option } from 'clipanion';
import type { PackageManifest, ResolvedBuildConfig } from '../utils/projectRoot.ts';
import { getProjectRoot, type ProjectRoot } from '../utils/projectRoot.ts';
import { getResolvedConfig } from '../utils/buildConfig.ts';
import { isFixMode } from '../utils/env.ts';

export class LintPackageCommand extends Command {
  static override paths = [['lint-package']];

  static override usage = Command.Usage({
    description: 'Lint the current package configuration',
    details:
      'This command analyzes the current package configuration for potential issues. When --fix is specified, it will attempt to automatically fix any detected problems.',
    examples: [['Lint the current package', '$0 lint-package']],
  });

  fix = Option.Boolean('--fix', false, {
    description: 'Automatically fix detected issues where possible',
  });

  private changed = false;
  private issues = 0;
  private isScripts = false;

  async execute() {
    this.fix = isFixMode(this.fix);
    const cwd = process.cwd();
    const projRoot = getProjectRoot(cwd);
    const buildConfig = getResolvedConfig(projRoot, true);
    this.isScripts = projRoot.manifest.name === '@fluentui-react-native/scripts';

    this.checkManifest(projRoot);
    this.checkScripts(projRoot);
    this.checkEntryPoints(projRoot, buildConfig);
    this.checkBuildConfig(projRoot, buildConfig);
    if (this.fix && this.changed) {
      projRoot.writeManifest();
      console.log('Updated package.json for ', projRoot.manifest.name);
    }
    return this.issues > 0 ? 1 : 0;
  }

  private checkManifest(projRoot: ProjectRoot) {
    const manifest = projRoot.manifest;
    this.warnIf(!manifest.description, 'Package is missing a description field');
    this.warnIf(manifest.depcheck !== undefined, 'depcheck should be under the furn field', () => {
      const buildConfig = projRoot.buildConfig;
      projRoot.setManifestEntry('furn', buildConfig);
      projRoot.clearManifestEntry('depcheck');
    });
    this.errorIf(manifest.typings !== undefined, 'typings field is deprecated; use types instead', () => {
      if (manifest.types === undefined && manifest.typings !== undefined) {
        projRoot.setManifestEntry('types', manifest.typings);
      }
      projRoot.clearManifestEntry('typings');
    });
  }

  private checkScripts(projRoot: ProjectRoot) {
    const scripts = projRoot.manifest.scripts || {};
    this.warnIf(scripts['just'] !== undefined, 'just script is deprecated, can invoke by calling yarn fluentui-scripts instead', () => {
      projRoot.updateRecordEntry('scripts', 'just', undefined);
    });
    this.warnIf(scripts['prettier-fix'] !== undefined, 'prettier-fix script is deprecated, use prettier --fix instead', () => {
      projRoot.updateRecordEntry('scripts', 'prettier-fix', undefined);
    });
  }

  private validateEntryPoint<T, K extends keyof T>(collection: T, key: K, expectedOutDir: string, otherOutDir: string) {
    const entryPoint = typeof collection[key] === 'string' ? (collection[key] as string) : undefined;
    if (entryPoint) {
      const normalizedEntry = removeDotPrefix(entryPoint) + '/';
      const expected = `${expectedOutDir}/`;
      const notExpected = `${otherOutDir}/`;
      this.errorIf(
        normalizedEntry.startsWith(notExpected),
        `Entry point ${String(key)} (${entryPoint}) should not be in output ${expectedOutDir}`,
        () => {
          collection[key] = entryPoint.replace(notExpected, expected) as T[K];
        },
      );
    }
  }

  private validateExportsGroup(manifest: PackageManifest, groupName: string, isDefault: boolean, buildConfig: ResolvedBuildConfig) {
    const exports = manifest.exports;
    if (!exports) {
      return;
    }

    const groupEntry = exports[groupName];
    const group = typeof groupEntry === 'object' && !Array.isArray(groupEntry) ? groupEntry : undefined;
    if (group || isDefault) {
      const updated = { ...group };
      const keys = Object.keys(updated);
      const errors: string[] = [];
      if (!group) {
        errors.push(`Missing required exports group ${groupName}`);
      }
      if (updated.types && keys[0] !== 'types') {
        errors.push(`'types' entry should be first in exports for ${groupName}`);
      }
      if (isDefault) {
        const manifestTypes = manifest.types ? toDotPrefix(manifest.types) : undefined;
        const manifestModule = manifest.module ? toDotPrefix(manifest.module) : undefined;
        const manifestMain = manifest.main ? toDotPrefix(manifest.main) : undefined;
        if (manifestTypes && updated.types !== manifestTypes) {
          errors.push(`'types' entry in exports does not match manifest.types`);
          updated.types = manifestTypes;
        }
        if (manifestModule && updated.import !== manifestModule) {
          errors.push(`'import' entry in exports does not match manifest.module`);
          updated.import = manifestModule;
        }
        if (manifestMain && updated.require !== manifestMain) {
          errors.push(`'require' entry in exports does not match manifest.main`);
          updated.require = manifestMain;
        }
      }
      const esmDir = buildConfig.typescript.esmDir;
      const cjsDir = buildConfig.typescript.cjsDir;
      this.validateEntryPoint(updated, 'import', esmDir, cjsDir);
      this.validateEntryPoint(updated, 'require', cjsDir, esmDir);
      if (updated.import && updated.require && keys.indexOf('import') > keys.indexOf('require')) {
        errors.push(`'import' entry should come before 'require' in exports for ${groupName}`);
      }
      if (updated.default && keys[keys.length - 1] !== 'default') {
        errors.push(`'default' entry should be last in exports for ${groupName}`);
      }
      this.errorIf(errors.length > 0, errors.join('\n'), () => {
        const { types, import: imp, require: req, default: def, ...rest } = updated;
        // restructure the group to have types, <custom>, import, require, default in order
        exports[groupName] = {
          ...(types && { types }),
          ...rest,
          ...(imp && { import: imp }),
          ...(req && { require: req }),
          ...(def && { default: def }),
        };
      });
    }
  }

  private checkEntryPoints(projRoot: ProjectRoot, buildConfig: ResolvedBuildConfig) {
    const manifest = projRoot.manifest;
    const { main, module, private: isPrivate } = manifest;
    const { cjsDir, esmDir } = buildConfig.typescript;
    this.validateEntryPoint(manifest, 'main', cjsDir, esmDir);
    this.validateEntryPoint(manifest, 'module', esmDir, cjsDir);
    if (!isPrivate) {
      this.errorIf(Boolean(!manifest.exports && (main || module)), 'Missing exports field for public package', () => {
        const newExports = { '.': {} };
        projRoot.setManifestEntry('exports', newExports);
      });
    }
    const exports = manifest.exports;
    if (exports) {
      const defaultExport = exports['.'];
      // this is really only ok for packages that only have a single build output and no types like a config package
      const validStringExport = typeof defaultExport === 'string' && !(main && module && main !== module && manifest.types === undefined);
      if (typeof defaultExport !== 'string' || !validStringExport) {
        this.validateExportsGroup(manifest, '.', true, buildConfig);
      }
      for (const key of Object.keys(exports)) {
        if (key !== '.') {
          this.validateExportsGroup(manifest, key, false, buildConfig);
        }
      }
    }
  }

  private checkBuildConfig(projRoot: ProjectRoot, buildConfig: ResolvedBuildConfig) {
    const { cjsScript, esmScript } = buildConfig.typescript;
    const hasBuilds = Boolean(cjsScript || esmScript);
    const scripts = projRoot.manifest.scripts || {};

    const buildScriptText = this.getFluentScriptsText('build');
    this.errorIf(hasBuilds && scripts.build !== buildScriptText, 'Missing or incorrect build script', () => {
      projRoot.updateRecordEntry('scripts', 'build', buildScriptText);
    });
    if (cjsScript) {
      this.errorIf(scripts['build-cjs'] !== cjsScript, 'Missing or incorrect build-cjs script', () => {
        projRoot.updateRecordEntry('scripts', 'build-cjs', cjsScript);
      });
    } else {
      this.errorIf(scripts['build-cjs'] !== undefined, 'Extraneous build-cjs script', () => {
        projRoot.updateRecordEntry('scripts', 'build-cjs', undefined);
      });
    }
    if (esmScript) {
      this.errorIf(scripts['build-esm'] !== esmScript, 'Missing or incorrect build-esm script', () => {
        projRoot.updateRecordEntry('scripts', 'build-esm', esmScript);
      });
    } else {
      this.errorIf(scripts['build-esm'] !== undefined, 'Extraneous build-esm script', () => {
        projRoot.updateRecordEntry('scripts', 'build-esm', undefined);
      });
    }
  }

  private warnIf(check: boolean, message: string, fixFn?: () => void) {
    if (check) {
      if (this.fix && fixFn) {
        fixFn();
        this.changed = true;
        console.log(`- Fixed: ${message}`);
      } else {
        console.warn(`- Warning: ${message}`);
      }
    }
  }

  private errorIf(check: boolean, message: string, fixFn?: () => void) {
    if (check) {
      if (this.fix && fixFn) {
        fixFn();
        this.changed = true;
        console.log(`- Fixed: ${message}`);
      } else {
        console.error(`- Error: ${message}`);
        this.issues++;
      }
    }
  }

  private getFluentScriptsText(command: string) {
    return this.isScripts ? `node ./src/cli.mjs ${command}` : `fluentui-scripts ${command}`;
  }
}

function toDotPrefix(path: string) {
  return path.startsWith('./') ? path : `./${path}`;
}

function removeDotPrefix(path: string) {
  return path.startsWith('./') ? path.slice(2) : path;
}
