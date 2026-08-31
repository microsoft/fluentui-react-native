import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  DesktopCommand,
  DesktopCommandPlan,
  DesktopNativeProjectOptions,
  DesktopPlatformOptions,
  DesktopPlatformOptionsMap,
  DesktopSmokeOptions,
  DesktopStorybookAction,
} from './commands.ts';
import { getAllPlatforms, getPlatform, isPlatform } from './platforms.ts';
import type { Platforms } from './platforms.ts';

const defaultStoryPatterns = ['src/**/*.stories.?(ts|tsx)'] as const;
const defaultDeviceAddons = ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'] as const;
const defaultMacOSBundleIdentifier = 'com.microsoft.ReactTestApp';
const defaultTestIDPrefix = 'storybook-desktop';

type JsonObject = Record<string, unknown>;

type PackageManifest = JsonObject & {
  name?: string;
};

type AppManifest = JsonObject & {
  components?: {
    appKey?: string;
    displayName?: string;
  }[];
  displayName?: string;
  macos?: {
    bundleIdentifier?: string;
  };
  name?: string;
  storybook?: {
    testIDPrefix?: string;
  };
};

export type PlatformStorySettings = {
  /**
   * Story glob patterns that replace the package or global patterns on this platform.
   */
  storyPatterns?: readonly string[];
};

export type StorySettings = {
  /**
   * Platforms on which the package's stories are included.
   * @default all desktop platforms available to the consuming app
   */
  platforms?: readonly Platforms[];

  /**
   * Story glob patterns to search within each package.
   * @default all .stories.ts and .stories.tsx files beneath src
   */
  storyPatterns?: readonly string[];

  /**
   * Platform-specific pattern overrides.
   */
  platformSettings?: Partial<Record<Platforms, PlatformStorySettings>>;
};

export type StoryPackageSpec = string | readonly [packageName: string, settings: Partial<StorySettings>];

export type DesktopStorybookConfigOptions = StorySettings & {
  /**
   * Path to the consuming app. A file URL is convenient from storybook.config.ts.
   * @default process.cwd()
   */
  projectRoot?: string | URL;

  /**
   * Directory containing Storybook's main.ts and preview.tsx.
   * Relative paths are resolved from projectRoot.
   * @default "src"
   */
  storybookConfigDir?: string;

  /**
   * Path to the react-native-test-app manifest, relative to projectRoot.
   * @default "app.json"
   */
  appConfigPath?: string;

  /**
   * Packages to include stories from. Use '.' to include the current package. Use the [string, StorySettings]
   * tuple to override the default story settings for a specific package.
   * @default ["."]
   */
  storyPackages?: readonly StoryPackageSpec[];

  /**
   * On-device addons.
   * @default controls and actions
   */
  deviceAddons?: readonly string[];

  /**
   * Prefix for native Storybook chrome and story-root automation identifiers.
   * @default "storybook-desktop"
   */
  testIDPrefix?: string;

  /**
   * Native project, command, and smoke-test settings for each desktop platform.
   */
  platformOptions?: DesktopPlatformOptionsMap;
};

export type ResolvedPackage = {
  manifest: Readonly<PackageManifest>;
  name: string;
  root: string;
};

export type ResolvedStoryPackage = ResolvedPackage & {
  storyPatterns: readonly string[];
};

export type DesktopReactNativeStorybookConfig = {
  deviceAddons: string[];
  stories: string[];
};

/**
 * Class representing the configuration for a desktop Storybook instance. This takes relevant user settings
 * and can build various configurations on demand for different platforms and environments.
 */
export class DesktopStorybookConfig {
  readonly projectRoot: string;
  readonly storybookConfigDir: string;
  readonly appConfigPath: string;

  private readonly config: DesktopStorybookConfigOptions;
  private readonly requireFromProject: NodeJS.Require;
  private readonly packageCache = new Map<string, ResolvedPackage>();
  private readonly storyPackageCache = new Map<string, readonly ResolvedStoryPackage[]>();
  private packageManifestCache?: Readonly<PackageManifest>;
  private appManifestCache?: Readonly<AppManifest>;

