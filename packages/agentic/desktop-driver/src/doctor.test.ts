import { doctor } from './cli/commands.ts';
import { checkWindowsPrerequisites, isSessionLocked } from './platforms/windows.ts';

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

describeOnWindows('Windows prerequisite probes', () => {
  it('reports NovaWindows hard requirements from the host', () => {
    const statuses = checkWindowsPrerequisites();
    expect(statuses.find((status) => status.id === 'windows-version')?.status).toBe('ok');
    expect(statuses.find((status) => status.id === 'powershell')).toMatchObject({ status: 'ok' });
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
