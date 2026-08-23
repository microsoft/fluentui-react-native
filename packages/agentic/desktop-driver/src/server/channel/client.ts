/**
 * Story controller.
 *
 * Talks to the Storybook channel server that the on-device app is already connected to. The same
 * implementation drives the real channel server and the `fake` backend's Storybook-compatible
 * surface, so story selection is covered by the contract suite rather than only by a live app.
 */

import { DesktopDriverError } from '../../errors.ts';
import { delay } from '../../net.ts';

export interface StoryIndexEntry {
  id: string;
  name: string;
  title: string;
  type: string;
}

export interface StoryControllerOptions {
  /** Base URL of the channel server, for example `http://127.0.0.1:7007`. */
  baseUrl: string;
  /** How long `select` keeps retrying for a rendered acknowledgement. Defaults to 30000. */
  renderTimeout?: number;
  retryIntervalMs?: number;
  fetchImpl?: typeof fetch;
}

export class StoryController {
  private readonly baseUrl: string;
  private readonly renderTimeout: number;
  private readonly retryInterval: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: StoryControllerOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.renderTimeout = options.renderTimeout ?? 30_000;
    this.retryInterval = options.retryIntervalMs ?? 500;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  get url(): string {
    return this.baseUrl;
  }

  private async request(pathname: string, init?: RequestInit, deadline = Date.now() + this.renderTimeout): Promise<unknown> {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new DesktopDriverError(`Storybook request deadline expired for ${pathname}`, {
        kind: 'storybook',
        detail: { pathname },
      });
    }
    const response = await this.fetchImpl(`${this.baseUrl}${pathname}`, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(remaining),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new DesktopDriverError(body.error ?? `Storybook channel server returned ${response.status} for ${pathname}`, {
        kind: 'storybook',
        detail: { pathname, status: response.status },
      });
    }
    return body;
  }

  /** Returns the story index reported by the running application. */
  async listStories(): Promise<readonly StoryIndexEntry[]> {
    const index = (await this.request('/index.json')) as { entries?: Record<string, StoryIndexEntry> };
    return Object.values(index.entries ?? {}).filter((entry) => entry.type === 'story');
  }

  /** Returns true when the channel server answers, used as a readiness gate. */
  async isConnected(): Promise<boolean> {
    try {
      await this.request('/index.json', undefined, Date.now() + Math.min(this.renderTimeout, 5000));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Selects a story and waits for its rendered acknowledgement.
   *
   * The channel server answers the synchronous select route only once the device has rendered the
   * story, so retrying that call is the render wait.
   */
  async select(storyId: string): Promise<void> {
    const deadline = Date.now() + this.renderTimeout;
    let lastError: unknown;

    while (Date.now() < deadline) {
      try {
        await this.request(`/select-story-sync/${encodeURIComponent(storyId)}`, { method: 'POST' }, deadline);
        return;
      } catch (error) {
        lastError = error;
        await delay(this.retryInterval);
      }
    }

    throw new DesktopDriverError(`Story "${storyId}" did not render within ${this.renderTimeout}ms`, {
      kind: 'storybook',
      cause: lastError,
      detail: { storyId, renderTimeout: this.renderTimeout },
    });
  }

  /** Waits until the requested story is the rendered one. */
  async waitForStory(storyId: string): Promise<void> {
    await this.select(storyId);
  }

  /** Updates on-device control args for a story. */
  async updateArgs(storyId: string, updatedArgs: Record<string, unknown>): Promise<void> {
    await this.sendEvent('updateStoryArgs', { storyId, updatedArgs });
  }

  /**
   * Broadcasts a Storybook channel event to the connected application.
   *
   * The payload is ordinary JSON data. This is the transport the desktop test service uses to
   * announce itself, so the device never needs a build-time endpoint or token.
   */
  async sendEvent(type: string, ...args: readonly unknown[]): Promise<void> {
    await this.request('/send-event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, args }),
    });
  }
}
