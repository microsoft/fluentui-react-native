/**
 * Attach-mode top-level window discovery.
 *
 * `attach` may name the application by process id, native window handle, identity, or window
 * title, but a Windows session can only be pinned to a window through `appium:appTopLevelWindow`,
 * which takes a native handle. This module closes that gap: it opens a throwaway root-desktop
 * session, enumerates the top-level windows, and resolves the configured identity to exactly one
 * handle.
 *
 * "Exactly one" is the whole point. Attaching to the wrong window is how an automated run
 * interacts with something it does not own, so an ambiguous match is a failure rather than a
 * first-match heuristic, and the selection order matches `describeAttachResolution`: process id is
 * exact, identity and title are queries.
 */

import { DesktopDriverError } from '../errors.ts';
import type { DesktopAppTarget } from '../types.ts';

/** A top-level window observed on the desktop. */
export interface DesktopWindowCandidate {
  /** Native window handle, normalized to a `0x`-prefixed lowercase hexadecimal string. */
  handle: string;
  /** Window title, as reported by the accessibility `Name` property. */
  name?: string;
  processId?: number;
  automationId?: string;
  className?: string;
}

/** Which configured identity selected a window, and whether the match was exact. */
export interface DesktopWindowMatch {
  candidate: DesktopWindowCandidate;
  matchedBy: 'processId' | 'windowHandle' | 'identity' | 'title';
  exact: boolean;
}

/** Enumerates the current top-level windows. Injectable so the selection rules stay testable. */
export type WindowEnumerator = () => Promise<readonly DesktopWindowCandidate[]>;

/** Upper bound on the windows reported in a diagnostic, so an error stays readable. */
const DIAGNOSTIC_LIMIT = 20;

/**
 * Normalizes a native window handle to the `0x`-prefixed lowercase hexadecimal string that
 * `appium:appTopLevelWindow` documents.
 *
 * UI Automation reports `NativeWindowHandle` as a decimal string, so a bare decimal is converted
 * rather than reinterpreted as hexadecimal.
 */
export function normalizeWindowHandle(raw: string | number): string {
  const text = String(raw).trim();
  if (text.length === 0) {
    throw new DesktopDriverError('Native window handle is empty', { kind: 'lifecycle' });
  }
  const value = /^0x/i.test(text) ? Number.parseInt(text.slice(2), 16) : Number.parseInt(text, 10);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new DesktopDriverError(`Native window handle "${text}" is not a usable window handle`, {
      kind: 'lifecycle',
      detail: { handle: text },
    });
  }
  return `0x${value.toString(16)}`;
}

function describe(candidates: readonly DesktopWindowCandidate[]): readonly Record<string, unknown>[] {
  return candidates.slice(0, DIAGNOSTIC_LIMIT).map((candidate) => ({
    handle: candidate.handle,
    name: candidate.name,
    processId: candidate.processId,
    automationId: candidate.automationId,
    className: candidate.className,
  }));
}

function equalsIgnoreCase(left: string | undefined, right: string): boolean {
  return typeof left === 'string' && left.toLowerCase() === right.toLowerCase();
}

function includesIgnoreCase(left: string | undefined, right: string): boolean {
  return typeof left === 'string' && left.toLowerCase().includes(right.toLowerCase());
}

/**
 * Picks the single window an attach target names.
 *
 * Each identity is tried in precedence order, and within an identity an exact match always beats
 * a substring match, so a window titled exactly `AgenticStorybook` wins over one titled
 * `AgenticStorybook - Notes`. Two windows in the same tier are ambiguous and rejected.
 */
