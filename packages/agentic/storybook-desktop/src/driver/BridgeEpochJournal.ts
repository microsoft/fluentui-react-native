import type { PrivateStorage } from '@fluentui-react-native/desktop-driver/authority';
import type { ProbeApplication } from '@fluentui-react-native/desktop-driver/server';
import type { DesktopEndpoint } from '@fluentui-react-native/desktop-driver';

type Application = { processId: number; processStartedAt: string };
type Record = {
  application: Application;
  endpoint: DesktopEndpoint;
  epoch: string;
  kind: 'bridge-epoch';
  renderer: 'fabric' | 'paper';
  targetId: string;
  version: 1;
};
type Namespace = Pick<Record, 'endpoint' | 'renderer' | 'targetId'>;

export type BridgeEpochRecovery = {
  storage: PrivateStorage;
  probeApplication?: ProbeApplication;
  /** Resolves the configured target through native identity verification, never from a channel payload. */
  resolveApplication(): Promise<Application>;
};

/** A sibling of settlement records in the factory's stable endpoint/target private namespace. */
export class BridgeEpochJournal {
  private queue: Promise<unknown> = Promise.resolve();
  private readonly recovery: BridgeEpochRecovery;
  private readonly namespace: Namespace;

  constructor(recovery: BridgeEpochRecovery, namespace: Namespace) {
    this.recovery = recovery;
    this.namespace = namespace;
  }

  record(epoch: string): Promise<void> {
    return this.serialize(async () => {
      const application = await this.recovery.resolveApplication();
      const record: Record = { ...this.namespace, application, epoch, kind: 'bridge-epoch', version: 1 };
      const contents = JSON.stringify(parseRecord(record));
      const previous = await this.recovery.storage.read('bridge-epoch.json');
      if (previous === contents) return;
      if (previous !== undefined && !(await this.recovery.storage.remove('bridge-epoch.json', previous)))
        throw new Error('The authenticated bridge epoch changed while replacing it.');
      await this.recovery.storage.publish('bridge-epoch.json', contents);
    });
  }

  requiresRelaunch(): Promise<boolean> {
    return this.serialize(async () => {
      const contents = await this.recovery.storage.read('bridge-epoch.json');
      if (contents === undefined) return false;
      const record = parseRecord(JSON.parse(contents));
      if (
        record.endpoint !== this.namespace.endpoint ||
        record.targetId !== this.namespace.targetId ||
        record.renderer !== this.namespace.renderer
      )
        return false;
      const state = await this.recovery.probeApplication?.(record.application);
      if (state === 'exited') {
        if (!(await this.recovery.storage.remove('bridge-epoch.json', contents)))
          throw new Error('The exited bridge epoch changed while removing it.');
        return false;
      }
      if (state !== 'running') return false;
      const current = await this.recovery.resolveApplication();
      if (current.processId !== record.application.processId || current.processStartedAt !== record.application.processStartedAt) {
        if (!(await this.recovery.storage.remove('bridge-epoch.json', contents)))
          throw new Error('The replaced bridge epoch changed while removing it.');
        return false;
      }

      return true;
    });
  }

  private serialize<T>(work: () => Promise<T>): Promise<T> {
    const result = this.queue.then(work, work);
    this.queue = result.catch(() => undefined);
    return result;
  }
}

function parseRecord(value: unknown): Record {
  if (!value || typeof value !== 'object') throw new Error('Invalid authenticated bridge epoch record.');
  const record = value as Partial<Record>;
  const application = record.application;
  if (
    record.version !== 1 ||
    record.kind !== 'bridge-epoch' ||
    !['macos', 'windows', 'win32'].includes(record.endpoint ?? '') ||
    !['fabric', 'paper'].includes(record.renderer ?? '') ||
    typeof record.targetId !== 'string' ||
    record.targetId.length < 1 ||
    record.targetId.length > 256 ||
    typeof record.epoch !== 'string' ||
    record.epoch.length < 1 ||
    record.epoch.length > 128 ||
    !application ||
    !Number.isSafeInteger(application.processId) ||
    application.processId < 1 ||
    application.processId > 0x7fffffff ||
    typeof application.processStartedAt !== 'string' ||
    application.processStartedAt.length < 1 ||
    application.processStartedAt.length > 64 ||
    Object.keys(record).length !== 7 ||
    Object.keys(application).length !== 2
  )
    throw new Error('Invalid authenticated bridge epoch record.');
  return record as Record;
}
