import fs from 'node:fs';
import path from 'node:path';

import type { ApplicationLease, DesktopHost, DesktopTarget } from '@fluentui-react-native/desktop-driver';

import {
  captureDesktopApplicationIdentity,
  createDesktopApplicationHost,
  desktopApplicationIdentityDescriptor,
} from './applicationOwnership';
import type { DesktopResourceRecord } from './resources';
import { createDesktopWorkloadClaim } from './ownership';

const owned: ApplicationLease = {
  id: 'lease-1',
  ownership: 'launched',
  processId: 123,
  processStartedAt: '2026-11-12T00:00:00.123456Z',
  containment: 'uncontained',
  launchKind: 'launch-services',
};
const target = { endpoint: 'macos', id: 'fixture', launchModes: ['launch'], platformName: 'macos' } satisfies Omit<DesktopTarget, 'host'>;
type DesktopHostEvent = Parameters<Parameters<NonNullable<DesktopHost['subscribe']>>[0]>[0];

function fixture() {
  const records: DesktopResourceRecord[] = [];
  let listener: ((event: DesktopHostEvent) => void) | undefined;
  const native = {
    endpoint: 'macos',
    probe: jest.fn(async () => ({})),
    launch: jest.fn(async () => ({ ...owned })),
    attach: jest.fn(async () => ({ ...owned, ownership: 'attached' as const, containment: 'external' as const })),
    windows: jest.fn(async () => []),
    closeApplication: jest.fn(async () => undefined),
    dispose: jest.fn(async () => undefined),
    subscribe: jest.fn((callback: (event: DesktopHostEvent) => void) => {
      listener = callback;
      return () => undefined;
    }),
  };
  const host = native as unknown as DesktopHost;
  return {
    native,
    host,
    records,
    options: { target, resourcePrefix: 'run:target', onResource: (record: DesktopResourceRecord) => records.push(record) },
    event: (event: DesktopHostEvent) => listener?.(event),
  };
}

