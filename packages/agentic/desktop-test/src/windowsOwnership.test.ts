import fs from 'node:fs';
import path from 'node:path';

import type { ApplicationLease } from '@fluentui-react-native/desktop-driver';

import { captureDesktopApplicationIdentity, desktopApplicationIdentityDescriptor } from './applicationOwnership';
import { createDesktopWorkloadClaim, recoverWindowsDesktopWorkloadClaim } from './ownership';
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
  const options = () => ({ directory, endpoint: 'windows' as const, targetId: 'packaged', targetInstanceId: 'package-instance' });
  const filename = () => path.join(directory, 'interactive.lock');

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(process.cwd(), '.windows-ownership-test-'));
  });
  afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

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
    let result: unknown;
    try {
      await recoverWindowsDesktopWorkloadClaim({
        ...options(),
        probeOwner: async () => ({ state: 'exited' }),
        recoverApplication: async () => {
          fs.renameSync(`${filename()}.recovery`, `${filename()}.old-recovery`);
          fs.mkdirSync(`${filename()}.recovery`);
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
    expect(fs.existsSync(`${filename()}.recovery`)).toBe(true);
    expect(fs.existsSync(filename())).toBe(true);
  });

  test('concurrent reclaimers and a replaced claim never inherit cleanup authority', async () => {
    survivor();
    let finish!: () => void;
    const entered = new Promise<void>((resolve) => (finish = resolve));
    let dispatch!: () => void;
    const dispatched = new Promise<void>((resolve) => (dispatch = resolve));
    const recovery = {
      ...options(),
      probeOwner: async () => ({ state: 'exited' as const }),
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
