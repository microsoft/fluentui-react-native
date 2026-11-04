import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';
import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import {
  createMacOSPrivateStorage,
  createWindowsPrivateStorage,
  describeMacOSService,
  describeWindowsService,
  publishConnectionDescriptor,
} from '@fluentui-react-native/desktop-driver/authority';
import type { ResolvedDesktopTarget } from './config.js';

/** The record name the Desktop Driver MCP adapter reads by default. */
export const defaultAgentDescriptor = 'agent-connection.json';

export type DesktopAgentConnectionOptions = {
  /** The record name to publish, which the adapter reads with `--descriptor`. Defaults to `agent-connection.json`. */
  descriptor?: string;
  /** The private storage root, which the adapter reads with `--root`. Defaults to the platform location. */
  root?: string;
  /** Replaces native publication; tests supply it. Returns the descriptor's removal. */
  publish?: PublishDesktopAgentConnection;
};

/** What a supervisor publishes for one agent. `grant` is a bearer secret and must never be logged. */
export type DesktopAgentConnection = {
  descriptor: string;
  grant: string;
  incarnation: string;
  root?: string;
  target: ResolvedDesktopTarget;
  url: string;
};

export type PublishDesktopAgentConnection = (connection: DesktopAgentConnection, signal: AbortSignal) => Promise<() => Promise<unknown>>;

/**
 * Publishes the connection through the platform's owner-only storage. The service identity is described by the
 * verified native helper, which is resolved without building, so the adapter's verifier can check the live listener
 * before it sends the grant.
 */
export function createNativeAgentPublisher(resolveArtifact?: () => Promise<NativeDriverArtifact>): PublishDesktopAgentConnection {
  return async (connection, signal) => {
    const { endpoint } = connection.target;
    const artifact = await (resolveArtifact?.() ??
      resolveNativeDesktopDriver({ ...connection.target.nativeDriver, buildPolicy: 'never', platform: endpoint, signal }));
    const root = connection.root === undefined ? [] : [connection.root];
    const storage =
      endpoint === 'macos'
        ? await createMacOSPrivateStorage(...root)
        : await createWindowsPrivateStorage({ artifact, ...(connection.root === undefined ? {} : { root: connection.root }) });
    const identity =
      endpoint === 'macos'
        ? await describeMacOSService({ artifact, pid: process.pid })
        : await describeWindowsService({ artifact, pid: process.pid });
    return publishConnectionDescriptor(storage, connection.descriptor, {
      grant: connection.grant,
      service: { ...identity, incarnation: connection.incarnation },
      url: connection.url,
      version: 1,
    });
  };
}
