import { z } from 'zod';

import { HostStaleError, toWebDriverError, WebDriverError } from '../protocol/errors';
import { attachFailureEffect, readFailureEffect } from '../protocol/settlement';
import {
  boundedMessage,
  invalidInputError,
  isRequestId,
  operationError,
  operationFailure,
  parseOperationRequest,
  requestedRequestId,
} from './envelope';
import { maxRequestIdLength } from './limits';

describe('parseOperationRequest', () => {
  test('defaults a missing body or input to an empty input', () => {
    expect(parseOperationRequest(undefined)).toEqual({ input: {} });
    expect(parseOperationRequest(null)).toEqual({ input: {} });
    expect(parseOperationRequest({})).toEqual({ input: {} });
  });

  test('passes the input and the request id through', () => {
    expect(parseOperationRequest({ input: { a: 1 }, requestId: 'agent-1:step.2', version: 1 })).toEqual({
      input: { a: 1 },
      requestId: 'agent-1:step.2',
    });
  });

  test.each([
    ['a list', [], 'invalid-envelope'],
    ['text', 'observe', 'invalid-envelope'],
    ['an unknown field', { input: {}, timeout: 1 }, 'invalid-envelope'],
    ['a newer schema version', { version: 2 }, 'unsupported-version'],
    ['an older schema version', { version: 0 }, 'unsupported-version'],
    ['a request id with spaces', { requestId: 'a b' }, 'invalid-request-id'],
    ['an empty request id', { requestId: '' }, 'invalid-request-id'],
    ['a numeric request id', { requestId: 7 }, 'invalid-request-id'],
    ['an input that is not an object', { input: 'x' }, 'invalid-input'],
    ['an input that is a list', { input: [] }, 'invalid-input'],
  ])('rejects %s', (_name, body, reason) => {
    expect(() => parseOperationRequest(body)).toThrow(WebDriverError);
    try {
      parseOperationRequest(body);
    } catch (error) {
      expect(error).toMatchObject({ code: 'invalid argument', data: { reason } });
    }
  });

  test('shows an unknown field name only after neutralizing and bounding it', () => {
    const hostile = `evil\u202E${'x'.repeat(100)}`;
    try {
      parseOperationRequest({ [hostile]: 1 });
      throw new Error('expected the request to be rejected');
    } catch (error) {
      const { message } = toWebDriverError(error);
      expect(message).not.toContain('\u202E');
      expect(message).toContain(String.raw`\u202e`);
      expect(message.length).toBeLessThan(200);
    }
  });
});

describe('request ids', () => {
  test('accepts letters, digits, and . _ : - up to the limit', () => {
    expect(isRequestId('a')).toBe(true);
    expect(isRequestId('Step_1.2:retry-3')).toBe(true);
    expect(isRequestId('x'.repeat(maxRequestIdLength))).toBe(true);
    expect(isRequestId('x'.repeat(maxRequestIdLength + 1))).toBe(false);
    expect(isRequestId('')).toBe(false);
    expect(isRequestId('a/b')).toBe(false);
    expect(isRequestId('a\nb')).toBe(false);
    expect(isRequestId(undefined)).toBe(false);
  });

  test('reads the id a caller chose even from a request that is otherwise invalid', () => {
    expect(requestedRequestId({ input: 5, requestId: 'mine' })).toBe('mine');
    expect(requestedRequestId({ requestId: 'not valid' })).toBeUndefined();
    expect(requestedRequestId('mine')).toBeUndefined();
    expect(requestedRequestId(null)).toBeUndefined();
  });
});

describe('boundedMessage', () => {
  test('makes invisible characters visible and bounds the length', () => {
    expect(boundedMessage('plain')).toBe('plain');
    expect(boundedMessage('a\u0000b')).toBe(String.raw`a\u0000b`);
    const long = boundedMessage('y'.repeat(1_000));
    expect(long).toHaveLength(301);
    expect(long.endsWith('…')).toBe(true);
  });
});

