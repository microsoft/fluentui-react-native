import { failureWithReason, requestWindowsAuthority, runWindowsAuthorityHelper, verifyWindowsAuthorityArtifact } from './authorityHelper';
import { FakeAuthorityHelper } from './fakeAuthorityHelper';

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({ spawn: (...args: unknown[]) => mockSpawn(...args) }));
const mockVerify = jest.fn();
jest.mock('../nativeDriver', () => ({ verifyNativeDriverArtifact: (...args: unknown[]) => mockVerify(...args) }));

const helperPath = 'C:\\cache\\furn-desktop-driver-host.exe';
const unavailable = { code: 'authority-helper-unavailable', message: 'The Windows authority helper did not answer.' };

let helper: FakeAuthorityHelper;

const run = (request: unknown = { operation: 'read' }) =>
  runWindowsAuthorityHelper({ executablePath: helperPath }, '--private-storage', request);

beforeEach(() => {
  helper = new FakeAuthorityHelper();
  mockSpawn.mockReset().mockImplementation(helper.spawn);
  mockVerify.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('runWindowsAuthorityHelper', () => {
  test('sends one JSON request to the requested mode and returns the frozen answer', async () => {
    helper.answer({ found: true, ok: true });

    const answer = await run({ name: 'a', operation: 'read' });

    expect(answer).toEqual({ found: true, ok: true });
    expect(Object.isFrozen(answer)).toBe(true);
    expect(helper.launches).toHaveLength(1);
    expect(helper.launches[0]).toMatchObject({ args: ['--private-storage'], executable: helperPath });
    expect(helper.launches[0].options).toMatchObject({ stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
    expect(JSON.parse(helper.launches[0].request)).toEqual({ name: 'a', operation: 'read' });
  });

  test('returns a refusal as an answer when the exit status agrees', async () => {
    helper.answer({ ok: false, reason: 'dacl' });

    await expect(run()).resolves.toEqual({ ok: false, reason: 'dacl' });
  });

  test('keeps a JSON key named __proto__ as data', async () => {
    helper.output('{"ok":true,"__proto__":{"polluted":true}}');

    const answer = await run();

    expect(Object.getPrototypeOf(answer)).toBe(Object.prototype);
    expect((answer as { polluted?: boolean }).polluted).toBeUndefined();
  });

  test.each<[string, string | Buffer, number]>([
    ['empty output', '', 0],
    ['text that is not JSON', 'oops', 0],
    ['a JSON array', '[]', 0],
    ['JSON null', 'null', 0],
    ['an ok that is not a boolean', '{"ok":"yes"}', 0],
    ['an answer without ok', '{"found":true}', 0],
    ['ok true with a failing exit status', '{"ok":true}', 1],
    ['ok false with a zero exit status', '{"ok":false,"reason":"io"}', 0],
    ['invalid UTF-8', Buffer.from([0x7b, 0x22, 0xff, 0x22, 0x7d]), 0],
  ])('rejects %s', async (_description, output, code) => {
    helper.output(output, code);

    await expect(run()).rejects.toMatchObject(unavailable);
  });

  test('never carries the output, the request, or a cause in the error', async () => {
    helper.output('fdg1.secret-grant not json', 0);

    const error = await run({ grant: 'fdg1.secret-grant' }).catch((caught: Error) => caught);

    expect(error).toMatchObject(unavailable);
    expect(String(error)).not.toContain('secret');
    expect((error as Error).cause).toBeUndefined();
  });

  test.each([
    ['reports an error event', (fake: FakeAuthorityHelper) => fake.fail(new Error('spawn UNKNOWN C:\\secret'))],
    ['throws from spawn', (fake: FakeAuthorityHelper) => fake.refuse(new Error('EACCES C:\\secret'))],
  ])('rejects when the helper cannot start and %s', async (_description, script) => {
    script(helper);

    const error = await run().catch((caught: Error) => caught);

    expect(error).toMatchObject(unavailable);
    expect(String(error)).not.toContain('secret');
  });

  test('kills a helper that never answers', async () => {
    jest.useFakeTimers();
    helper.silent();

    const rejected = expect(run()).rejects.toMatchObject(unavailable);
    await jest.advanceTimersByTimeAsync(10_000);

    await rejected;
    expect(helper.launches[0].killed).toBe(true);
  });

  test('kills a helper whose answer exceeds the bound', async () => {
    helper.output([Buffer.alloc(40 * 1024, 0x20), Buffer.alloc(40 * 1024, 0x20)]);

    await expect(run()).rejects.toMatchObject(unavailable);
    expect(helper.launches[0].killed).toBe(true);
  });

  test('ignores an error on standard input that the helper closed early', async () => {
    helper.answer({ ok: true });

    const answer = run();
    helper.launches[0].stdin.emit('error', new Error('EPIPE'));

    await expect(answer).resolves.toEqual({ ok: true });
  });
});

describe('requestWindowsAuthority', () => {
  const failure = (reason: string) => failureWithReason('Fixed failure.', reason);
  const request = () => requestWindowsAuthority({ executablePath: helperPath }, '--service-identity', { operation: 'describe' }, failure);

  test('returns an answer the helper accepted', async () => {
    helper.answer({ identity: {}, ok: true });

    await expect(request()).resolves.toEqual({ identity: {}, ok: true });
  });

  test.each([
    ['a closed token', 'dacl', 'dacl'],
    ['a path', 'C:\\Users\\agent', 'unknown'],
    ['an uppercase token', 'DACL', 'unknown'],
    ['a long token', 'a'.repeat(17), 'unknown'],
    ['an empty reason', '', 'unknown'],
    ['a reason that is not text', 7, 'unknown'],
  ])('maps a refusal with %s to a failure with reason %s', async (_description, reason, expected) => {
    helper.answer({ detail: 'C:\\secret', ok: false, reason });

    const error = await request().catch((caught: Error) => caught);

    expect(error).toMatchObject({ message: 'Fixed failure.', reason: expected });
    expect(String(error)).not.toContain('secret');
  });

  test('maps a helper that cannot answer to the helper reason', async () => {
    helper.output('not json');

    await expect(request()).rejects.toMatchObject({ message: 'Fixed failure.', reason: 'helper' });
  });

  test('keeps the reason off enumeration so logging the error cannot print it', () => {
    const error = failureWithReason('Fixed failure.', 'dacl');

    expect(Object.keys(error)).toEqual([]);
    expect(JSON.stringify(error)).toBe('{}');
    expect((error as { reason?: string }).reason).toBe('dacl');
  });
});

describe('verifyWindowsAuthorityArtifact', () => {
  test('verifies a Windows artifact and refuses any other before verifying', async () => {
    mockVerify.mockResolvedValue({ executablePath: 'C:\\verified.exe', provider: 'windows' });

    await expect(verifyWindowsAuthorityArtifact({ executablePath: helperPath, provider: 'windows' } as never)).resolves.toMatchObject({
      executablePath: 'C:\\verified.exe',
    });
    for (const other of [{ executablePath: '/helper', provider: 'macos' }, undefined, null, 'C:\\helper.exe']) {
      await expect(verifyWindowsAuthorityArtifact(other as never)).rejects.toThrow(TypeError);
    }

    expect(mockVerify).toHaveBeenCalledTimes(1);
  });
});
