import * as fs from 'node:fs';
import * as path from 'node:path';

import { doctor } from './cli/commands.ts';
import { checkWindowsPrerequisites, findWinAppDriver, isSessionLocked, WAD_PATH_ENV } from './platforms/windows.ts';

const isWindows = process.platform === 'win32';
const describeOnWindows = isWindows ? describe : describe.skip;

describe('doctor', () => {
  it('reports every prerequisite with a status rather than prose alone', () => {
    for (const platform of ['macos', 'windows'] as const) {
      const report = doctor(platform);
      expect(report.prerequisites.length).toBeGreaterThan(0);
      for (const prerequisite of report.prerequisites) {
        expect(['ok', 'missing', 'unknown']).toContain(prerequisite.status);
        expect(prerequisite.id).toBeTruthy();
      }
    }
  });

  it('never claims a prerequisite is satisfied on the wrong operating system', () => {
    const foreign = doctor(isWindows ? 'macos' : 'windows');
    expect(foreign.prerequisites.every((prerequisite) => prerequisite.status === 'unknown')).toBe(true);
  });

  it('warns about an unsatisfied prerequisite instead of hiding it in the list', () => {
    const report = doctor('fake');
    expect(report.prerequisites).toEqual([]);
    expect(report.warnings).toEqual([]);
  });
});

describe('WinAppDriver discovery', () => {
  const directory = fs.mkdtempSync(path.join(process.env.TEMP ?? process.env.TMPDIR ?? '.', 'wad-probe-'));
  const executable = path.join(directory, 'WinAppDriver.exe');
  fs.writeFileSync(executable, '');
  const installRoot = path.join(directory, 'root');
  fs.mkdirSync(path.join(installRoot, 'Windows Application Driver'), { recursive: true });
  fs.writeFileSync(path.join(installRoot, 'Windows Application Driver', 'WinAppDriver.exe'), '');

  afterAll(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it('prefers the variable appium-windows-driver actually reads', () => {
    // The driver resolves APPIUM_WAD_PATH; any other variable name has no effect at all.
    expect(findWinAppDriver({ [WAD_PATH_ENV]: executable })).toBe(executable);
    expect(WAD_PATH_ENV).toBe('APPIUM_WAD_PATH');
  });

  it('falls back to the documented install roots', () => {
    expect(findWinAppDriver({ 'ProgramFiles(x86)': installRoot })).toBe(
      path.resolve(installRoot, 'Windows Application Driver', 'WinAppDriver.exe'),
    );
  });

  it('ignores a configured path that does not exist', () => {
    expect(findWinAppDriver({ [WAD_PATH_ENV]: path.join(directory, 'absent.exe') })).toBeUndefined();
  });
});

describeOnWindows('Windows prerequisite probes', () => {
  it('reports the resolved executable when one is configured', () => {
    const directory = fs.mkdtempSync(path.join(process.env.TEMP ?? '.', 'wad-status-'));
    const executable = path.join(directory, 'WinAppDriver.exe');
    fs.writeFileSync(executable, '');
    try {
      const statuses = checkWindowsPrerequisites({ ...process.env, [WAD_PATH_ENV]: executable });
      const wad = statuses.find((status) => status.id === 'winappdriver');
      expect(wad).toMatchObject({ status: 'ok', detail: executable });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('never reports a missing executable as satisfied', () => {
    const statuses = checkWindowsPrerequisites({
      ...process.env,
      [WAD_PATH_ENV]: 'Z:\\nowhere\\WinAppDriver.exe',
      ProgramFiles: 'Z:\\nowhere',
      'ProgramFiles(x86)': 'Z:\\nowhere',
    });
    expect(statuses.find((status) => status.id === 'winappdriver')?.status).toBe('unknown');
  });

  it('reports the lock state as unknown rather than guessing from a process list', () => {
    // LogonUI.exe keeps running after a session is unlocked, so its presence proves nothing;
    // reporting `missing` from it called every unlocked machine locked.
    expect(isSessionLocked()).toBeUndefined();
    const locked = checkWindowsPrerequisites().find((status) => status.id === 'session-unlocked');
    expect(locked?.status).toBe('unknown');
    expect(locked?.detail).toContain('refuses every click');
  });
});
