import { randomInt } from 'node:crypto';

import type { NativeElementScope } from '../host/types.js';
import { WebDriverError } from '../protocol/errors.js';
import type { WebDriverErrorCode } from '../protocol/errors.js';
import { referenceCapacity, requireCapacity } from './limits.js';

/**
 * Element references are opaque to callers: `<tag><serial>`, a lowercase base-36 tag that ends in a letter followed by
 * a decimal serial, such as `k3x9a12`. The tag names one application incarnation of one session and the serial counts
 * the references that incarnation issued, so a reference from another session, another driver process, or an earlier
 * incarnation is told apart from a stale one instead of resolving to someone else's element.
 *
 * A reference is a local handle, never a proof of liveness: every use goes to the provider, which rejects an element it
 * no longer tracks. The table only decides what the caller was told.
 */
const tagAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const tagLetters = 'abcdefghijklmnopqrstuvwxyz';
const minTagLength = 4;
const maxTagLength = 8;
const maxSerialDigits = 9;
export const maxReferenceLength = 32;
const attemptsPerLength = 8;
const rememberedEarlierTags = 16;

export type ReferenceFailure = 'earlier-incarnation' | 'expired' | 'foreign' | 'malformed' | 'region-changed' | 'unknown';

export type ReferenceTarget = {
  nativeId: string;
  /** The preview-region generation the element was observed in; only `preview` scope elements expire with it. */
  previewGeneration: number;
  scope: NativeElementScope;
  windowId: string;
};

export type ReferenceEntry = ReferenceTarget & {
  /** The observation or search sequence that last returned the reference. */
  lastSeen: number;
  reference: string;
  serial: number;
};

export type ReferenceResolution = { entry: ReferenceEntry; ok: true } | { failure: ReferenceFailure; ok: false };

export type ParsedReference = { serial: number; tag: string };

/** Splits `<tag><serial>`. Scans by hand so hostile input cannot cost more than one pass. */
export function parseReference(reference: string): ParsedReference | undefined {
  if (reference.length < minTagLength + 1 || reference.length > maxReferenceLength) {
    return undefined;
  }
  let split = reference.length;
  while (split > 0 && isDigit(reference.charCodeAt(split - 1))) {
    split -= 1;
  }
  const digits = reference.length - split;
  if (digits < 1 || digits > maxSerialDigits || split < minTagLength || split > maxTagLength) {
    return undefined;
  }
  if (reference.charCodeAt(split) === 48 && digits > 1) {
    return undefined;
  }
  for (let index = 0; index < split; index += 1) {
    if (!tagAlphabet.includes(reference[index])) {
      return undefined;
    }
  }
  if (!tagLetters.includes(reference[split - 1])) {
    return undefined;
  }
  const serial = Number(reference.slice(split));
  return serial >= 1 ? { serial, tag: reference.slice(0, split) } : undefined;
}

/**
 * Draws a random tag that `isTaken` has not seen. Tags widen after repeated collisions, so the namespace never runs
 * out and refs stay as short as the number of sessions allows.
 */
export function allocateReferenceTag(isTaken: (tag: string) => boolean): string {
  for (let length = minTagLength; length <= maxTagLength; length += 1) {
    for (let attempt = 0; attempt < attemptsPerLength; attempt += 1) {
      const tag = randomTag(length);
      if (!isTaken(tag)) {
        return tag;
      }
    }
  }
  throw new Error('No unused element reference tag is available.');
}

function randomTag(length: number): string {
  let tag = '';
  for (let index = 0; index < length - 1; index += 1) {
    tag += tagAlphabet[randomInt(tagAlphabet.length)];
  }
  return tag + tagLetters[randomInt(tagLetters.length)];
}

function isDigit(code: number): boolean {
  return code >= 48 && code <= 57;
}

/**
 * The element references one session has issued. A native id keeps one reference while the table retains it, so a
 * repeated observation reports unchanged elements under unchanged references within their region, and a reference
 * is never reissued.
 */
export class ReferenceTable {
  private readonly capacity: number;
  private readonly earlierTags: string[] = [];
  private readonly entries = new Map<string, ReferenceEntry>();
  private issued = 0;
  private readonly referencesByNativeId = new Map<string, string>();
  private tag: string;

  constructor(tag: string, capacity: number = referenceCapacity.default) {
    this.tag = tag;
    this.capacity = requireCapacity('referenceCapacity', capacity, referenceCapacity);
  }

  get size(): number {
    return this.entries.size;
  }

  /** The longest reference `issue` could return after `additional` more issues, used to size lines before they exist. */
  maxLength(additional: number): number {
    return this.tag.length + String(this.issued + Math.max(0, additional)).length;
  }

  /** Whether a reference currently retains the native element id. */
  holds(nativeId: string): boolean {
    return this.referencesByNativeId.has(nativeId);
  }

  peek(nativeId: string): string | undefined {
    return this.referencesByNativeId.get(nativeId);
  }

