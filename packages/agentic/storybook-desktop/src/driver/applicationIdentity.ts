import type { DesktopHost, DesktopTarget, NativeDesktopHost } from '@fluentui-react-native/desktop-driver';

import type { BridgeEpochRecovery } from './BridgeEpochJournal.js';

export function createApplicationIdentityResolver(options: {
  host: Pick<NativeDesktopHost, 'inspectApplication'>;
  target: DesktopTarget;
  createIdentityHost(): DesktopHost;
}): BridgeEpochRecovery['resolveApplication'] {
  return async () => {
    const signal = AbortSignal.timeout(10_000);
    if (options.target.endpoint === 'macos') return options.host.inspectApplication(options.target, signal);

    // Other providers retain their existing temporary attachment without changing the session's window records.
    const identityHost = options.createIdentityHost();
    try {
      const lease = await identityHost.attach({ ...options.target, host: identityHost }, signal);
      if (lease.processId === undefined || lease.processStartedAt === undefined)
        throw new Error('The Storybook application has no verified process incarnation.');
      return { processId: lease.processId, processStartedAt: lease.processStartedAt };
    } finally {
      await identityHost.dispose();
    }
  };
}
