import type { TokenLayer, TokenSource } from '@fluentui-react-native/concepts';
import { isTokenSource } from '@fluentui-react-native/concepts';
import { createTestTheme } from '@fluentui-react-native/analyzer';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import { defaultButtonColorTokens } from '../ButtonColorTokens';

import { buttonV1Tokens } from './ButtonV1.tokens';

/**
 * Verifies that every captured colour leaf in `buttonV1Tokens` matches
 * the value the runtime `defaultButtonColorTokens` function produces
 * for the same path.
 *
 * Scope: colour tokens only. `ButtonColorTokens.ts` has no per-platform
 * override, so the cross-platform capture and the runtime resolve
 * through the same source under every jest platform. Layout and font
 * tokens DO have per-platform overrides (`ButtonTokens.ios.ts`,
 * `ButtonFontTokens.ios.ts`, etc.) — those need separate per-platform
 * `<Component>.tokens.<platform>.ts` artifacts and a parallel test;
 * tracked as a follow-up.
 *
 * COLOUR_TOKEN_KEYS lists the keys (at any layer depth) that the
 * colour-token source file owns. Other keys in the captured tree
 * (layout / font) are skipped here.
 */
describe('buttonV1Tokens correctness — colour subset', () => {
  const { theme } = createTestTheme();
  const runtimeColors = (defaultButtonColorTokens as unknown as (t: unknown) => Record<string, unknown>)(theme);

  it('every captured colour leaf matches the runtime value', () => {
    const mismatches: string[] = [];
    walkInLockstep(
      buttonV1Tokens.layers as TokenLayer,
      runtimeColors,
      [],
      (path, captured, runtime) => {
        const leafKey = path[path.length - 1];
        if (!COLOUR_TOKEN_KEYS.has(leafKey)) {
          return;
        }
        const capturedValue = resolveSource(captured, theme as unknown as Record<string, unknown>);
        if (capturedValue !== runtime) {
          mismatches.push(
            `${path.join('.')} — captured=${JSON.stringify(capturedValue)} runtime=${JSON.stringify(runtime)}`,
          );
        }
      },
    );

    expect(mismatches).toEqual([]);
  });
});

/** Keys owned by `ButtonColorTokens.ts`. Drawn from the source file. */
const COLOUR_TOKEN_KEYS = new Set(['backgroundColor', 'color', 'borderColor', 'iconColor', 'icon']);

// ─── Helpers ──────────────────────────────────────────────────────────────

function walkInLockstep(
  captured: TokenLayer,
  runtime: Record<string, unknown> | undefined,
  path: string[],
  onLeaf: (path: string[], capturedSource: TokenSource, runtimeValue: unknown) => void,
): void {
  if (runtime === undefined) {
    return;
  }
  for (const key of Object.keys(captured)) {
    const capturedValue = captured[key];
    const runtimeValue = runtime[key];
    const here = [...path, key];
    if (isTokenSource(capturedValue)) {
      onLeaf(here, capturedValue, runtimeValue);
    } else {
      const nextRuntime = isPlainObject(runtimeValue) ? runtimeValue : undefined;
      walkInLockstep(capturedValue, nextRuntime, here, onLeaf);
    }
  }
}

function resolveSource(source: TokenSource, theme: Record<string, unknown>): unknown {
  switch (source.kind) {
    case 'theme':
      return readByPath(theme, source.path);
    case 'global':
      return readByPath(globalTokens as unknown as Record<string, unknown>, source.path);
    case 'constant':
      return source.value;
    case 'expression': {
      const values = source.operands.map((o) => resolveSource(o, theme));
      return computeExpression(source.op, values);
    }
  }
}

function readByPath(root: Record<string, unknown>, path: string): unknown {
  let cursor: unknown = root;
  for (const segment of path.split('.')) {
    if (!isPlainObject(cursor)) {
      return undefined;
    }
    cursor = cursor[segment];
  }
  return cursor;
}

function computeExpression(op: '+' | '-' | '*' | '/', operands: unknown[]): unknown {
  if (operands.length === 0) {
    return undefined;
  }
  let acc = operands[0];
  for (let i = 1; i < operands.length; i++) {
    const right = operands[i];
    if (typeof acc !== 'number' || typeof right !== 'number') {
      return NaN;
    }
    switch (op) {
      case '+': acc = acc + right; break;
      case '-': acc = acc - right; break;
      case '*': acc = acc * right; break;
      case '/': acc = acc / right; break;
    }
  }
  return acc;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
