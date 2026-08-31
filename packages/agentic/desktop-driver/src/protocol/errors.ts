import type { WebDriverErrorValue } from './types.js';

const errorStatuses = {
  'element click intercepted': 400,
  'element not interactable': 400,
  'invalid argument': 400,
  'invalid selector': 400,
  'invalid session id': 404,
  'javascript error': 500,
  'no such element': 404,
  'no such window': 404,
  'session not created': 500,
  'stale element reference': 404,
  timeout: 500,
  'unable to capture screen': 500,
  'unknown command': 404,
  'unknown error': 500,
  'unknown method': 405,
  'unsupported operation': 500,
} as const;

export type WebDriverErrorCode = keyof typeof errorStatuses;

export class WebDriverError extends Error {
  readonly code: WebDriverErrorCode;
  readonly data?: Record<string, unknown>;
  readonly status: number;

  constructor(code: WebDriverErrorCode, message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = 'WebDriverError';
    this.code = code;
    this.data = data;
    this.status = errorStatuses[code];
  }

  toJSON(): WebDriverErrorValue {
    return {
      error: this.code,
      message: this.message,
      stacktrace: this.stack ?? '',
      ...(this.data ? { data: this.data } : {}),
    };
  }
}

export function invalidArgument(message: string): WebDriverError {
  return new WebDriverError('invalid argument', message);
}

export function toWebDriverError(error: unknown): WebDriverError {
  if (error instanceof WebDriverError) {
    return error;
  }
  if (error instanceof HostStaleError) {
    return new WebDriverError('stale element reference', error.message);
  }
  if (error instanceof HostUnsupportedError) {
    return new WebDriverError('unsupported operation', error.message);
  }
  return new WebDriverError('unknown error', error instanceof Error ? error.message : String(error));
}

export class HostStaleError extends Error {
  constructor(message = 'The native element is no longer available.') {
    super(message);
    this.name = 'HostStaleError';
  }
}

export class HostUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HostUnsupportedError';
  }
}
