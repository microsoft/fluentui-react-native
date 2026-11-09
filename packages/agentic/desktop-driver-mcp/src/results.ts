import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { AdapterError, isWebDriverError } from './controller.js';

type Content = CallToolResult['content'][number];

const maxMessageLength = 300;

/**
 * Renders a value as the model reads it: compact JSON, with any observation outline lifted out into its own text block
 * so its lines read as lines instead of escaped `\n` runs. Nothing is sent twice.
 */
export function jsonResult(value: unknown, extra: Content[] = []): CallToolResult {
  const outlines: string[] = [];
  const lifted = liftOutlines(value, outlines);
  return {
    content: [{ text: JSON.stringify(lifted), type: 'text' }, ...outlines.map((text): Content => ({ text, type: 'text' })), ...extra],
  };
}

/** A failure the model can branch on: the WebDriver error code, the machine reason, and a bounded message. */
export function errorResult(error: unknown): CallToolResult {
  let failure: Record<string, unknown>;
  if (error instanceof AdapterError) {
    failure = { error: 'adapter', message: error.message, reason: error.reason };
  } else if (isWebDriverError(error)) {
    const data = error.data ?? {};
    failure = {
      error: error.code,
      message: bound(error.message),
      ...pick(data, ['reason', 'nativeCode', 'requestId', 'mutation']),
    };
  } else {
    console.error(`desktop-driver-mcp: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
    failure = { error: 'adapter', message: 'The adapter failed unexpectedly.', reason: 'internal' };
  }
  return { content: [{ text: JSON.stringify(failure), type: 'text' }], isError: true };
}

function liftOutlines(value: unknown, outlines: string[]): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }
  const copy: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === 'outline' && typeof child === 'string') {
      outlines.push(child);
      copy.outline = `(text block ${outlines.length + 1})`;
    } else if (key === 'result' || key === 'observation') {
      copy[key] = liftOutlines(child, outlines);
    } else {
      copy[key] = child;
    }
  }
  return copy;
}

function pick(data: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(keys.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]));
}

function bound(message: string): string {
  // The service already bounds operation messages; session errors may quote provider text, so bound them here too.
  const visible = message.replace(/\p{Cc}/gu, ' ');
  return visible.length > maxMessageLength ? `${visible.slice(0, maxMessageLength - 1)}…` : visible;
}
