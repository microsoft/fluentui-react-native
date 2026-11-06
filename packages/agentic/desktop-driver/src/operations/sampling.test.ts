import { HostStaleError, HostWebDriverError } from '../protocol/errors';
import type { NativeObservation } from '../host/types';
import { buildSample } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import { nativeByteBudget } from './limits';
import { nativeDeadline, sampleTree } from './sampling';
import { OperationSessionState } from './sessionState';

const limits = { deadlineMs: 3_000, maxDepth: 24, maxStringLength: 120, maxVisited: 1_500 };
const request = { facts: [], limits };

function buttons(prefix: string, count: number): NativeObservation {
  return buildSample({
    children: Array.from({ length: count }, (_, index) => ({ id: `${prefix}${index}`, name: `Button ${index}`, role: 'button' })),
    id: `${prefix}root`,
    role: 'window',
  });
}

describe('nativeDeadline', () => {
  test.each([
    [15_000, 10_000, 8_500],
    [3_000, 10_000, 3_000],
    [3_000, 1_000, 50],
  ])('fits a request of %ims inside a %ims native timeout as %ims', (requested, timeout, expected) => {
    expect(nativeDeadline(requested, timeout)).toBe(expected);
  });
});

describe('sampleTree', () => {
  test('asks the provider for the facts and limits given, rooted at the current window', async () => {
    const stub = stubRuntime();
    await sampleTree(
      stub.runtime,
      { facts: ['enabled'], limits: { deadlineMs: 15_000, maxDepth: 5, maxStringLength: 64, maxVisited: 200 } },
      () => 0,
    );
    expect(stub.observed).toEqual([
      {
        budget: { deadlineMs: 8_500, maxBytes: nativeByteBudget(200, 64), maxDepth: 5, maxStringLength: 64, maxVisited: 200 },
        facts: ['enabled'],
        windowId: 'w1',
      },
    ]);
  });

  test('issues references only where the callback asks and releases every other element it read', async () => {
    const stub = stubRuntime({ observation: buttons('a', 2) });
    const sampled = await sampleTree(stub.runtime, request, ({ issue, observation }) => issue(observation.nodes[1]));
    expect(stub.state.refs.holds('a0')).toBe(true);
    expect(new Set(stub.released.flat())).toEqual(new Set(['aroot', 'a1']));
    expect(stub.state.ledger.pendingCount).toBe(0);
    expect(sampled.warnings).toEqual([]);
  });

  test('evicts the oldest references beyond capacity and releases their elements', async () => {
    const state = new OperationSessionState({ referenceCapacity: 512 });
    const issueAll = ({ issue, observation }) => observation.nodes.slice(1).map(issue);
    const first = stubRuntime({ observation: buttons('a', 400), state });
    await sampleTree(first.runtime, request, issueAll);
    expect(state.refs.size).toBe(400);
    expect(first.released.flat()).toEqual(['aroot']);

    const second = stubRuntime({ observation: buttons('b', 400), state });
    await sampleTree(second.runtime, request, issueAll);
    expect(state.refs.size).toBe(512);
    expect(second.released.flat().filter((id) => id.startsWith('a'))).toHaveLength(288);
    expect(state.refs.holds('a0')).toBe(false);
    expect(state.refs.holds('a288')).toBe(true);
    expect(state.refs.holds('b399')).toBe(true);
  });

  test('warns when records cannot be released and retries them on the next sample', async () => {
    const stub = stubRuntime({ observation: buttons('a', 3) });
    stub.control.releaseError = new Error('the helper went away');
    const failed = await sampleTree(stub.runtime, request, () => 'kept');
    expect(failed.value).toBe('kept');
    expect(failed.warnings).toEqual([{ code: 'release-failed', pending: 4 }]);

    stub.control.releaseError = undefined;
    const retried = await sampleTree(stub.runtime, request, () => 'kept');
    expect(retried.warnings).toEqual([]);
    expect(stub.state.ledger.pendingCount).toBe(0);
  });

  test('still releases what it read, and rethrows, when the callback fails', async () => {
    const stub = stubRuntime({ observation: buttons('a', 2) });
    const failing = sampleTree(stub.runtime, request, ({ issue, observation }) => {
      issue(observation.nodes[1]);
      throw new Error('projection failed');
    });
    await expect(failing).rejects.toThrow('projection failed');
    expect(new Set(stub.released.flat())).toEqual(new Set(['aroot', 'a1']));
  });

  test('numbers samples and reports the epoch each was taken in', async () => {
    const stub = stubRuntime();
    const first = await sampleTree(stub.runtime, request, () => 0);
    stub.control.previewGeneration = 4;
    stub.state.startIncarnation();
    const second = await sampleTree(stub.runtime, request, () => 0);
    expect(first.sample).toMatchObject({ epoch: { incarnation: 1, region: 1 }, id: 'o1', scope: 'window', window: 'w1' });
    expect(second.sample).toMatchObject({ epoch: { incarnation: 2, region: 4 }, id: 'o2' });
    expect(Number.isNaN(Date.parse(first.sample.capturedAt))).toBe(false);
  });

  test('has nothing to observe without a window', async () => {
    const stub = stubRuntime({ windowId: null });
    await expect(sampleTree(stub.runtime, request, () => 0)).rejects.toMatchObject({
      code: 'no such window',
      data: { reason: 'no-window' },
    });
    expect(stub.observed).toEqual([]);
  });

  describe('within a reference', () => {
    test('roots the sample at the element, in the window that issued the reference', async () => {
      const stub = stubRuntime({ observation: buildSample({ children: [{ id: 'ok', role: 'button' }], id: 'dlg', role: 'dialog' }) });
      const first = await sampleTree(stub.runtime, request, ({ issue, observation }) => issue(observation.nodes[0]));
      stub.control.windowId = 'w2';
      const second = await sampleTree(stub.runtime, { ...request, within: first.value }, () => 0);
      expect(stub.observed[1]).toMatchObject({ rootId: 'dlg', windowId: 'w1' });
      expect(second.sample).toMatchObject({ scope: 'element', window: 'w1' });
    });

    test('rejects a reference it cannot resolve without asking the provider', async () => {
      const stub = stubRuntime();
      await expect(sampleTree(stub.runtime, { ...request, within: '!!' }, () => 0)).rejects.toMatchObject({
        code: 'invalid argument',
        data: { reason: 'ref-malformed' },
      });
      expect(stub.observed).toEqual([]);
    });

    test('expires references into a replaced preview region', async () => {
      const stub = stubRuntime({ observation: buildSample({ id: 'p', role: 'group', scope: 'preview' }) });
      const first = await sampleTree(stub.runtime, request, ({ issue, observation }) => issue(observation.nodes[0]));
      stub.control.previewGeneration = 2;
      await expect(sampleTree(stub.runtime, { ...request, within: first.value }, () => 0)).rejects.toMatchObject({
        code: 'stale element reference',
        data: { reason: 'ref-region-changed' },
      });
      expect(stub.observed).toHaveLength(1);
    });

    test('forgets a reference the provider no longer tracks and queues its element for release', async () => {
      const stub = stubRuntime({
        observe: (_request, _signal, call) => {
          if (call > 1) {
            throw new HostStaleError();
          }
          return buildSample({ children: [{ id: 'gone', role: 'button' }], id: 'root', role: 'window' });
        },
      });
      const first = await sampleTree(stub.runtime, request, ({ issue, observation }) => issue(observation.nodes[1]));
      await expect(sampleTree(stub.runtime, { ...request, within: first.value }, () => 0)).rejects.toMatchObject({
        code: 'stale element reference',
        data: { reason: 'ref-stale' },
      });
      expect(stub.state.refs.resolve(first.value, 1)).toMatchObject({ failure: 'expired', ok: false });
      expect(stub.state.ledger.pendingCount).toBe(1);
    });
  });

  test('forgets every reference into a window the provider reports closed', async () => {
    const stub = stubRuntime({
      observe: (_request, _signal, call) => {
        if (call > 1) {
          throw new HostWebDriverError('no such window', 'Window "w1" is not open.');
        }
        return buttons('a', 3);
      },
    });
    await sampleTree(stub.runtime, request, ({ issue, observation }) => observation.nodes.slice(1).map(issue));
    expect(stub.state.refs.size).toBe(3);
    await expect(sampleTree(stub.runtime, request, () => 0)).rejects.toMatchObject({
      code: 'no such window',
      data: { reason: 'window-closed' },
    });
    expect(stub.state.refs.size).toBe(0);
  });

  test('stops when the caller leaves, issuing no references and releasing nothing', async () => {
    const controller = new AbortController();
    let markStarted: () => void;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const stub = stubRuntime({
      observe: (_request, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason));
          markStarted();
        }),
      signal: controller.signal,
    });
    const pending = sampleTree(stub.runtime, request, () => 0);
    await started;
    controller.abort();
    await expect(pending).rejects.toMatchObject({ data: { reason: 'cancelled' } });
    expect(stub.state.refs.size).toBe(0);
    expect(stub.released).toEqual([]);
  });
});