export function selectWindow(candidates: readonly DesktopWindowCandidate[], target: DesktopAppTarget): DesktopWindowMatch {
  if (target.mode !== 'attach') {
    throw new DesktopDriverError('Window discovery only applies to an attach target', { kind: 'configuration' });
  }

  const tiers: { matchedBy: DesktopWindowMatch['matchedBy']; exact: boolean; matches: readonly DesktopWindowCandidate[] }[] = [];

  if (target.processId !== undefined) {
    tiers.push({ matchedBy: 'processId', exact: true, matches: candidates.filter((c) => c.processId === target.processId) });
  }
  if (target.identity !== undefined) {
    const identity = target.identity;
    tiers.push({
      matchedBy: 'identity',
      exact: true,
      matches: candidates.filter((c) => equalsIgnoreCase(c.automationId, identity) || equalsIgnoreCase(c.className, identity)),
    });
  }
  if (target.title !== undefined) {
    const title = target.title;
    tiers.push({ matchedBy: 'title', exact: true, matches: candidates.filter((c) => equalsIgnoreCase(c.name, title)) });
    tiers.push({ matchedBy: 'title', exact: false, matches: candidates.filter((c) => includesIgnoreCase(c.name, title)) });
  }

  for (const tier of tiers) {
    if (tier.matches.length === 1) {
      return { candidate: tier.matches[0], matchedBy: tier.matchedBy, exact: tier.exact };
    }
    if (tier.matches.length > 1) {
      throw new DesktopDriverError(
        `The attach target matched ${tier.matches.length} top-level windows by ${tier.matchedBy}; refusing to guess. ` +
          'Narrow the target with processId or windowHandle.',
        { kind: 'ownership', detail: { matchedBy: tier.matchedBy, matches: describe(tier.matches) } },
      );
    }
  }

  throw new DesktopDriverError('The attach target did not match any top-level window', {
    kind: 'ownership',
    detail: { target, observedWindows: describe(candidates), observedWindowCount: candidates.length },
  });
}

/** Resolves an attach target to one window handle, short-circuiting when one was configured. */
export async function discoverAttachWindow(target: DesktopAppTarget, enumerate: WindowEnumerator): Promise<DesktopWindowMatch> {
  if (target.mode !== 'attach') {
    throw new DesktopDriverError('Window discovery only applies to an attach target', { kind: 'configuration' });
  }
  if (target.windowHandle) {
    return { candidate: { handle: normalizeWindowHandle(target.windowHandle) }, matchedBy: 'windowHandle', exact: true };
  }
  return selectWindow(await enumerate(), target);
}

// --------------------------------------------------------------------- W3C enumeration

interface W3CResponse<T> {
  value: T;
}

interface W3CErrorValue {
  error?: string;
  message?: string;
}

async function w3c<T>(method: 'POST' | 'GET' | 'DELETE', url: string, body?: unknown, timeout = 60_000): Promise<T> {
  const request: RequestInit = { method, headers: { accept: 'application/json' }, signal: AbortSignal.timeout(timeout) };
  if (body !== undefined) {
    request.headers = { 'content-type': 'application/json', accept: 'application/json' };
    request.body = JSON.stringify(body);
  }
  const response = await fetch(url, request);
  const payload = (await response.json().catch(() => undefined)) as W3CResponse<T> | undefined;
  if (!response.ok) {
    const failure = (payload?.value ?? {}) as W3CErrorValue;
    throw new DesktopDriverError(`${method} ${url} failed: ${failure.error ?? response.status} ${failure.message ?? ''}`.trim(), {
      kind: 'driverHost',
      detail: { status: response.status, error: failure.error },
    });
  }
  return (payload as W3CResponse<T>).value;
}

/** Element ids arrive under the W3C key; the legacy key is accepted for older backends. */
const W3C_ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

function elementId(element: Record<string, unknown>): string | undefined {
  const value = element[W3C_ELEMENT_KEY] ?? element.ELEMENT;
  return typeof value === 'string' ? value : undefined;
}