describe('invalidInputError', () => {
  const schema = z.strictObject({ count: z.number().max(5), name: z.string().min(2), nested: z.strictObject({ id: z.string() }) });

  function issuesFor(value: unknown) {
    const parsed = schema.safeParse(value);
    if (parsed.success) {
      throw new Error('expected the value to be rejected');
    }
    return invalidInputError(parsed.error);
  }

  test('names the field and the rule, in an invalid-input failure', () => {
    const error = issuesFor({ count: 9, name: 'abc', nested: { id: 'x' } });
    expect(error).toMatchObject({ code: 'invalid argument', data: { reason: 'invalid-input' } });
    expect(error.message).toMatch(/^Invalid input\. count: /);
  });

  test('never echoes the rejected value', () => {
    const error = issuesFor({ count: 'SECRET', name: 'SECRET', nested: { id: 1, secret: 'SECRET' }, SECRET: 'SECRET' });
    expect(error.message).not.toContain('SECRET');
  });

  test('says a key is unknown without quoting it', () => {
    const error = issuesFor({ count: 1, name: 'abc', nested: { id: 'x', IGNORE: 1 }, SECRET: 1 });
    expect(error.message).toBe('Invalid input. nested: Unrecognized key.; Unrecognized key.');
  });

  test('lists at most three issues and counts the rest', () => {
    const parts = issuesFor({ count: 'a', name: 1, nested: { id: 2 }, other: 3 })
      .message.replace('Invalid input. ', '')
      .split('; ');
    expect(parts).toHaveLength(4);
    expect(parts[3]).toBe('and 1 more');
  });
});

describe('operationFailure', () => {
  const context = { operation: 'observe', requestId: 'r7' };

  test('does not expose stack traces in WebDriver errors', () => {
    const error = new WebDriverError('unknown error', 'The helper failed.');
    expect(error.toJSON().stacktrace).toBe('');
  });

  test('names the operation, request, and schema version, and drops the stack', () => {
    const failure = operationFailure(operationError('invalid argument', 'invalid-input', 'No.'), context);
    expect(failure).toMatchObject({
      code: 'invalid argument',
      data: { operation: 'observe', reason: 'invalid-input', requestId: 'r7', schemaVersion: 1 },
      message: 'No.',
    });
    expect(failure.stack).toBe('');
    expect(failure.toJSON().stacktrace).toBe('');
  });

  test('keeps only data an agent can act on', () => {
    const source = new WebDriverError('unknown error', 'The helper said something.', {
      leaked: 'the document the user has open',
      nativeCode: 'mutation-indeterminate',
      reason: 'Not A Token!',
    });
    const { data } = operationFailure(source, context);
    expect(Object.keys(data).sort()).toEqual(['nativeCode', 'operation', 'requestId', 'schemaVersion']);
    expect(data.nativeCode).toBe('mutation-indeterminate');
  });

  test('rebuilds the mutation report from the closed effect set, so nothing else can ride along', () => {
    const source = new WebDriverError('unknown error', 'Quarantined.', {
      mutation: { disposition: 'indeterminate', effect: 'partial', leaked: 'x', quarantined: true },
    });
    expect(operationFailure(source, context).data.mutation).toEqual({ disposition: 'indeterminate', effect: 'partial', quarantined: true });

    const rejected = new WebDriverError('unknown error', 'Refused.', { mutation: { effect: 'none', quarantined: false } });
    expect(operationFailure(rejected, context).data.mutation).toEqual({ disposition: 'rejected', effect: 'none', quarantined: false });

    const forged = new WebDriverError('unknown error', 'Quarantined.', {
      mutation: { disposition: 'applied', effect: 'a document title that has spaces', quarantined: 'yes' },
    });
    expect(operationFailure(forged, context).data.mutation).toEqual({
      disposition: 'indeterminate',
      effect: 'unknown',
      quarantined: false,
    });
  });

  test('bounds and neutralizes the message', () => {
    const failure = operationFailure(new Error(`Window "${'w'.repeat(500)}\u202E" failed`), context);
    expect(failure.message.length).toBeLessThanOrEqual(301);
    expect(failure.message).not.toContain('\u202E');
  });

  test('keeps the effect the failure recorded, so settlement still reads it', () => {
    const source = attachFailureEffect(new WebDriverError('timeout', 'Slow.'), 'unknown');
    expect(readFailureEffect(operationFailure(source, context))).toBe('unknown');
    expect(readFailureEffect(operationFailure(new HostStaleError(), context))).toBeUndefined();
  });

  test('converts an unexpected error into an unknown error without its details', () => {
    const failure = operationFailure(new TypeError('Cannot read properties of undefined'), context);
    expect(failure.code).toBe('unknown error');
    expect(failure.data).toEqual({ operation: 'observe', requestId: 'r7', schemaVersion: 1 });
  });

  test('makes an operation name safe even if a caller chose it', () => {
    expect(operationFailure(new Error('x'), { operation: 'a b\nc', requestId: 'r1' }).data.operation).toBe('a_b_c');
  });
});
