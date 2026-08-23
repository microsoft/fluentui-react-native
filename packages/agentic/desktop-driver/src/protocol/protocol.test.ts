import {
  decodeDesktopHostClosing,
  decodeDesktopHostReady,
  decodeDesktopRunCancel,
  decodeDesktopRunRequest,
  decodeDesktopRunStatus,
} from './index.ts';

describe('desktop channel protocol codecs', () => {
  const ready = {
    protocolVersion: 1,
    serviceId: 'service-1',
    manifest: {
      schemaVersion: 1,
      digest: 'abc',
      tests: [{ storyId: 'button--default', planId: 'button-default', kind: 'inline' }],
    },
    capabilities: { runModes: ['selected', 'all'], cancellation: true, maxConcurrentRuns: 1 },
  };

  it('decodes a complete host readiness payload', () => {
    expect(decodeDesktopHostReady(ready)).toEqual(ready);
    expect(decodeDesktopHostReady({ ...ready, manifest: { ...ready.manifest, tests: [{ storyId: 'button--default' }] } })).toBeUndefined();
  });

  it('decodes only matching host-closing envelopes', () => {
    expect(decodeDesktopHostClosing({ protocolVersion: 1, serviceId: 'service-1' })).toEqual({
      protocolVersion: 1,
      serviceId: 'service-1',
    });
    expect(decodeDesktopHostClosing({ protocolVersion: 99, serviceId: 'service-1' })).toBeUndefined();
  });

  it('requires an exact manifest and selected story list in run requests', () => {
    const request = {
      protocolVersion: 1,
      serviceId: 'service-1',
      requestId: 'request-1',
      manifestDigest: 'abc',
      mode: 'selected',
      storyIds: ['button--default'],
    };
    expect(decodeDesktopRunRequest(request)).toEqual(request);
    expect(decodeDesktopRunRequest({ ...request, manifestDigest: undefined })).toBeUndefined();
    expect(decodeDesktopRunRequest({ ...request, storyIds: [] })).toBeUndefined();
  });

  it('decodes ordered run status and cancellation payloads', () => {
    const status = {
      protocolVersion: 1,
      serviceId: 'service-1',
      requestId: 'request-1',
      sequence: 1,
      status: { runId: 'run-1', protocolVersion: 1, state: 'running', requestedStoryIds: ['button--default'], results: [] },
    };
    expect(decodeDesktopRunStatus(status)).toEqual(status);
    expect(decodeDesktopRunStatus({ ...status, sequence: undefined })).toBeUndefined();
    expect(decodeDesktopRunCancel({ protocolVersion: 1, serviceId: 'service-1', runId: 'run-1' })).toBeDefined();
  });
});
