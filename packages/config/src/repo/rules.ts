import type { JestPlatform, PackageManifest } from './manifest.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __packageDir = path.dirname(path.dirname(__dirname));

export type ReportMetadata = {
  changedManifest?: boolean;
};

export type RuleContext = {
  /** root directory of the package */
  readonly root: string;

  /** manifest of the package */
  manifest: PackageManifest;

  /** fix mode */
  readonly fix: boolean;

  /** report an action */
  readonly report: (level: 'error' | 'warn' | 'info', message: string, metadata?: ReportMetadata) => void;
};

export type Rule = (context: RuleContext) => void | Promise<void>;

export type RuleSet = {
  [ruleName: string]: Rule;
};

const rules: RuleSet = {
  'valid-eslint': validateEslintConfig,
  'valid-jest': validateJestConfig,
  'valid-tsconfig': validTsConfig,
};

function validateEslintConfig(context: RuleContext): void {
  const { fix, report, root, manifest } = context;
  if (manifest.scripts?.lint) {
    if (fs.existsSync(path.join(root, 'eslint.config.js'))) {
      if (fix) {
        fs.rmSync(path.join(root, 'eslint.config.js'));
        report('info', 'Removed eslint.config.js');
      } else {
        report('error', 'Package should be using eslint.config.cjs instead of eslint.config.js');
      }
    }
    const eslintSrc = fs.readFileSync(path.join(__dirname, '../../templates/eslint.config.cjs'), 'utf-8');
    const targetPath = path.join(root, 'eslint.config.cjs');
    if (!fs.existsSync(targetPath) || fs.readFileSync(targetPath, 'utf-8') !== eslintSrc) {
      if (fix) {
        fs.writeFileSync(targetPath, eslintSrc, { encoding: 'utf-8' });
        report('info', 'Updated eslint.config.cjs to match template');
      } else {
        report('error', 'eslint.config.cjs is missing or does not match the expected template');
      }
    }
  }
}

function validateJestConfig(context: RuleContext): void {
  const { fix, report, root, manifest } = context;
  if (manifest.scripts?.test) {
    const jestConfigPath = path.join(root, 'jest.config.js');
    if (fs.existsSync(jestConfigPath)) {
      const jestSrc = fs.readFileSync(jestConfigPath, 'utf-8');
      // capture the jest platform from the configureReactNativeJest('android') call
      const platformMatch = jestSrc.match(/configureReactNativeJest\(['"](\w+)['"]\)/);
      const platform = platformMatch ? platformMatch[1] : undefined;
      // get the relative path from root to this package's root in posix form
      const relativePath = path.posix.normalize(path.relative(root, __packageDir));
      const presetValue = `<rootDir>/${relativePath}`;
      const oldBabelPath = path.join(root, 'babel.config.js');
      const oldBabelExists = fs.existsSync(oldBabelPath);
      if (platform && manifest.furn?.jestPlatform !== platform) {
        if (fix) {
          report('info', `Updating jest platform to ${platform}`, { changedManifest: true });
          manifest.furn ??= {};
          manifest.furn.jestPlatform = platform as JestPlatform;
        } else {
          report('error', `jestPlatform should be set to ${platform}`);
        }
      }
      if (oldBabelExists) {
        if (fix) {
          fs.rmSync(oldBabelPath);
          report('info', 'Removed babel.config.js');
        } else {
          report('error', 'Local babel.config.js should be removed');
        }
      }

      if (fix) {
        fs.rmSync(jestConfigPath);
        manifest.jest ??= {};
        (manifest.jest as Record<string, unknown>).preset = presetValue;
        report('info', 'Removed jest.config.js and updated manifest.jest.preset to match expected template', { changedManifest: true });
      }
    }
  }
}

function validTsConfig(context: RuleContext): void {
  const { fix, report, root, manifest } = context;
  const tsConfigPath = path.join(root, 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
    let edit = false;
    const noEmit = tsConfig.compilerOptions?.noEmit;
    if (tsConfig.extends && !tsConfig.extends.startsWith('@fluentui-react-native/config/tsconfig')) {
      if (fix) {
        tsConfig.extends = '@fluentui-react-native/config/tsconfig.json';
        edit = true;
      } else {
        report('error', 'tsconfig should extend from @fluentui-react-native/config/tsconfig*.json');
      }
    }
    if (!noEmit && tsConfig.compilerOptions?.rootDir !== 'src') {
      if (fix) {
        tsConfig.compilerOptions ??= {};
        tsConfig.compilerOptions.rootDir = 'src';
        edit = true;
      } else {
        report('error', 'tsconfig should have compilerOptions.rootDir set to src');
      }
    }
    if (manifest.type === 'module' && !noEmit && tsConfig.compilerOptions?.outDir !== 'lib') {
      if (fix) {
        tsConfig.compilerOptions ??= {};
        tsConfig.compilerOptions.outDir = 'lib';
        edit = true;
      } else {
        report('error', 'tsconfig should have compilerOptions.outDir set to lib for ESM packages');
      }
    }
    if (edit) {
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2), { encoding: 'utf-8' });
      report('info', 'Updated tsconfig.json to match template', { changedManifest: true });
    }
  }
}

export async function runRules(context: RuleContext) {
  for (const [ruleName, rule] of Object.entries(rules)) {
    try {
      await rule(context);
    } catch (err) {
      context.report('error', `Error running rule ${ruleName}: ${(err as Error).message}`);
    }
  }
}