export interface RootSessionEnumeratorOptions {
  /** Base URL of the owned driver host, for example `http://127.0.0.1:53312`. */
  webDriverUrl: string;
  /** Capabilities of the root-desktop session used only for discovery. */
  capabilities: Record<string, unknown>;
  /**
   * Read the identity attributes as well.
   *
   * The window handle, title, and owning process id are always read: the first two select the
   * window and the third is recorded as an externally owned resource. `AutomationId` and
   * `ClassName` cost another two round trips per window and are only read when an `identity`
   * target needs them.
   */
  need?: { identity?: boolean };
  requestTimeout?: number;
  /** Upper bound on enumerated windows, so a busy desktop cannot stall a run. */
  maxWindows?: number;
}

/**
 * Enumerates top-level windows through a throwaway root-desktop session.
 *
 * `/*​/*` selects the grandchildren of the session root, which are the real top-level windows:
 * the root's only child is the desktop pane itself, so `/*` would offer the desktop as a
 * candidate — precisely the window an attach must never bind to. `//Window` is the fallback for a
 * backend that does not accept a root-relative step, and it is only a fallback because it misses
 * top-level windows whose UI Automation control type is `Pane`. The session is always deleted,
 * including on failure: it is a resource this package owns.
 */
export function createRootSessionEnumerator(options: RootSessionEnumeratorOptions): WindowEnumerator {
  const base = options.webDriverUrl.replace(/\/+$/, '');
  const timeout = options.requestTimeout ?? 60_000;
  const maxWindows = options.maxWindows ?? 200;

  return async () => {
    const session = await w3c<{ sessionId: string }>(
      'POST',
      `${base}/session`,
      { capabilities: { alwaysMatch: options.capabilities, firstMatch: [{}] } },
      timeout,
    );
    // A W3C body reports the session id inside `value`; some backends also echo it at the top
    // level. The nested form is the one the specification requires.
    const sessionId = session.sessionId;
    const sessionBase = `${base}/session/${sessionId}`;

    const attribute = async (id: string, name: string): Promise<string | undefined> => {
      try {
        const value = await w3c<string | null>('GET', `${sessionBase}/element/${id}/attribute/${name}`, undefined, timeout);
        return value === null || value === undefined || value === '' ? undefined : String(value);
      } catch {
        // A window that closed mid-enumeration, or an attribute a backend does not implement,
        // must not fail the whole discovery pass.
        return undefined;
      }
    };

    try {
      let elements: Record<string, unknown>[] = [];
      for (const query of [
        { using: 'xpath', value: '/*/*' },
        { using: 'xpath', value: '//Window' },
      ]) {
        elements = await w3c<Record<string, unknown>[]>('POST', `${sessionBase}/elements`, query, timeout).catch(() => []);
        if (elements.length > 0) {
          break;
        }
      }

      const candidates = await mapConcurrent(
        elements.slice(0, maxWindows),
        8,
        async (element): Promise<DesktopWindowCandidate | undefined> => {
          const id = elementId(element);
          if (!id) {
            return undefined;
          }
          const rawHandle = await attribute(id, 'NativeWindowHandle');
          if (!rawHandle) {
            return undefined;
          }
          let handle: string;
          try {
            handle = normalizeWindowHandle(rawHandle);
          } catch {
            // Elements that are not real windows report a zero handle.
            return undefined;
          }
          const [name, processId, automationId, className] = await Promise.all([
            attribute(id, 'Name'),
            attribute(id, 'ProcessId'),
            options.need?.identity ? attribute(id, 'AutomationId') : undefined,
            options.need?.identity ? attribute(id, 'ClassName') : undefined,
          ]);
          return {
            handle,
            name,
            processId: Number(processId) || undefined,
            automationId,
            className,
          };
        },
      );
      return candidates.filter((candidate): candidate is DesktopWindowCandidate => candidate !== undefined);
    } finally {
      await w3c('DELETE', sessionBase, undefined, timeout).catch(() => undefined);
    }
  };
}

async function mapConcurrent<T, U>(values: readonly T[], concurrency: number, map: (value: T) => Promise<U>): Promise<U[]> {
  const results = Array.from<U>({ length: values.length });
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, async () => {
      while (next < values.length) {
        const index = next++;
        results[index] = await map(values[index]);
      }
    }),
  );
  return results;
}
