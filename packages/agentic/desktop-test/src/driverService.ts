import { createHash } from 'node:crypto';

import { NativeDesktopHost } from '@fluentui-react-native/desktop-driver';
import type { DesktopHost, DesktopTarget, NativeDesktopHostOptions, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';
import {
  createMacOSApplicationProbe,
  createMacOSPrivateStorage,
  createWindowsApplicationProbe,
  createWindowsPrivateStorage,
  DesktopAuthority,
} from '@fluentui-react-native/desktop-driver/authority';
import type { PrivateStorage } from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverServer } from '@fluentui-react-native/desktop-driver/server';
import type { DesktopDriverServer, ProbeApplication } from '@fluentui-react-native/desktop-driver/server';
import { publishDesktopAgent } from './agentConnection.js';
import type { DesktopAgentConnectionOptions, DesktopAgentPublication, DesktopAgentTarget } from './agentConnection.js';

export type DesktopServiceOptions = {
  target: Omit<DesktopTarget, 'host'>;
  port?: number;
  host?: string;
  /** Protects every route and publishes a descriptor only after the host and listener are ready. */
  agent?: DesktopAgentConnectionOptions;
  /** Trusted storage/probe overrides. Omitted, use platform owner-only storage and the verified native helper. */
  recovery?: {
    root?: string;
    storage?: PrivateStorage;
    probeApplication?: ProbeApplication;
  };
  addSecret?: (secret: string) => void;
  signal?: AbortSignal;
  guard?: <T>(work: Promise<T>) => Promise<T>;
  /** Optional application-specific target context; native authority remains in the driver. */
  createTarget?: (
    host: DesktopHost,
    recovery: { storage: PrivateStorage; probeApplication?: ProbeApplication },
  ) => Promise<Pick<DesktopTarget, 'storyOrchestrator' | 'storyRootTestId'> | undefined>;
};

export type DesktopService = DesktopDriverServer & { readonly agentDescriptor?: string; readonly runnerDescriptor?: string };

export type NativeDesktopServiceOptions = Omit<NativeDesktopHostOptions, 'artifact'> &
  DesktopServiceOptions & {
    artifact?: NativeDriverArtifact;
    nativeDriver?: DesktopAgentTarget['nativeDriver'];
  };

/** Normal service startup never builds a helper. Storybook may supply its already resolved artifact. */
export async function startNativeDesktopService(options: NativeDesktopServiceOptions): Promise<DesktopService> {
  const artifact =
    options.artifact ??
    (await resolveNativeDesktopDriver({
      ...options.nativeDriver,
      platform: options.endpoint,
      buildPolicy: 'never',
      signal: options.signal,
    }));
  return startDesktopService(new NativeDesktopHost({ ...options, artifact }), options, artifact);
}

