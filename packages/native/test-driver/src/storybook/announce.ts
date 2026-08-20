/**
 * Service discovery over the Storybook channel.
 *
 * The on-device controls cannot read an environment variable: React Native populates
 * `process.env` with `NODE_ENV` only, and nothing inlines other values into the bundle. Instead
 * the host-side service announces itself over the Storybook channel the application is already
 * connected to, using the channel server's existing `send-event` endpoint. No change to the
 * channel server is required.
 *
 * The announcement repeats on an interval so an application that connects late, reloads, or
 * restarts still receives the current endpoint and token without a rebuild.
 */

import { DESKTOP_PROTOCOL_VERSION } from '../protocol.ts';
import type { StoryController } from './controller.ts';

/** The payload broadcast to the device. It is data only; nothing here is executable. */
export interface DesktopServiceAnnouncement {
  protocolVersion: number;
  url: string;
  token: string;
  /** Lets the device notice that it is talking to a service built from a different manifest. */
  manifestDigest: string;
}

/** Channel event name the on-device controls subscribe to. */
export const DESKTOP_SERVICE_ANNOUNCE_EVENT = 'desktopTestServiceAnnounce';

export interface AnnouncerOptions {
  controller: StoryController;
  announcement: DesktopServiceAnnouncement;
  /** Re-broadcast interval in milliseconds. Defaults to 5000. */
  intervalMs?: number;
  onError?: (error: unknown) => void;
}

export interface AnnouncerHandle {
  /** Broadcasts once, immediately. Resolves false when the channel is unreachable. */
  announceNow(): Promise<boolean>;
  stop(): void;
}

/** Starts announcing the service until stopped. */
export function startServiceAnnouncer(options: AnnouncerOptions): AnnouncerHandle {
  const interval = options.intervalMs ?? 5000;
  let stopped = false;

  const announceNow = async (): Promise<boolean> => {
    try {
      await options.controller.sendEvent(DESKTOP_SERVICE_ANNOUNCE_EVENT, options.announcement);
      return true;
    } catch (error) {
      // The channel server may not be running yet; that is expected and not fatal.
      options.onError?.(error);
      return false;
    }
  };

  const timer = setInterval(() => {
    if (!stopped) {
      void announceNow();
    }
  }, interval);
  timer.unref();

  return {
    announceNow,
    stop: () => {
      stopped = true;
      clearInterval(timer);
    },
  };
}

/** Builds the announcement payload for a running service. */
export function createAnnouncement(url: string, token: string, manifestDigest: string): DesktopServiceAnnouncement {
  return { protocolVersion: DESKTOP_PROTOCOL_VERSION, url, token, manifestDigest };
}
