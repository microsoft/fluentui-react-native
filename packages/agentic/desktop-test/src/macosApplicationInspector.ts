import path from 'node:path';

import { NativeDesktopHost, NativeDriverError } from '@fluentui-react-native/desktop-driver';
import type { DesktopTarget, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { describeMacOSService } from '@fluentui-react-native/desktop-driver/authority';
import { verifyNativeDriverArtifact } from '@fluentui-react-native/desktop-driver/native';
import type { DesktopMacOSApplicationInspector, DesktopMacOSApplicationSelector } from './applicationOwnership.js';

export type DesktopMacOSApplicationInspectorOptions = {
  artifact: NativeDriverArtifact;
  targetId: string;
  selector: DesktopMacOSApplicationSelector;
  onFailure?(error: Error): void;
};

/** Builds a lease-free, read-only inspector from a verified macOS native helper. */
export async function createDesktopMacOSApplicationInspector(
  options: DesktopMacOSApplicationInspectorOptions,
): Promise<DesktopMacOSApplicationInspector> {
  const { selector, targetId } = options;
  if (
    !selector ||
    typeof selector !== 'object' ||
    Array.isArray(selector) ||
    Object.keys(selector).some((key) => !['bundleIdentifier', 'windowTitle', 'executablePath'].includes(key)) ||
    !text(selector.bundleIdentifier, 4096) ||
    !text(selector.windowTitle, 4096) ||
    (selector.executablePath !== undefined && (!text(selector.executablePath, 4096) || !path.posix.isAbsolute(selector.executablePath))) ||
    !text(targetId, 200) ||
    options.artifact?.provider !== 'macos'
  ) {
    throw new TypeError('A macOS inspector requires a native artifact and a lease-free application selector.');
  }
  const artifact = await verifyNativeDriverArtifact(options.artifact);
  const host = new NativeDesktopHost({
    application: Object.freeze({ ...selector }),
    artifact,
    endpoint: 'macos',
    onFailure: () => options.onFailure?.(new Error('The macOS application identity helper failed.')),
  });
  const target: DesktopTarget = { endpoint: 'macos', host, id: targetId, platformName: 'macos', launchModes: ['attach'] };
  return {
    async inspect(signal) {
      let first;
      try {
        first = await host.inspectApplication(target, signal);
      } catch (error) {
        if (signal.aborted) throw signal.reason;
        if (error instanceof NativeDriverError && error.code === 'attach-failed' && error.data?.reason === 'no-matching-application') {
          return undefined;
        }
        throw error;
      }
      const described = await describeMacOSService({ artifact, pid: first.processId });
      signal.throwIfAborted();
      if (described.pid !== first.processId || described.startedAt !== first.processStartedAt) {
        throw new Error('The macOS application changed during identity inspection.');
      }
      const confirmed = await host.inspectApplication(target, signal);
      if (confirmed.processId !== first.processId || confirmed.processStartedAt !== first.processStartedAt) {
        throw new Error('The macOS application changed during identity inspection.');
      }
      return Object.freeze({
        processId: first.processId,
        processStartedAt: first.processStartedAt,
        executablePath: described.executablePath,
      });
    },
    close: () => host.dispose(),
  };
}

function text(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maximum && !/\p{Cc}/u.test(value);
}
