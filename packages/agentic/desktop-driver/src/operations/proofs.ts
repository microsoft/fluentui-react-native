import type { NativeElementSnapshot, NativeObservedNode } from '../host/types.js';
import { proofCapacity, requireCapacity } from './limits.js';

/** One identifying field as a sample showed it. A clipped field holds only the first part of the provider's string. */
export type FingerprintField = { clipped: boolean; text: string };

/**
 * What a sample showed about an element, checked again immediately before acting on it. A fingerprint is a
 * precondition, never an identity proof: two controls can share one, and only the provider's liveness check says the
 * element is still the one the reference named.
 */
export type ElementFingerprint = {
  automationId?: FingerprintField;
  name?: FingerprintField;
  role: string;
};

/** A `find` whose outcome was `unique`: the sample that showed it, the one match, and what the match looked like. */
export type UniquenessProof = {
  fingerprint: ElementFingerprint;
  nativeId: string;
  reference: string;
  sample: string;
};

function field(value: string | undefined, clipped: boolean): FingerprintField | undefined {
  return value === undefined || value.length === 0 ? undefined : { clipped, text: value };
}

export function fingerprintOf(node: NativeObservedNode): ElementFingerprint {
  const clipped = new Set(node.clipped ?? []);
  const automationId = field(node.automationId, clipped.has('automationId'));
  const name = field(node.name, clipped.has('name'));
  return { ...(automationId ? { automationId } : {}), ...(name ? { name } : {}), role: node.role };
}

function fieldMatches(expected: FingerprintField | undefined, actual: string | undefined): boolean {
  const value = actual ?? '';
  if (expected === undefined) {
    return value.length === 0;
  }
  return expected.clipped ? value.startsWith(expected.text) : value === expected.text;
}

/** Whether a fresh snapshot still shows the role, name, and automation id the proving sample showed. */
export function matchesFingerprint(fingerprint: ElementFingerprint, snapshot: NativeElementSnapshot): boolean {
  return (
    snapshot.role === fingerprint.role &&
    fieldMatches(fingerprint.name, snapshot.name) &&
    fieldMatches(fingerprint.automationId, snapshot.automationId)
  );
}

/**
 * The most recent uniqueness proofs, by sample id. A proof stays usable until newer ones push it out or the application
 * restarts; each use still revalidates liveness and the fingerprint, so an old proof cannot act on a changed element.
 */
export class UniquenessProofs {
  private readonly capacity: number;
  private readonly proofs = new Map<string, UniquenessProof>();

  constructor(capacity: number = proofCapacity.default) {
    this.capacity = requireCapacity('proofCapacity', capacity, proofCapacity);
  }

  get size(): number {
    return this.proofs.size;
  }

  record(proof: UniquenessProof): void {
    this.proofs.delete(proof.sample);
    this.proofs.set(proof.sample, proof);
    while (this.proofs.size > this.capacity) {
      this.proofs.delete(this.proofs.keys().next().value!);
    }
  }

  get(sample: string): UniquenessProof | undefined {
    return this.proofs.get(sample);
  }

  clear(): void {
    this.proofs.clear();
  }
}
