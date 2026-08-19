/**
 * A WebdriverIO-shaped adapter over the in-process fake backend.
 *
 * WebdriverIO speaks HTTP, which is not always available (sandboxed CI, restricted developer
 * machines). This adapter implements the same element and browser surface the portable command
 * matrix uses, on top of the very same W3C routes a real driver serves, so the plan runner, the
 * `browser.desktop` augmentation, and the selector policy stay covered everywhere.
 *
 * It is a test double for this package's own plumbing, not a WebdriverIO replacement.
 */

import { createFakeRoutes, FakeDriver, loadFakeScene } from './fake-driver.ts';
import { createRouteDispatcher, type DispatchResult } from './w3c-server.ts';
import type { DesktopBrowserLike, DesktopElementLike } from '../wdio/commands.ts';
import type { DesktopFakeScene } from '../types.ts';

const ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

export interface InProcessSession {
  browser: DesktopBrowserLike;
  driver: FakeDriver;
  sessionId: string;
  selectStory(storyId: string): void;
}

/** Creates a fake session that satisfies the surface the portable commands need. */
export async function createInProcessSession(
  scene: string | DesktopFakeScene,
  options: { initialStory?: string } = {},
): Promise<InProcessSession> {
  const driver = new FakeDriver(loadFakeScene(scene));
  const dispatch = createRouteDispatcher(createFakeRoutes(driver));

  const call = async (method: string, url: string, body?: unknown): Promise<unknown> => {
    const result: DispatchResult = await dispatch(method, url, body);
    const payload = result.payload as { value?: unknown };
    if (result.status >= 400) {
      const error = payload.value as { error: string; message: string };
      throw new Error(`${error.error}: ${error.message}`);
    }
    return payload.value;
  };

  const created = (await call('POST', '/session', {
    capabilities: { alwaysMatch: { browserName: '', 'desktop:initialStory': options.initialStory } },
  })) as { sessionId: string };
  const sessionId = created.sessionId;

  const findHandle = async (selector: string): Promise<string | undefined> => {
    if (!selector.startsWith('~')) {
      throw new Error(`The in-process session only supports accessibility-id selectors, got "${selector}"`);
    }
    const handles = (await call('POST', `/session/${sessionId}/elements`, {
      using: 'accessibility id',
      value: selector.slice(1),
    })) as Record<string, string>[];
    return handles[0]?.[ELEMENT_KEY];
  };

  const element = (selector: string, resolvedHandle: string | undefined): DesktopElementLike => {
    // Handles are resolved lazily on each command so the element reflects the current scene,
    // which is what a real driver's implicit re-resolution does for a re-rendered story.
    const withHandle = async <T>(action: (handle: string) => Promise<T>, whenMissing: () => T | Promise<T>): Promise<T> => {
      const handle = await findHandle(selector);
      if (handle === undefined) {
        return whenMissing();
      }
      return action(handle);
    };

    const missing = (): never => {
      throw new Error(`no such element: ${selector}`);
    };

    const waitFor = async (predicate: (handle: string) => Promise<boolean>, reverse: boolean, timeout: number): Promise<boolean> => {
      const deadline = Date.now() + timeout;
      for (;;) {
        const handle = await findHandle(selector);
        const satisfied = handle === undefined ? reverse : (await predicate(handle)) !== reverse;
        if (satisfied) {
          return true;
        }
        if (Date.now() >= deadline) {
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    };

    return {
      elementId: resolvedHandle ?? '',
      isExisting: async () => (await findHandle(selector)) !== undefined,
      isDisplayed: () =>
        withHandle(
          (handle) => call('GET', `/session/${sessionId}/element/${handle}/displayed`) as Promise<boolean>,
          () => false,
        ),
      isEnabled: () => withHandle((handle) => call('GET', `/session/${sessionId}/element/${handle}/enabled`) as Promise<boolean>, missing),
      isSelected: () =>
        withHandle((handle) => call('GET', `/session/${sessionId}/element/${handle}/selected`) as Promise<boolean>, missing),
      getText: () => withHandle((handle) => call('GET', `/session/${sessionId}/element/${handle}/text`) as Promise<string>, missing),
      getAttribute: (name: string) =>
        withHandle((handle) => call('GET', `/session/${sessionId}/element/${handle}/attribute/${name}`) as Promise<string | null>, missing),
      click: () => withHandle(async (handle) => void (await call('POST', `/session/${sessionId}/element/${handle}/click`)), missing),
      clearValue: () => withHandle(async (handle) => void (await call('POST', `/session/${sessionId}/element/${handle}/clear`)), missing),
      setValue: (value: string) =>
        withHandle(async (handle) => {
          await call('POST', `/session/${sessionId}/element/${handle}/clear`);
          await call('POST', `/session/${sessionId}/element/${handle}/value`, { text: value });
        }, missing),
      waitForDisplayed: (waitOptions) =>
        waitFor(
          (handle) => call('GET', `/session/${sessionId}/element/${handle}/displayed`) as Promise<boolean>,
          waitOptions?.reverse ?? false,
          waitOptions?.timeout ?? 2000,
        ),
      waitForExist: (waitOptions) => waitFor(async () => true, waitOptions?.reverse ?? false, waitOptions?.timeout ?? 2000),
    };
  };

  const browser: DesktopBrowserLike = {
    sessionId,
    $: async (selector: string) => element(selector, await findHandle(selector)),
    execute: (script: string, ...args: unknown[]) =>
      call('POST', `/session/${sessionId}/execute/sync`, { script, args }) as Promise<unknown>,
    getPageSource: () => call('GET', `/session/${sessionId}/source`) as Promise<string>,
    takeScreenshot: () => call('GET', `/session/${sessionId}/screenshot`) as Promise<string>,
    getActiveElement: () => call('GET', `/session/${sessionId}/element/active`) as Promise<Record<string, string>>,
    addCommand: () => undefined,
  };

  return {
    browser,
    driver,
    sessionId,
    selectStory: (storyId: string) => driver.selectStory(sessionId, storyId),
  };
}

/** Resolves the current handle for a selector, for assertions that need element identity. */
export async function resolveHandle(session: InProcessSession, selector: string): Promise<string | undefined> {
  const handles = session.driver.findElements(session.sessionId, 'accessibility id', selector.replace(/^~/, ''));
  return handles[0];
}
