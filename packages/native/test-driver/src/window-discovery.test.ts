import { DesktopDriverError } from './errors.ts';
import {
  createRootSessionEnumerator,
  discoverAttachWindow,
  normalizeWindowHandle,
  selectWindow,
  type DesktopWindowCandidate,
} from './wdio/window-discovery.ts';

const storybook: DesktopWindowCandidate = {
  handle: '0x501e2',
  name: 'AgenticStorybook',
  processId: 4242,
  automationId: 'AgenticStorybookWindow',
  className: 'RNWindow',
};
const notes: DesktopWindowCandidate = { handle: '0x100', name: 'AgenticStorybook - Notes', processId: 99 };
const explorer: DesktopWindowCandidate = { handle: '0x200', name: 'File Explorer', processId: 12 };

describe('native window handles', () => {
  it('normalizes a decimal UI Automation handle to prefixed hexadecimal', () => {
    // NativeWindowHandle is reported in decimal; appium:appTopLevelWindow documents 0x-hex.
    expect(normalizeWindowHandle('328162')).toBe('0x501e2');
    expect(normalizeWindowHandle(328162)).toBe('0x501e2');
  });

  it('accepts an already hexadecimal handle without reinterpreting it', () => {
    expect(normalizeWindowHandle('0x501E2')).toBe('0x501e2');
  });

  it('rejects the zero handle reported by elements that are not windows', () => {
    expect(() => normalizeWindowHandle('0')).toThrow(DesktopDriverError);
    expect(() => normalizeWindowHandle('')).toThrow(DesktopDriverError);
    expect(() => normalizeWindowHandle('not-a-handle')).toThrow(DesktopDriverError);
  });
});

describe('attach window selection', () => {
  it('prefers an exact title over a window that merely contains it', () => {
    const match = selectWindow([notes, storybook, explorer], { mode: 'attach', title: 'AgenticStorybook' });
    expect(match.candidate.handle).toBe('0x501e2');
    expect(match).toMatchObject({ matchedBy: 'title', exact: true });
  });

  it('falls back to a unique substring match', () => {
    const match = selectWindow([notes, explorer], { mode: 'attach', title: 'AgenticStorybook' });
    expect(match).toMatchObject({ candidate: notes, matchedBy: 'title', exact: false });
  });

  it('refuses to guess between two windows with the same title', () => {
    const duplicate = { ...storybook, handle: '0x999' };
    expect(() => selectWindow([storybook, duplicate], { mode: 'attach', title: 'AgenticStorybook' })).toThrow(
      /matched 2 top-level windows/,
    );
  });

  it('refuses to guess between two windows that both contain the title', () => {
    const other = { ...notes, handle: '0x321', name: 'Copy of AgenticStorybook' };
    expect(() => selectWindow([notes, other], { mode: 'attach', title: 'AgenticStorybook' })).toThrow(DesktopDriverError);
  });

  it('resolves the process id before the title', () => {
    const match = selectWindow([storybook, notes], { mode: 'attach', processId: 99, title: 'AgenticStorybook' });
    expect(match).toMatchObject({ candidate: notes, matchedBy: 'processId', exact: true });
  });

  it('matches an identity against the automation id or class name', () => {
    expect(selectWindow([storybook, explorer], { mode: 'attach', identity: 'agenticstorybookwindow' }).candidate).toBe(storybook);
    expect(selectWindow([storybook, explorer], { mode: 'attach', identity: 'RNWindow' }).candidate).toBe(storybook);
  });

  it('falls through to the next identity when the stronger one matches nothing', () => {
    const match = selectWindow([storybook], { mode: 'attach', identity: 'com.example.absent', title: 'AgenticStorybook' });
    expect(match).toMatchObject({ matchedBy: 'title', exact: true });
  });

  it('reports the observed windows when nothing matches', () => {
    try {
      selectWindow([explorer], { mode: 'attach', title: 'AgenticStorybook' });
      throw new Error('expected a failure');
    } catch (error) {
      expect(error).toBeInstanceOf(DesktopDriverError);
      expect((error as DesktopDriverError).kind).toBe('ownership');
      expect((error as DesktopDriverError).detail?.observedWindows).toEqual([expect.objectContaining({ name: 'File Explorer' })]);
    }
  });
});

describe('attach window discovery', () => {
  it('never enumerates when the target already carries a handle', async () => {
    const enumerate = jest.fn(async () => [] as DesktopWindowCandidate[]);
    const match = await discoverAttachWindow({ mode: 'attach', windowHandle: '0x1234', title: 'ignored' }, enumerate);
    expect(match.candidate.handle).toBe('0x1234');
    expect(enumerate).not.toHaveBeenCalled();
  });

  it('enumerates once and selects the single match', async () => {
    const enumerate = jest.fn(async () => [storybook, explorer]);
    const match = await discoverAttachWindow({ mode: 'attach', title: 'AgenticStorybook' }, enumerate);
    expect(match.candidate.handle).toBe('0x501e2');
    expect(enumerate).toHaveBeenCalledTimes(1);
  });

  it('rejects a launch target', async () => {
    await expect(discoverAttachWindow({ mode: 'launch', app: 'C:/app.exe' }, async () => [])).rejects.toThrow(DesktopDriverError);
  });
});

