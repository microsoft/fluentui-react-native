import type { NativeElementSnapshot } from '../host/types';
import { HostStaleError, HostWebDriverError } from '../protocol/errors';
import type { WebDriverError } from '../protocol/errors';
import { buildSample, supportedFact, unsupportedFact } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import type { StubRuntime, StubRuntimeOptions } from '../testing/operationRuntime';
import { executeOperation } from './executor';
import type { FindResult } from './find';

function app() {
  return buildSample({
    children: [{ automationId: 'go', id: 'go', name: 'Go', role: 'button' }],
    id: 'win',
    name: 'Payroll',
    role: 'window',
  });
}

function snapshotOf(overrides: Partial<NativeElementSnapshot> = {}): NativeElementSnapshot {
  return {
    automationId: 'go',
    checked: unsupportedFact(),
    enabled: supportedFact(true),
    expanded: unsupportedFact(),
    focused: supportedFact(false),
    id: 'go',
    name: 'Go',
    rect: { height: 10, width: 20, x: 0, y: 0 },
    role: 'button',
    scope: 'application',
    selected: unsupportedFact(),
    visible: supportedFact(true),
    windowId: 'w1',
    ...overrides,
  };
}

function stub(options: StubRuntimeOptions = {}): StubRuntime {
  return stubRuntime({
    capabilities: { accessibilityClick: true, physicalClick: true },
    observation: app(),
    ...options,
    host: { snapshot: async () => snapshotOf(), ...options.host },
  });
}

async function failureOf(promise: Promise<unknown>): Promise<WebDriverError> {
  try {
    await promise;
  } catch (error) {
    return error as WebDriverError;
  }
  throw new Error('expected the operation to fail');
}

async function provenGo(runtime: StubRuntime) {
  const result = (await executeOperation(runtime.runtime, 'find', { input: { name: 'Go' } })).result as FindResult;
  return { ref: result.matches[0].ref, sample: result.sample.id };
}

const act = (runtime: StubRuntime, input: Record<string, unknown>) => executeOperation(runtime.runtime, 'act', { input });

