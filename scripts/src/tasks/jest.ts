import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.ts';
import { hasJestConfig } from '../preinstall/tool-versions.ts';
import { PackageContext, type PlatformTarget } from '../pkgContext.ts';
import { PLATFORM_ENV_VAR, ALL_PLATFORMS } from '../const.ts';
import path from 'node:path';

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

export class JestCommand extends Command {
  static override paths = [['jest']];

  static override usage = Command.Usage({
    description: 'Tests the current package using jest',
    details: 'This command tests the current package.',
    examples: [['Test the current package', '$0 jest']],
  });

  args = Option.Proxy();

  async execute() {
    const context = PackageContext.init(process.cwd());
    if (!hasJestConfig(process.cwd())) {
      console.warn('No jest configuration found, skipping jest.');
      return;
    }
    const args = ['--passWithNoTests', '--runTestsByPath'];
    if (process.env.TF_BUILD) {
      args.push('--runInBand');
    }

    const defaultPlatform = getBaseJestPlatform(context);
    const targetFiles = getJestTargetFiles(context, defaultPlatform);
    if (targetFiles) {
      for (const key in targetFiles) {
        const platform = key as PlatformTarget;
        const files = targetFiles[platform];
        if (files && files.length > 0) {
          console.log(`Running jest for platform ${platform} with ${files.length} test files.`);
          const options = platform !== defaultPlatform ? { env: { ...process.env, [PLATFORM_ENV_VAR]: platform } } : undefined;
          const result = await runScript('jest', [...args, ...this.args, ...files], options);
          if (result !== 0) {
            return result;
          }
        }
      }
    } else {
      console.warn('No test files found for any platform, skipping jest.');
    }
    return 0;
  }
}

export function getBaseJestPlatform(context: PackageContext): PlatformTarget {
  return context.manifest.furn?.jestPlatform ?? 'ios';
}

/**
 * Get the list of test files for the given package context, defaulting to the base jest platform but allowing other platforms to
 * execute in parallel if they have platform-specific test files.
 */
export function getJestTargetFiles(
  context: PackageContext,
  defaultPlatform: PlatformTarget,
): Partial<Record<PlatformTarget, string[]>> | undefined {
  let results: Partial<Record<PlatformTarget, string[]>> | undefined = undefined;

  const files = context.files;
  for (const file of files) {
    let platform: string | undefined = undefined;
    const parts = path.parse(file);
    if (!SUPPORTED_EXTENSIONS.has(parts.ext)) {
      continue;
    }
    const suffixParts = parts.name.split('.');
    for (let i = suffixParts.length - 1; i > 0; i--) {
      const suffix = suffixParts[i].toLocaleLowerCase();
      if (!platform && ALL_PLATFORMS.includes(suffix as PlatformTarget)) {
        platform = suffix;
      } else if (suffix === 'test' || suffix === 'spec') {
        const key = (platform as PlatformTarget) ?? defaultPlatform;
        results ??= {};
        const fileList = (results[key] ??= []);
        fileList.push(file);
      } else {
        break;
      }
    }
  }
  return results;
}
