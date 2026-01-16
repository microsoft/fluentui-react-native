import { Command, Option } from 'clipanion';
import { getProjectRoot, type ProjectRoot } from '../utils/projectRoot.ts';
import { getTypescriptBuildInfo } from './build.ts';

const buildScript = 'fluentui-scripts build';
const buildCjsScript = 'tsgo --outDir lib-commonjs';
const buildEsmScript = 'tsgo --outDir lib --module esnext --moduleResolution bundler';
const buildCheckScript = 'tsgo --noEmit';

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
    this.fix = this.fix || Boolean(process.env.FURN_FIX_MODE);
    const cwd = process.cwd();
    const projRoot = getProjectRoot(cwd);
    this.isScripts = projRoot.manifest.name === '@fluentui-react-native/scripts';

    this.checkManifest(projRoot);
    this.checkBuildConfig(projRoot);
    if (this.fix && this.changed) {
      projRoot.writeManifest();
      console.log('Updated package.json for ', projRoot.manifest.name);
    }
    return this.issues > 0 ? 1 : 0;
  }

  private checkManifest(projRoot: ProjectRoot) {
    const manifest = projRoot.manifest;
    this.warnIf(!manifest.description, 'Package is missing a description field');
    this.warnIf(manifest['react-native'] !== undefined, 'Currently we should not use the react-native field', () => {
      projRoot.clearManifestEntry('react-native');
    });
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

  private checkBuildConfig(projRoot: ProjectRoot) {
    const tsconfig = getTypescriptBuildInfo(projRoot);
    if (!tsconfig || this.isScripts) {
      return;
    }
    const cjsScript = tsconfig.options.noEmit ? buildCheckScript : buildCjsScript;
    const esmScript = tsconfig.options.noEmit ? buildCheckScript : buildEsmScript;
    const scripts = projRoot.manifest.scripts || {};
    this.errorIf(scripts.build !== buildScript, 'Missing build script', () => {
      projRoot.updateRecordEntry('scripts', 'build', buildScript);
    });
    this.errorIf(scripts['build-cjs'] !== cjsScript, 'Missing build-cjs script', () => {
      projRoot.updateRecordEntry('scripts', 'build-cjs', cjsScript);
    });
    this.errorIf(scripts['build-esm'] !== esmScript, 'Missing build-esm script', () => {
      projRoot.updateRecordEntry('scripts', 'build-esm', esmScript);
    });
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

  errorIf(check: boolean, message: string, fixFn?: () => void) {
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
}
