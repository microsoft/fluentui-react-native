import { DESKTOP_PROTOCOL_VERSION } from '@fluentui-react-native/desktop-driver/protocol';

import {
  createCancelRequest,
  createRunRequest,
  isHostClosing,
  isTestedStory,
  resolveHostReady,
  resolveRunStatus,
  type DesktopRuntimeContract,
} from './desktopTestProtocol';

const runtime: DesktopRuntimeContract = {
  protocolVersion: DESKTOP_PROTOCOL_VERSION,
  manifestDigest: 'digest-1',
  testedStoryIds: ['button--default'],
};

const ready = {
  protocolVersion: DESKTOP_PROTOCOL_VERSION,
  serviceId: 'service-1',
  manifest: {
    schemaVersion: 1,
    digest: runtime.manifestDigest,
    tests: [{ storyId: 'button--default', planId: 'button-default', kind: 'inline' }],
  },
  capabilities: {
    runModes: ['selected', 'all'],
    cancellation: true,
    maxConcurrentRuns: 1,
  },
};

describe('desktop test host protocol decisions', () => {
  it('accepts only the generated app manifest and tested stories', () => {
    expect(resolveHostReady(ready, runtime)).toEqual({ ready });
    expect(resolveHostReady({ ...ready, manifest: { ...ready.manifest, digest: 'stale' } }, runtime)).toEqual({
      error: expect.stringContaining('different generated desktop-test manifests'),
    });
    expect(resolveHostReady({ ...ready, protocolVersion: 99 }, runtime)).toEqual({
      error: expect.stringContaining('does not match app protocol'),
    });
    expect(isTestedStory(runtime, 'button--default')).toBe(true);
    expect(isTestedStory(runtime, 'button--untested')).toBe(false);
  });

  it('accepts only matching, newer status envelopes', () => {
    const status = {
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      serviceId: 'service-1',
      requestId: 'request-1',
      sequence: 2,
      status: {
        runId: 'run-1',
        protocolVersion: DESKTOP_PROTOCOL_VERSION,
        state: 'running',
        requestedStoryIds: ['button--default'],
        results: [],
      },
    };
    expect(resolveRunStatus(status, { serviceId: 'service-1', requestId: 'request-1', sequence: 1 })).toEqual(status);
    expect(resolveRunStatus(status, { serviceId: 'service-1', requestId: 'request-1', sequence: 2 })).toBeUndefined();
    expect(resolveRunStatus(status, { serviceId: 'other', requestId: 'request-1', sequence: 0 })).toBeUndefined();
  });

  it('recognizes closing only for the current host', () => {
    expect(isHostClosing({ protocolVersion: DESKTOP_PROTOCOL_VERSION, serviceId: 'service-1' }, 'service-1')).toBe(true);
    expect(isHostClosing({ protocolVersion: DESKTOP_PROTOCOL_VERSION, serviceId: 'stale' }, 'service-1')).toBe(false);
  });

  it('creates exact run and cancel envelopes and rejects untested stories', () => {
    expect(createRunRequest(runtime, 'service-1', 'request-1', 'current', 'button--default')).toEqual({
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      serviceId: 'service-1',
      requestId: 'request-1',
      manifestDigest: runtime.manifestDigest,
      mode: 'selected',
      storyIds: ['button--default'],
    });
    expect(createRunRequest(runtime, 'service-1', 'request-2', 'all')).toEqual({
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      serviceId: 'service-1',
      requestId: 'request-2',
      manifestDigest: runtime.manifestDigest,
      mode: 'all',
      storyIds: undefined,
    });
    expect(createRunRequest(runtime, 'service-1', 'request-3', 'current', 'button--unknown')).toBeUndefined();
    expect(createCancelRequest('service-1', 'run-1')).toEqual({
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      serviceId: 'service-1',
      runId: 'run-1',
    });
  });
});
