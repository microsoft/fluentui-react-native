export class NativeDriverError extends Error {
  readonly code: string;
  readonly data?: Record<string, unknown>;

  constructor(code: string, message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = 'NativeDriverError';
    this.code = code;
    this.data = data;
  }
}
