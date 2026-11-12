import fs from 'node:fs';
import path from 'node:path';

import type { ApplicationLease } from '@fluentui-react-native/desktop-driver';

import { captureDesktopApplicationIdentity, desktopApplicationIdentityDescriptor } from './applicationOwnership';
import { createDesktopWorkloadClaim, recoverWindowsDesktopWorkloadClaim } from './ownership';
import type { DesktopWorkloadOwnerIdentity } from './ownership';
import type { DesktopResourceRecord } from './resources';
import { defineDesktopConfig } from './config';
import type { ResolvedDesktopTarget } from './config';
import { resolveDesktopApplication } from './adapters';

const exact = {
  processId: 456,
  processStartedAt: '2026-11-12T00:00:00.1234567Z',
  executablePath: 'C:\\apps\\ReactApp.exe',
  aumid: 'package_family!App',
  interactiveSession: 'windows-session:2',
};
const owner = {
  platform: 'windows' as const,
  pid: process.pid,
  startedAt: '2026-11-12T00:00:00.7654321Z',
  executablePath: process.execPath,
  interactiveSession: 'windows-session:2',
};

describe('Windows exact identity and survivor recovery', () => {
  let directory: string;
  const options = () => ({
    directory,
    endpoint: 'windows' as const,
    targetId: 'packaged',
    targetInstanceId: 'package-instance',
    processIdentity: owner,
  });
  const filename = () => path.join(directory, 'interactive.lock');

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(process.cwd(), '.windows-ownership-test-'));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  function survivor(extra: readonly DesktopResourceRecord[] = []) {
    const claim = createDesktopWorkloadClaim({ ...options(), runId: 'crashed-run', processIdentity: owner });
    claim.updateResource({
      id: 'application:1',
      identity: 'exact-application-incarnation',
      generation: 1,
      ownership: 'owned',
      readiness: 'ready',
      disposal: 'pending',
      application: {
        ...exact,
        endpoint: 'windows',
        lifetime: 'session',
        containment: 'uncontained',
        launchKind: 'packaged-activation',
        leaseId: 'owned-lease',
      },
    });
    for (const resource of extra) claim.updateResource(resource);
    return claim;
  }

  test.each(['windows', 'win32'] as const)('captures %s identity without rounding away native start/session evidence', (endpoint) => {
    const lease = { ...exact, id: 'native', ownership: 'launched', containment: 'uncontained' } as ApplicationLease;
    const identity = captureDesktopApplicationIdentity(lease, endpoint);
    expect(identity).toEqual({ schemaVersion: 1, endpoint, ...exact });
    expect(desktopApplicationIdentityDescriptor(identity, { aumid: exact.aumid, windowTitle: 'Fixture' })).toEqual({
      aumid: exact.aumid,
      windowTitle: 'Fixture',
      processIdentity: exact,
    });
    expect(() => captureDesktopApplicationIdentity({ ...lease, processStartedAt: '2026-11-12T00:00:00.123Z' }, endpoint)).toThrow(/native/);
    expect(() => captureDesktopApplicationIdentity({ ...lease, interactiveSession: undefined }, endpoint)).toThrow(/session/);
    expect(() => captureDesktopApplicationIdentity({ ...lease, aumid: '' }, endpoint)).toThrow(/identity/);
    expect(() => captureDesktopApplicationIdentity({ ...lease, executablePath: `C:\\${'a'.repeat(4096)}.exe` }, endpoint)).toThrow(
      /identity/,
    );
    expect(() => desktopApplicationIdentityDescriptor(identity, { executablePath: 'C:\\other.exe', windowTitle: 'Fixture' })).toThrow(
      /identity/,
    );
  });

  test('the next run cleans a journaled packaged survivor only after proving its owner exited', async () => {
    survivor();
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication,
      }),
    ).resolves.toEqual({ state: 'recovered', applications: 1 });
    expect(recoverApplication).toHaveBeenCalledWith(exact);
    expect(fs.existsSync(filename())).toBe(false);
    const next = createDesktopWorkloadClaim({ ...options(), runId: 'next-run', processIdentity: owner });
    next.release();
  });

  test('a live owner is probed without publishing any recovery barrier', async () => {
    const claim = survivor();
    let barrierDuringProbe = false;
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => {
          barrierDuringProbe = ['.recovery', '.recovery-v2'].some((suffix) => fs.existsSync(filename() + suffix));
          return { state: 'alive', processStartedAt: claim.record.owner.processStartedAt! };
        },
        recoverApplication: jest.fn(async () => undefined),
      }),
    ).rejects.toThrow(/owner.*live|fenced/);
    expect(barrierDuringProbe).toBe(false);
  });

  test('a foreign target never creates even a temporary recovery barrier', async () => {
    survivor();
    const mkdir = jest.spyOn(fs, 'mkdirSync');
    const probeOwner = jest.fn(async () => ({ state: 'exited' as const }));
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        targetInstanceId: 'foreign-target',
        probeOwner,
        recoverApplication: jest.fn(async () => undefined),
      }),
    ).rejects.toThrow(/different target/);
    expect(probeOwner).not.toHaveBeenCalled();
    expect(mkdir).not.toHaveBeenCalled();
  });

  test('claim replacement while acquiring the barrier never inherits recovery authority', async () => {
    survivor();
    const replacement = JSON.stringify({ ...JSON.parse(fs.readFileSync(filename(), 'utf8')), state: 'active' });
    const original = fs.mkdirSync;
    jest.spyOn(fs, 'mkdirSync').mockImplementation((root, attributes) => {
      const result = original(root, attributes);
      if (root === `${filename()}.recovery` || root === `${filename()}.recovery-v2`) {
        fs.writeFileSync(filename(), replacement);
      }
      return result;
    });
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication,
      }),
    ).rejects.toThrow(/ownership changed/);
    expect(recoverApplication).not.toHaveBeenCalled();
    expect(fs.readFileSync(filename(), 'utf8')).toBe(replacement);
  });

  async function interruptBarrierCleanup(removeClaim = false): Promise<void> {
    const original = fs.rmdirSync;
    const interrupted = jest.spyOn(fs, 'rmdirSync').mockImplementation((root, attributes) => {
      if (String(root).startsWith(`${filename()}.recovery`)) throw new Error('recoverer crashed before barrier removal');
      return original(root, attributes);
    });
    try {
      await expect(
        recoverWindowsDesktopWorkloadClaim({
          ...options(),
          probeOwner: async () => ({ state: 'exited' }),
          recoverApplication: async () => {
            if (!removeClaim) throw new Error('recoverer crashed during application cleanup');
          },
        }),
      ).rejects.toThrow(/recovery|recoverer|barrier/i);
    } finally {
      interrupted.mockRestore();
    }
  }

  test.each(['exited', 'pid-reused'] as const)('resumes an interrupted barrier whose exact recoverer is %s', async (state) => {
    const claim = survivor();
    await interruptBarrierCleanup();
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async (candidate) =>
          candidate.id === claim.record.owner.id || state === 'exited'
            ? { state: 'exited' }
            : { state: 'alive', processStartedAt: '2026-11-12T00:00:00.7654322Z' },
        recoverApplication,
      }),
    ).resolves.toEqual({ state: 'recovered', applications: 1 });
    expect(recoverApplication).toHaveBeenCalledWith(exact);
    expect(fs.existsSync(filename())).toBe(false);
    expect(fs.existsSync(`${filename()}.recovery-v2`)).toBe(false);
  });

  test.each(['live', 'unknown'] as const)('never removes an interrupted barrier with a %s recoverer', async (state) => {
    const claim = survivor();
    await interruptBarrierCleanup();
    const before = fs.readFileSync(filename(), 'utf8');
    const recoverApplication = jest.fn(async () => undefined);
    const probeOwner = jest.fn(async (candidate: DesktopWorkloadOwnerIdentity) =>
      candidate.id === claim.record.owner.id
        ? { state: 'exited' as const }
        : state === 'live'
          ? { state: 'alive' as const, processStartedAt: owner.startedAt }
          : { state: 'unknown' as const },
    );
    await expect(recoverWindowsDesktopWorkloadClaim({ ...options(), probeOwner, recoverApplication })).rejects.toThrow(
      /recovery.*busy|recoverer.*live|recoverer.*unknown/i,
    );
    expect(probeOwner).toHaveBeenCalledTimes(2);
    expect(recoverApplication).not.toHaveBeenCalled();
    expect(fs.readFileSync(filename(), 'utf8')).toBe(before);
  });

  test('a dead-recoverer probe never deletes a replacement barrier or dispatches application cleanup', async () => {
    const claim = survivor();
    await interruptBarrierCleanup();
    const root = `${filename()}.recovery-v2`;
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async (candidate) => {
          if (candidate.id !== claim.record.owner.id) {
            fs.renameSync(root, `${filename()}.old-recovery`);
            fs.mkdirSync(root);
          }
          return { state: 'exited' };
        },
        recoverApplication,
      }),
    ).rejects.toThrow(/barrier ownership changed/);
    expect(fs.existsSync(root)).toBe(true);
    expect(fs.existsSync(filename())).toBe(true);
    expect(recoverApplication).not.toHaveBeenCalled();
  });

  test('retires a dead recoverer barrier after the exact claim was already removed', async () => {
    survivor();
    await interruptBarrierCleanup(true);
    expect(fs.existsSync(filename())).toBe(false);
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({ ...options(), probeOwner: async () => ({ state: 'exited' }), recoverApplication }),
    ).resolves.toEqual({ state: 'absent' });
    expect(recoverApplication).not.toHaveBeenCalled();
    const next = createDesktopWorkloadClaim({ ...options(), runId: 'after-interrupted-recovery', processIdentity: owner });
    next.release();
  });

  test('unknown versioned barrier ownership still fences an absent claim and new workload', async () => {
    const barrier = `${filename()}.recovery-v2`;
    fs.mkdirSync(barrier);
    fs.mkdirSync(path.join(barrier, 'unknown-owner'));
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication: jest.fn(async () => undefined),
      }),
    ).rejects.toThrow(/recovery.*busy|barrier.*owner|fenced/i);
    expect(() => createDesktopWorkloadClaim({ ...options(), runId: 'cannot-bypass-versioned-barrier' })).toThrow(/recovery.*busy/);
    expect(fs.existsSync(barrier)).toBe(true);
  });

  test('an empty versioned barrier represents interrupted publication, never application recovery authority', async () => {
    const barrier = `${filename()}.recovery-v2`;
    fs.mkdirSync(barrier);
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({ ...options(), probeOwner: async () => ({ state: 'exited' }), recoverApplication }),
    ).resolves.toEqual({ state: 'absent' });
    expect(recoverApplication).not.toHaveBeenCalled();
    expect(fs.existsSync(barrier)).toBe(false);
  });

  test('an interrupted recovery barrier still fences an absent claim', async () => {
    fs.mkdirSync(`${filename()}.recovery`);
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication,
      }),
    ).rejects.toThrow(/recovery.*busy|interrupted recovery/);
    expect(recoverApplication).not.toHaveBeenCalled();
    expect(fs.existsSync(`${filename()}.recovery`)).toBe(true);
  });

  test('a new workload cannot bypass an interrupted recovery barrier after claim removal', () => {
    fs.mkdirSync(`${filename()}.recovery`);
    expect(() => createDesktopWorkloadClaim({ ...options(), runId: 'replacement', processIdentity: owner })).toThrow(
      /recovery.*busy|interrupted recovery/,
    );
    expect(fs.existsSync(filename())).toBe(false);
  });

  test.each([
    ['direct-child', 'uncontained'],
    ['packaged-activation', 'job-object'],
  ] as const)('inconsistent %s / %s containment never authorizes application recovery', async (launchKind, containment) => {
    const claim = survivor();
    const resource = claim.record.resources[0];
    claim.updateResource({ ...resource, application: { ...resource.application!, launchKind, containment } });
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication,
      }),
    ).rejects.toThrow(/Windows ownership|fenced/);
    expect(recoverApplication).not.toHaveBeenCalled();
    expect(fs.existsSync(filename())).toBe(true);
  });

  test('an unrecognized owner-probe state never implies exit', async () => {
    survivor();
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'unexpected' }) as never,
        recoverApplication,
      }),
    ).rejects.toThrow(/owner.*unknown|fenced/);
    expect(recoverApplication).not.toHaveBeenCalled();
  });

  test.each([
    'live',
    'unknown',
    'foreign-target',
    'unverified',
    'invalid-owner-start',
    'pending-identity',
    'unleased-identity',
    'unknown-resource',
    'unknown-effect',
  ])('keeps %s evidence fenced without signaling an application', async (kind) => {
    const claim = survivor();
    const record = JSON.parse(fs.readFileSync(filename(), 'utf8'));
    if (kind === 'foreign-target') record.owner.targetInstanceId = 'another-target';
    if (kind === 'unverified') delete record.owner.processIdentity;
    if (kind === 'invalid-owner-start') {
      record.owner.processStartedAt = '2026-99-12T00:00:00.7654321Z';
      record.owner.processIdentity.startedAt = record.owner.processStartedAt;
    }
    if (kind === 'pending-identity') delete record.resources[0].application.processStartedAt;
    if (kind === 'unleased-identity') delete record.resources[0].application.leaseId;
    if (kind === 'unknown-resource')
      record.resources.push({
        id: 'metro',
        identity: 'unknown-process',
        generation: 1,
        ownership: 'owned',
        readiness: 'ready',
        disposal: 'pending',
      });
    if (kind === 'unknown-effect')
      record.unresolvedEffects.push({
        id: 'native-effect',
        resourceId: 'application:1',
        resourceIdentity: 'exact-application-incarnation',
      });
    fs.writeFileSync(filename(), JSON.stringify(record));
    const before = fs.readFileSync(filename(), 'utf8');
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () =>
          kind === 'live'
            ? { state: 'alive', processStartedAt: claim.record.owner.processStartedAt! }
            : { state: kind === 'unknown' ? 'unknown' : 'exited' },
        recoverApplication,
      }),
    ).rejects.toThrow(/fenced|owner|identity|resource|effect|target|claim/i);
    expect(recoverApplication).not.toHaveBeenCalled();
    expect(fs.readFileSync(filename(), 'utf8')).toBe(before);
  });

  test('a reused owner PID permits exact application recovery, not a PID-only termination', async () => {
    survivor();
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'alive', processStartedAt: '2026-11-12T00:00:00.7654322Z' }),
        recoverApplication,
      }),
    ).resolves.toMatchObject({ state: 'recovered' });
    expect(recoverApplication).toHaveBeenCalledWith(exact);
  });

  test.each(['not-a-native-start', '2026-11-12T00:00:00.123Z', '2026-99-12T00:00:00.1234567Z'])(
    'an invalid owner probe %s never authorizes recovery as PID reuse',
    async (processStartedAt) => {
      survivor();
      const recoverApplication = jest.fn(async () => undefined);
      await expect(
        recoverWindowsDesktopWorkloadClaim({
          ...options(),
          probeOwner: async () => ({ state: 'alive', processStartedAt }),
          recoverApplication,
        }),
      ).rejects.toThrow(/owner.*unknown|fenced/);
      expect(recoverApplication).not.toHaveBeenCalled();
      expect(fs.existsSync(filename())).toBe(true);
    },
  );

  test('partial application recovery persists exact progress without reclaiming an unsettled survivor', async () => {
    const claim = survivor();
    claim.updateResource({
      ...claim.record.resources[0],
      id: 'application:2',
      identity: 'second-incarnation',
      application: { ...claim.record.resources[0].application!, leaseId: 'second-lease', processId: 457 },
    });
    const recoverApplication = jest.fn(async (identity) => {
      if (identity.processId === 457) throw new Error('application-lock-busy');
    });
    const recovery = { ...options(), probeOwner: async () => ({ state: 'exited' as const }), recoverApplication };
    await expect(recoverWindowsDesktopWorkloadClaim(recovery)).rejects.toThrow('application-lock-busy');
    expect(JSON.parse(fs.readFileSync(filename(), 'utf8')).resources.map(({ disposal }) => disposal)).toEqual(['settled', 'pending']);
    recoverApplication.mockResolvedValue(undefined);
    await expect(recoverWindowsDesktopWorkloadClaim(recovery)).resolves.toEqual({ state: 'recovered', applications: 1 });
    expect(recoverApplication.mock.calls.map(([identity]) => identity.processId)).toEqual([456, 457, 457]);
  });

  test('the exited owner proves its in-process WebDriver listener ended, not an arbitrary owned service', async () => {
    survivor([
      {
        id: 'webdriver',
        identity: 'driver-service:packaged:package-instance',
        generation: 1,
        ownership: 'owned',
        readiness: 'ready',
        disposal: 'pending',
      },
    ]);
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication: async () => undefined,
      }),
    ).resolves.toEqual({ state: 'recovered', applications: 1 });
  });

  test('a failed exact recovery preserves the original process identity and claim', async () => {
    survivor();
    const before = fs.readFileSync(filename(), 'utf8');
    await expect(
      recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication: async () => {
          throw new Error('application-identity-mismatch');
        },
      }),
    ).rejects.toThrow('application-identity-mismatch');
    expect(fs.readFileSync(filename(), 'utf8')).toBe(before);
  });

  test('barrier replacement preserves the exact recovery failure as well as the foreign barrier', async () => {
    survivor();
    const failure = new Error('application-recovery-unsettled');
    let barrier = `${filename()}.recovery`;
    let result: unknown;
    try {
      await recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication: async () => {
          if (fs.existsSync(`${filename()}.recovery-v2`)) barrier = `${filename()}.recovery-v2`;
          fs.renameSync(barrier, `${filename()}.old-recovery`);
          fs.mkdirSync(barrier);
          throw failure;
        },
      });
    } catch (error) {
      result = error;
    }
    expect(result).toBeInstanceOf(AggregateError);
    expect((result as AggregateError).errors).toContain(failure);
    expect((result as AggregateError).errors).toContainEqual(
      expect.objectContaining({ message: expect.stringMatching(/barrier ownership changed/) }),
    );
    expect(fs.existsSync(barrier)).toBe(true);
    expect(fs.existsSync(filename())).toBe(true);
  });

  test('concurrent reclaimers and a replaced claim never inherit cleanup authority', async () => {
    const claim = survivor();
    let finish!: () => void;
    const entered = new Promise<void>((resolve) => (finish = resolve));
    let dispatch!: () => void;
    const dispatched = new Promise<void>((resolve) => (dispatch = resolve));
    const recovery = {
      ...options(),
      probeOwner: async (candidate: DesktopWorkloadOwnerIdentity) =>
        candidate.id === claim.record.owner.id
          ? { state: 'exited' as const }
          : { state: 'alive' as const, processStartedAt: owner.startedAt },
      recoverApplication: async () => {
        dispatch();
        await entered;
      },
    };
    const first = recoverWindowsDesktopWorkloadClaim(recovery);
    await dispatched;
    await expect(recoverWindowsDesktopWorkloadClaim(recovery)).rejects.toThrow(/recovery.*busy|another.*recover/i);
    const replacement = '{"replacement":"foreign-owner"}';
    fs.writeFileSync(filename(), replacement);
    finish();
    await expect(first).rejects.toThrow(/ownership changed/);
    expect(fs.readFileSync(filename(), 'utf8')).toBe(replacement);
  });

  test('attached applications remain external and are never sent to the recovery terminator', async () => {
    const claim = createDesktopWorkloadClaim({ ...options(), runId: 'external-run', processIdentity: owner });
    claim.updateResource({
      id: 'external:1',
      identity: 'borrowed-incarnation',
      generation: 1,
      ownership: 'borrowed',
      readiness: 'ready',
      disposal: 'not-owned',
      application: { ...exact, endpoint: 'windows', lifetime: 'external', containment: 'external' },
    });
    const recoverApplication = jest.fn(async () => undefined);
    await expect(
      recoverWindowsDesktopWorkloadClaim({ ...options(), probeOwner: async () => ({ state: 'exited' }), recoverApplication }),
    ).resolves.toEqual({ state: 'recovered', applications: 0 });
    expect(recoverApplication).not.toHaveBeenCalled();
  });

  test.each(['windows', 'win32'] as const)('accepts supervisor ownership and an exact %s pin in configuration', (endpoint) => {
    const target = {
      endpoint,
      host: {
        kind: 'installed' as const,
        ownership: 'supervisor' as const,
        application: { processIdentity: exact, windowTitle: 'Fixture' },
      },
    };
    expect(() => defineDesktopConfig({ schemaVersion: 1, targets: { fixture: target } })).not.toThrow();
    for (const processIdentity of [
      { ...exact, interactiveSession: 'macos-session:2' },
      { ...exact, executablePath: 'ReactTest.exe' },
      { ...exact, processStartedAt: '2026-11-12T00:00:00.123456Z' },
      { processId: exact.processId, processStartedAt: exact.processStartedAt },
    ]) {
      expect(() =>
        defineDesktopConfig({
          schemaVersion: 1,
          targets: { fixture: { ...target, host: { ...target.host, application: { processIdentity, windowTitle: 'Fixture' } } } },
        }),
      ).toThrow(/identity|session|native|timestamp|executable/i);
    }
  });

  test.each(['windows', 'win32'] as const)(
    'resolves an installed exact %s pin without re-discovering another process',
    async (endpoint) => {
      const target: ResolvedDesktopTarget = {
        endpoint,
        id: 'exact-external',
        registrationId: 'exact-external',
        instanceId: 'external-instance',
        projectRoot: directory,
        configPath: path.join(directory, 'desktop.config.mts'),
        host: { kind: 'installed', ownership: 'external', application: { processIdentity: exact, windowTitle: 'Fixture' } },
      };
      await expect(resolveDesktopApplication(target)).resolves.toEqual(target.host.application);
    },
  );
});
