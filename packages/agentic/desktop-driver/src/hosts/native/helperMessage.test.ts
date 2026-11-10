import { validateHelperMessage } from './helperMessage';

const hello = {
  architecture: 'arm64',
  buildId: 'build',
  features: ['screenshot'],
  protocol: { major: 1, minor: 0 },
  provider: 'macos',
  sourceDigest: 'source',
  type: 'hello',
};

describe('validateHelperMessage', () => {
  test.each([
    ['a hello', hello],
    ['a response', { id: 'r1', result: {}, type: 'response' }],
    ['an error response', { error: { code: 'failed', message: 'Failed.' }, id: 'r1', type: 'response' }],
    ['a response with a binary payload', { binary: { id: 'b1' }, id: 'r1', result: {}, type: 'response' }],
    ['a cancellation', { id: 'r1', type: 'cancelled' }],
    ['an event', { event: 'changed', type: 'event' }],
  ])('accepts %s', (_, message) => {
    expect(validateHelperMessage(message)).toBe(message);
  });

  test.each([
    ['null', null],
    ['a string', 'hello'],
    ['an array', [hello]],
    ['no type', { id: 'r1' }],
    ['an unknown type', { type: 'shutdown' }],
    ['a non-string type', { type: 7 }],
    ['a hello without features', { ...hello, features: undefined }],
    ['a hello with non-string features', { ...hello, features: [1] }],
    ['a hello with a non-integer protocol version', { ...hello, protocol: { major: 1.5, minor: 0 } }],
    ['a hello without a protocol', { ...hello, protocol: undefined }],
    ['a hello with a non-string build id', { ...hello, buildId: 4 }],
    ['a response without an id', { result: {}, type: 'response' }],
    ['a response with a non-object error', { error: 'failed', id: 'r1', type: 'response' }],
    ['a response whose error lacks a code', { error: { message: 'Failed.' }, id: 'r1', type: 'response' }],
    ['a response with an empty binary id', { binary: { id: '' }, id: 'r1', type: 'response' }],
    ['a response with a non-object binary', { binary: 'b1', id: 'r1', type: 'response' }],
    ['a cancellation without an id', { type: 'cancelled' }],
    ['an event without a name', { type: 'event' }],
  ])('rejects %s', (_, message) => {
    expect(() => validateHelperMessage(message)).toThrow(expect.objectContaining({ code: 'invalid-message' }));
  });

  test('does not repeat helper-controlled values in the failure', () => {
    expect(() => validateHelperMessage({ type: 'attacker-chosen-secret-type' })).toThrow(
      expect.not.objectContaining({ message: expect.stringContaining('attacker-chosen-secret-type') }),
    );
  });
});
