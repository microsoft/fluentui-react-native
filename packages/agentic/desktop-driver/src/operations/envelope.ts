import type { z } from 'zod';

import { toWebDriverError, WebDriverError } from '../protocol/errors.js';
import type { WebDriverErrorCode } from '../protocol/errors.js';
import { attachFailureEffect, dispositionForEffect, parseMutationEffect, readFailureEffect } from '../protocol/settlement.js';
import { maxRequestIdLength, operationSchemaVersion } from './limits.js';
import { clipText, neutralizeText, safeToken } from './text.js';

/** One operation call as the caller sends it. `version` and `requestId` are optional; `input` defaults to `{}`. */
export type OperationRequest = {
  input: Record<string, unknown>;
  requestId?: string;
};

/** What an operation returns. The result is the operation's own output; the rest identifies and places it. */
export type OperationResponse<Result = unknown> = {
  operation: string;
  requestId: string;
  result: Result;
  schemaVersion: number;
  session: { incarnation: number; quarantined?: true };
};

const envelopeKeys: ReadonlySet<string> = new Set(['input', 'requestId', 'version']);
const maxMessageLength = 300;
const maxIssues = 3;
const maxKeyDisplay = 32;
const requestIdCharacters = /^[A-Za-z0-9._:-]+$/;
const reasonToken = /^[a-z0-9]+(?:[ -][a-z0-9]+)*$/;
const maxReasonLength = 48;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isRequestId(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= maxRequestIdLength && requestIdCharacters.test(value);
}

/** The id the caller chose, when it is usable, so even a rejected request is echoed under its own id. */
export function requestedRequestId(body: unknown): string | undefined {
  return isRecord(body) && isRequestId(body.requestId) ? body.requestId : undefined;
}

/** A message that is safe to hand an agent: invisible characters made visible and the length bounded. */
export function boundedMessage(message: string): string {
  const { clipped, text } = clipText(neutralizeText(message), maxMessageLength);
  return clipped ? `${text}…` : text;
}

/** A failure with a machine-readable reason. Callers branch on `reason`, never on the message. */
export function operationError(
  code: WebDriverErrorCode,
  reason: string,
  message: string,
  extra: Record<string, unknown> = {},
): WebDriverError {
  return new WebDriverError(code, boundedMessage(message), { ...extra, reason });
}

function displayKey(key: string): string {
  const { clipped, text } = clipText(neutralizeText(key), maxKeyDisplay);
  return clipped ? `${text}…` : text;
}

/** Validates the envelope. The request body is untrusted, so every field is checked before anything uses it. */
export function parseOperationRequest(body: unknown): OperationRequest {
  if (body === undefined || body === null) {
    return { input: {} };
  }
  if (!isRecord(body)) {
    throw operationError(
      'invalid argument',
      'invalid-envelope',
      'The request must be a JSON object with optional version, requestId, and input.',
    );
  }
  for (const key of Object.keys(body)) {
    if (!envelopeKeys.has(key)) {
      throw operationError(
        'invalid argument',
        'invalid-envelope',
        `Unknown request field "${displayKey(key)}". A request has version, requestId, and input.`,
      );
    }
  }
  if (body.version !== undefined && body.version !== operationSchemaVersion) {
    throw operationError(
      'invalid argument',
      'unsupported-version',
      `This driver speaks operation schema version ${operationSchemaVersion}.`,
    );
  }
  const requestId = body.requestId;
  if (requestId !== undefined && !isRequestId(requestId)) {
    throw operationError(
      'invalid argument',
      'invalid-request-id',
      `requestId must be 1 to ${maxRequestIdLength} letters, digits, or the characters . _ : -`,
    );
  }
  const input = body.input ?? {};
  if (!isRecord(input)) {
    throw operationError('invalid argument', 'invalid-input', 'input must be a JSON object.');
  }
  return typeof requestId === 'string' ? { input, requestId } : { input };
}

/**
 * Describes why input failed validation in a few short lines that name the field and the rule, never the value. An
 * unknown key is the caller's own text, so the message says a key is unknown and names where, not which. A schema may
 * give the rule that fails first a reason, so a caller can tell a malformed reference from other invalid input.
 */
export function invalidInputError(error: z.ZodError): WebDriverError {
  const described = error.issues.slice(0, maxIssues).map((issue) => {
    const path = issue.path.map(String).join('.');
    const message = issue.code === 'unrecognized_keys' ? 'Unrecognized key.' : issue.message;
    return path.length > 0 ? `${path}: ${message}` : message;
  });
  const more = error.issues.length - described.length;
  const suffix = more > 0 ? `; and ${more} more` : '';
  const [first] = error.issues;
  const reason = first?.code === 'custom' && typeof first.params?.reason === 'string' ? first.params.reason : 'invalid-input';
  return operationError('invalid argument', reason, `Invalid input. ${described.join('; ')}${suffix}`);
}

function readToken(value: unknown): string | undefined {
  return typeof value === 'string' && value.length <= maxReasonLength && reasonToken.test(value) ? value : undefined;
}

/**
 * Keeps the data a caller can act on. Free-form provider data is dropped: it can quote what an application displayed,
 * and an agent reads failures as instructions.
 */
function safeData(data: Record<string, unknown> | undefined): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  const reason = readToken(data?.reason);
  if (reason) {
    safe.reason = reason;
  }
  const nativeCode = readToken(data?.nativeCode);
  if (nativeCode) {
    safe.nativeCode = nativeCode;
  }
  const mutation = data?.mutation;
  if (isRecord(mutation)) {
    // The report is rebuilt from the closed effect set, as the service builds it, so no other text can ride along.
    const effect = parseMutationEffect(mutation.effect);
    safe.mutation = {
      disposition: dispositionForEffect(effect),
      effect: effect ?? 'unknown',
      quarantined: mutation.quarantined === true,
    };
  }
  return safe;
}

/**
 * Turns any failure into the error an agent receives: a WebDriver error with a bounded, neutralized message and the
 * operation, request, and schema version in `data`. The stack trace is dropped; it names local paths and costs tokens.
 */
export function operationFailure(error: unknown, context: { operation: string; requestId: string }): WebDriverError {
  const converted = toWebDriverError(error);
  const failure = new WebDriverError(converted.code, boundedMessage(converted.message), {
    ...safeData(converted.data),
    operation: safeToken(context.operation),
    requestId: context.requestId,
    schemaVersion: operationSchemaVersion,
  });
  failure.stack = '';
  return attachFailureEffect(failure, readFailureEffect(error) ?? readFailureEffect(converted));
}
