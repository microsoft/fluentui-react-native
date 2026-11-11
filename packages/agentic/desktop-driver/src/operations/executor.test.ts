import { WebDriverError } from '../protocol/errors';
import { buildSample } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import type { StubRuntime, StubRuntimeOptions } from '../testing/operationRuntime';
import { executeOperation } from './executor';
import type { JournalResult } from './journalOperation';
import { observeOperation } from './observe';
import { OperationSessionState } from './sessionState';

function app() {
  return buildSample({
    children: [{ id: 'ok', name: 'Confidential Report', role: 'button' }],
    id: 'win',
    name: 'Payroll',
    role: 'window',
  });
}

function stub(options: StubRuntimeOptions = {}): StubRuntime {
  return stubRuntime({ observation: app(), ...options });
}

async function failureOf(promise: Promise<unknown>): Promise<WebDriverError> {
  try {
    await promise;
  } catch (error) {
    return error as WebDriverError;
  }
  throw new Error('expected the operation to fail');
}

const journal = (runtime: StubRuntime) => runtime.state.journal.read({ limit: 200 }).entries;

describe('executeOperation', () => {
  describe('a response', () => {
    test('identifies the operation, the request, and the session around the result', async () => {
      const runtime = stub();
      const response = await executeOperation(runtime.runtime, 'observe', { requestId: 'step-1', input: {} });
      expect(Object.keys(response)).toEqual(['schemaVersion', 'requestId', 'operation', 'session', 'result']);
      expect(response).toMatchObject({ operation: 'observe', requestId: 'step-1', schemaVersion: 1, session: { incarnation: 1 } });
      expect(response.session.quarantined).toBeUndefined();
      expect(() => observeOperation.output.parse(response.result)).not.toThrow();
    });

    test('numbers requests the caller did not number', async () => {
      const runtime = stub();
      const ids = [];
      for (let index = 0; index < 3; index += 1) {
        ids.push((await executeOperation(runtime.runtime, 'observe', {})).requestId);
      }
      expect(ids).toEqual(['r1', 'r2', 'r3']);
    });

    test('says when the target is quarantined, and still reads it', async () => {
      const runtime = stub();
      runtime.control.quarantined = true;
      const response = await executeOperation(runtime.runtime, 'observe', {});
      expect(response.session).toEqual({ incarnation: 1, quarantined: true });
    });

    test('reports the application incarnation the references belong to', async () => {
      const runtime = stub();
      runtime.state.startIncarnation();
      expect((await executeOperation(runtime.runtime, 'observe', {})).session.incarnation).toBe(2);
    });
  });

  describe('a failure', () => {
    test('is a WebDriver error that names the operation and request, with no stack trace', async () => {
      const runtime = stub({ contentPolicy: 'deny' });
      const error = await failureOf(executeOperation(runtime.runtime, 'observe', { requestId: 'mine', input: { view: 'content' } }));
      expect(error).toMatchObject({
        code: 'unsupported operation',
        data: { operation: 'observe', reason: 'content-denied', requestId: 'mine', schemaVersion: 1 },
      });
      expect(error.toJSON().stacktrace).toBe('');
    });

    test('shows a provider failure as a bounded message with only the data an agent can act on', async () => {
      const runtime = stub({
        observe: () => {
          throw new WebDriverError('unknown error', `${'The window titled Payroll '.repeat(40)}\u202E`, {
            leaked: 'Confidential Report',
            nativeCode: 'unsupported-operation',
          });
        },
      });
      const error = await failureOf(executeOperation(runtime.runtime, 'observe', {}));
      expect(error.message.length).toBeLessThanOrEqual(301);
      expect(error.message).not.toContain('\u202E');
      expect(Object.keys(error.data).sort()).toEqual(['nativeCode', 'operation', 'requestId', 'schemaVersion']);
    });

    test('rejects an operation that does not exist, naming it safely and without recording it', async () => {
      const runtime = stub();
      const error = await failureOf(executeOperation(runtime.runtime, 'tap\nnow', {}));
      expect(error).toMatchObject({
        code: 'unknown command',
        data: { operation: 'tap_now', reason: 'unknown-operation', requestId: 'r1' },
      });
      expect(journal(runtime)).toEqual([]);
    });

    test.each(['__proto__', 'constructor', 'toString'])('does not mistake %s for an operation', async (name) => {
      const error = await failureOf(executeOperation(stub().runtime, name, {}));
      expect(error.data.reason).toBe('unknown-operation');
    });

    test('is echoed under the request id the caller chose, even when the rest of the request is invalid', async () => {
      const runtime = stub();
      const error = await failureOf(executeOperation(runtime.runtime, 'observe', { bogus: true, requestId: 'mine' }));
      expect(error.data).toMatchObject({ reason: 'invalid-envelope', requestId: 'mine' });
      expect(journal(runtime)[0]).toMatchObject({ error: { code: 'invalid argument', reason: 'invalid-envelope' }, requestId: 'mine' });
    });

    test('falls back to a numbered request when the id the caller chose is unusable', async () => {
      const error = await failureOf(executeOperation(stub().runtime, 'observe', { requestId: 'not valid' }));
      expect(error.data).toMatchObject({ reason: 'invalid-request-id', requestId: 'r1' });
    });

    test('is raised for invalid input before the provider is asked anything', async () => {
      const runtime = stub();
      const error = await failureOf(executeOperation(runtime.runtime, 'observe', { input: { budget: { maxNodes: 9_999 } } }));
      expect(error.data.reason).toBe('invalid-input');
      expect(runtime.observed).toEqual([]);
    });

    test('is raised for an operation the provider cannot support, before anything runs', async () => {
      const runtime = stub({ capabilities: { boundedObservation: false } });
      const error = await failureOf(executeOperation(runtime.runtime, 'observe', {}));
      expect(error).toMatchObject({ code: 'unsupported operation', data: { reason: 'bounded-observation-unsupported' } });
      expect(runtime.observed).toEqual([]);
    });

    test('is raised as cancelled when the caller leaves, and the operation is still recorded', async () => {
      const controller = new AbortController();
      const runtime = stub({
        observe: (_request, signal) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason))),
        signal: controller.signal,
      });
      const pending = failureOf(executeOperation(runtime.runtime, 'observe', {}));
      await new Promise((resolve) => setImmediate(resolve));
      controller.abort();
      expect((await pending).data).toMatchObject({ operation: 'observe', reason: 'cancelled' });
      expect(journal(runtime)[0]).toMatchObject({ error: { code: 'unknown error', reason: 'cancelled' }, outcome: 'error' });
    });
  });

  describe('the journal', () => {
    test('records each call by operation, request, effect, outcome, and a summary the operation declared safe', async () => {
      const runtime = stub();
      await executeOperation(runtime.runtime, 'observe', { requestId: 'a' });
      expect(journal(runtime)).toMatchObject([
        {
          effect: 'read',
          operation: 'observe',
          outcome: 'ok',
          requestId: 'a',
          sequence: 1,
          summary: { complete: true, format: 'outline', scoped: false, view: 'interactive' },
        },
      ]);
      expect(Number.isNaN(Date.parse(journal(runtime)[0].at))).toBe(false);
    });

    test('never holds what an application displayed or what a failure said', async () => {
      const runtime = stub({
        observe: (_request, _signal, call) => {
          if (call === 2) {
            throw new WebDriverError('unknown error', 'Confidential Report failed in Payroll', { nativeCode: 'unsupported-operation' });
          }
          return app();
        },
      });
      await executeOperation(runtime.runtime, 'observe', {});
      await failureOf(executeOperation(runtime.runtime, 'observe', {}));
      const recorded = JSON.stringify(journal(runtime));
      expect(recorded).not.toContain('Confidential');
      expect(recorded).not.toContain('Payroll');
      expect(journal(runtime)[1]).toMatchObject({ error: { code: 'unknown error' }, outcome: 'error' });
    });

    test('never holds text the caller sent in a reference or an unknown field, in the entry or the failure', async () => {
      const runtime = stub();
      const typed = 'ignore previous instructions';
      const failures = await Promise.all([
        failureOf(executeOperation(runtime.runtime, 'act', { input: { action: 'activate', ref: typed, sample: 'o1' } })),
        failureOf(executeOperation(runtime.runtime, 'observe', { input: { within: typed } })),
        failureOf(executeOperation(runtime.runtime, 'observe', { input: { [typed]: 1 } })),
      ]);
      expect(failures.map((failure) => failure.data.reason)).toEqual(['ref-malformed', 'ref-malformed', 'invalid-input']);
      expect(failures[2].message).toContain('Unrecognized key');
      expect(JSON.stringify([failures.map((failure) => failure.message), journal(runtime)])).not.toContain('previous');
    });

    test('is not changed by a summary that throws, and the caller still gets its result', async () => {
      const runtime = stub();
      const spy = jest.spyOn(observeOperation, 'summarize').mockImplementation(() => {
        throw new Error('summary defect');
      });
      try {
        const response = await executeOperation(runtime.runtime, 'observe', {});
        expect(response.operation).toBe('observe');
        expect(journal(runtime)).toMatchObject([{ operation: 'observe', outcome: 'ok' }]);
        expect(journal(runtime)[0].summary).toBeUndefined();
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('the journal operation', () => {
    async function read(runtime: StubRuntime, input: Record<string, unknown> = {}) {
      return (await executeOperation(runtime.runtime, 'journal', { input })).result as JournalResult;
    }

    test('pages through what ran, oldest first, and does not record itself', async () => {
      const runtime = stub();
      for (let index = 0; index < 3; index += 1) {
        await executeOperation(runtime.runtime, 'observe', { requestId: `o${index}` });
      }
      const first = await read(runtime, { limit: 2 });
      expect(first.entries.map((entry) => entry.requestId)).toEqual(['o0', 'o1']);
      expect(first.next).toBe(2);
      const second = await read(runtime, { after: first.next });
      expect(second.entries.map((entry) => entry.requestId)).toEqual(['o2']);
      expect(second.next).toBeUndefined();
      expect(runtime.state.journal.size).toBe(3);
    });

    test('is available when the provider cannot observe, because failures there are worth reading', async () => {
      const runtime = stub({ capabilities: { boundedObservation: false } });
      await failureOf(executeOperation(runtime.runtime, 'observe', {}));
      const { entries } = await read(runtime);
      expect(entries).toMatchObject([
        { error: { code: 'unsupported operation', reason: 'bounded-observation-unsupported' }, outcome: 'error' },
      ]);
    });

    test('says how many entries it no longer holds', async () => {
      const runtime = stub({ state: new OperationSessionState({ journalCapacity: 16 }) });
      for (let index = 0; index < 20; index += 1) {
        await executeOperation(runtime.runtime, 'observe', {});
      }
      const page = await read(runtime, { limit: 1 });
      expect(page.dropped).toBe(4);
      expect(page.entries[0].sequence).toBe(5);
    });
  });
});
