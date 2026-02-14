import { Command, Option } from 'clipanion';
import type { PackageManifest, ResolvedBuildConfig } from '../utils/projectRoot.ts';
import { getProjectRoot, type ProjectRoot } from '../utils/projectRoot.ts';
import { getResolvedConfig } from '../utils/buildConfig.ts';
import { isFixMode } from '../utils/env.ts';
import { runAlignDeps } from './runAlignDeps.ts';
import { DepCheckRunner } from './depcheck.ts';
import { getCatalog } from '../utils/getCatalog.ts';
import fs from 'node:fs';
import path from 'node:path';

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

  fixDepWarnings = Option.Boolean('--fix-dep-warnings', false, {
    description: 'Automatically fix dependency warnings where possible, be very careful when using this option',
  });

  private changed = false;
  private issues = 0;
  private isScripts = false;
  private isLibrary = false;
  private projRoot: ProjectRoot = getProjectRoot(process.cwd());
  private result = 0;
  private removedDevDeps: string[] = [];
  private addedDevDeps: Record<string, string> = {};
  private ensuredCapabilities: string[] = [];
  private removedCapabilities: string[] = [];
  private getCatalog = getCatalog();

  async execute() {
    this.fix = isFixMode(this.fix);
    const manifest = this.projRoot.manifest;
    this.isScripts = manifest.name === '@fluentui-react-native/scripts';
    this.isLibrary = !(manifest['rnx-kit']?.kitType === 'app') && manifest.furn?.packageType !== 'tooling';

    const runningOps: Promise<void>[] = [];

    // kick off align deps or wait for it in fix mode
    if (this.fix) {
      await this.startAlignDepsCheck();
    } else {
      runningOps.push(this.startAlignDepsCheck());
    }

    // kick off depcheck or wait for it in fix mode
    if (this.fix) {
      await this.startDependencyCheck();
    } else {
      runningOps.push(this.startDependencyCheck());
    }

    // now do the custom linting
    const buildConfig = getResolvedConfig(this.projRoot, true);

    this.checkManifest();
    this.checkUsage();
    this.checkScripts();
    this.checkEntryPoints(buildConfig);
    this.checkBuildConfig(buildConfig);
    this.checkDependencies();
    this.checkDevDeps();
    this.checkPeerDeps();
    this.checkRnxKitConfig();
    await this.checkCatalogs();

    // report the results for the custom linting
    this.handleResult(this.issues > 0 ? 1 : 0, 'custom package rules');

    // wait for any queued ops to finish
    await Promise.all(runningOps);

    // write changes if in fix mode
    if (this.fix && this.changed) {
      this.projRoot.writeManifest();
      console.log('Updated package.json for ', this.projRoot.manifest.name);
    }

    return this.result;
  }

  private handleResult(code: number, source: string) {
    if (code !== 0) {
      console.error(`lint-package: ${source} failed with code`, code);
      this.result = code;
    }
  }

  private async startDependencyCheck() {
    const runner = new DepCheckRunner({
      verbose: false,
      fixErrors: this.fix,
      fixWarnings: this.fixDepWarnings,
      dryRun: false,
    });
    const result = await runner.execute();
    if (this.fix && runner.madeChanges()) {
      this.changed = true;
    }
    this.handleResult(result, 'depcheck');
  }

  private async startAlignDepsCheck() {
    if (!this.isScripts && this.projRoot.manifest['rnx-kit']?.alignDeps) {
      const result = await runAlignDeps(this.projRoot.root, this.fix);
      if (this.fix) {
        this.changed = this.projRoot.reloadManifest();
      }
      this.handleResult(result, 'align-deps');
    }
  }

  private checkManifest() {
    const manifest = this.projRoot.manifest;
    this.warnIf(!manifest.description, 'Package is missing a description field');
    this.errorIf(manifest.typings !== undefined, 'typings field is deprecated; use types instead', () => {
      if (manifest.types === undefined && manifest.typings !== undefined) {
        this.projRoot.setManifestEntry('types', manifest.typings);
      }
      this.projRoot.clearManifestEntry('typings');
    });
  }

  private checkUsage() {
    const rootDir = this.projRoot.root;
    if (this.isLibrary) {
      this.ensuredCapabilities.push('tools-core');
      const hasJestConfig = fs.existsSync(path.join(rootDir, 'jest.config.js')) || fs.existsSync(path.join(rootDir, 'jest.config.ts'));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasReactJest = this.projRoot.manifest['rnx-kit']?.alignDeps?.capabilities?.includes('tools-jest-react' as any);
      if (!hasReactJest) {
        if (hasJestConfig) {
          this.ensuredCapabilities.push('tools-jest');
          this.addedDevDeps['@fluentui-react-native/jest-config'] = 'workspace:*';
        } else {
          this.removedCapabilities.push('tools-jest', 'babel-preset-react-native', 'tools-babel');
          this.removedDevDeps.push('@fluentui-react-native/jest-config', '@types/jest', 'jest', 'ts-jest');
        }
      }
    }
  }

  private checkDependencies() {
    const manifest = this.projRoot.manifest;
    if (manifest['rnx-kit']?.kitType === 'app') {
      return;
    }
    const dependencies = manifest.dependencies || {};
    this.errorIf(dependencies.react !== undefined, 'react should be a peerDependency, not a dependency');
    this.errorIf(dependencies['react-native'] !== undefined, 'react-native should be a peerDependency, not a dependency');
    this.errorIf(dependencies['react-native-macos'] !== undefined, 'react-native-macos should be a peerDependency, not a dependency');
    this.errorIf(dependencies['react-native-windows'] !== undefined, 'react-native-windows should be a peerDependency, not a dependency');
    this.errorIf(
      dependencies['@office-iss/react-native-win32'] !== undefined,
      '@office-iss/react-native-win32 should be a peerDependency, not a dependency',
    );
    if (manifest.furn?.packageType !== 'tooling') {
      this.addedDevDeps['@fluentui-react-native/kit-config'] = 'workspace:*';
    }
  }

  private checkDevDeps() {
    const issues: string[] = [];
    const devDependencies = this.projRoot.manifest.devDependencies || {};
    for (const depName of this.removedDevDeps) {
      if (devDependencies[depName] !== undefined) {
        issues.push(`- devDependency ${depName} should be removed`);
        this.projRoot.updateRecordEntry('devDependencies', depName, undefined);
      }
    }
    for (const [depName, depVersion] of Object.entries(this.addedDevDeps)) {
      if (devDependencies[depName] === undefined) {
        issues.push(`- devDependency ${depName} should be added`);
        this.projRoot.updateRecordEntry('devDependencies', depName, depVersion);
      }
    }
    this.errorIf(issues.length > 0, issues.join('\n'), () => {
      // changes already applied above
    });
  }

  private checkPeerDeps() {
    const issues: string[] = [];
    const manifest = this.projRoot.manifest;
    const peerDeps = new Set<string>(Object.keys(manifest.peerDependencies || {}));
    if (peerDeps.has('@types/react')) {
      if (!manifest.peerDependenciesMeta) {
        this.projRoot.setManifestEntry('peerDependenciesMeta', {});
        issues.push('- peerDependenciesMeta field should be added for optional peer dependencies');
      }
      const peerDepsMeta = manifest.peerDependenciesMeta || {};
      if (!peerDepsMeta['@types/react'] || !peerDepsMeta['@types/react'].optional) {
        this.projRoot.updateRecordEntry('peerDependenciesMeta', '@types/react', { optional: true });
        issues.push('- @types/react should be marked as an optional peer dependency');
      }
    }
    const peerDepsMeta = manifest.peerDependenciesMeta || {};
    for (const depName of Object.keys(peerDepsMeta)) {
      if (!peerDeps.has(depName)) {
        issues.push(`- peerDependenciesMeta entry for ${depName} should be removed since it's not a declared peer dependency`);
        this.projRoot.updateRecordEntry('peerDependenciesMeta', depName, undefined);
      }
    }

    this.errorIf(issues.length > 0, issues.join('\n'), () => {
      // changes already applied above
    });
  }

  private checkRnxKitConfig() {
    const projRoot = this.projRoot;
    const manifest = projRoot.manifest;
    if (manifest.furn?.packageType === 'tooling') {
      return;
    }
    const rnxKitIssues: string[] = [];
    if (manifest['rnx-kit'] === undefined) {
      rnxKitIssues.push('- Missing rnx-kit configuration');
    }
    const rnxKitConfig = manifest['rnx-kit'] || {};
    if (rnxKitConfig.kitType === undefined) {
      rnxKitIssues.push('- Missing rnx-kit.kitType field');
      rnxKitConfig.kitType = 'library';
    }
    if (rnxKitConfig.extends === undefined) {
      rnxKitIssues.push('- Missing rnx-kit.extends field');
      rnxKitConfig.extends = '@fluentui-react-native/kit-config';
    }
    if (!rnxKitConfig.alignDeps) {
      rnxKitIssues.push('- Missing rnx-kit.alignDeps field');
      rnxKitConfig.alignDeps = {};
    }
    const alignDeps = rnxKitConfig.alignDeps || {};
    if (alignDeps.presets !== undefined) {
      rnxKitIssues.push('- rnx-kit.alignDeps.presets should come from the root configuration');
      delete alignDeps.presets;
    }
    const capabilities: string[] = alignDeps.capabilities || [];
    for (const removedCap of this.removedCapabilities) {
      const index = capabilities.indexOf(removedCap);
      if (index >= 0) {
        rnxKitIssues.push(`- rnx-kit.alignDeps.capabilities should not include "${removedCap}"`);
        capabilities.splice(index, 1);
      }
    }
    for (const ensuredCap of this.ensuredCapabilities) {
      if (!capabilities.includes(ensuredCap)) {
        rnxKitIssues.push(`- rnx-kit.alignDeps.capabilities is missing "${ensuredCap}"`);
        capabilities.push(ensuredCap);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alignDeps.capabilities = capabilities.sort() as any[];
    this.errorIf(rnxKitIssues.length > 0, rnxKitIssues.join('\n'), () => {
      projRoot.setManifestEntry('rnx-kit', rnxKitConfig);
    });
  }

  private async checkCatalogs() {
    const catalog = await this.getCatalog;
    this.checkCatalogUsage('dependencies', catalog);
    this.checkCatalogUsage('devDependencies', catalog);
  }

  private checkCatalogUsage(key: 'dependencies' | 'devDependencies', catalog: Record<string, string>) {
    const depSet = this.projRoot.manifest[key] || {};
    for (const depName of Object.keys(depSet)) {
      if (catalog[depName] !== undefined) {
        this.errorIf(depSet[depName] !== 'catalog:', `- ${key}: ${depName} should use "catalog:" version specifier`, () => {
          this.projRoot.updateRecordEntry(key, depName, 'catalog:');
        });
      }
    }
  }

  private checkScripts() {
    const scripts = this.projRoot.manifest.scripts || {};
    this.warnIf(scripts['just'] !== undefined, 'just script is deprecated, can invoke by calling yarn fluentui-scripts instead', () => {
      this.projRoot.updateRecordEntry('scripts', 'just', undefined);
    });
    this.warnIf(scripts['prettier-fix'] !== undefined, 'prettier-fix script is deprecated, use prettier --fix instead', () => {
      this.projRoot.updateRecordEntry('scripts', 'prettier-fix', undefined);
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

  private checkEntryPoints(buildConfig: ResolvedBuildConfig) {
    const manifest = this.projRoot.manifest;
    const { main, module, private: isPrivate } = manifest;
    const { cjsDir, esmDir } = buildConfig.typescript;
    this.validateEntryPoint(manifest, 'main', cjsDir, esmDir);
    this.validateEntryPoint(manifest, 'module', esmDir, cjsDir);
    if (!isPrivate) {
      this.errorIf(Boolean(!manifest.exports && (main || module)), 'Missing exports field for public package', () => {
        const newExports = { '.': {} };
        this.projRoot.setManifestEntry('exports', newExports);
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

  private checkBuildConfig(buildConfig: ResolvedBuildConfig) {
    const { cjsScript, esmScript } = buildConfig.typescript;
    const hasBuilds = Boolean(cjsScript || esmScript);
    const scripts = this.projRoot.manifest.scripts || {};

    const buildScriptText = this.getFluentScriptsText('build');
    this.errorIf(hasBuilds && scripts.build !== buildScriptText, 'Missing or incorrect build script', () => {
      this.projRoot.updateRecordEntry('scripts', 'build', buildScriptText);
    });
    if (cjsScript) {
      this.errorIf(scripts['build-cjs'] !== cjsScript, 'Missing or incorrect build-cjs script', () => {
        this.projRoot.updateRecordEntry('scripts', 'build-cjs', cjsScript);
      });
    } else {
      this.errorIf(scripts['build-cjs'] !== undefined, 'Extraneous build-cjs script', () => {
        this.projRoot.updateRecordEntry('scripts', 'build-cjs', undefined);
      });
    }
    if (esmScript) {
      this.errorIf(scripts['build-esm'] !== esmScript, 'Missing or incorrect build-esm script', () => {
        this.projRoot.updateRecordEntry('scripts', 'build-esm', esmScript);
      });
    } else {
      this.errorIf(scripts['build-esm'] !== undefined, 'Extraneous build-esm script', () => {
        this.projRoot.updateRecordEntry('scripts', 'build-esm', undefined);
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
