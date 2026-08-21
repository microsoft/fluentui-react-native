/**
 * The `fake` backend.
 *
 * A deterministic in-process W3C endpoint plus a Storybook-compatible channel surface. It exists
 * so the launcher/worker service, the `browser.desktop` commands, the story controller, the
 * artifact pipeline, and the shared-spec contract suite can all be exercised on any machine,
 * without Xcode, Windows PowerShell, or a built application.
 *
 * It is a contract fake for this package's own plumbing. It is never a substitute for running the
 * shared suite against a real platform backend.
 */

import * as fs from 'node:fs';

import { W3CError, type RouteDefinition } from './w3c-server.ts';
import type { DesktopFakeElement, DesktopFakeScene } from '../types.ts';

const ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

/** A 1x1 transparent PNG, so `takeScreenshot()` returns a decodable image. */
const BLANK_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

interface FakeElementState extends DesktopFakeElement {
  displayed: boolean;
  enabled: boolean;
  selected: boolean;
  focused: boolean;
  pressCount: number;
}

interface FakeSession {
  id: string;
  storyId?: string;
  elements: Map<string, FakeElementState>;
  handles: Map<string, string>;
  nextHandle: number;
  timeouts: { implicit: number; pageLoad: number; script: number };
}

function normalizeElement(element: DesktopFakeElement): FakeElementState {
  return {
    ...element,
    displayed: element.displayed ?? true,
    enabled: element.enabled ?? true,
    selected: element.selected ?? false,
    focused: element.focused ?? false,
    pressCount: 0,
  };
}

/** Loads a scene from an inline document or a JSON file path. */
export function loadFakeScene(source: string | DesktopFakeScene | undefined): DesktopFakeScene {
  if (source === undefined) {
    return { stories: {} };
  }
  if (typeof source !== 'string') {
    return source;
  }
  return JSON.parse(fs.readFileSync(source, 'utf8')) as DesktopFakeScene;
}

export class FakeDriver {
  private readonly scene: DesktopFakeScene;
  private readonly sessions = new Map<string, FakeSession>();
  private sessionCounter = 0;
  private pendingStory?: string;

  constructor(scene: DesktopFakeScene) {
    this.scene = scene;
  }

  get storyIds(): readonly string[] {
    return Object.keys(this.scene.stories);
  }