  /** Returns the element's reference, issuing one when it has none, and marks it seen by `sequence`. */
  issue(target: ReferenceTarget, sequence: number): string {
    const existing = this.referencesByNativeId.get(target.nativeId);
    if (existing !== undefined) {
      const entry = this.entries.get(existing)!;
      if (entry.scope === 'preview' && entry.previewGeneration !== target.previewGeneration) {
        // A surviving native container does not make its expired public preview reference current again.
        this.drop(existing);
      } else {
        entry.lastSeen = sequence;
        entry.previewGeneration = target.previewGeneration;
        entry.scope = target.scope;
        entry.windowId = target.windowId;
        return existing;
      }
    }
    this.issued += 1;
    const reference = `${this.tag}${this.issued}`;
    this.entries.set(reference, { ...target, lastSeen: sequence, reference, serial: this.issued });
    this.referencesByNativeId.set(target.nativeId, reference);
    return reference;
  }

  resolve(reference: string, previewGeneration: number): ReferenceResolution {
    const parsed = parseReference(reference);
    if (!parsed) {
      return { failure: 'malformed', ok: false };
    }
    const entry = this.entries.get(reference);
    if (entry) {
      if (entry.scope === 'preview' && entry.previewGeneration !== previewGeneration) {
        return { failure: 'region-changed', ok: false };
      }
      return { entry, ok: true };
    }
    if (parsed.tag === this.tag) {
      return { failure: parsed.serial <= this.issued ? 'expired' : 'unknown', ok: false };
    }
    return { failure: this.earlierTags.includes(parsed.tag) ? 'earlier-incarnation' : 'foreign', ok: false };
  }

  /** Forgets one reference and returns the native id it retained, which the caller should release. */
  drop(reference: string): string | undefined {
    const entry = this.entries.get(reference);
    if (!entry) {
      return undefined;
    }
    this.entries.delete(reference);
    this.referencesByNativeId.delete(entry.nativeId);
    return entry.nativeId;
  }

  /** Forgets every reference into a window, such as one that closed, and returns their native ids. */
  dropWindow(windowId: string): string[] {
    const dropped: string[] = [];
    for (const entry of this.entries.values()) {
      if (entry.windowId === windowId) {
        dropped.push(entry.nativeId);
        this.drop(entry.reference);
      }
    }
    return dropped;
  }

  /**
   * Drops references beyond capacity and returns their native ids. Stale-region references go first, then the least
   * recently seen; nothing seen by `sequence` is dropped, so one observation's references always survive it.
   */
  evict(sequence: number, previewGeneration: number): string[] {
    const excess = this.entries.size - this.capacity;
    if (excess <= 0) {
      return [];
    }
    const candidates = [...this.entries.values()]
      .filter((entry) => entry.lastSeen !== sequence)
      .sort((left, right) => rank(left, previewGeneration) - rank(right, previewGeneration));
    const released: string[] = [];
    for (const entry of candidates.slice(0, excess)) {
      released.push(entry.nativeId);
      this.drop(entry.reference);
    }
    return released;
  }

  /**
   * Starts a new application incarnation: every earlier reference stops resolving and is reported as earlier. The
   * provider's records are gone with the incarnation, so nothing is returned for release.
   */
  reset(newTag: string): void {
    this.earlierTags.push(this.tag);
    if (this.earlierTags.length > rememberedEarlierTags) {
      this.earlierTags.shift();
    }
    this.tag = newTag;
    this.entries.clear();
    this.referencesByNativeId.clear();
  }
}

function rank(entry: ReferenceEntry, previewGeneration: number): number {
  const stale = entry.scope === 'preview' && entry.previewGeneration !== previewGeneration;
  return stale ? Number.NEGATIVE_INFINITY : entry.lastSeen;
}

const failureErrors: Record<ReferenceFailure, { code: WebDriverErrorCode; detail: string }> = {
  'earlier-incarnation': { code: 'stale element reference', detail: 'belongs to an earlier incarnation of the application' },
  expired: { code: 'stale element reference', detail: 'expired; observe again to get a current reference' },
  foreign: { code: 'no such element', detail: 'does not belong to this session' },
  malformed: { code: 'invalid argument', detail: 'is not an element reference' },
  'region-changed': { code: 'stale element reference', detail: 'belongs to a view that has been replaced' },
  unknown: { code: 'no such element', detail: 'has not been issued in this session' },
};

/**
 * The error for a reference that failed to resolve. A well-formed reference is short and drawn from a closed alphabet,
 * so naming it is safe. A malformed one is the caller's own text, which an agent would read back as an instruction.
 */
export function referenceFailureError(failure: ReferenceFailure, reference: string): WebDriverError {
  const { code, detail } = failureErrors[failure];
  const subject = failure === 'malformed' ? 'The reference' : `Reference "${printable(reference)}"`;
  return new WebDriverError(code, `${subject} ${detail}.`, { reason: `ref-${failure}` });
}

/** The error for a reference whose element the provider no longer tracks. */
export function staleReferenceError(reference: string): WebDriverError {
  return new WebDriverError('stale element reference', `Reference "${printable(reference)}" is no longer attached to the application.`, {
    reason: 'ref-stale',
  });
}

function printable(reference: string): string {
  return reference.slice(0, maxReferenceLength).replace(/[^\x20-\x7e]/g, '?');
}
