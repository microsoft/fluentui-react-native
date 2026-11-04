import { ArtifactStore } from './artifacts.js';
import { OperationJournal } from './journal.js';
import { ReleaseLedger } from './ledger.js';
import { OutcomeLedger } from './outcomes.js';
import { ObservationStore } from './observations.js';
import { UniquenessProofs } from './proofs.js';
import { allocateReferenceTag, ReferenceTable } from './refs.js';

/**
 * Every reference tag this process has issued. A tag stays reserved for good, so a reference from another session, or
 * from another driver server in the same process, can never resolve to this session's elements.
 */
const issuedTags = new Set<string>();

function drawTag(): string {
  const tag = allocateReferenceTag((candidate) => issuedTags.has(candidate));
  issuedTags.add(tag);
  return tag;
}

export type OperationSessionStateOptions = {
  journalCapacity?: number;
  referenceCapacity?: number;
};

/**
 * What the operation layer remembers about one session: the references it issued, the provider records it still has
 * to release, and the journal of what ran. It holds no host handles, so it can be created, inspected, and discarded
 * without a provider.
 */
export class OperationSessionState {
  /** Images the session captured, bounded by count and bytes. */
  readonly artifacts = new ArtifactStore();
  readonly journal: OperationJournal;
  readonly ledger: ReleaseLedger;
  /** Outcomes of mutating requests whose ids the caller chose, so a retry never runs an action twice. */
  readonly outcomes = new OutcomeLedger();
  /** Immutable bounded observations retained for page continuations and deltas. */
  readonly observations = new ObservationStore();
  /** Recent `find` results that proved a unique match, which actions must cite. */
  readonly proofs = new UniquenessProofs();
  readonly refs: ReferenceTable;
  private incarnationNumber = 1;
  private requests = 0;
  private samples = 0;

  constructor(options: OperationSessionStateOptions = {}) {
    this.journal = new OperationJournal(options.journalCapacity);
    this.refs = new ReferenceTable(drawTag(), options.referenceCapacity);
    this.ledger = new ReleaseLedger((nativeId) => this.refs.holds(nativeId) || this.observations.holds(nativeId));
  }

  /** Counts the application incarnations this session has had. References and records never cross one. */
  get incarnation(): number {
    return this.incarnationNumber;
  }

  nextRequestId(): string {
    this.requests += 1;
    return `r${this.requests}`;
  }

  /** The next observation sequence number. Sample ids and reference recency share it. */
  nextSample(): number {
    this.samples += 1;
    return this.samples;
  }

  /**
   * Starts a new application incarnation, such as after a relaunch. Earlier references stop resolving and are reported
   * as belonging to an earlier incarnation; the provider's records went with the old application, so none are released.
   */
  startIncarnation(): void {
    this.refs.reset(drawTag());
    this.observations.clear();
    this.ledger.clear();
    this.proofs.clear();
    this.incarnationNumber += 1;
  }
}