  constructor(userConfig: DesktopStorybookConfigOptions = {}) {
    this.projectRoot = resolveProjectRoot(userConfig.projectRoot);
    this.storybookConfigDir = resolveFromProject(this.projectRoot, userConfig.storybookConfigDir ?? 'src');
    this.appConfigPath = resolveFromProject(this.projectRoot, userConfig.appConfigPath ?? 'app.json');
    this.config = normalizeConfig(userConfig, this.projectRoot);
    this.requireFromProject = createRequire(path.join(this.projectRoot, 'package.json'));
  }

  get platform(): Platforms | undefined {
    return getPlatform();
  }

  get platforms(): readonly Platforms[] {
    return this.config.platforms ?? getAllPlatforms(this.projectRoot);
  }

  get packageManifest(): Readonly<PackageManifest> {
    return (this.packageManifestCache ??= readJsonFile<PackageManifest>(path.join(this.projectRoot, 'package.json')));
  }

  get packageName(): string {
    return requireSetting(this.packageManifest.name, `Package manifest at ${this.projectRoot} does not define "name".`);
  }

  get appManifest(): Readonly<AppManifest> {
    return (this.appManifestCache ??= readJsonFile<AppManifest>(this.appConfigPath));
  }

  get appName(): string {
    return requireSetting(
      this.appManifest.components?.[0]?.appKey ?? this.appManifest.name,
      `App manifest at ${this.appConfigPath} does not define a component appKey or "name".`,
    );
  }

  get displayName(): string {
    return this.appManifest.components?.[0]?.displayName ?? this.appManifest.displayName ?? this.appName;
  }

  get macosBundleIdentifier(): string {
    return this.appManifest.macos?.bundleIdentifier ?? defaultMacOSBundleIdentifier;
  }

  get testIDPrefix(): string {
    const prefix = this.config.testIDPrefix ?? this.appManifest.storybook?.testIDPrefix ?? defaultTestIDPrefix;
    validateTestIDPrefix(prefix);
    return prefix;
  }

  resolvePackage(packageName: string): ResolvedPackage {
    const cachedPackage = this.packageCache.get(packageName);
    if (cachedPackage) {
      return cachedPackage;
    }

    const root = packageName === '.' ? this.projectRoot : this.resolveDependencyRoot(packageName);
    const manifest = readJsonFile<PackageManifest>(path.join(root, 'package.json'));
    const resolvedName = requireSetting(manifest.name, `Package manifest at ${root} does not define "name".`);
    if (packageName !== '.' && resolvedName !== packageName) {
      throw new Error(`Resolved "${packageName}" to package "${resolvedName}" at ${root}.`);
    }

    const resolvedPackage = Object.freeze({
      manifest,
      name: resolvedName,
      root,
    });
    this.packageCache.set(packageName, resolvedPackage);
    return resolvedPackage;
  }

  getStoryPackages(platformSetting: Platforms | string | undefined = this.platform): readonly ResolvedStoryPackage[] {
    const platform = platformSetting ? getPlatform(platformSetting) : undefined;
    const cacheKey = platform ?? 'unscoped';
    const cachedPackages = this.storyPackageCache.get(cacheKey);
    if (cachedPackages) {
      return cachedPackages;
    }

    const storyPackages = (this.config.storyPackages ?? ['.'])
      .map((spec) => this.resolveStoryPackage(spec, platform))
      .filter((storyPackage): storyPackage is ResolvedStoryPackage => storyPackage !== undefined);
    const frozenPackages = Object.freeze(storyPackages);
    this.storyPackageCache.set(cacheKey, frozenPackages);
    return frozenPackages;
  }

  getStoryGlobs(platformSetting: Platforms | string | undefined = this.platform): readonly string[] {
    return Object.freeze(
      this.getStoryPackages(platformSetting).flatMap(({ root, storyPatterns }) => {
        const relativePackageRoot = toPosixPath(path.relative(this.storybookConfigDir, root));
        return storyPatterns.map((pattern) => path.posix.join(relativePackageRoot, pattern));
      }),
    );
  }

