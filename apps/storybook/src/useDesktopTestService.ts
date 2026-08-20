/**
 * Discovers the host-side desktop test service over the Storybook channel.
 *
 * The service cannot be configured at build time: React Native populates `process.env` with
 * `NODE_ENV` only, and nothing inlines other values into the bundle, so an environment variable
 * read here is always `undefined`. Instead the service announces its loopback URL and per-boot
 * token over the Storybook channel this app is already connected to, and re-broadcasts on an
 * interval so a reload or a service restart re-discovers it without a rebuild.
 *
 * The announcement is data only. Nothing executable crosses this boundary, and the app still
 * cannot do anything except ask the service to run a story id from the generated manifest.
 */
import { useEffect, useState } from 'react';
import { addons } from 'storybook/preview-api';

/** Must match `DESKTOP_SERVICE_ANNOUNCE_EVENT` in @fluentui-react-native/desktop-driver. */
const ANNOUNCE_EVENT = 'desktopTestServiceAnnounce';

const SUPPORTED_PROTOCOL_VERSION = 1;

export type DesktopServiceEndpoint = {
  url: string;
  token: string;
  manifestDigest: string;
};

function isAnnouncement(value: unknown): value is DesktopServiceEndpoint & { protocolVersion: number } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    candidate.protocolVersion === SUPPORTED_PROTOCOL_VERSION &&
    typeof candidate.url === 'string' &&
    typeof candidate.token === 'string' &&
    typeof candidate.manifestDigest === 'string'
  );
}

/** Returns the announced service endpoint, or undefined until one arrives. */
export const useDesktopTestService = (): DesktopServiceEndpoint | undefined => {
  const [endpoint, setEndpoint] = useState<DesktopServiceEndpoint | undefined>();

  useEffect(() => {
    let channel: ReturnType<typeof addons.getChannel> | undefined;
    try {
      channel = addons.getChannel();
    } catch {
      // No preview channel in this host; the controls stay unavailable.
      return undefined;
    }

    const onAnnounce = (payload: unknown) => {
      if (!isAnnouncement(payload)) {
        return;
      }
      // Replace on every announcement so a restarted service with a new token takes over.
      setEndpoint((current) =>
        current?.url === payload.url && current.token === payload.token && current.manifestDigest === payload.manifestDigest
          ? current
          : { url: payload.url, token: payload.token, manifestDigest: payload.manifestDigest },
      );
    };

    channel.on(ANNOUNCE_EVENT, onAnnounce);
    return () => {
      channel?.off(ANNOUNCE_EVENT, onAnnounce);
    };
  }, []);

  return endpoint;
};
