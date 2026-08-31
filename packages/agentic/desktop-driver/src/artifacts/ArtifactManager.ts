import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { DesktopArtifact, DesktopStoryRunResult } from '../authoring/results.js';

export class ArtifactManager {
  readonly root: string;

  constructor(root: string) {
    if (!root) {
      throw new TypeError('ArtifactManager requires a non-empty root path.');
    }
    fs.mkdirSync(root, { recursive: true });
    this.root = fs.realpathSync.native(root);
  }

  writeScreenshot(testDirectory: string, name: string, base64: string): DesktopArtifact {
    return this.write(testDirectory, name, 'png', Buffer.from(base64, 'base64'), 'screenshot');
  }

  writeSource(testDirectory: string, name: string, source: string): DesktopArtifact {
    return this.write(testDirectory, name, 'xml', source, 'source');
  }

  writeTree(testDirectory: string, name: string, tree: unknown): DesktopArtifact {
    return this.write(testDirectory, name, 'json', `${JSON.stringify(tree, null, 2)}\n`, 'tree');
  }

  writeRunResult(result: DesktopStoryRunResult): string {
    const outputPath = this.resolvePath('run.json');
    writeAtomic(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    return outputPath;
  }

  writeMetadata(name: string, value: unknown): string {
    const outputPath = this.resolvePath(`${sanitizeSegment(name)}.json`);
    writeAtomic(outputPath, `${JSON.stringify(value, null, 2)}\n`);
    return outputPath;
  }

  private write(
    testDirectory: string,
    name: string,
    extension: string,
    data: string | Uint8Array,
    kind: DesktopArtifact['kind'],
  ): DesktopArtifact {
    const safeDirectory = sanitizeSegment(testDirectory);
    const safeName = sanitizeSegment(name);
    const relativePath = path.join('tests', safeDirectory, `${safeName}.${extension}`);
    const outputPath = this.resolvePath(relativePath);
    writeAtomic(outputPath, data);
    return {
      kind,
      name,
      path: relativePath.split(path.sep).join('/'),
    };
  }

  private resolvePath(relativePath: string): string {
    if (path.isAbsolute(relativePath)) {
      throw new Error('Artifact paths must be relative to the configured root.');
    }
    const outputPath = path.resolve(this.root, relativePath);
    const relative = path.relative(this.root, outputPath);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Artifact path escapes the configured root: ${relativePath}`);
    }
    const parent = path.dirname(outputPath);
    fs.mkdirSync(parent, { recursive: true });
    const realParent = fs.realpathSync.native(parent);
    const realRelative = path.relative(this.root, realParent);
    if (realRelative === '..' || realRelative.startsWith(`..${path.sep}`) || path.isAbsolute(realRelative)) {
      throw new Error(`Artifact path traverses outside the configured root: ${relativePath}`);
    }
    return path.join(realParent, path.basename(outputPath));
  }
}

function sanitizeSegment(value: string): string {
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

function writeAtomic(outputPath: string, data: string | Uint8Array): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, data);
    fs.renameSync(temporaryPath, outputPath);
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    throw error;
  }
}