  getStorybookConfig(platformSetting: Platforms | string | undefined = this.platform): DesktopReactNativeStorybookConfig {
    return {
      stories: [...this.getStoryGlobs(platformSetting)],
      deviceAddons: [...(this.config.deviceAddons ?? defaultDeviceAddons)],
    };
  }

  getPlatformOptions(platformSetting: Platforms | string | undefined = this.platform): Readonly<DesktopPlatformOptions> {
    const platform = requirePlatform(platformSetting);
    const configured = this.config.platformOptions?.[platform] ?? {};
    const nativeProject = {
      ...defaultNativeProjectOptions(this, platform),
      ...configured.nativeProject,
    };

    return Object.freeze({
      nativeProject: Object.freeze(nativeProject),
      server: configured.server !== undefined ? configured.server : defaultServerCommand(this),
      prep: configured.prep !== undefined ? configured.prep : defaultPrepPlan(platform),
      bundle: configured.bundle !== undefined ? configured.bundle : defaultBundlePlan(this, platform),
      run: configured.run !== undefined ? configured.run : defaultNativePlan(platform, 'run', nativeProject),
      build: configured.build !== undefined ? configured.build : defaultNativePlan(platform, 'build', nativeProject),
      smoke: configured.smoke !== undefined ? configured.smoke : defaultSmokeOptions(this, platform),
    });
  }

  getCommandPlan(
    action: Exclude<DesktopStorybookAction, 'smoke'>,
    platformSetting: Platforms | string | undefined = this.platform,
  ): DesktopCommandPlan | false {
    const platform = requirePlatform(platformSetting);
    const plan = this.getPlatformOptions(platform)[action];
    if (plan === undefined) {
      throw new Error(`No default ${action} command is available for ${platform}.`);
    }
    return plan;
  }

  getSmokeOptions(platformSetting: Platforms | string | undefined = this.platform): Readonly<DesktopSmokeOptions> | false | undefined {
    const platform = requirePlatform(platformSetting);
    return this.getPlatformOptions(platform).smoke;
  }

  private resolveStoryPackage(spec: StoryPackageSpec, platform?: Platforms): ResolvedStoryPackage | undefined {
    const [packageName, packageSettings] = typeof spec === 'string' ? [spec, {}] : spec;
    const enabledPlatforms = packageSettings.platforms ?? this.config.platforms ?? getAllPlatforms(this.projectRoot);
    if (platform && enabledPlatforms.length > 0 && !enabledPlatforms.includes(platform)) {
      return undefined;
    }

    const globalPlatformSettings = platform ? this.config.platformSettings?.[platform] : undefined;
    const packagePlatformSettings = platform ? packageSettings.platformSettings?.[platform] : undefined;
    const storyPatterns =
      packagePlatformSettings?.storyPatterns ??
      packageSettings.storyPatterns ??
      globalPlatformSettings?.storyPatterns ??
      this.config.storyPatterns ??
      defaultStoryPatterns;

    return Object.freeze({
      ...this.resolvePackage(packageName),
      storyPatterns: Object.freeze(storyPatterns.map((pattern) => normalizeStoryPattern(pattern, packageName))),
    });
  }

  private resolveDependencyRoot(packageName: string): string {
    try {
      return path.dirname(this.requireFromProject.resolve(`${packageName}/package.json`));
    } catch (error) {
      if (!isPackageResolutionError(error)) {
        throw error;
      }
    }

    const entryPath = this.requireFromProject.resolve(packageName);
    let current = path.dirname(entryPath);
    while (true) {
      const manifestPath = path.join(current, 'package.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = readJsonFile<PackageManifest>(manifestPath);
        if (manifest.name === packageName) {
          return current;
        }
      }

      const parent = path.dirname(current);
      if (parent === current) {
        throw new Error(`Could not find package root for "${packageName}" from ${this.projectRoot}.`);
      }
      current = parent;
    }
  }
}

