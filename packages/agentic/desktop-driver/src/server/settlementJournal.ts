// Durable settlement state for a Desktop Driver service. Before a mutation is dispatched its record is written to
// owner-only storage that the trusted supervisor supplies, and it is removed only once the mutation settles; a target
// quarantine is written the same way. A service that stops while a mutation is in flight, or while a target is
// quarantined, therefore finds the uncertainty again when it restarts instead of silently forgetting it.
import { createHash, randomUUID } from 'node:crypto';

import { z } from 'zod';

import type { PrivateStorage } from '../authority/privateStorage.js';
import type { ApplicationLease } from '../host/types.js';
import type { MutationEffect } from '../protocol/settlement.js';

/** The exact process an application lease named, so its exit can be proven later. */
export type ApplicationIncarnation = {
  ownership: ApplicationLease['ownership'];
  processId: number;
  processStartedAt: string;
};

/**
 * Whether the exact process incarnation is still running. `exited` must mean the process with that id and start time no
 * longer runs; a probe that cannot tell answers `unknown`.
 */
export type ApplicationState = 'exited' | 'running' | 'unknown';

/** Supplied by the trusted operator; never by a model or a WebDriver client. */
export type ProbeApplication = (
  application: Readonly<Pick<ApplicationIncarnation, 'processId' | 'processStartedAt'>>,
) => Promise<ApplicationState>;

/**
 * Why a target refuses mutations. `command`: the recorded command did not settle. `provider`: the provider quarantined
 * itself and refused the recorded command. `interrupted`: the service stopped while the recorded command was in flight,
 * or left a record it cannot read. `journal`: the journal could not record that the command settled.
 */
export type QuarantineRecord = {
  /** The application incarnation the target held, when its lease named one. */
  application?: ApplicationIncarnation;
  command: string;
  effect: MutationEffect;
  /** Names this quarantine, so an operator recovers the one they inspected and never a later one. */
  id: string;
  message: string;
  origin: 'command' | 'interrupted' | 'journal' | 'provider';
  /** Absent when a journal record could not be read. */
  sessionId?: string;
  since: string;
  targetId: string;
};

/** A mutation that was about to be dispatched. */
export type PendingMutation = {
  application?: ApplicationIncarnation;
  command: string;
  sessionId: string;
  targetId: string;
};

const boundedText = (maximum: number) => z.string().min(1).max(maximum);
const applicationSchema = z.strictObject({
  ownership: z.enum(['attached', 'launched']),
  processId: z.number().int().positive().max(0x7fffffff),
  processStartedAt: boundedText(64),
});
const recordId = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
const mutationSchema = z.strictObject({
  application: applicationSchema.optional(),
  command: boundedText(512),
  id: recordId,
  kind: z.literal('mutation'),
  sessionId: boundedText(128),
  since: boundedText(64),
  targetId: z.string().min(1),
  version: z.literal(1),
});
const quarantineSchema = z.strictObject({
  application: applicationSchema.optional(),
  command: boundedText(512),
  effect: z.enum(['applied', 'none', 'partial', 'unknown']),
  id: recordId,
  kind: z.literal('quarantine'),
  message: z.string().max(512),
  origin: z.enum(['command', 'interrupted', 'journal', 'provider']),
  sessionId: boundedText(128).optional(),
  since: boundedText(64),
  targetId: z.string().min(1),
  version: z.literal(1),
});

type HeldRecords = { mutation?: string; quarantine?: string };

export class SettlementJournal {
  // The exact contents this service holds in storage for each target, since storage removes only an exact match.
  private readonly held = new Map<string, HeldRecords>();
  // Each target's operations run one at a time, so none reads the held records while another is writing them.
  private readonly queues = new Map<string, Promise<unknown>>();

  private readonly storage: PrivateStorage;

  constructor(storage: PrivateStorage) {
    this.storage = storage;
  }

  /**
   * Reads what an earlier run left for a target. A mutation record means that run stopped before the mutation settled,
   * so it becomes an `interrupted` quarantine; a record that cannot be read does too, never an absent one.
   */
  load(targetId: string): Promise<QuarantineRecord | undefined> {
    return this.serialize(targetId, () => this.loadNow(targetId));
  }

  private async loadNow(targetId: string): Promise<QuarantineRecord | undefined> {
    const names = recordNames(targetId);
    const [mutation, quarantine] = await Promise.all([this.storage.read(names.mutation), this.storage.read(names.quarantine)]);
    if (mutation === undefined && quarantine === undefined) {
      return undefined;
    }
    this.held.set(targetId, { ...(mutation !== undefined ? { mutation } : {}), ...(quarantine !== undefined ? { quarantine } : {}) });
    const parsedQuarantine = quarantine === undefined ? undefined : parseRecord(quarantineSchema, quarantine, targetId);
    const parsedMutation = mutation === undefined ? undefined : parseRecord(mutationSchema, mutation, targetId);
    // A readable sibling cannot establish which application's effects an unreadable record represents.
    const corrupt = (quarantine !== undefined && !parsedQuarantine) || (mutation !== undefined && !parsedMutation);
    if (!corrupt) {
      if (parsedQuarantine) {
        const { kind: _kind, version: _version, ...record } = parsedQuarantine;
        return record;
      }
      if (parsedMutation) {
        return {
          ...(parsedMutation.application ? { application: parsedMutation.application } : {}),
          command: parsedMutation.command,
          effect: 'unknown',
          id: parsedMutation.id,
          message: 'The service stopped before this mutation settled.',
          origin: 'interrupted',
          sessionId: parsedMutation.sessionId,
          since: parsedMutation.since,
          targetId,
        };
      }
    }
    return {
      command: 'unknown',
      effect: 'unknown',
      id: randomUUID(),
      message: 'A settlement journal record could not be read.',
      origin: 'interrupted',
      since: new Date().toISOString(),
      targetId,
    };
  }