/** One composition root for the generic supervisor and the supervised Storybook channel child. */
export async function startDesktopService(
  desktopHost: DesktopHost,
  options: DesktopServiceOptions,
  artifact?: NativeDriverArtifact,
): Promise<DesktopService> {
  const authority = options.agent ? new DesktopAuthority() : undefined;
  let server: DesktopDriverServer | undefined;
  let publication: DesktopAgentPublication | undefined;
  let runnerPublication: DesktopAgentPublication | undefined;
  try {
    const recovery = await resolveRecovery(options, artifact);
    // Only the declared story context is taken: an integration cannot replace the target's identity or launch modes.
    const added = await options.createTarget?.(desktopHost, recovery);
    const target = {
      ...options.target,
      ...(added?.storyOrchestrator === undefined ? {} : { storyOrchestrator: added.storyOrchestrator }),
      ...(added?.storyRootTestId === undefined ? {} : { storyRootTestId: added.storyRootTestId }),
      host: desktopHost,
    };
    options.signal?.throwIfAborted();
    server = await createDesktopDriverServer({
      ...(authority ? { authority } : {}),
      host: options.host,
      port: options.port,
      recovery,
      targets: [target],
    });
    await desktopHost.probe(options.signal);
    options.signal?.throwIfAborted();
    if (options.agent) {
      publication = await publishDesktopAgent({
        authority: authority!,
        connection: options.agent,
        target: { endpoint: options.target.endpoint, id: options.target.id },
        url: server.url,
        ...(artifact ? { artifact } : {}),
        addSecret: options.addSecret,
        signal: options.signal,
        guard: options.guard,
      });
      if (
        options.agent.runner !== false &&
        !target.storyOrchestrator &&
        target.launchModes?.length === 1 &&
        target.launchModes[0] === 'attach'
      ) {
        runnerPublication = await publishDesktopAgent({
          authority: authority!,
          connection: options.agent,
          target: { endpoint: options.target.endpoint, id: options.target.id },
          url: server.url,
          role: 'runner',
          ...(artifact ? { artifact } : {}),
          addSecret: options.addSecret,
          signal: options.signal,
          guard: options.guard,
        });
      } else if (options.agent.runner && !runnerPublication) {
        throw new Error('Runner descriptors require a generic attach-only target.');
      }
    }
  } catch (error) {
    const failures: unknown[] = [];
    for (const step of [
      async () => runnerPublication?.withdraw(),
      async () => publication?.withdraw(),
      () => (server ? server.close() : desktopHost.dispose()),
    ]) {
      try {
        await step();
      } catch (cleanup) {
        failures.push(cleanup);
      }
    }
    if (failures.length) throw new AggregateError([error, ...failures], 'Desktop service startup and disposal failed.');
    throw error;
  }
  const listening = server;
  let closing: Promise<void> | undefined;
  return {
    ...listening,
    get agentDescriptor() {
      return closing ? undefined : publication?.descriptor;
    },
    get runnerDescriptor() {
      return closing ? undefined : runnerPublication?.descriptor;
    },
    close: () =>
      (closing ??= (async () => {
        const failures: unknown[] = [];
        for (const step of [async () => runnerPublication?.withdraw(), async () => publication?.withdraw(), () => listening.close()]) {
          try {
            await step();
          } catch (error) {
            failures.push(error);
          }
        }
        if (failures.length === 1) throw failures[0];
        if (failures.length) throw new AggregateError(failures, 'Agent withdrawal and settled service close failed.');
      })()),
  };
}

async function resolveRecovery(
  options: DesktopServiceOptions,
  artifact?: NativeDriverArtifact,
): Promise<{ storage: PrivateStorage; probeApplication?: ProbeApplication }> {
  if (options.recovery?.storage && options.recovery.root !== undefined)
    throw new TypeError('Desktop recovery accepts a storage adapter or a root, not both.');
  const endpoint = options.target.endpoint;
  let storage = options.recovery?.storage;
  let probeApplication = options.recovery?.probeApplication;
  if (!storage) {
    if (endpoint === 'macos') storage = await createMacOSPrivateStorage(options.recovery?.root);
    else {
      if (!artifact) throw new Error('Windows recovery storage requires a verified native helper or a trusted storage adapter.');
      storage = await createWindowsPrivateStorage({ artifact, root: options.recovery?.root });
    }
  }
  if (!probeApplication && artifact)
    probeApplication = endpoint === 'macos' ? createMacOSApplicationProbe({ artifact }) : createWindowsApplicationProbe({ artifact });

  // Neither service incarnations, grants, listener ports, nor report runs may change the recovery identity.
  const prefix = `settlement-${createHash('sha256')
    .update(JSON.stringify([endpoint, options.target.id]))
    .digest('hex')
    .slice(0, 24)}-`;
  const privateStorage = storage;
  return {
    storage: {
      read: (name) => privateStorage.read(prefix + name),
      publish: (name, contents) => privateStorage.publish(prefix + name, contents),
      remove: (name, contents) => privateStorage.remove(prefix + name, contents),
    },
    ...(probeApplication ? { probeApplication } : {}),
  };
}
