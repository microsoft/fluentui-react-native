/**
 * Portable command matrix contract test.
 *
 * Exercises every portable command against the `fake` backend through the same W3C routes a real
 * driver serves. It runs in-process so it works where binding a loopback socket is not permitted;
 * `contract.wdio.spec.ts` runs the same assertions through a real WebdriverIO session.
 */

import { createFakeRoutes, FakeDriver } from './driver-host/fake-driver.ts';
import { createRouteDispatcher, type DispatchResult } from './driver-host/w3c-server.ts';
import { PORTABLE_COMMANDS, PORTABLE_COMMAND_SURFACES } from './capabilities.ts';
import contractScene from './__fixtures__/contract-scene.json' with { type: 'json' };
import type { DesktopFakeScene } from './types.ts';

const ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

function createClient() {
  const driver = new FakeDriver(contractScene as DesktopFakeScene);
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

  return { driver, call, dispatch };
}

async function newSession(call: (method: string, url: string, body?: unknown) => Promise<unknown>): Promise<string> {
  const session = (await call('POST', '/session', {
    capabilities: { alwaysMatch: { browserName: '', platformName: 'fake', 'desktop:initialStory': 'components-button--default' } },
  })) as { sessionId: string };
  return session.sessionId;
}

async function findElement(
  call: (method: string, url: string, body?: unknown) => Promise<unknown>,
  sessionId: string,
  testId: string,
): Promise<string> {
  const element = (await call('POST', `/session/${sessionId}/element`, { using: 'accessibility id', value: testId })) as Record<
    string,
    string
  >;
  return element[ELEMENT_KEY];
}