  /** Records a mutation before it is dispatched. Rejects when it cannot be recorded, and then nothing may be dispatched. */
  beginMutation(pending: PendingMutation): Promise<void> {
    return this.serialize(pending.targetId, () => this.beginMutationNow(pending));
  }

  private async beginMutationNow(pending: PendingMutation): Promise<void> {
    const held = this.held.get(pending.targetId) ?? {};
    if (held.mutation !== undefined) {
      throw new Error('An earlier mutation of this target is still recorded as in flight.');
    }
    const contents = JSON.stringify({
      ...(pending.application ? { application: pending.application } : {}),
      command: pending.command,
      id: randomUUID(),
      kind: 'mutation',
      sessionId: pending.sessionId,
      since: new Date().toISOString(),
      targetId: pending.targetId,
      version: 1,
    } satisfies z.infer<typeof mutationSchema>);
    await this.storage.publish(recordNames(pending.targetId).mutation, contents);
    this.held.set(pending.targetId, { ...held, mutation: contents });
  }

  /** Removes the record of a mutation that settled. Rejects when the record could not be removed. */
  endMutation(targetId: string): Promise<void> {
    return this.serialize(targetId, () => this.remove(targetId, 'mutation'));
  }

  /** Records a target quarantine. A target can hold one quarantine record at a time. */
  recordQuarantine(record: QuarantineRecord): Promise<void> {
    return this.serialize(record.targetId, () => this.recordQuarantineNow(record));
  }

  private async recordQuarantineNow(record: QuarantineRecord): Promise<void> {
    const held = this.held.get(record.targetId) ?? {};
    if (held.quarantine !== undefined) {
      return;
    }
    const contents = JSON.stringify({ ...record, kind: 'quarantine', version: 1 } satisfies z.infer<typeof quarantineSchema>);
    await this.storage.publish(recordNames(record.targetId).quarantine, contents);
    this.held.set(record.targetId, { ...held, quarantine: contents });
  }

  /** Removes every record of a target. Rejects when any of them could not be removed. */
  clear(targetId: string): Promise<void> {
    return this.serialize(targetId, () => this.clearNow(targetId));
  }

  private async clearNow(targetId: string): Promise<void> {
    const failures: unknown[] = [];
    for (const kind of ['quarantine', 'mutation'] as const) {
      await this.remove(targetId, kind).catch((error: unknown) => failures.push(error));
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, 'The settlement journal could not remove the records of this target.');
    }
  }

  hasMutation(targetId: string): boolean {
    return this.held.get(targetId)?.mutation !== undefined;
  }

  private serialize<T>(targetId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(targetId) ?? Promise.resolve();
    const result = previous.then(operation, operation);
    const tail = result.catch(() => undefined);
    this.queues.set(targetId, tail);
    void tail.then(() => {
      if (this.queues.get(targetId) === tail) {
        this.queues.delete(targetId);
      }
    });
    return result;
  }

  private async remove(targetId: string, kind: keyof HeldRecords): Promise<void> {
    const held = this.held.get(targetId);
    const contents = held?.[kind];
    if (!held || contents === undefined) {
      return;
    }
    if (!(await this.storage.remove(recordNames(targetId)[kind], contents))) {
      throw new Error('The settlement journal record was missing or changed.');
    }
    const rest: HeldRecords = { ...held };
    delete rest[kind];
    if (rest.mutation === undefined && rest.quarantine === undefined) {
      this.held.delete(targetId);
    } else {
      this.held.set(targetId, rest);
    }
  }
}

/** The application incarnation a lease names, when it names one. */
export function applicationOf(lease: ApplicationLease): ApplicationIncarnation | undefined {
  return lease.processId !== undefined && lease.processStartedAt !== undefined
    ? { ownership: lease.ownership, processId: lease.processId, processStartedAt: lease.processStartedAt }
    : undefined;
}

// Target ids are operator-chosen text, so record names use a digest that is always a portable filename.
function recordNames(targetId: string): Record<keyof HeldRecords, string> {
  const digest = createHash('sha256').update(targetId, 'utf8').digest('hex').slice(0, 32);
  return { mutation: `mutation-${digest}.json`, quarantine: `quarantine-${digest}.json` };
}

function parseRecord<T extends z.ZodType<{ targetId: string }>>(schema: T, contents: string, targetId: string): z.infer<T> | undefined {
  try {
    const parsed = schema.safeParse(JSON.parse(contents));
    return parsed.success && parsed.data.targetId === targetId ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