describe('act', () => {
  describe('an element whose state forbids the action', () => {
    test('names the reference the selector proved, not the one the caller never gave', async () => {
      const runtime = stub({ host: { snapshot: async () => snapshotOf({ enabled: supportedFact(false) }) } });
      const failure = await failureOf(act(runtime, { action: 'activate', find: { name: 'Go' } }));
      expect(failure.data).toMatchObject({ reason: 'not-enabled' });
      expect(failure.message).toBe(`Reference "${runtime.state.refs.peek('go')}" is not enabled.`);
    });

    test('tells a state the provider cannot read from one that is false', async () => {
      const disabled = stub({ host: { snapshot: async () => snapshotOf({ enabled: unsupportedFact() }) } });
      const unreadable = await failureOf(act(disabled, { action: 'activate', find: { name: 'Go' } }));
      expect(unreadable).toMatchObject({
        code: 'element not interactable',
        data: { mutation: { effect: 'none' }, reason: 'state-unsupported' },
      });
      expect(unreadable.message).toContain(`"${disabled.state.refs.peek('go')}"`);

      const hidden = stub({ host: { snapshot: async () => snapshotOf({ visible: unsupportedFact() }) } });
      const { ref, sample } = await provenGo(hidden);
      expect((await failureOf(act(hidden, { action: 'click', ref, sample }))).data).toMatchObject({ reason: 'state-unsupported' });
    });
  });

  describe('a provider failure while acting', () => {
    test('is reported in fixed words for its code, keeping its machine reason and the settled outcome', async () => {
      const runtime = stub({
        host: {
          click: async () => {
            throw new HostWebDriverError('element not interactable', 'Window "Payroll Q3" element 0x1A2B refused the press', {
              nativeCode: 'automation-failed',
              reason: 'ax-refused',
            });
          },
        },
      });
      const { ref, sample } = await provenGo(runtime);
      const failure = await failureOf(act(runtime, { action: 'activate', ref, sample }));
      expect(failure).toMatchObject({
        code: 'element not interactable',
        data: { mutation: { effect: 'unknown' }, nativeCode: 'automation-failed', reason: 'ax-refused' },
      });
      expect(failure.message).toBe('The provider reported that the element cannot be interacted with.');
      expect(JSON.stringify(runtime.state.journal.read({ limit: 10 }).entries)).not.toContain('Payroll');
    });

    test('forgets a reference the provider says is gone, as a read does', async () => {
      const runtime = stub({
        host: {
          click: async () => {
            throw new HostStaleError('Element 0x1A2B of "Payroll Q3" is gone');
          },
        },
      });
      const { ref, sample } = await provenGo(runtime);
      const failure = await failureOf(act(runtime, { action: 'activate', ref, sample }));
      expect(failure).toMatchObject({ code: 'stale element reference' });
      expect(failure.message).not.toMatch(/Payroll|0x1A2B/);
      expect(runtime.state.refs.resolve(ref, 1).ok).toBe(false);
    });
  });

  describe('a physical click', () => {
    const covering = (windowId: string, id = 'cover') => snapshotOf({ id, windowId });
    const effectOf = (failure: WebDriverError) => (failure.data?.mutation as { disposition: string; effect: string }) ?? {};

    function clicking(hits: (call: number) => NativeElementSnapshot | null, elsewhere: Record<string, () => NativeElementSnapshot> = {}) {
      const activated: string[] = [];
      let call = 0;
      const runtime = stub({
        host: {
          activate: async (windowId) => {
            activated.push(windowId);
          },
          click: async () => undefined,
          hitTest: async () => hits((call += 1)),
          snapshot: async (nativeId) => (elsewhere[nativeId] ?? snapshotOf)(),
        },
      });
      return { activated, runtime };
    }

    test('refuses a point covered inside its own window before raising the window', async () => {
      const { activated, runtime } = clicking(() => covering('w1'));
      const { ref, sample } = await provenGo(runtime);
      const failure = await failureOf(act(runtime, { action: 'click', ref, sample }));
      expect(failure).toMatchObject({ code: 'element click intercepted', data: { reason: 'obscured' } });
      expect(effectOf(failure)).toMatchObject({ disposition: 'rejected', effect: 'none' });
      expect(activated).toEqual([]);
    });

    test('raises the window when another window covers it, and reports the raise when the point is still covered', async () => {
      const { activated, runtime } = clicking(() => covering('w2'));
      const { ref, sample } = await provenGo(runtime);
      const failure = await failureOf(act(runtime, { action: 'click', ref, sample }));
      expect(failure).toMatchObject({ code: 'element click intercepted', data: { reason: 'obscured' } });
      expect(effectOf(failure)).toMatchObject({ disposition: 'indeterminate', effect: 'partial' });
      expect(activated).toEqual(['w1']);
    });

    test('clicks once raising the window uncovers the element', async () => {
      const { activated, runtime } = clicking((call) => (call === 1 ? covering('w2') : snapshotOf()));
      const { ref, sample } = await provenGo(runtime);
      await expect(act(runtime, { action: 'click', ref, sample })).resolves.toMatchObject({ result: { mechanism: 'physical-pointer' } });
      expect(activated).toEqual(['w1']);
    });

    test('reports a hit test that failed after the raise as that failure, with the raise it could not undo', async () => {
      const { activated, runtime } = clicking((call) => {
        if (call === 1) {
          return covering('w2');
        }
        throw new HostWebDriverError('timeout', 'Hit test in "Payroll Q3" ran out of time');
      });
      const { ref, sample } = await provenGo(runtime);
      const failure = await failureOf(act(runtime, { action: 'click', ref, sample }));
      expect(failure).toMatchObject({ code: 'timeout' });
      expect(failure.message).not.toContain('Payroll');
      expect(effectOf(failure)).toMatchObject({ disposition: 'indeterminate', effect: 'partial' });
      expect(activated).toEqual(['w1']);
    });

    test('does not read a failed ancestor lookup as a covered element', async () => {
      const covered = snapshotOf({ id: 'cover', parentId: 'parent', windowId: 'w1' });
      const { runtime } = clicking(() => covered, {
        parent: () => {
          throw new HostWebDriverError('timeout', 'Ancestor lookup timed out');
        },
      });
      const { ref, sample } = await provenGo(runtime);
      const failure = await failureOf(act(runtime, { action: 'click', ref, sample }));
      expect(failure.code).toBe('timeout');
      expect(failure.data).not.toMatchObject({ reason: 'obscured' });
    });
  });
});