describe('neutral desktop application ownership', () => {
  test('publishes the possible launch before dispatch and journals the acquired exact process', async () => {
    const f = fixture();
    f.native.launch.mockImplementationOnce(async () => {
      expect(f.records).toHaveLength(1);
      expect(f.records[0]).toMatchObject({ readiness: 'pending', disposal: 'pending', application: { lifetime: 'session' } });
      return { ...owned };
    });
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    const lease = await host.launch({ ...target, host });
    expect(f.records.at(-1)).toMatchObject({
      readiness: 'ready',
      ownership: 'owned',
      application: {
        processId: owned.processId,
        processStartedAt: owned.processStartedAt,
        launchKind: 'launch-services',
        containment: 'uncontained',
      },
    });
    await host.closeApplication(lease);
    expect(f.native.closeApplication).toHaveBeenCalledWith(owned, undefined);
    expect(f.records.at(-1)?.disposal).toBe('settled');
    await host.dispose();
    expect(f.native.closeApplication).toHaveBeenCalledTimes(1);
  });

  test('supervisor owns one launch across sessions, while sessions receive only borrowed leases', async () => {
    const f = fixture();
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'supervisor' });
    const first = await host.launch({ ...target, host });
    await host.closeApplication(first);
    const second = await host.launch({ ...target, host });
    expect(first).toMatchObject({ id: owned.id, ownership: 'attached' });
    expect(second).toEqual(first);
    expect(f.native.launch).toHaveBeenCalledTimes(1);
    expect(f.native.closeApplication).not.toHaveBeenCalled();
    expect(f.records.at(-1)?.disposal).toBe('pending');
    await host.dispose();
    expect(f.native.closeApplication).toHaveBeenCalledTimes(1);
    expect(f.native.closeApplication).toHaveBeenCalledWith(owned, undefined);
    expect(f.records.at(-1)).toMatchObject({ disposal: 'settled', application: { lifetime: 'supervisor' } });
  });

  test('attached applications remain borrowed during session close and supervisor cleanup', async () => {
    const f = fixture();
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'external' });
    await expect(host.launch({ ...target, host })).rejects.toThrow(/only be attached/);
    const lease = await host.attach({ ...target, host });
    expect(f.records.at(-1)).toMatchObject({ ownership: 'borrowed', disposal: 'not-owned', application: { lifetime: 'external' } });
    await host.dispose();
    expect(f.native.closeApplication).toHaveBeenCalledWith({ ...owned, ownership: 'attached', containment: 'external' }, undefined);
    expect(f.native.launch).not.toHaveBeenCalled();
    expect(lease.ownership).toBe('attached');
  });

  test('stale and foreign leases cannot close the acquired application; events are advisory', async () => {
    const f = fixture();
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    const lease = await host.launch({ ...target, host });
    await expect(host.closeApplication({ ...lease, processStartedAt: '2026-11-12T00:00:00.123457Z' })).rejects.toThrow(/foreign, stale/);
    await expect(host.closeApplication({ ...lease, id: 'foreign' })).rejects.toThrow(/foreign, stale/);
    host.subscribe?.(() => undefined);
    f.event({ type: 'application-exited', applicationId: owned.id });
    f.event({ type: 'application-exited', applicationId: 'foreign' });
    expect(f.records.at(-1)?.disposal).toBe('pending');
    expect(f.native.closeApplication).not.toHaveBeenCalled();
    await host.dispose();
  });

  test('a failed unleased launch names its survivor and remains unsettled after helper disposal', async () => {
    const f = fixture();
    const error = Object.assign(new Error('survivor'), {
      data: {
        processId: owned.processId,
        processStartedAt: owned.processStartedAt,
        launchKind: 'launch-services',
        applicationSettlement: 'unknown',
      },
    });
    f.native.launch.mockRejectedValueOnce(error);
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    await expect(host.launch({ ...target, host })).rejects.toThrow('survivor');
    expect(f.records.at(-1)).toMatchObject({
      readiness: 'failed',
      disposal: 'failed',
      application: { processId: owned.processId, processStartedAt: owned.processStartedAt },
    });
    await expect(host.dispose()).rejects.toThrow(/did not settle/);
    expect(f.records.at(-1)?.disposal).toBe('failed');
  });

  test.each(['macos', 'windows', 'win32'] as const)(
    'a no-data %s launch rejection releases the claim for the next run',
    async (endpoint) => {
      const directory = fs.mkdtempSync(path.join(process.cwd(), '.application-claim-test-'));
      const claimOptions = { directory, runId: 'failed-launch', targetId: 'fixture', targetInstanceId: 'fixture' };
      try {
        const claim = createDesktopWorkloadClaim(claimOptions);
        const f = fixture();
        f.native.endpoint = endpoint;
        f.native.launch.mockRejectedValueOnce(new Error('launch rejected before creating an application'));
        const configured = {
          ...target,
          endpoint,
          platformName: endpoint === 'macos' ? 'macos' : 'windows',
        } satisfies Omit<DesktopTarget, 'host'>;
        const host = await createDesktopApplicationHost(f.host, {
          ...f.options,
          target: configured,
          lifetime: 'session',
          onResource: (record) => claim.updateResource(record),
        });
        await expect(host.launch({ ...configured, host })).rejects.toThrow('launch rejected');
        await host.dispose();
        expect(claim.record).toMatchObject({
          state: 'active',
          resources: [expect.objectContaining({ readiness: 'failed', disposal: 'settled' })],
          unresolvedEffects: [],
        });
        claim.release();
        expect(fs.existsSync(path.join(directory, 'interactive.lock'))).toBe(false);
        const next = createDesktopWorkloadClaim({ ...claimOptions, runId: 'next-run' });
        next.release();
      } finally {
        fs.rmSync(directory, { force: true, recursive: true });
      }
    },
  );

  test('an explicit not-started verdict settles an otherwise indeterminate launch rejection', async () => {
    const f = fixture();
    f.native.launch.mockRejectedValueOnce(
      Object.assign(new Error('no installed application'), {
        effect: 'unknown',
        data: { applicationSettlement: 'not-started' },
      }),
    );
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    await expect(host.launch({ ...target, host })).rejects.toThrow('no installed application');
    expect(f.records.at(-1)?.disposal).toBe('settled');
    await host.dispose();
  });

  test.each([
    { applicationSettlement: 'unknown' },
    { applicationSettlement: 'unrecognized-verdict' },
    { processId: owned.processId },
    { processStartedAt: owned.processStartedAt },
    { processId: owned.processId, applicationSettlement: 'not-started' },
  ])('a launch that may have created a process remains fenced with evidence %p', async (data) => {
    const f = fixture();
    f.native.launch.mockRejectedValueOnce(Object.assign(new Error('launch interrupted'), { data }));
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    await expect(host.launch({ ...target, host })).rejects.toThrow('launch interrupted');
    await expect(host.dispose()).rejects.toThrow(/did not settle/);
    expect(f.records.at(-1)?.disposal).toBe('failed');
  });

  test('a launch that succeeded after cancellation remains uncertain without a returned lease', async () => {
    const f = fixture();
    f.native.launch.mockRejectedValueOnce(Object.assign(new Error('completed after cancellation'), { effect: 'applied' }));
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    await expect(host.launch({ ...target, host })).rejects.toThrow('completed after cancellation');
    await expect(host.dispose()).rejects.toThrow(/did not settle/);
  });

  test.each(['windows', 'win32'] as const)('names an uncontained %s application in the durable failed-cleanup claim', async (endpoint) => {
    const directory = fs.mkdtempSync(path.join(process.cwd(), '.application-claim-test-'));
    try {
      const claim = createDesktopWorkloadClaim({
        directory,
        runId: 'survivor',
        targetId: 'packaged',
        targetInstanceId: 'packaged',
      });
      const f = fixture();
      f.native.endpoint = endpoint;
      f.native.launch.mockResolvedValueOnce({
        id: 'uncontained-package',
        ownership: 'launched',
        processId: 456,
        processStartedAt: '2026-11-12T00:00:00.1234567Z',
        containment: 'uncontained',
      });
      f.native.closeApplication.mockRejectedValue(new Error('packaged survivor'));
      const configured = { ...target, endpoint, platformName: 'windows' } satisfies Omit<DesktopTarget, 'host'>;
      const host = await createDesktopApplicationHost(f.host, {
        ...f.options,
        target: configured,
        lifetime: 'session',
        onResource: (record) => claim.updateResource(record),
      });
      await host.launch({ ...configured, host });
      await expect(host.dispose()).rejects.toThrow(/did not settle/);
      const persisted = JSON.parse(fs.readFileSync(path.join(directory, 'interactive.lock'), 'utf8'));
      expect(persisted).toMatchObject({
        state: 'fenced',
        resources: [
          expect.objectContaining({
            disposal: 'failed',
            application: {
              endpoint,
              lifetime: 'session',
              leaseId: 'uncontained-package',
              processId: 456,
              processStartedAt: '2026-11-12T00:00:00.1234567Z',
              containment: 'uncontained',
            },
          }),
        ],
        unresolvedEffects: [expect.objectContaining({ resourceIdentity: persisted.resources[0].identity })],
      });
      expect(() => claim.release()).toThrow(/unresolved/);
    } finally {
      fs.rmSync(directory, { force: true, recursive: true });
    }
  });

  test('late acquisition is drained and exactly closed before owner disposal settles', async () => {
    const f = fixture();
    let finish!: (lease: ApplicationLease) => void;
    f.native.launch.mockImplementationOnce(() => new Promise<ApplicationLease>((resolve) => (finish = resolve)));
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    const acquisition = host.launch({ ...target, host });
    const disposal = host.dispose();
    expect(f.native.dispose).not.toHaveBeenCalled();
    finish(owned);
    await acquisition;
    await disposal;
    expect(f.native.closeApplication).toHaveBeenCalledWith(owned, undefined);
    expect(f.records.at(-1)?.disposal).toBe('settled');
  });

  test('publication failure after launch still disposes the exact owned lease', async () => {
    const f = fixture();
    let publications = 0;
    const host = await createDesktopApplicationHost(f.host, {
      ...f.options,
      lifetime: 'session',
      onResource(record) {
        f.records.push(record);
        if (++publications > 1) throw new Error('claim publication failed');
      },
    });
    await expect(host.launch({ ...target, host })).rejects.toThrow(/publication failed/);
    await expect(host.dispose()).rejects.toThrow(/did not settle/);
    expect(f.native.closeApplication).toHaveBeenCalledWith(owned, undefined);
    expect(f.native.dispose).toHaveBeenCalledTimes(1);
  });

  test('a failed pending publication prevents native launch dispatch', async () => {
    const f = fixture();
    const host = await createDesktopApplicationHost(f.host, {
      ...f.options,
      lifetime: 'session',
      onResource() {
        throw new Error('claim unavailable');
      },
    });
    await expect(host.launch({ ...target, host })).rejects.toThrow('claim unavailable');
    expect(f.native.launch).not.toHaveBeenCalled();
    await host.dispose();
  });

  test('a cancelled launch can settle only with exact provider exit evidence', async () => {
    const f = fixture();
    f.native.launch.mockRejectedValueOnce(
      Object.assign(new Error('cancelled'), {
        name: 'AbortError',
        data: { processId: owned.processId, processStartedAt: owned.processStartedAt, applicationSettlement: 'exited' },
      }),
    );
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    await expect(host.launch({ ...target, host })).rejects.toMatchObject({ name: 'AbortError' });
    expect(f.records.at(-1)).toMatchObject({ readiness: 'failed', disposal: 'settled', application: { processId: owned.processId } });
    await host.dispose();
    expect(f.native.launch).toHaveBeenCalledTimes(1);
  });

  test('failed close retains the acquired identity and refuses to report settled disposal', async () => {
    const f = fixture();
    f.native.closeApplication.mockRejectedValue(new Error('permission refused'));
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    const lease = await host.launch({ ...target, host });
    await expect(host.closeApplication(lease)).rejects.toThrow('permission refused');
    await expect(host.dispose()).rejects.toThrow(/did not settle/);
    expect(f.records.at(-1)).toMatchObject({
      disposal: 'failed',
      application: { processId: owned.processId, processStartedAt: owned.processStartedAt },
    });
  });

  test('duplicate lease identifiers keep both named resources and never authorize a guessed close', async () => {
    const f = fixture();
    const host = await createDesktopApplicationHost(f.host, { ...f.options, lifetime: 'session' });
    const first = await host.launch({ ...target, host });
    f.native.launch.mockResolvedValueOnce({ ...owned, processId: 456 });
    await expect(host.launch({ ...target, host })).rejects.toThrow(/ambiguous/);
    await expect(host.closeApplication(first)).rejects.toThrow(/foreign, stale/);
    expect(new Set(f.records.map((record) => record.id)).size).toBe(2);
    await expect(host.dispose()).rejects.toThrow(/did not settle/);
    expect(f.native.closeApplication).not.toHaveBeenCalled();
  });

  test('neutral exact attach rejects legacy timestamp precision and never grants launch authority', () => {
    const identity = captureDesktopApplicationIdentity(owned, 'macos');
    expect(desktopApplicationIdentityDescriptor(identity, { windowTitle: 'Fixture' })).toEqual({
      windowTitle: 'Fixture',
      processIdentity: { processId: owned.processId, processStartedAt: owned.processStartedAt },
    });
    expect(() => captureDesktopApplicationIdentity({ ...owned, processStartedAt: '2026-11-12T00:00:00.123Z' }, 'macos')).toThrow(
      /microsecond/,
    );
    expect(() => captureDesktopApplicationIdentity({ ...owned, processId: 0x80000000 }, 'macos')).toThrow(/native PID/);
    expect(() =>
      desktopApplicationIdentityDescriptor(identity, { windowTitle: 'Fixture', leasePath: 'old', leaseNonce: 'secret' }),
    ).toThrow(/legacy lease/);
  });
});
