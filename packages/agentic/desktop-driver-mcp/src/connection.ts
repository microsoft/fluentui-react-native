import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';
import {
  createMacOSPrivateStorage,
  createMacOSServiceVerifier,
  createWindowsPrivateStorage,
  createWindowsServiceVerifier,
  readConnectionDescriptor,
} from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import type { DesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

/** Returns a client for a running Desktop Driver service. Called again after the service goes away. */
export type ConnectDesktopDriver = () => Promise<DesktopDriverClient>;

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
    const platform = process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : undefined;
    if (platform === undefined) {
      throw new Error('Desktop Driver services run on macOS and Windows.');
    }
    const artifact = await resolveNativeDesktopDriver({ buildPolicy: 'never', platform });
    const storage =
      platform === 'macos'
        ? await createMacOSPrivateStorage(...(options.root === undefined ? [] : [options.root]))
        : await createWindowsPrivateStorage({ artifact, ...(options.root === undefined ? {} : { root: options.root }) });
    const verify = platform === 'macos' ? createMacOSServiceVerifier({ artifact }) : createWindowsServiceVerifier({ artifact });
    const descriptor = await readConnectionDescriptor(storage, options.descriptor, verify);
    return createDesktopDriverClient({ grant: descriptor.grant, url: descriptor.url });
  };
}
