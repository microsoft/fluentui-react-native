import { createHash } from 'node:crypto';

/** A directory under the artifact root: one sanitized segment when given as text, or an ordered list of segments. */
export type ArtifactDirectory = string | readonly string[];

/** The directory inside a test's evidence directory that holds failure evidence. Authored artifact names never use it. */
export const failureEvidenceDirectory = 'failure';

/** Artifact names that failure evidence uses, so an authored artifact cannot be mistaken for it. */
export const reservedArtifactName = 'failure';

const maximumSegmentLength = 64;

/**
 * Turns text into one safe path segment. Anything outside letters, digits and `._-` becomes `-`, so the result can never
 * climb out of the directory it is joined to. It throws for text with nothing left to name a file.
 */
export function sanitizeArtifactSegment(value: string): string {
  let sanitized = value
    .replaceAll(/[^A-Za-z0-9._-]/g, '-')
    .replaceAll(/-+/g, '-')
    .replace(/^\.+/, '');
  if (/^(?:aux|con|nul|prn|com[1-9]|lpt[1-9])(?:\.|$)/i.test(sanitized)) {
    sanitized = `_${sanitized}`;
  }
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    throw new Error(`Invalid artifact name "${value}".`);
  }
  return sanitized;
}

/** The sanitized segments of a directory. Empty text and empty lists are errors rather than the root. */
export function artifactDirectorySegments(directory: ArtifactDirectory): string[] {
  const segments = typeof directory === 'string' ? [directory] : [...directory];
  if (segments.length === 0) throw new Error('An artifact directory needs at least one segment.');
  return segments.map(sanitizeArtifactSegment);
}

/**
 * Where one test keeps its evidence, as nested story and test segments. The test segment ends with a short hash of the
 * exact pair, so ids that sanitize or truncate to the same text, or that only differ in where a hyphen falls
 * (`a`/`b-c` against `a-b`/`c`), still get different directories.
 */
export function testArtifactDirectory(storyId: string, testId: string): readonly string[] {
  const hash = createHash('sha256')
    .update(JSON.stringify([storyId, testId]))
    .digest('hex')
    .slice(0, 12);
  return [directorySegment(storyId), `${directorySegment(testId)}-${hash}`];
}

/**
 * The file an authored artifact occupies in its test directory, normalized so two names that land on the same file,
 * including on a case-insensitive filesystem, have the same key.
 */
export function authoredArtifactKey(kind: 'screenshot' | 'source', name: string): string {
  return `${kind === 'screenshot' ? 'png' : 'xml'}:${sanitizeArtifactSegment(name).toLowerCase()}`;
}

/** Whether an authored artifact name falls in the namespace that failure evidence owns. */
export function isReservedArtifactName(name: string): boolean {
  const sanitized = sanitizeArtifactSegment(name).toLowerCase();
  return sanitized === reservedArtifactName || sanitized.startsWith(`${reservedArtifactName}-`);
}

function directorySegment(value: string): string {
  let sanitized: string;
  try {
    sanitized = sanitizeArtifactSegment(value);
  } catch {
    sanitized = '_';
  }
  return sanitized.slice(0, maximumSegmentLength);
}
