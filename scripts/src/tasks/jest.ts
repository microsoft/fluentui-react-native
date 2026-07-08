import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.ts';
import { hasJestConfig } from '../preinstall/tool-versions.ts';
import { PackageContext, type PlatformTarget } from '../pkgContext.ts';
import { PLATFORM_ENV_VAR, DEFULT_WIN_PLATFORM } from '../const.mts';
import { getFileMetadata } from '../utils/fileData.ts';

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
    const metadata = getFileMetadata(file);
    // we only care about source test files
    if (!metadata.isSource || !metadata.isTest) {
      continue;
    }
    results ??= {};
    let platform: string | undefined = undefined;
    if (defaultPlatform !== 'react') {
      // If the default platform is not 'react', check for platform-specific suffixes to multiplex the tests.
      platform = (metadata.platformSuffix ?? metadata.intermediateSuffix === 'win') ? DEFULT_WIN_PLATFORM : undefined;
    }
    // fall through to the default platform
    platform ??= defaultPlatform;
    const fileList = (results[platform as PlatformTarget] ??= []);
    fileList.push(file);
  }
  return results;
}
