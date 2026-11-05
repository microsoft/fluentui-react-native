import { ReleaseLedger } from './ledger';

function ids(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_unused, index) => `${prefix}${index}`);
}

describe('ReleaseLedger', () => {
  test('releases pending ids in provider-sized batches', async () => {
    const retained = new Set<string>();
    const ledger = new ReleaseLedger((id) => retained.has(id));
    ledger.queue(ids('e', 2500));
    const batches: number[] = [];

    const result = await ledger.flush(async (batch) => {
      batches.push(batch.length);
      return batch.length;
    });

    expect(batches).toEqual([1000, 1000, 500]);
    expect(result).toEqual({ failed: false, pending: 0, released: 2500 });
  });

  test('never queues an id something still owns', async () => {
    const retained = new Set(['kept']);
    const ledger = new ReleaseLedger((id) => retained.has(id));
    ledger.markExternal('issued');

    ledger.queue(['kept', 'issued', 'free']);

    expect(ledger.pendingCount).toBe(1);
    const released: string[][] = [];
    await ledger.flush(async (batch) => released.push(batch));
    expect(released).toEqual([['free']]);
  });

  test('keeps ids pending when a release fails and retries them', async () => {
    const ledger = new ReleaseLedger(() => false);
    ledger.queue(['a', 'b']);

    const failed = await ledger.flush(async () => {
      throw new Error('helper busy');
    });
    expect(failed).toEqual({ failed: true, pending: 2, released: 0 });

    const retried = await ledger.flush(async () => 2);
    expect(retried).toEqual({ failed: false, pending: 0, released: 2 });
  });

  test('does not release an id that was reacquired while its release was failing', async () => {
    const retained = new Set<string>();
    const ledger = new ReleaseLedger((id) => retained.has(id));
    ledger.queue(['stale', 'reacquired']);
    await ledger.flush(async () => {
      throw new Error('timed out');
    });

    retained.add('reacquired');
    const sent: string[][] = [];
    const result = await ledger.flush(async (batch) => sent.push(batch));

    expect(sent).toEqual([['stale']]);
    expect(result).toEqual({ failed: false, pending: 0, released: 1 });
  });

  test('an id issued to a WebDriver client leaves the pending set and is never released', async () => {
    const ledger = new ReleaseLedger(() => false);
    ledger.queue(['shared', 'own']);

    ledger.markExternal('shared');

    const sent: string[][] = [];
    await ledger.flush(async (batch) => sent.push(batch));
    expect(sent).toEqual([['own']]);
    expect(ledger.isExternal('shared')).toBe(true);
  });

  test('stops after the batch limit so one flush stays bounded', async () => {
    const ledger = new ReleaseLedger(() => false);
    ledger.queue(ids('e', 3000));

    const result = await ledger.flush(async (batch) => batch.length, 2);

    expect(result).toEqual({ failed: false, pending: 1000, released: 2000 });
  });
});