export function makeDesktopStorybookConfig(userConfig: DesktopStorybookConfigOptions = {}): DesktopStorybookConfig {
  return new DesktopStorybookConfig(userConfig);
}

function resolveProjectRoot(projectRoot?: string | URL): string {
  if (projectRoot instanceof URL) {
    return path.resolve(fileURLToPath(projectRoot.href));
  }
  return path.resolve(projectRoot ?? process.cwd());
}

function resolveFromProject(projectRoot: string, setting: string): string {
  return path.isAbsolute(setting) ? path.normalize(setting) : path.resolve(projectRoot, setting);
}

function requirePlatform(platformSetting: Platforms | string | undefined): Platforms {
  const platform = getPlatform(platformSetting);
  if (!platform) {
    throw new Error('A desktop platform must be selected.');
  }
  return platform;
}

function defaultPrepPlan(platform: Platforms): DesktopCommandPlan {
  switch (platform) {
    case 'macos':
      return { command: 'pod', args: ['install', '--project-directory=macos'] };
    case 'windows':
      return { command: 'install-windows-test-app', args: ['--use-fabric'] };
    case 'win32':
      return [];
  }
}

function defaultServerCommand(config: DesktopStorybookConfig): DesktopCommand {
  return {
    command: process.execPath,
    args: [path.join(config.resolvePackage('@fluentui-react-native/storybook-desktop').root, 'config', 'server-runner.cjs')],
    env: {
      STORYBOOK_CONFIG_PATH: config.storybookConfigDir,
      STORYBOOK_PROJECT_ROOT: config.projectRoot,
    },
  };
}

function defaultBundlePlan(config: DesktopStorybookConfig, platform: Platforms): DesktopCommandPlan {
  return [
    {
      command: 'sb-rn-get-stories',
      args: ['--config-path', config.storybookConfigDir],
    },
    {
      command: 'rnx-cli',
      args: ['bundle', '--dev', 'false', '--platform', platform],
    },
  ];
}

function defaultNativePlan(
  platform: Platforms,
  action: 'build' | 'run',
  nativeProject: DesktopNativeProjectOptions,
): DesktopCommandPlan | false {
  if (platform === 'win32') {
    return false;
  }

  return {
    command: 'rnx-cli',
    args: [action, '--platform', platform, ...nativeProjectArgs(platform, nativeProject, action)],
  };
}

function nativeProjectArgs(
  platform: Exclude<Platforms, 'win32'>,
  nativeProject: DesktopNativeProjectOptions,
  action: 'build' | 'run',
): string[] {
  const args: string[] = [];
  if (platform === 'macos') {
    args.push('--workspace', requireSetting(nativeProject.workspace, 'The macOS workspace was not resolved.'));
    args.push('--scheme', requireSetting(nativeProject.scheme, 'The macOS scheme was not resolved.'));
  } else {
    args.push('--solution', requireSetting(nativeProject.solution, 'The Windows solution was not resolved.'));
  }
  if (nativeProject.configuration) {
    args.push('--configuration', nativeProject.configuration);
  }
  if (nativeProject.destination) {
    args.push('--destination', nativeProject.destination);
  }
  if (action === 'run' && nativeProject.device) {
    args.push('--device', nativeProject.device);
  }
  return args;
}

function defaultNativeProjectOptions(config: DesktopStorybookConfig, platform: Platforms): DesktopNativeProjectOptions {
  switch (platform) {
    case 'macos':
      return {
        workspace: `macos/${config.appName}.xcworkspace`,
        scheme: config.appName,
      };
    case 'windows':
      return {
        solution: `windows/${config.appName}.sln`,
      };
    case 'win32':
      return {};
  }
}

