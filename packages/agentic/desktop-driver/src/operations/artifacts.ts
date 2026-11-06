import { createHash } from 'node:crypto';

import type { NativeImage } from '../host/types.js';
import { artifactLimits } from './limits.js';

/** Where a captured image came from, so evidence can be tied to the application state it showed. */
export type ArtifactProvenance = {
  capturedAt: string;
  incarnation: number;
  previewGeneration: number;
  ref?: string;
  scope: 'element' | 'window';
  window: string;
};

export type Artifact = ArtifactProvenance & {
  readonly data: Uint8Array;
  height: number;
  id: string;
  mimeType: NativeImage['mimeType'];
  scaleFactor: number;
  sha256: string;
  width: number;
};

export type ArtifactLookup = { artifact: Artifact; ok: true } | { failure: 'expired' | 'unknown'; ok: false };

/**
 * The images a session captured, held in memory and bounded by count and total bytes. The oldest go first, and an id is
 * never reused, so a dropped artifact reads as expired rather than as another image.
 */
export class ArtifactStore {
  private readonly artifacts = new Map<string, Artifact>();
  private issued = 0;
  private totalBytes = 0;
  private readonly limits: { maxCount: number; maxTotalBytes: number };

  constructor(limits: { maxCount: number; maxTotalBytes: number } = artifactLimits) {
    this.limits = limits;
  }

  add(image: NativeImage, provenance: ArtifactProvenance): Artifact {
    this.issued += 1;
    const artifact: Artifact = {
      ...provenance,
      data: image.data,
      height: image.height,
      id: `a${this.issued}`,
      mimeType: image.mimeType,
      scaleFactor: image.scaleFactor,
      sha256: createHash('sha256').update(image.data).digest('hex'),
      width: image.width,
    };
    this.artifacts.set(artifact.id, artifact);
    this.totalBytes += image.data.byteLength;
    for (const [id, held] of this.artifacts) {
      if (this.artifacts.size <= this.limits.maxCount && this.totalBytes <= this.limits.maxTotalBytes) {
        break;
      }
      if (id !== artifact.id) {
        this.artifacts.delete(id);
        this.totalBytes -= held.data.byteLength;
      }
    }
    return artifact;
  }

  get(id: string): ArtifactLookup {
    const artifact = this.artifacts.get(id);
    if (artifact) {
      return { artifact, ok: true };
    }
    const issued = /^a([1-9][0-9]{0,9})$/.exec(id);
    return { failure: issued && Number(issued[1]) <= this.issued ? 'expired' : 'unknown', ok: false };
  }

  get bytes(): number {
    return this.totalBytes;
  }

  get size(): number {
    return this.artifacts.size;
  }
}
