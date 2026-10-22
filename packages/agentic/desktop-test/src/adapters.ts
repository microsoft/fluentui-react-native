import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { NativeDesktopApplicationDescriptor } from '@fluentui-react-native/desktop-driver';
import type { DesktopCommand, DesktopStage, ResolvedDesktopTarget } from './config.js';

export async function resolveDesktopApplication(
  target: ResolvedDesktopTarget,
  signal?: AbortSignal,
): Promise<NativeDesktopApplicationDescriptor> {
  const configured = target.host.application ?? {};
  let application: NativeDesktopApplicationDescriptor;
  if (target.host.kind === 'installed') {
    application = { ...configured };
  } else if (target.host.kind === 'rex') {
    const require = createRequire(path.join(target.projectRoot, 'package.json'));
    const directory = path.dirname(require.resolve('@office-iss/rex-win32/rex-win32.js'));
    const bundleRoot = target.host.bundleRoot ?? path.join(target.projectRoot, 'dist');
    if (!target.host.component || !target.host.windowTitle)
      throw new Error('REX targets require their canonical component and windowTitle.');
    if (!fs.existsSync(path.join(bundleRoot, 'index.win32.bundle')))
      throw new Error(`REX bundle is missing in ${bundleRoot}; run the bundle stage first.`);
    application = {
      executablePath: path.join(directory, 'ReactTest.exe'),
      workingDirectory: directory,
      arguments: [
        'basePath',
        bundleRoot,
        'plugin',
        'defaultplugin',
        'bundle',
        'index.win32',
        'component',
        target.host.component,
        'windowTitle',
        target.host.windowTitle,
        'jsEngine',
        'v8',
      ],
      windowTitle: target.host.windowTitle,
      ...configured,
    };
  } else {
    const app = readAppManifest(target);
    const component = app.components?.[0];
    const windowTitle = component?.displayName ?? app.displayName ?? app.name;
    if (!windowTitle) throw new Error('RN Test App manifest does not define its display identity.');
    if (target.endpoint === 'macos') {
      application = { bundleIdentifier: app.macos?.bundleIdentifier ?? 'com.microsoft.ReactTestApp', windowTitle, ...configured };
    } else {
      const propertiesPath = path.join(target.projectRoot, 'windows', 'ExperimentalFeatures.props');
      const properties = fs.readFileSync(propertiesPath, 'utf8');
      const useFabric = /<UseFabric>\s*(true|false)\s*<\/UseFabric>/i.exec(properties)?.[1]?.toLowerCase();
      if (!useFabric) throw new Error(`Generated Windows renderer is not explicit in ${propertiesPath}; regenerate the project.`);
      const actualRenderer = useFabric === 'true' ? 'fabric' : 'paper';
      if (!target.host.renderer || target.host.renderer !== actualRenderer) {
        throw new Error(
          `Configured Windows renderer ${target.host.renderer ?? '(not specified)'} does not match generated ${actualRenderer}.`,
        );
      }
      application = { windowTitle, ...configured };
      if (!application.aumid && !application.executablePath && !application.leasePath) {
        const manifestPath = path.join(target.projectRoot, 'windows', 'ReactApp.Package', 'bin', 'x64', 'Debug', 'AppxManifest.xml');
        if (!fs.existsSync(manifestPath))
          throw new Error(
            `Built Windows manifest missing at ${manifestPath}; build/register the app or configure its verified application identity.`,
          );
        const manifest = fs.readFileSync(manifestPath, 'utf8');
        const name = /<Identity\b[^>]*\bName="([^"]+)"/.exec(manifest)?.[1];
        const appId = /<Application\b[^>]*\bId="([^"]+)"/.exec(manifest)?.[1];
        if (!name || !appId || !/^[\w.-]+$/.test(name) || !/^[\w.-]+$/.test(appId))
          throw new Error('Generated Windows manifest has an invalid or ambiguous application identity.');
        const { stdout } = await promisify(execFile)(
          'powershell.exe',
          [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            `$ErrorActionPreference='Stop'; $p=@(Get-AppxPackage -Name '${name}'); if ($p.Count -ne 1) { throw 'Expected one registered app package; install the generated application first.' }; $p[0].PackageFamilyName`,
          ],
          { timeout: 10_000, signal, maxBuffer: 64 * 1024, windowsHide: true },
        );
        const family = stdout.trim();
        if (!/^[\w.-]+_[\w]+$/.test(family)) throw new Error('Could not verify the registered Windows package family.');
        application.aumid = `${family}!${appId}`;
      }
    }
  }
  if (target.endpoint === 'macos') {
    if (!application.bundleIdentifier && !application.executablePath && !application.leasePath)
      throw new Error('macOS application identity is missing.');
    if (application.workingDirectory) throw new Error('workingDirectory is currently supported only by the Windows helper.');
  } else {
    if (!application.windowTitle) throw new Error('Windows applications require an exact window title.');
    if (!application.aumid && !application.executablePath && !application.leasePath) {
      throw new Error('A title alone is not an application identity; configure an executable, AUMID, or verified owner lease.');
    }
  }
  return Object.freeze(application);
}

export function desktopStageCommands(target: ResolvedDesktopTarget, stage: DesktopStage): readonly DesktopCommand[] {
  const override = target.commands?.[stage];
  if (override === false) throw new Error(`The ${stage} stage is unsupported for ${target.endpoint}.`);
  if (override !== undefined) return Array.isArray(override) ? override : [override as DesktopCommand];
  if (target.host.kind === 'installed') throw new Error(`Installed applications do not support the ${stage} stage.`);
  if (target.host.kind === 'rex') {
    if (stage === 'build') throw new Error('REX uses a prebuilt host; native build is unsupported.');
    if (stage === 'prep') return [];
    if (stage === 'run')
      throw new Error('Use a driver session to launch REX with recorded ownership, or declare an explicit development run command.');
    return [{ command: 'yarn', args: ['bundle'] }];
  }
  const app = readAppManifest(target);
  if (!app.name) throw new Error('RN Test App manifest must define name for native commands.');
  if (stage === 'prep')
    return target.endpoint === 'windows'
      ? [{ command: 'yarn', args: ['exec', 'install-windows-test-app', ...(target.host.renderer === 'paper' ? [] : ['--use-fabric'])] }]
      : [{ command: 'pod', args: ['install'], cwd: 'macos' }];
  if (stage === 'bundle')
    return [{ command: 'yarn', args: ['exec', 'rnx-cli', 'bundle', '--dev', 'false', '--platform', target.endpoint] }];
  return [
    {
      command: 'yarn',
      args: [
        'exec',
        'rnx-cli',
        stage,
        '--platform',
        target.endpoint,
        ...(target.endpoint === 'windows'
          ? ['--solution', path.join('windows', `${app.name}.sln`)]
          : ['--workspace', path.join('macos', `${app.name}.xcworkspace`), '--scheme', app.name]),
      ],
    },
  ];
}

type AppManifest = {
  name?: string;
  displayName?: string;
  components?: { appKey?: string; displayName?: string }[];
  macos?: { bundleIdentifier?: string };
};
function readAppManifest(target: ResolvedDesktopTarget): AppManifest {
  const filename = target.host.appConfigPath ?? path.join(target.projectRoot, 'app.json');
  const value: unknown = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`Invalid app manifest ${filename}.`);
  return value as AppManifest;
}