function defaultSmokeOptions(config: DesktopStorybookConfig, platform: Platforms): DesktopSmokeOptions | undefined {
  if (platform !== 'macos') {
    return undefined;
  }
  return {
    stop: {
      command: 'osascript',
      args: [path.join(config.resolvePackage('@fluentui-react-native/storybook-desktop').root, 'config', 'stop-macos-app.applescript')],
    },
  };
}

function normalizeConfig(config: DesktopStorybookConfigOptions, projectRoot: string): DesktopStorybookConfigOptions {
  validatePlatforms(config.platforms, 'config');
  validatePlatformSettings(config.platformSettings, 'config');
  validateDesktopPlatformOptions(config.platformOptions);
  if (config.testIDPrefix !== undefined) {
    validateTestIDPrefix(config.testIDPrefix);
  }

  const seenPackages = new Set<string>();
  const normalizedStoryPackages: StoryPackageSpec[] = [];
  for (const spec of config.storyPackages ?? ['.']) {
    const [packageName, settings] = typeof spec === 'string' ? [spec, {}] : spec;
    if (!packageName.trim()) {
      throw new TypeError('Story package names cannot be empty.');
    }
    if (seenPackages.has(packageName)) {
      throw new Error(`Story package "${packageName}" is configured more than once.`);
    }
    seenPackages.add(packageName);
    validatePlatforms(settings.platforms, `story package "${packageName}"`);
    validatePlatformSettings(settings.platformSettings, `story package "${packageName}"`);
    for (const pattern of settings.storyPatterns ?? []) {
      normalizeStoryPattern(pattern, packageName);
    }
    normalizedStoryPackages.push(typeof spec === 'string' ? packageName : [packageName, normalizeStorySettings(settings)]);
  }
  for (const pattern of config.storyPatterns ?? []) {
    normalizeStoryPattern(pattern, projectRoot);
  }

  return {
    ...config,
    ...normalizeStorySettings(config),
    storyPackages: normalizedStoryPackages,
    deviceAddons: config.deviceAddons ? [...config.deviceAddons] : undefined,
    platformOptions: normalizeDesktopPlatformOptions(config.platformOptions),
  };
}

function validateTestIDPrefix(prefix: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(prefix)) {
    throw new TypeError('testIDPrefix must contain lowercase alphanumeric segments separated by hyphens.');
  }
}

function normalizeDesktopPlatformOptions(platformOptions: DesktopPlatformOptionsMap | undefined): DesktopPlatformOptionsMap | undefined {
  if (!platformOptions) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(platformOptions).map(([platform, options]) => [
      platform,
      {
        ...options,
        nativeProject: options.nativeProject ? { ...options.nativeProject } : undefined,
        server: normalizeCommand(options.server),
        prep: normalizeCommandPlan(options.prep),
        bundle: normalizeCommandPlan(options.bundle),
        run: normalizeCommandPlan(options.run),
        build: normalizeCommandPlan(options.build),
        smoke:
          options.smoke === false
            ? false
            : options.smoke
              ? {
                  ...options.smoke,
                  command: normalizeCommandPlan(options.smoke.command),
                  server: normalizeCommand(options.smoke.server),
                  metro: normalizeCommand(options.smoke.metro),
                  stop: normalizeCommandPlan(options.smoke.stop),
                }
              : undefined,
      },
    ]),
  ) as DesktopPlatformOptionsMap;
}

function normalizeCommandPlan<T extends DesktopCommandPlan | false | undefined>(plan: T): T {
  if (plan === false || plan === undefined) {
    return plan;
  }
  return (isCommandArray(plan) ? plan.map((command) => normalizeCommand(command)) : normalizeCommand(plan)) as T;
}

function normalizeCommand<T extends DesktopCommand | false | undefined>(command: T): T {
  if (command === false || command === undefined) {
    return command;
  }
  return {
    ...command,
    args: command.args ? [...command.args] : undefined,
    env: command.env ? { ...command.env } : undefined,
  } as T;
}

