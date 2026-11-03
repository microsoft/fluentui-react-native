import { toWebDriverError } from '../protocol/errors.js';
import { invalidInputError, operationError, operationFailure, parseOperationRequest, requestedRequestId } from './envelope.js';
import type { OperationResponse } from './envelope.js';
import { operationSchemaVersion } from './limits.js';
import { lookupOperation } from './registry.js';
import type { OperationRuntime, RegisteredOperation } from './runtime.js';
import { safeToken } from './text.js';

function journalError(error: unknown): { code: string; reason?: string } {
  const { code, data } = toWebDriverError(error);
  return typeof data?.reason === 'string' ? { code, reason: data.reason } : { code };
}

/** The summary is a side channel for operators, so a defect in it must never change what the caller receives. */
function summarize(definition: RegisteredOperation, input: unknown, output: unknown) {
  try {
    return definition.summarize(input, output);
  } catch {
    return undefined;
  }
}

/**
 * Runs one operation: checks the request, runs the operation, records it in the session journal, and shapes the
 * response or the failure. Every failure leaves as a WebDriver error whose `data` names the operation and request, so a
 * caller can always correlate it with its journal entry.
 */
export async function executeOperation(runtime: OperationRuntime, name: string, body: unknown): Promise<OperationResponse> {
  const { state } = runtime;
  const requestId = requestedRequestId(body) ?? state.nextRequestId();
  const definition = lookupOperation(name);
  const startedAt = Date.now();
  let input: unknown;
  let output: unknown;
  let failure: { error: unknown } | undefined;
  try {
    if (!definition) {
      throw operationError('unknown command', 'unknown-operation', `There is no operation named "${safeToken(name)}".`);
    }
    const request = parseOperationRequest(body);
    const availability = definition.availability(runtime.capabilities);
    if (availability.available === false) {
      throw operationError('unsupported operation', availability.reason, `The operation "${definition.name}" is not available here.`);
    }
    const parsed = definition.input.safeParse(request.input);
    if (!parsed.success) {
      throw invalidInputError(parsed.error);
    }
    input = parsed.data;
    output = await definition.run(parsed.data, runtime);
  } catch (error) {
    failure = { error };
  }

  if (definition && definition.journaled !== false) {
    const summary = input === undefined ? undefined : summarize(definition, input, failure ? undefined : output);
    state.journal.record({
      at: new Date(startedAt).toISOString(),
      durationMs: Date.now() - startedAt,
      effect: definition.effect,
      ...(failure ? { error: journalError(failure.error) } : {}),
      operation: definition.name,
      outcome: failure ? 'error' : 'ok',
      requestId,
      ...(summary ? { summary } : {}),
    });
  }
  if (failure) {
    throw operationFailure(failure.error, { operation: definition?.name ?? name, requestId });
  }
  return {
    schemaVersion: operationSchemaVersion,
    requestId,
    operation: definition.name,
    session: { incarnation: state.incarnation, ...(runtime.quarantined() ? { quarantined: true as const } : {}) },
    result: output,
  };
}
