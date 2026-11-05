import type { WebDriverError } from '../protocol/errors.js';
import type { NativeObserveFact } from '../host/types.js';
import { operationError } from './envelope.js';
import type { OperationAvailability, OperationCapabilities, OperationRuntime } from './runtime.js';

/** Observation needs the provider's bounded `observe`; the driver never substitutes the unbounded `tree`. */
export function requireBoundedObservation(capabilities: OperationCapabilities): OperationAvailability {
  return capabilities.boundedObservation ? { available: true } : { available: false, reason: 'bounded-observation-unsupported' };
}

/** Facts that carry what an application displays, as opposed to what a control is and how it is doing. */
const contentFacts: ReadonlySet<NativeObserveFact> = new Set(['help', 'text', 'value']);

export function requestsContent(facts: readonly NativeObserveFact[]): boolean {
  return facts.some((fact) => contentFacts.has(fact));
}

export function contentDeniedError(): WebDriverError {
  return operationError(
    'unsupported operation',
    'content-denied',
    'This driver does not allow reading what applications display: values, text, and help. Names and states remain available.',
  );
}

/** Rejects a read of content when the operator denied it. Operators set the policy; a request cannot change it. */
export function assertContentAllowed(runtime: OperationRuntime, wantsContent: boolean): void {
  if (wantsContent && runtime.contentPolicy === 'deny') {
    throw contentDeniedError();
  }
}