function normalizeStorySettings(settings: Partial<StorySettings>): StorySettings {
  const platformSettings = settings.platformSettings
    ? (Object.fromEntries(
        Object.entries(settings.platformSettings).map(([platform, platformSetting]) => [
          platform,
          {
            storyPatterns: platformSetting.storyPatterns ? [...platformSetting.storyPatterns] : undefined,
          },
        ]),
      ) as Partial<Record<Platforms, PlatformStorySettings>>)
    : undefined;

  return {
    platforms: settings.platforms ? [...settings.platforms] : undefined,
    storyPatterns: settings.storyPatterns ? [...settings.storyPatterns] : undefined,
    platformSettings,
  };
}

function validatePlatforms(platforms: readonly Platforms[] | undefined, source: string): void {
  for (const platform of platforms ?? []) {
    if (!isPlatform(platform)) {
      throw new RangeError(`${source} contains unsupported platform "${platform}".`);
    }
  }
}

function validatePlatformSettings(settings: Partial<Record<Platforms, PlatformStorySettings>> | undefined, source: string): void {
  for (const [platform, platformSettings] of Object.entries(settings ?? {})) {
    if (!isPlatform(platform)) {
      throw new RangeError(`${source} contains unsupported platform override "${platform}".`);
    }
    for (const pattern of platformSettings.storyPatterns ?? []) {
      normalizeStoryPattern(pattern, `${source}:${platform}`);
    }
  }
}

function validateDesktopPlatformOptions(platformOptions: DesktopPlatformOptionsMap | undefined): void {
  for (const [platform, options] of Object.entries(platformOptions ?? {})) {
    if (!isPlatform(platform)) {
      throw new RangeError(`config contains unsupported desktop platform options "${platform}".`);
    }
    validateCommand(options.server, `${platform}.server`);
    validateCommandPlan(options.prep, `${platform}.prep`);
    validateCommandPlan(options.bundle, `${platform}.bundle`);
    validateCommandPlan(options.run, `${platform}.run`);
    validateCommandPlan(options.build, `${platform}.build`);
    if (options.smoke !== false) {
      validateCommandPlan(options.smoke?.command, `${platform}.smoke.command`);
      validateCommand(options.smoke?.server, `${platform}.smoke.server`);
      validateCommand(options.smoke?.metro, `${platform}.smoke.metro`);
      validateCommandPlan(options.smoke?.stop, `${platform}.smoke.stop`);
    }
  }
}

function validateCommandPlan(plan: DesktopCommandPlan | false | undefined, source: string): void {
  if (plan === false || plan === undefined) {
    return;
  }
  for (const command of isCommandArray(plan) ? plan : [plan]) {
    validateCommand(command, source);
  }
}

function validateCommand(command: DesktopCommand | false | undefined, source: string): void {
  if (command !== false && command !== undefined && !command.command.trim()) {
    throw new TypeError(`Desktop command ${source} must define a command.`);
  }
}

function isCommandArray(plan: DesktopCommandPlan): plan is readonly DesktopCommand[] {
  return Array.isArray(plan);
}

function normalizeStoryPattern(pattern: string, source: string): string {
  const normalizedPattern = toPosixPath(pattern).replace(/^\.\//, '');
  if (
    !normalizedPattern ||
    path.posix.isAbsolute(normalizedPattern) ||
    path.win32.isAbsolute(pattern) ||
    normalizedPattern === '..' ||
    normalizedPattern.startsWith('../')
  ) {
    throw new TypeError(`Story pattern "${pattern}" for ${source} must stay within its package.`);
  }
  return normalizedPattern;
}

function readJsonFile<T extends JsonObject>(filePath: string): Readonly<T> {
  const content = fs.readFileSync(filePath, 'utf8');
  return Object.freeze(JSON.parse(content) as T);
}

function requireSetting(value: string | undefined, message: string): string {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function toPosixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function isPackageResolutionError(error: unknown): error is NodeJS.ErrnoException {
  const code = (error as NodeJS.ErrnoException)?.code;
  return code === 'MODULE_NOT_FOUND' || code === 'ERR_PACKAGE_PATH_NOT_EXPORTED';
}