describe('portable command matrix (fake backend)', () => {
  it('declares a surface for every portable command', () => {
    for (const command of PORTABLE_COMMANDS) {
      expect(PORTABLE_COMMAND_SURFACES[command]).toBeDefined();
    }
    expect(PORTABLE_COMMAND_SURFACES.isFocused).toBe('desktop');
    expect(PORTABLE_COMMAND_SURFACES.scrollIntoView).toBe('desktop');
  });

  it('finds, inspects, clicks, and observes the resulting state change', async () => {
    const { call } = createClient();
    const sessionId = await newSession(call);

    const button = await findElement(call, sessionId, 'agentic-storybook-button');
    expect(await call('GET', `/session/${sessionId}/element/${button}/displayed`)).toBe(true);
    expect(await call('GET', `/session/${sessionId}/element/${button}/enabled`)).toBe(true);
    expect(await call('GET', `/session/${sessionId}/element/${button}/selected`)).toBe(false);
    expect(await call('GET', `/session/${sessionId}/element/${button}/text`)).toBe('Button');

    const statusBefore = await findElement(call, sessionId, 'agentic-storybook-button-status');
    expect(await call('GET', `/session/${sessionId}/element/${statusBefore}/text`)).toBe('Not pressed');

    await call('POST', `/session/${sessionId}/element/${button}/click`);

    const statusAfter = await findElement(call, sessionId, 'agentic-storybook-button-status');
    expect(await call('GET', `/session/${sessionId}/element/${statusAfter}/text`)).toBe('Pressed');
  });

  it('reports the active element so focus is inspectable without a DOM script', async () => {
    const { call } = createClient();
    const sessionId = await newSession(call);

    const button = await findElement(call, sessionId, 'agentic-storybook-button');
    await call('POST', `/session/${sessionId}/element/${button}/click`);

    const active = (await call('GET', `/session/${sessionId}/element/active`)) as Record<string, string>;
    expect(active[ELEMENT_KEY]).toBe(button);
  });

  it('clears and sets a value, and reads it back through the value attribute', async () => {
    const { call, driver } = createClient();
    const sessionId = await newSession(call);
    driver.selectStory(sessionId, 'components-input--default');

    const input = await findElement(call, sessionId, 'agentic-storybook-input');
    expect(await call('GET', `/session/${sessionId}/element/${input}/attribute/value`)).toBe('seed');

    await call('POST', `/session/${sessionId}/element/${input}/clear`);
    await call('POST', `/session/${sessionId}/element/${input}/value`, { text: 'hello' });

    expect(await call('GET', `/session/${sessionId}/element/${input}/attribute/value`)).toBe('hello');
  });

  it('refuses to click or type into a disabled control', async () => {
    const { call, driver } = createClient();
    const sessionId = await newSession(call);
    driver.selectStory(sessionId, 'components-button--disabled');

    const button = await findElement(call, sessionId, 'agentic-storybook-button-disabled');
    expect(await call('GET', `/session/${sessionId}/element/${button}/enabled`)).toBe(false);
    await expect(call('POST', `/session/${sessionId}/element/${button}/click`)).rejects.toThrow(/disabled/);
  });

  it('returns an empty list rather than an error when nothing matches', async () => {
    const { call } = createClient();
    const sessionId = await newSession(call);

    expect(await call('POST', `/session/${sessionId}/elements`, { using: 'accessibility id', value: 'missing' })).toEqual([]);
    await expect(call('POST', `/session/${sessionId}/element`, { using: 'accessibility id', value: 'missing' })).rejects.toThrow(
      /no such element/,
    );
  });

  it('rejects a non-portable locator strategy', async () => {
    const { call } = createClient();
    const sessionId = await newSession(call);

    await expect(call('POST', `/session/${sessionId}/element`, { using: 'xpath', value: '//Button' })).rejects.toThrow(
      /only implements the portable "accessibility id" strategy/,
    );
  });

  it('captures source and a decodable screenshot', async () => {
    const { call } = createClient();
    const sessionId = await newSession(call);

    const source = (await call('GET', `/session/${sessionId}/source`)) as string;
    expect(source).toContain('identifier="agentic-storybook-button"');

    const screenshot = (await call('GET', `/session/${sessionId}/screenshot`)) as string;
    expect(Buffer.from(screenshot, 'base64').subarray(1, 4).toString('ascii')).toBe('PNG');
  });

  it('implements the scroll execute method the desktop augmentation calls', async () => {
    const { call } = createClient();
    const sessionId = await newSession(call);
    const button = await findElement(call, sessionId, 'agentic-storybook-button');

    expect(
      await call('POST', `/session/${sessionId}/execute/sync`, { script: 'desktop: scroll', args: [{ elementId: button }] }),
    ).toBeNull();
    await expect(call('POST', `/session/${sessionId}/execute/sync`, { script: 'eval', args: [] })).rejects.toThrow(
      /does not implement execute script/,
    );
  });

  it('invalidates the session after deletion', async () => {
    const { call } = createClient();
    const sessionId = await newSession(call);

    await call('DELETE', `/session/${sessionId}`);
    await expect(call('GET', `/session/${sessionId}/source`)).rejects.toThrow(/invalid session id/);
  });

  it('serves the Storybook-compatible surface the story controller uses', async () => {
    const { dispatch } = createClient();

    const index = (await dispatch('GET', '/index.json')).payload as { entries: Record<string, unknown> };
    expect(Object.keys(index.entries)).toContain('components-button--default');

    const selected = (await dispatch('POST', '/select-story-sync/components-button--disabled')).payload as { success: boolean };
    expect(selected.success).toBe(true);
  });

  it('preserves element state when the story that is already rendered is re-selected', async () => {
    const { call, driver } = createClient();
    const sessionId = await newSession(call);

    const button = await findElement(call, sessionId, 'agentic-storybook-button');
    await call('POST', `/session/${sessionId}/element/${button}/click`);

    const statusAfterClick = await findElement(call, sessionId, 'agentic-storybook-button-status');
    expect(await call('GET', `/session/${sessionId}/element/${statusAfterClick}/text`)).toBe('Pressed');

    // The React Native renderer applies a selection with `setContext` on a component rendered
    // without a `key`, so re-selecting the current story does not reset its state. The fake must
    // model that, otherwise a spec that depends on a reset passes here and fails on a device.
    driver.selectStory(sessionId, 'components-button--default');

    const statusAfterReselect = await findElement(call, sessionId, 'agentic-storybook-button-status');
    expect(await call('GET', `/session/${sessionId}/element/${statusAfterReselect}/text`)).toBe('Pressed');
  });

  it('resets state when a different story is selected', async () => {
    const { call, driver } = createClient();
    const sessionId = await newSession(call);

    const button = await findElement(call, sessionId, 'agentic-storybook-button');
    await call('POST', `/session/${sessionId}/element/${button}/click`);

    driver.selectStory(sessionId, 'components-button--disabled');
    driver.selectStory(sessionId, 'components-button--default');

    const status = await findElement(call, sessionId, 'agentic-storybook-button-status');
    expect(await call('GET', `/session/${sessionId}/element/${status}/text`)).toBe('Not pressed');
  });

  it('answers a malformed percent-escape with a W3C error instead of rejecting', async () => {
    const { dispatch } = createClient();
    const result = await dispatch('GET', '/session/%E0%A4%A/source');

    expect(result.status).toBe(400);
    expect((result.payload as { value: { error: string } }).value.error).toBe('invalid argument');
  });

  it('keeps rejecting an unknown story on every attempt', async () => {
    const { call, dispatch } = createClient();
    const sessionId = await newSession(call);

    // The story controller retries selection until the render budget expires. A selection that
    // succeeded on retry would turn "this story id does not exist" into "no such element on an
    // empty screen", which is the wrong diagnosis for a manifest that disagrees with the app.
    for (const attempt of [1, 2, 3]) {
      const result = await dispatch('POST', '/select-story-sync/nope--typo');
      expect({ attempt, status: result.status }).toEqual({ attempt, status: 404 });
    }

    // The failed selection must not have replaced the rendered story either.
    expect(await call('GET', `/session/${sessionId}/element/active`).catch(() => 'no active element')).toBeDefined();
    const button = await findElement(call, sessionId, 'agentic-storybook-button');
    expect(await call('GET', `/session/${sessionId}/element/${button}/text`)).toBe('Button');
  });

  it('answers unknown routes with the W3C unknown-command error', async () => {
    const { dispatch } = createClient();
    const result = await dispatch('GET', '/definitely/not/a/route');

    expect(result.status).toBe(404);
    expect((result.payload as { value: { error: string } }).value.error).toBe('unknown command');
  });
});
