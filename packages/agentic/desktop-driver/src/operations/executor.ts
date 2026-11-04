import { toWebDriverError } from '../protocol/errors.js';
import { invalidInputError, operationError, operationFailure, parseOperationRequest, requestedRequestId } from './envelope.js';
import type { OperationResponse } from './envelope.js';
import { operationSchemaVersion } from './limits.js';
import { outcomeKey } from './outcomes.js';
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
  const chosenId = requestedRequestId(body);
  const requestId = chosenId ?? state.nextRequestId();
  const definition = lookupOperation(name);
  const startedAt = Date.now();
  let input: unknown;
  let output: unknown;
  let failure: { error: unknown } | undefined;
  let replay: Promise<OperationResponse> | undefined;
  let recording: ReturnType<typeof state.outcomes.begin> | undefined;
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
    if (definition.effect === 'mutate' && chosenId !== undefined) {
      const key = outcomeKey(definition.name, parsed.data);
      const recorded = state.outcomes.lookup(chosenId);
      if (recorded && recorded.key !== key) {
        throw operationError(
          'invalid argument',
          'request-id-reused',
          `requestId "${chosenId}" already named a different request in this session. Choose a new id for a new request.`,
        );
      }
      if (recorded) {
        replay = recorded.settled;
      } else {
        recording = state.outcomes.begin(chosenId, key);
      }
    }
    if (!replay) {
      output = await definition.run(parsed.data, runtime);
    }
  } catch (error) {
    failure = { error };
  }
  if (replay && definition) {
    return replayOutcome(runtime, definition, requestId, startedAt, replay);
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
    const shaped = operationFailure(failure.error, { operation: definition?.name ?? name, requestId });
    recording?.reject(shaped);
    throw shaped;
  }
  const response: OperationResponse = {
    schemaVersion: operationSchemaVersion,
    requestId,
    operation: definition.name,
    session: { incarnation: state.incarnation, ...(runtime.quarantined() ? { quarantined: true as const } : {}) },
    result: output,
  };
  recording?.resolve(response);
  return response;
}

/**
 * Answers a repeated mutating request with the outcome of the first one, without running anything. The repeat is
 * journaled as a replay, so the journal shows the retry and that it changed nothing.
 */
async function replayOutcome(
  runtime: OperationRuntime,
  definition: RegisteredOperation,
  requestId: string,
  startedAt: number,
  recorded: Promise<OperationResponse>,
): Promise<OperationResponse> {
  let error: unknown;
  let response: OperationResponse | undefined;
  try {
    response = await recorded;
  } catch (failure) {
    error = failure;
  }
  runtime.state.journal.record({
    at: new Date(startedAt).toISOString(),
    durationMs: Date.now() - startedAt,
    effect: definition.effect,
    ...(response ? {} : { error: journalError(error) }),
    operation: definition.name,
    outcome: response ? 'ok' : 'error',
    requestId,
    summary: { replay: true },
  });
  if (!response) {
    throw error;
  }
  return response;
}
