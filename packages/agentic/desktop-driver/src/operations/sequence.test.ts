import type { NativeElementSnapshot } from '../host/types';
import type { WebDriverError } from '../protocol/errors';
import { buildSample, supportedFact, unsupportedFact } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import type { StubRuntimeOptions } from '../testing/operationRuntime';
import { executeOperation } from './executor';

const snapshot: NativeElementSnapshot = {
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
};

function stub(options: StubRuntimeOptions = {}) {
  const clicks: string[] = [];
  const runtime = stubRuntime({
    capabilities: { accessibilityClick: true, clear: true },
    observation: buildSample({
      children: [{ automationId: 'go', id: 'go', name: 'Go', role: 'button' }],
      id: 'win',
      name: 'Payroll',
      role: 'window',
    }),
    ...options,
    host: {
      click: async (nativeId) => {
        clicks.push(nativeId);
      },
      clear: async () => 'semantic',
      snapshot: async () => snapshot,
      ...options.host,
    },
  });
  return { clicks, runtime };
}

async function failureOf(promise: Promise<unknown>): Promise<WebDriverError> {
  try {
    await promise;
  } catch (error) {
    return error as WebDriverError;
  }
  throw new Error('expected the operation to fail');
}

const sequence = (runtime: ReturnType<typeof stub>['runtime'], steps: unknown[]) =>
  executeOperation(runtime.runtime, 'sequence', { input: { steps } });

describe('sequence preflight', () => {
  const press = { act: { action: 'activate', find: { name: 'Go' } } };

  test.each([
    ['an act step that selects by displayed text', { act: { action: 'activate', find: { textContains: 'Go' } } }],
    ['a check step that selects by displayed text', { check: { find: { text: 'Saved' }, matches: 'some' } }],
    ['a check step that compares displayed text', { check: { expect: { text: 'Saved' }, ref: 'elem1' } }],
  ])('refuses %s under a content ban before any step runs', async (_name, later) => {
    const { clicks, runtime } = stub({ contentPolicy: 'deny' });
    const failure = await failureOf(sequence(runtime, [press, later]));
    expect(failure.data).toMatchObject({ reason: 'content-denied' });
    expect(clicks).toEqual([]);
    expect(runtime.observed).toHaveLength(0);
  });

  test('refuses a clear the session cannot perform before an earlier step acts', async () => {
    const { clicks, runtime } = stub({ capabilities: { accessibilityClick: true, clear: false } });
    const failure = await failureOf(sequence(runtime, [press, { act: { action: 'clear', find: { name: 'Go' } } }]));
    expect(failure.data).toMatchObject({ reason: 'action-unsupported' });
    expect(clicks).toEqual([]);
  });

  test('refuses the same clear when it is the only act', async () => {
    const { runtime } = stub({ capabilities: { clear: false } });
    const failure = await failureOf(executeOperation(runtime.runtime, 'act', { input: { action: 'clear', find: { name: 'Go' } } }));
    expect(failure.data).toMatchObject({ reason: 'action-unsupported' });
    expect(runtime.observed).toHaveLength(0);
  });

  test('runs the steps when nothing would refuse them', async () => {
    const { clicks, runtime } = stub();
    const response = await sequence(runtime, [press]);
    expect(response.result).toMatchObject({ status: 'completed' });
    expect(clicks).toEqual(['go']);
  });
});
