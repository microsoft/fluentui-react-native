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
import { createDesktopSupervisorConnector, DesktopWorkloadTransportError } from '@fluentui-react-native/desktop-test/supervisor-connection';
import type { DesktopSupervisorConnector } from '@fluentui-react-native/desktop-test/supervisor-connection';

export type DesktopDriverConnection = {
  client: DesktopDriverClient;
  /** The verified service incarnation. Never a URL or a credential. */
  incarnation: string;
  /** The non-secret grant id, not its bearer token or display label. */
  principal: string;
};

/** Revalidates private driver discovery and returns its verified authority, without launching anything. */
export type ConnectDesktopDriver = () => Promise<DesktopDriverConnection>;

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
export function connectSupervisorWithDescriptor(options: DescriptorConnectionOptions): DesktopSupervisorConnector {
  let connector: Promise<DesktopSupervisorConnector> | undefined;
  let closing = false;
  return {
    async connect() {
      if (closing) throw new DesktopWorkloadTransportError('unavailable');
      connector ??= openPrivateDiscovery(options)
        .then(({ storage, verify }) => createDesktopSupervisorConnector({ storage, descriptor: options.descriptor, verifyService: verify }))
        .catch((error: unknown) => {
          connector = undefined;
          throw error;
        });
      const current = await connector;
      if (closing) throw new DesktopWorkloadTransportError('unavailable');
      return current.connect();
    },
    async close() {
      closing = true;
      const current = await connector?.catch(() => undefined);
      await current?.close();
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
