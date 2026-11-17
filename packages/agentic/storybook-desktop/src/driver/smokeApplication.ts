import { createDesktopApplicationHost } from '@fluentui-react-native/desktop-test/application-ownership';
import type { DesktopResourceRecord } from '@fluentui-react-native/desktop-test/resources';
import type { DesktopHost, DesktopTarget } from '@fluentui-react-native/desktop-driver';
import { updateWindowsApplicationLease } from './applicationLease.js';

/** One native owner lends its retained application to traversal and authored-test sessions. */
export async function prepareSmokeApplicationHost(
  host: DesktopHost,
  options: {
    target: Omit<DesktopTarget, 'host'>;
    manifestPath: string;
    handoff: string;
    windowTitle: string;
    signal: AbortSignal;
    onResource: (resource: DesktopResourceRecord) => void;
    updateLease?: typeof updateWindowsApplicationLease;
  },
): Promise<DesktopHost> {
  const updateLease = options.updateLease ?? updateWindowsApplicationLease;
  let application: DesktopResourceRecord['application'];
  let digest: string | undefined;
  let owned: DesktopHost | undefined;
  let closing: Promise<void> | undefined;
  const close = () =>
    (closing ??= (async () => {
      // Do not withdraw the lease when native settlement is uncertain.
      await owned?.dispose();
      if (digest) await updateLease(options.manifestPath, options.handoff, { operation: 'remove', digest });
    })());
  try {
    owned = await createDesktopApplicationHost(host, {
      lifetime: 'supervisor',
      resourcePrefix: options.target.id,
      target: options.target,
      signal: options.signal,
      onResource: (record) => {
        options.onResource(record);
        if (record.readiness === 'ready') application = record.application;
      },
    });
    if (!application?.processId || !application.processStartedAt) throw new Error('Native smoke launch has no exact identity.');
    if (options.target.endpoint !== 'macos') {
      digest = await updateLease(options.manifestPath, options.handoff, {
        operation: 'publish',
        application: {
          processId: application.processId,
          processStartedAt: application.processStartedAt,
          windowTitle: options.windowTitle,
          ...(options.target.endpoint === 'windows' ? { aumid: application.aumid } : { executablePath: application.executablePath }),
        },
      });
      if (!digest) throw new Error('Native smoke application lease publication returned no receipt.');
    }
    options.signal.throwIfAborted();
    return new Proxy(owned, {
      get(target, key) {
        if (key === 'dispose') return close;
        const value = Reflect.get(target, key, target) as unknown;
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  } catch (error) {
    try {
      await close();
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Smoke application setup and cleanup failed.');
    }
    throw error;
  }
}
