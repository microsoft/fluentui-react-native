import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';
import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import {
  createMacOSPrivateStorage,
  createWindowsPrivateStorage,
  describeMacOSService,
  describeWindowsService,
  publishConnectionDescriptor,
} from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopAuthority } from '@fluentui-react-native/desktop-driver/authority';
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

/** The target fields a publication reads. Without a resolved helper, the native publisher resolves `nativeDriver`. */
export type DesktopAgentTarget = Pick<ResolvedDesktopTarget, 'endpoint' | 'id'> & Partial<Pick<ResolvedDesktopTarget, 'nativeDriver'>>;

/** What a service publishes for one agent. `grant` is a bearer secret and must never be logged. */
export type DesktopAgentConnection = {
  descriptor: string;
  grant: string;
  incarnation: string;
  root?: string;
  target: DesktopAgentTarget;
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

/** One agent's published connection. */
export type DesktopAgentPublication = {
  /** The record name the adapter reads. */
  readonly descriptor: string;
  /** Removes the descriptor, then revokes the grant, so no adapter discovers a connection that can no longer authenticate. */
  withdraw(): Promise<void>;
};

export type PublishDesktopAgentOptions = {
  /** The authority protecting the service. The grant it issues names only `target`. */
  authority: DesktopAuthority;
  connection: DesktopAgentConnectionOptions;
  target: DesktopAgentTarget;
  url: string;
  /** The verified helper the service runs, so the native publisher describes the service without resolving it again. */
  artifact?: NativeDriverArtifact;
  /** Receives the grant so reporters redact it. */
  addSecret?: (secret: string) => void;
  signal?: AbortSignal;
  /** Bounds publication by its owner's lifetime, such as a service scope's guard. */
  guard?: <T>(work: Promise<T>) => Promise<T>;
};

/**
 * Issues one grant for the target and publishes its connection descriptor. A failed publication revokes the grant, and
 * a publication that completes after its guard settles is withdrawn.
 */
export async function publishDesktopAgent(options: PublishDesktopAgentOptions): Promise<DesktopAgentPublication> {
  const { artifact, authority, connection, target } = options;
  const descriptor = connection.descriptor ?? defaultAgentDescriptor;
  const grant = authority.issue({ label: 'agent', targets: [target.id] });
  options.addSecret?.(grant.token);
  const publish = connection.publish ?? createNativeAgentPublisher(artifact ? async () => artifact : undefined);
  let publication: Promise<() => Promise<unknown>> | undefined;
  let remove: () => Promise<unknown>;
  try {
    publication = publish(
      {
        descriptor,
        grant: grant.token,
        incarnation: authority.incarnation,
        ...(connection.root === undefined ? {} : { root: connection.root }),
        target,
        url: options.url,
      },
      options.signal ?? new AbortController().signal,
    );
    remove = await (options.guard ? options.guard(publication) : publication);
  } catch (error) {
    void publication?.then((late) => late()).catch(() => undefined);
    authority.revoke(grant.id);
    throw error;
  }
  let withdrawal: Promise<void> | undefined;
  return Object.freeze({
    descriptor,
    withdraw: () =>
      (withdrawal ??= (async () => {
        try {
          await remove();
        } finally {
          authority.revoke(grant.id);
        }
      })()),
  });
}