  private session(sessionId: string): FakeSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new W3CError('invalid session id', `No fake session "${sessionId}"`);
    }
    return session;
  }

  private element(session: FakeSession, handle: string): FakeElementState {
    const testId = session.handles.get(handle);
    const element = testId === undefined ? undefined : session.elements.get(testId);
    if (!element) {
      throw new W3CError('stale element reference', `Element "${handle}" is no longer attached to the fake scene`);
    }
    return element;
  }

  private handleFor(session: FakeSession, testId: string): string {
    for (const [handle, id] of session.handles) {
      if (id === testId) {
        return handle;
      }
    }
    const handle = `fake-element-${(session.nextHandle += 1)}`;
    session.handles.set(handle, testId);
    return handle;
  }

  createSession(capabilities: Record<string, unknown>): { sessionId: string; capabilities: Record<string, unknown> } {
    const id = `fake-session-${(this.sessionCounter += 1)}`;
    const session: FakeSession = {
      id,
      elements: new Map(),
      handles: new Map(),
      nextHandle: 0,
      timeouts: { implicit: 0, pageLoad: 300_000, script: 30_000 },
    };
    this.sessions.set(id, session);

    const initialStory =
      typeof capabilities['desktop:initialStory'] === 'string' ? (capabilities['desktop:initialStory'] as string) : undefined;
    this.selectStory(id, initialStory ?? this.pendingStory ?? this.storyIds[0]);

    return {
      sessionId: id,
      capabilities: {
        ...capabilities,
        platformName: 'fake',
        'appium:automationName': 'Fake',
        'desktop:backend': 'fake',
      },
    };
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Switches the scene, which is how the fake models a Storybook story selection.
   *
   * Re-selecting the story that is already rendered deliberately preserves element state. The
   * React Native renderer implements story selection as `setContext(...)` on a component that is
   * rendered without a `key`, so re-selecting the current story re-renders the same component
   * instance and does not reset its state. A fake that reset here would hide that from every
   * shared spec until it ran on a real device.
   *
   * Existence is checked before anything is mutated or short-circuited, so an unknown story id
   * fails every time it is requested rather than appearing to render on a retry.
   */
  selectStory(sessionId: string, storyId: string | undefined): void {
    const session = this.session(sessionId);

    if (storyId === undefined) {
      session.storyId = undefined;
      session.elements.clear();
      session.handles.clear();
      return;
    }

    const story = this.scene.stories[storyId];
    if (!story) {
      throw new W3CError('no such window', `The fake scene has no story "${storyId}"`);
    }
    if (session.storyId === storyId) {
      return;
    }

    session.storyId = storyId;
    session.elements.clear();
    session.handles.clear();
    for (const element of story.elements) {
      session.elements.set(element.testId, normalizeElement(element));
    }
  }

  currentStory(sessionId: string): string | undefined {
    return this.session(sessionId).storyId;
  }

  /** Applies a story selection to every open session; all fake sessions share one scene. */
  selectStoryEverywhere(storyId: string): void {
    if (!this.scene.stories[storyId]) {
      throw new W3CError('no such window', `The fake scene has no story "${storyId}"`);
    }
    if (this.sessions.size === 0) {
      // Selection before a session exists is legal: the next session starts on this story.
      this.pendingStory = storyId;
      return;
    }
    for (const sessionId of this.sessions.keys()) {
      this.selectStory(sessionId, storyId);
    }
  }

  findElements(sessionId: string, using: string, value: string): string[] {
    const session = this.session(sessionId);
    if (using !== 'accessibility id') {
      throw new W3CError('invalid selector', `The fake backend only implements the portable "accessibility id" strategy, got "${using}"`);
    }
    const element = session.elements.get(value);
    return element ? [this.handleFor(session, value)] : [];
  }

  getState(sessionId: string, handle: string, property: 'displayed' | 'enabled' | 'selected'): boolean {
    return this.element(this.session(sessionId), handle)[property];
  }

  getText(sessionId: string, handle: string): string {
    return this.element(this.session(sessionId), handle).text ?? '';
  }

  getAttribute(sessionId: string, handle: string, name: string): string | null {
    const element = this.element(this.session(sessionId), handle);
    switch (name) {
      case 'value':
        return element.value ?? null;
      case 'name':
      case 'label':
        return element.name ?? null;
      case 'AutomationId':
      case 'identifier':
        return element.testId;
      case 'enabled':
        return String(element.enabled);
      case 'selected':
        return String(element.selected);
      case 'focused':
        return String(element.focused);
      default:
        return null;
    }
  }

  activeElement(sessionId: string): string {
    const session = this.session(sessionId);
    for (const [testId, element] of session.elements) {
      if (element.focused) {
        return this.handleFor(session, testId);
      }
    }
    throw new W3CError('no such element', 'The fake scene has no focused element');
  }

  click(sessionId: string, handle: string): void {
    const session = this.session(sessionId);
    const element = this.element(session, handle);
    if (!element.enabled) {
      throw new W3CError('unsupported operation', `Element "${element.testId}" is disabled and cannot be clicked`);
    }
    for (const [, other] of session.elements) {
      other.focused = false;
    }
    element.focused = true;
    for (const mutation of element.onClick ?? []) {
      const target = session.elements.get(mutation.testId);
      if (!target) {
        continue;
      }
      if (mutation.set) {
        Object.assign(target, mutation.set);
      }
      if (mutation.incrementText) {
        target.pressCount += 1;
        target.text = mutation.incrementText.replace('{count}', String(target.pressCount));
      }
    }
  }

  clear(sessionId: string, handle: string): void {
    this.element(this.session(sessionId), handle).value = '';
  }

  addValue(sessionId: string, handle: string, text: string): void {
    const element = this.element(this.session(sessionId), handle);
    if (!element.enabled) {
      throw new W3CError('unsupported operation', `Element "${element.testId}" is disabled and cannot receive input`);
    }
    element.value = `${element.value ?? ''}${text}`;
  }

  setTimeouts(sessionId: string, timeouts: Partial<FakeSession['timeouts']>): void {
    Object.assign(this.session(sessionId).timeouts, timeouts);
  }

  getTimeouts(sessionId: string): FakeSession['timeouts'] {
    return this.session(sessionId).timeouts;
  }

  source(sessionId: string): string {
    const session = this.session(sessionId);
    const nodes = [...session.elements.values()]
      .map(
        (element) =>
          `  <Element identifier="${escapeXml(element.testId)}" role="${escapeXml(element.role ?? 'unknown')}" name="${escapeXml(
            element.name ?? '',
          )}" displayed="${element.displayed}" enabled="${element.enabled}" selected="${element.selected}" focused="${element.focused}" />`,
      )
      .join('\n');
    return `<Application story="${escapeXml(session.storyId ?? '')}">\n${nodes}\n</Application>\n`;
  }

  screenshot(): string {
    return BLANK_PNG_BASE64;
  }

  /** Implements the platform execute methods the desktop augmentation relies on. */
  execute(sessionId: string, script: string, args: readonly unknown[]): unknown {
    switch (script) {
      case 'desktop: scroll':
      case 'macos: scroll':
      case 'windows: scroll': {
        const first = args[0] as { elementId?: string } | undefined;
        if (first?.elementId) {
          // Scrolling never changes the fake scene; the call exists so the portable command has
          // one contract assertion that passes unchanged on every backend.
          this.element(this.session(sessionId), first.elementId);
        }
        return null;
      }
      case 'desktop: appState':
        return this.sessions.has(sessionId) ? 'ready' : 'stopped';
      case 'desktop: currentStory':
        return this.currentStory(sessionId) ?? null;
      default:
        throw new W3CError('unsupported operation', `The fake backend does not implement execute script "${script}"`);
    }
  }
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function elementValue(handle: string): Record<string, string> {
  return { [ELEMENT_KEY]: handle };
}

/** Builds the W3C and Storybook-compatible routes for a fake driver instance. */
export function createFakeRoutes(driver: FakeDriver): readonly RouteDefinition[] {
  const requireBody = (body: unknown): Record<string, unknown> => {
    if (typeof body !== 'object' || body === null) {
      throw new W3CError('invalid argument', 'Expected a JSON object body');
    }
    return body as Record<string, unknown>;
  };

  return [
    { method: 'GET', path: '/status', handler: () => ({ ready: true, message: 'fake desktop driver ready' }) },
    {
      method: 'POST',
      path: '/session',
      handler: ({ body }) => {
        const payload = requireBody(body);
        const capabilities = payload.capabilities as { alwaysMatch?: Record<string, unknown> } | undefined;
        return driver.createSession({ ...capabilities?.alwaysMatch });
      },
    },
    {
      method: 'DELETE',
      path: '/session/:sessionId',
      handler: ({ params }) => {
        driver.deleteSession(params.sessionId);
        return null;
      },
    },
    {
      method: 'POST',
      path: '/session/:sessionId/timeouts',
      handler: ({ params, body }) => {
        driver.setTimeouts(params.sessionId, requireBody(body) as Partial<{ implicit: number; pageLoad: number; script: number }>);
        return null;
      },
    },
    { method: 'GET', path: '/session/:sessionId/timeouts', handler: ({ params }) => driver.getTimeouts(params.sessionId) },
    {
      method: 'POST',
      path: '/session/:sessionId/element',
      handler: ({ params, body }) => {
        const { using, value } = requireBody(body) as { using: string; value: string };
        const [handle] = driver.findElements(params.sessionId, using, value);
        if (!handle) {
          throw new W3CError('no such element', `No element with accessibility id "${value}"`);
        }
        return elementValue(handle);
      },
    },
    {
      method: 'POST',
      path: '/session/:sessionId/elements',
      handler: ({ params, body }) => {
        const { using, value } = requireBody(body) as { using: string; value: string };
        return driver.findElements(params.sessionId, using, value).map(elementValue);
      },
    },
    {
      method: 'GET',
      path: '/session/:sessionId/element/active',
      handler: ({ params }) => elementValue(driver.activeElement(params.sessionId)),
    },
    {
      method: 'GET',
      path: '/session/:sessionId/element/:elementId/displayed',
      handler: ({ params }) => driver.getState(params.sessionId, params.elementId, 'displayed'),
    },
    {
      method: 'GET',
      path: '/session/:sessionId/element/:elementId/enabled',
      handler: ({ params }) => driver.getState(params.sessionId, params.elementId, 'enabled'),
    },
    {
      method: 'GET',
      path: '/session/:sessionId/element/:elementId/selected',
      handler: ({ params }) => driver.getState(params.sessionId, params.elementId, 'selected'),
    },
    {
      method: 'GET',
      path: '/session/:sessionId/element/:elementId/text',
      handler: ({ params }) => driver.getText(params.sessionId, params.elementId),
    },
    {
      method: 'GET',
      path: '/session/:sessionId/element/:elementId/attribute/:name',
      handler: ({ params }) => driver.getAttribute(params.sessionId, params.elementId, params.name),
    },
    {
      method: 'GET',
      path: '/session/:sessionId/element/:elementId/property/:name',
      handler: ({ params }) => driver.getAttribute(params.sessionId, params.elementId, params.name),
    },
    {
      method: 'POST',
      path: '/session/:sessionId/element/:elementId/click',
      handler: ({ params }) => {
        driver.click(params.sessionId, params.elementId);
        return null;
      },
    },
    {
      method: 'POST',
      path: '/session/:sessionId/element/:elementId/clear',
      handler: ({ params }) => {
        driver.clear(params.sessionId, params.elementId);
        return null;
      },
    },
    {
      method: 'POST',
      path: '/session/:sessionId/element/:elementId/value',
      handler: ({ params, body }) => {
        const payload = requireBody(body) as { text?: string; value?: string[] };
        driver.addValue(params.sessionId, params.elementId, payload.text ?? (payload.value ?? []).join(''));
        return null;
      },
    },
    { method: 'GET', path: '/session/:sessionId/source', handler: ({ params }) => driver.source(params.sessionId) },
    { method: 'GET', path: '/session/:sessionId/screenshot', handler: () => driver.screenshot() },
    {
      method: 'POST',
      path: '/session/:sessionId/execute/sync',
      handler: ({ params, body }) => {
        const { script, args } = requireBody(body) as { script: string; args?: unknown[] };
        return driver.execute(params.sessionId, script, args ?? []);
      },
    },

    // Storybook-compatible channel surface. The story controller talks to these routes with the
    // same code it uses against the real channel server, so selection is covered by the contract
    // suite instead of only by a live application.
    {
      method: 'GET',
      path: '/index.json',
      raw: true,
      handler: () => ({
        v: 5,
        entries: Object.fromEntries(
          driver.storyIds.map((storyId) => [storyId, { id: storyId, name: storyId, title: storyId, type: 'story' }]),
        ),
      }),
    },
    {
      method: 'POST',
      path: '/select-story-sync/:storyId',
      raw: true,
      handler: ({ params }) => {
        driver.selectStoryEverywhere(params.storyId);
        return { success: true, storyId: params.storyId };
      },
    },
  ];
}

export { ELEMENT_KEY };
