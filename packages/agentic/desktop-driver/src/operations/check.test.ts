import type { DesktopHostEvent } from '../host/types';
import { buildSample } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import type { StubRuntimeOptions } from '../testing/operationRuntime';
import { executeOperation } from './executor';
import type { CheckResult } from './check';

const page = (unsupportedFacts: string[] = []) =>
  buildSample(
    { children: [{ id: 'go', name: 'Go', role: 'button' }], id: 'win', name: 'Payroll', role: 'window' },
    { unsupportedFacts: unsupportedFacts as never[] },
  );

async function check(options: StubRuntimeOptions, input: Record<string, unknown>) {
  const runtime = stubRuntime(options);
  const response = await executeOperation(runtime.runtime, 'check', { input });
  return { result: response.result as CheckResult, runtime };
}

describe('check', () => {
  test('stops waiting for a fact the provider cannot report', async () => {
    const { result, runtime } = await check(
      { observation: page(['text']) },
      { find: { textContains: 'Go' }, matches: 'some', waitMs: 5_000 },
    );
    expect(result).toMatchObject({
      attempts: 1,
      search: { outcome: 'inconclusive', reasons: ['unsupported-fact'] },
      status: 'unsupported',
    });
    expect(result.elapsedMs).toBeLessThan(2_000);
    expect(runtime.observed).toHaveLength(1);
  });

  test('keeps waiting when only the search was inconclusive', async () => {
    const { result } = await check({ observation: page() }, { find: { name: 'Missing' }, matches: 'some', waitMs: 250 });
    expect(result).toMatchObject({ last: 'failed', status: 'timed-out' });
    expect(result.attempts).toBeGreaterThan(1);
  });

  test('does not walk the application again for every event of a burst', async () => {
    let emit: ((event: DesktopHostEvent) => void) | undefined;
    const burst = setInterval(() => emit?.({ type: 'structure-changed', windowId: 'w1' }), 2);
    try {
      const { result, runtime } = await check(
        {
          host: {
            subscribe(listener) {
              emit = listener;
              return () => {
                emit = undefined;
              };
            },
          },
          observation: page(),
        },
        { find: { name: 'Missing' }, matches: 'some', waitMs: 1_000 },
      );
      expect(result.status).toBe('timed-out');
      // A 100 ms floor between evaluations allows about ten in the second; unthrottled, the burst allows hundreds.
      expect(result.attempts).toBeLessThanOrEqual(15);
      expect(runtime.observed.length).toBe(result.attempts);
    } finally {
      clearInterval(burst);
    }
  });
});