describe('root-session enumeration', () => {
  const ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

  /** Minimal W3C endpoint standing in for a root-desktop session. */
  function fakeFetch(windows: readonly { id: string; attributes: Record<string, string> }[], log: string[]): typeof fetch {
    return (async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      log.push(`${method} ${new URL(url).pathname}`);
      const json = (value: unknown, status = 200) =>
        new Response(JSON.stringify({ value }), { status, headers: { 'content-type': 'application/json' } });

      if (method === 'POST' && url.endsWith('/session')) {
        return json({ sessionId: 'root-1', capabilities: {} });
      }
      if (method === 'POST' && url.endsWith('/elements')) {
        const body = JSON.parse(String(init?.body)) as { value: string };
        // Only the primary query is answered, so the fallback path stays exercised.
        if (body.value !== '/*/*') {
          return json({ error: 'invalid selector', message: 'unsupported' }, 400);
        }
        return json(windows.map((window) => ({ [ELEMENT_KEY]: window.id })));
      }
      const attributeMatch = /\/element\/([^/]+)\/attribute\/([^/]+)$/.exec(url);
      if (method === 'GET' && attributeMatch) {
        const window = windows.find((candidate) => candidate.id === attributeMatch[1]);
        return json(window?.attributes[attributeMatch[2]] ?? null);
      }
      if (method === 'DELETE') {
        return json(null);
      }
      return json({ error: 'unknown command', message: url }, 404);
    }) as typeof fetch;
  }

  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('reads handles and titles, skips non-windows, and always deletes the session', async () => {
    const log: string[] = [];
    globalThis.fetch = fakeFetch(
      [
        { id: 'e1', attributes: { NativeWindowHandle: '328162', Name: 'AgenticStorybook' } },
        // A pane reports a zero handle and must not become a candidate.
        { id: 'e2', attributes: { NativeWindowHandle: '0', Name: 'Program Manager' } },
        { id: 'e3', attributes: { NativeWindowHandle: '512', Name: 'File Explorer' } },
      ],
      log,
    );

    const enumerate = createRootSessionEnumerator({
      webDriverUrl: 'http://127.0.0.1:4723/',
      capabilities: { platformName: 'Windows', 'appium:app': 'Root' },
    });
    const candidates = await enumerate();

    expect(candidates).toEqual([
      { handle: '0x501e2', name: 'AgenticStorybook', processId: undefined, automationId: undefined, className: undefined },
      { handle: '0x200', name: 'File Explorer', processId: undefined, automationId: undefined, className: undefined },
    ]);
    expect(log).toContain('DELETE /session/root-1');
    // The identity attributes cost a round trip each, so they are only read when the target needs them.
    expect(log.filter((entry) => entry.includes('/attribute/AutomationId'))).toHaveLength(0);
  });

  it('reads the identity attributes only when the target needs them', async () => {
    const log: string[] = [];
    globalThis.fetch = fakeFetch(
      [{ id: 'e1', attributes: { NativeWindowHandle: '16', Name: 'App', ProcessId: '77', ClassName: 'RN' } }],
      log,
    );

    const candidates = await createRootSessionEnumerator({
      webDriverUrl: 'http://127.0.0.1:4723',
      capabilities: {},
      need: { identity: true },
    })();

    expect(candidates[0]).toMatchObject({ handle: '0x10', processId: 77, className: 'RN' });
    expect(log.filter((entry) => entry.includes('/attribute/ClassName'))).toHaveLength(1);
  });

  it('deletes the session even when enumeration fails', async () => {
    const log: string[] = [];
    globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      log.push(`${method} ${new URL(url).pathname}`);
      if (method === 'POST' && url.endsWith('/session')) {
        return new Response(JSON.stringify({ value: { sessionId: 'root-2' } }), { status: 200 });
      }
      if (method === 'DELETE') {
        return new Response(JSON.stringify({ value: null }), { status: 200 });
      }
      return new Response(JSON.stringify({ value: { error: 'unknown error', message: 'boom' } }), { status: 500 });
    }) as typeof fetch;

    const candidates = await createRootSessionEnumerator({ webDriverUrl: 'http://127.0.0.1:4723', capabilities: {} })();
    expect(candidates).toEqual([]);
    expect(log).toContain('DELETE /session/root-2');
  });
});
