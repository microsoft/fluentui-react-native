import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { DesktopArtifact, DesktopStoryRunResult } from '../authoring/results.js';
import { artifactDirectorySegments, sanitizeArtifactSegment } from './segments.js';
import type { ArtifactDirectory } from './segments.js';

export class ArtifactManager {
  readonly root: string;

  constructor(root: string) {
    if (!root) {
      throw new TypeError('ArtifactManager requires a non-empty root path.');
    }
    fs.mkdirSync(root, { recursive: true });
    this.root = fs.realpathSync.native(root);
  }

  writeScreenshot(directory: ArtifactDirectory, name: string, base64: string): DesktopArtifact {
    return this.write(directory, name, 'png', Buffer.from(base64, 'base64'), 'screenshot');
  }

  writeSource(directory: ArtifactDirectory, name: string, source: string): DesktopArtifact {
    return this.write(directory, name, 'xml', source, 'source');
  }

  writeTree(directory: ArtifactDirectory, name: string, tree: unknown): DesktopArtifact {
    return this.write(directory, name, 'json', `${JSON.stringify(tree, null, 2)}\n`, 'tree');
  }

  writeWindowEvents(directory: ArtifactDirectory, name: string, log: unknown): DesktopArtifact {
    return this.write(directory, name, 'json', `${JSON.stringify(log, null, 2)}\n`, 'window-events');
  }

  writeRunResult(result: DesktopStoryRunResult): string {
    const outputPath = this.resolvePath(['run.json']);
    writeAtomic(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    return outputPath;
  }

  writeMetadata(name: string, value: unknown): string {
    const outputPath = this.resolvePath([`${sanitizeArtifactSegment(name)}.json`]);
    writeAtomic(outputPath, `${JSON.stringify(value, null, 2)}\n`);
    return outputPath;
  }

  private write(
    directory: ArtifactDirectory,
    name: string,
    extension: string,
    data: string | Uint8Array,
    kind: DesktopArtifact['kind'],
  ): DesktopArtifact {
    const segments = ['tests', ...artifactDirectorySegments(directory), `${sanitizeArtifactSegment(name)}.${extension}`];
    const outputPath = this.resolvePath(segments);
    writeAtomic(outputPath, data);
    return {
      kind,
      name,
      path: segments.join('/'),
    };
  }

  /**
   * Resolves a file beneath the root and creates its directories. The deepest directory that already exists is resolved
   * before anything is created, so a link that leads out of the root is refused without making directories outside it.
   */
  private resolvePath(segments: readonly string[]): string {
    const relativePath = segments.join('/');
    const outputPath = path.join(this.root, ...segments);
    if (!isWithin(this.root, outputPath)) {
      throw new Error(`Artifact path escapes the configured root: ${relativePath}`);
    }
    const parent = path.dirname(outputPath);
    this.assertConfined(deepestExisting(parent), relativePath);
    fs.mkdirSync(parent, { recursive: true });
    const realParent = this.assertConfined(parent, relativePath);
    return path.join(realParent, path.basename(outputPath));
  }

  private assertConfined(existing: string, relativePath: string): string {
    let real: string;
    try {
      real = fs.realpathSync.native(existing);
    } catch {
      throw new Error(`Artifact path traverses a link that does not resolve: ${relativePath}`);
    }
    if (!isWithin(this.root, real)) {
      throw new Error(`Artifact path traverses outside the configured root: ${relativePath}`);
    }
    return real;
  }
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

/** The nearest ancestor, or the path itself, that exists. A dangling link counts as existing so it is resolved and refused. */
function deepestExisting(target: string): string {
  let current = target;
  for (;;) {
    try {
      fs.lstatSync(current);
      return current;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT' && code !== 'ENOTDIR') throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) return current;
    current = parent;
  }
}

function writeAtomic(outputPath: string, data: string | Uint8Array): void {
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, data);
    fs.renameSync(temporaryPath, outputPath);
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    throw error;
  }
}
