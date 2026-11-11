import type { NativeHostJsonMessage } from '../../native/types.js';
import { NativeDriverError } from '../../native/NativeDriverError.js';

const helperMessageTypes: ReadonlySet<string> = new Set(['cancel', 'cancelled', 'event', 'hello', 'request', 'response']);

/**
 * Checks the fields Node reads from a decoded helper message before it routes the message, so a helper that sends
 * well-formed JSON of the wrong shape fails the transport instead of throwing in a stream listener. The messages
 * are otherwise not validated: a command's `result` is checked by the command that asked for it.
 */
export function validateHelperMessage(value: unknown): NativeHostJsonMessage {
  const message = asRecord(value);
  const type = message?.type;
  if (!message || typeof type !== 'string' || !helperMessageTypes.has(type)) {
    throw invalid('Native driver helper emitted a JSON message without a known type.');
  }
  if (type === 'hello') {
    const protocol = asRecord(message.protocol);
    if (
      !isString(message.architecture) ||
      !isString(message.buildId) ||
      !isString(message.provider) ||
      !isString(message.sourceDigest) ||
      !Array.isArray(message.features) ||
      !message.features.every(isString) ||
      !protocol ||
      !Number.isSafeInteger(protocol.major) ||
      !Number.isSafeInteger(protocol.minor)
    ) {
      throw invalid('Native driver helper emitted a "hello" message with missing or malformed fields.');
    }
  } else if (type === 'response') {
    const error = message.error === undefined ? undefined : asRecord(message.error);
    const binary = message.binary === undefined ? undefined : asRecord(message.binary);
    if (
      !isString(message.id) ||
      (message.error !== undefined && (!error || !isString(error.code) || !isString(error.message))) ||
      (message.binary !== undefined && (!binary || !isString(binary.id) || binary.id.length === 0))
    ) {
      throw invalid('Native driver helper emitted a "response" message with missing or malformed fields.');
    }
  } else if (type === 'cancelled') {
    if (!isString(message.id)) {
      throw invalid('Native driver helper emitted a "cancelled" message without a string id.');
    }
  } else if (type === 'event' && !isString(message.event)) {
    throw invalid('Native driver helper emitted an "event" message without a string event name.');
  }
  return message as NativeHostJsonMessage;
}

function invalid(message: string): NativeDriverError {
  return new NativeDriverError('invalid-message', message);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}
