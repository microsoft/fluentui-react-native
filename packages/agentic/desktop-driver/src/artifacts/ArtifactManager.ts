import { createHash, randomUUID } from 'node:crypto';
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

  prepareRun(): void {
    fs.rmSync(this.resolvePath('tests'), { force: true, recursive: true });
    for (const file of ['events.ndjson', 'host.json', 'junit.xml', 'run.json']) {
      fs.rmSync(this.resolvePath(file), { force: true });
    }
  }

  testDirectory(storyId: string, testId: string): string {
    const readable = `${sanitizeSegment(storyId)}__${sanitizeSegment(testId)}`;
    const digest = createHash('sha256')
      .update(JSON.stringify([storyId, testId]))
      .digest('hex')
      .slice(0, 12);
    return `${readable}__${digest}`;
  }

  writeAgentScreenshot(name: string, base64: string): DesktopArtifact {
    const safeName = sanitizeSegment(name);
    const relativePath = path.join('agent', `${safeName}.png`);
    writeAtomic(this.resolvePath(relativePath), Buffer.from(base64, 'base64'));
    return {
      kind: 'screenshot',
      name,
      path: relativePath.split(path.sep).join('/'),
    };
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
    for (const test of result.tests) {
      const testDirectory = this.testDirectory(test.storyId, test.testId);
      writeAtomic(this.resolvePath(path.join('tests', testDirectory, 'result.json')), `${JSON.stringify(test, null, 2)}\n`);
    }
    writeAtomic(this.resolvePath('events.ndjson'), formatRunEvents(result));
    writeAtomic(this.resolvePath('junit.xml'), formatJUnit(result));
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

function formatRunEvents(result: DesktopStoryRunResult): string {
  const events: Record<string, unknown>[] = [
    {
      endpoint: result.endpoint,
      finishedAt: result.finishedAt,
      runId: result.runId,
      startedAt: result.startedAt,
      status: result.status,
      summary: result.summary,
      type: 'run',
    },
  ];
  for (const test of result.tests) {
    events.push({
      durationMs: test.durationMs,
      error: test.error,
      status: test.status,
      storyId: test.storyId,
      testId: test.testId,
      title: test.title,
      type: 'test',
    });
    for (const step of test.steps) {
      events.push({
        durationMs: step.durationMs,
        error: step.error,
        index: step.index,
        status: step.status,
        storyId: test.storyId,
        testId: test.testId,
        type: 'step',
      });
    }
  }
  return `${events.map((event) => JSON.stringify(event)).join('\n')}\n`;
}

function formatJUnit(result: DesktopStoryRunResult): string {
  const failures = result.tests.filter(({ status }) => !['passed', 'quarantined', 'skipped'].includes(status)).length;
  const skipped = result.tests.filter(({ status }) => status === 'quarantined' || status === 'skipped').length;
  const durationSeconds = result.tests.reduce((total, test) => total + test.durationMs, 0) / 1000;
  const cases = result.tests
    .map((test) => {
      const attributes = `classname="${escapeXml(test.storyId)}" name="${escapeXml(test.testId)}" time="${(test.durationMs / 1000).toFixed(3)}"`;
      if (test.status === 'skipped' || test.status === 'quarantined') {
        return `  <testcase ${attributes}><skipped message="${escapeXml(test.skipReason ?? test.status)}" /></testcase>`;
      }
      if (test.status !== 'passed') {
        return `  <testcase ${attributes}><failure message="${escapeXml(test.error ?? test.status)}" /></testcase>`;
      }
      return `  <testcase ${attributes} />`;
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<testsuite name="desktop-story-tests" tests="${result.tests.length}" failures="${failures}" skipped="${skipped}" time="${durationSeconds.toFixed(3)}">`,
    cases,
    '</testsuite>',
    '',
  ].join('\n');
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
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
