import { allocateGeneration, createOperationChannel } from './nativeOperation';

describe('native operation lifetime', () => {
  afterEach(() => jest.useRealTimers());

  it('does not queue before attachment and confirms only correlated native results', async () => {
    const channel = createOperationChannel();
    const dispatch = jest.fn();
    expect(await channel.request(dispatch)).toEqual({ status: 'not-mounted' });
    expect(dispatch).not.toHaveBeenCalled();
    channel.activate(allocateGeneration());
    const result = channel.request(dispatch);
    const [generation, requestId] = dispatch.mock.calls[0];
    channel.receive({ generation: generation + 1, requestId, status: 'confirmed' });
    channel.receive({ generation, requestId, status: 'confirmed' });
    expect(await result).toEqual({ status: 'confirmed' });
  });

  it('cancels on detach and ignores stale results after replacement', async () => {
    const channel = createOperationChannel();
    const dispatch = jest.fn();
    channel.activate(allocateGeneration());
    const old = channel.request(dispatch);
    const [generation, requestId] = dispatch.mock.calls[0];
    channel.cancel();
    channel.activate(allocateGeneration());
    channel.receive({ generation, requestId, status: 'confirmed' });
    expect(await old).toEqual({ status: 'cancelled' });
  });

  it('supports abort, target replacement, and explicit unconfirmed timeouts', async () => {
    jest.useFakeTimers();
    const channel = createOperationChannel();
    channel.activate(allocateGeneration());
    const controller = new AbortController();
    const aborted = channel.request(jest.fn(), { signal: controller.signal });
    controller.abort();
    expect(await aborted).toEqual({ status: 'cancelled' });
    const dispatch = jest.fn();
    const stale = channel.request(dispatch, {}, () => false);
    const [generation, requestId] = dispatch.mock.calls[0];
    channel.receive({ generation, requestId, status: 'confirmed' });
    expect(await stale).toEqual({ status: 'cancelled' });
    const timeout = channel.request(jest.fn(), { timeoutMs: 10 });
    jest.advanceTimersByTime(10);
    expect(await timeout).toEqual({ status: 'timed-out' });
  });

  it('surfaces malformed results and dispatch failures', async () => {
    const channel = createOperationChannel();
    channel.activate(allocateGeneration());
    const dispatch = jest.fn();
    const result = channel.request(dispatch);
    const rejected = expect(result).rejects.toThrow('invalid operation status');
    const [generation, requestId] = dispatch.mock.calls[0];
    expect(() => channel.receive({ generation, requestId, status: 'success-ish' })).toThrow('invalid operation status');
    await rejected;
    await expect(
      channel.request(() => {
        throw new Error('transport failed');
      }),
    ).rejects.toThrow('transport failed');
    expect(() => channel.request(jest.fn(), { timeoutMs: NaN })).toThrow(RangeError);
  });
});
