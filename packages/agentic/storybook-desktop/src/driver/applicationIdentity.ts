import type { DesktopHost, DesktopTarget, NativeDesktopHost } from '@fluentui-react-native/desktop-driver';

import type { BridgeEpochRecovery } from './BridgeEpochJournal.js';

export function createApplicationIdentityResolver(options: {
  host: Pick<NativeDesktopHost, 'inspectApplication'>;
  target: DesktopTarget;
  /** @deprecated Inspection never acquires a second controlling attachment. */
  createIdentityHost?(): DesktopHost;
}): BridgeEpochRecovery['resolveApplication'] {
  return async () => {
    const signal = AbortSignal.timeout(10_000);
    const identity = await options.host.inspectApplication(options.target, signal);
    // The epoch journal intentionally records only its existing PID/start schema, not the Windows ownership evidence.
    return { processId: identity.processId, processStartedAt: identity.processStartedAt };
  };
}
