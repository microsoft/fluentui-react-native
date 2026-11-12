import fs from 'node:fs';
import path from 'node:path';

import { createDesktopWorkloadClaim, inspectDesktopWorkloadClaim } from './ownership';
import type { DesktopWorkloadProcessIdentity } from './ownership';

const identity: DesktopWorkloadProcessIdentity = {
  platform: 'macos',
  pid: process.pid,
  startedAt: '2026-11-12T00:00:00.123456Z',
  executablePath: process.execPath,
  interactiveSession: 'macos-session:1',
};

describe('desktop workload exact owner identity', () => {
  let directory: string;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(process.cwd(), '.ownership-test-'));
  });
  afterEach(() => fs.rmSync(directory, { force: true, recursive: true }));

  const claimOptions = () => ({ runId: 'run', targetId: 'target', targetInstanceId: 'instance', directory });

  test('compares the unchanged native start identity, including microseconds', async () => {
    const claim = createDesktopWorkloadClaim({ ...claimOptions(), processIdentity: identity });
    const filename = path.join(directory, 'interactive.lock');
    expect(claim.record.schemaVersion).toBe(3);
    expect(claim.record.owner.processStartedAt).toBe(identity.startedAt);
    await expect(
      inspectDesktopWorkloadClaim(filename, async () => ({ state: 'alive', processStartedAt: identity.startedAt })),
    ).resolves.toMatchObject({ state: 'live' });
    await expect(
      inspectDesktopWorkloadClaim(filename, async () => ({ state: 'alive', processStartedAt: '2026-11-12T00:00:00.123457Z' })),
    ).resolves.toMatchObject({ state: 'pid-reused' });
    await expect(inspectDesktopWorkloadClaim(filename, async () => ({ state: 'unknown' }))).resolves.toMatchObject({ state: 'unknown' });
    expect(fs.existsSync(filename)).toBe(true);
    claim.release();
  });

  test.each(['legacy', 'unverified'])('%s claims never compare a clock estimate to an OS timestamp', async (kind) => {
    const claim = createDesktopWorkloadClaim(claimOptions());
    const filename = path.join(directory, 'interactive.lock');
    expect(claim.record.owner.processStartedAt).toBeUndefined();
    if (kind === 'legacy') {
      fs.writeFileSync(
        filename,
        JSON.stringify({
          ...claim.record,
          schemaVersion: 2,
          owner: { ...claim.record.owner, processStartedAt: '2026-11-12T00:00:00.123Z' },
        }),
      );
    }
    const probe = jest.fn(async () => ({ state: 'exited' as const }));
    await expect(inspectDesktopWorkloadClaim(filename, probe)).resolves.toMatchObject({ state: 'unknown' });
    expect(probe).not.toHaveBeenCalled();
    expect(fs.existsSync(filename)).toBe(true);
  });

  test('refuses another process identity and corrupted native identity fields', async () => {
    expect(() => createDesktopWorkloadClaim({ ...claimOptions(), processIdentity: { ...identity, pid: process.pid + 1 } })).toThrow(
      /native operating-system identity/,
    );
    const claim = createDesktopWorkloadClaim({ ...claimOptions(), processIdentity: identity });
    const filename = path.join(directory, 'interactive.lock');
    fs.writeFileSync(filename, JSON.stringify({ ...claim.record, owner: { ...claim.record.owner, processStartedAt: 'different' } }));
    await expect(inspectDesktopWorkloadClaim(filename, async () => ({ state: 'exited' }))).rejects.toThrow(/invalid/);
  });

  test('contends for one per-user claim even when TMPDIR changes', () => {
    const saved = { HOME: process.env.HOME, LOCALAPPDATA: process.env.LOCALAPPDATA, TMPDIR: process.env.TMPDIR };
    process.env.HOME = directory;
    process.env.LOCALAPPDATA = directory;
    process.env.TMPDIR = path.join(directory, 'first');
    const options = { runId: 'one', targetId: 'target', targetInstanceId: 'instance' };
    try {
      const claim = createDesktopWorkloadClaim(options);
      try {
        process.env.TMPDIR = path.join(directory, 'second');
        expect(() => createDesktopWorkloadClaim({ ...options, runId: 'two' })).toThrow(/Another desktop workload/);
      } finally {
        claim.release();
      }
    } finally {
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
