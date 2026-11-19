import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';
import {
  createMacOSPrivateStorage,
  createMacOSServiceVerifier,
  createWindowsPrivateStorage,
  createWindowsServiceVerifier,
  readConnectionDescriptor,
} from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import type { DesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import {
  createDesktopSupervisorConnector,
  defaultSupervisorDescriptor,
  DesktopWorkloadTransportError,
} from '@fluentui-react-native/desktop-test/supervisor-connection';
import type {
  DesktopSupervisorConnectionOptions,
  DesktopSupervisorConnector,
} from '@fluentui-react-native/desktop-test/supervisor-connection';

export type DesktopDriverConnection = {
  client: DesktopDriverClient;
  /** The verified service incarnation. Never a URL or a credential. */
  incarnation: string;
  /** The non-secret grant id, not its bearer token or display label. */
  principal: string;
};

/** Revalidates private driver discovery and returns its verified authority, without launching anything. */
export type ConnectDesktopDriver = () => Promise<DesktopDriverConnection>;

export type RestartAwareSupervisorConnector = DesktopSupervisorConnector & {
  /** Reports a changed private descriptor; never connects to or accepts authority from it. */
  restartDetected?(): Promise<boolean>;
};

export type DescriptorConnectionOptions = {
  /** The record name the supervisor published the connection descriptor under, such as `agent-connection.json`. */
  descriptor: string;
  /** The private storage root, when the supervisor published somewhere other than the platform default. */
  root?: string;
};

/**
 * Connects through the private descriptor a trusted supervisor published. The service's identity is verified by the
 * installed native helper before the grant is sent. Nothing is launched or built: a missing helper, descriptor, or
 * service is an error.
 */
export function connectWithDescriptor(options: DescriptorConnectionOptions): ConnectDesktopDriver {
  return async () => {
    const { storage, verify } = await openPrivateDiscovery(options);
    const descriptor = await readConnectionDescriptor(storage, options.descriptor, verify);
    return {
      client: createDesktopDriverClient({ grant: descriptor.grant, url: descriptor.url }),
      incarnation: descriptor.service.incarnation,
      principal: descriptor.grant.split('.')[1],
    };
  };
}

/** Lazily opens one supervisor connector, retaining its connection ID across ambiguous discovery retries. */
export function connectSupervisorWithDescriptor(options: DescriptorConnectionOptions): RestartAwareSupervisorConnector {
  let connector: Promise<RestartAwareSupervisorConnector> | undefined;
  let closing = false;
  return {
    async connect() {
      if (closing) throw new DesktopWorkloadTransportError('unavailable');
      connector ??= openPrivateDiscovery(options)
        .then(({ storage, verify }) => trackSupervisorRestart({ storage, descriptor: options.descriptor, verifyService: verify }))
        .catch((error: unknown) => {
          connector = undefined;
          throw error;
        });
      const current = await connector;
      if (closing) throw new DesktopWorkloadTransportError('unavailable');
      return current.connect();
    },
    async restartDetected() {
      const current = await connector?.catch(() => undefined);
      return (await current?.restartDetected?.()) ?? false;
    },
    async close() {
      closing = true;
      const current = await connector?.catch(() => undefined);
      await current?.close();
    },
  };
}

export function trackSupervisorRestart(options: DesktopSupervisorConnectionOptions): RestartAwareSupervisorConnector {
  const connector = createDesktopSupervisorConnector(options);
  let boundIncarnation: string | undefined;
  return {
    async connect() {
      const connection = await connector.connect();
      boundIncarnation ??= connection.incarnation;
      return connection;
    },
    close: () => connector.close(),
    async restartDetected() {
      if (boundIncarnation === undefined) return false;
      try {
        const contents = await options.storage.read(options.descriptor ?? defaultSupervisorDescriptor);
        if (contents === undefined || Buffer.byteLength(contents, 'utf8') > 16 * 1024) return false;
        const record = JSON.parse(contents) as {
          version?: unknown;
          incarnation?: unknown;
          management?: { service?: { incarnation?: unknown } };
        };
        // This is a diagnostic hint only. The shared connector retains and verifies the original binding.
        return (
          record?.version === 1 &&
          typeof record.incarnation === 'string' &&
          /^inc_[0-9a-f]{24}$/.test(record.incarnation) &&
          record.management?.service?.incarnation === record.incarnation &&
          record.incarnation !== boundIncarnation
        );
      } catch {
        return false;
      }
    },
  };
}

async function openPrivateDiscovery(options: DescriptorConnectionOptions) {
  const platform = process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : undefined;
  if (platform === undefined) throw new Error('Desktop Driver services run on macOS and Windows.');
  const artifact = await resolveNativeDesktopDriver({ buildPolicy: 'never', platform });
  const storage =
    platform === 'macos'
      ? await createMacOSPrivateStorage(...(options.root === undefined ? [] : [options.root]))
      : await createWindowsPrivateStorage({ artifact, ...(options.root === undefined ? {} : { root: options.root }) });
  const verify = platform === 'macos' ? createMacOSServiceVerifier({ artifact }) : createWindowsServiceVerifier({ artifact });
  return { storage, verify };
}
