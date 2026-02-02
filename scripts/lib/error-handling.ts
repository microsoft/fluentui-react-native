#!/usr/bin/env node

/**
 * Error handling utilities for beachball publishing workflow
 * Provides type guards and custom error classes for better error handling
 */

import type { ExecException } from 'child_process';

/**
 * Check if error is a 404 Not Found error
 */
export function is404Error(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const execError = error as ExecException;
  const stderr = execError.stderr?.toString() || '';
  const message = error.message.toLowerCase();

  return (
    stderr.includes('404') ||
    stderr.includes('not found') ||
    stderr.includes('e404') ||
    message.includes('404') ||
    message.includes('not found')
  );
}

/**
 * Check if error is a network connectivity error
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('etimedout') ||
    message.includes('enetunreach') ||
    message.includes('econnreset') ||
    message.includes('network error')
  );
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const execError = error as ExecException;
  const stderr = execError.stderr?.toString() || '';
  const message = error.message.toLowerCase();

  return (
    message.includes('rate limit') ||
    message.includes('429') ||
    stderr.includes('rate limit') ||
    stderr.includes('429')
  );
}

/**
 * Custom network error class
 */
export class NetworkError extends Error {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

/**
 * Custom rate limit error class
 */
export class RateLimitError extends Error {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'RateLimitError';
    this.cause = cause;
  }
}
