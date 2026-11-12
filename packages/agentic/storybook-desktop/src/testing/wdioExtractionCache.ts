import { createHash } from 'node:crypto';
import fs from 'node:fs';

import { extractWdioTests, type ExtractedWdioStory } from './extractWdioTests.js';

function sourceDigest(source: string): string {
  return createHash('sha256').update(source).digest('hex');
}

function helperDigest(file: string): string | undefined {
  try {
    return sourceDigest(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

/** Owned by one test/smoke run, with only the latest source identity retained for each file. */
export class WdioExtractionCache {
  private readonly sources = new Map<
    string,
    { digest: string; helpers: ReadonlyMap<string, string | undefined>; tests: ReadonlyMap<string, ExtractedWdioStory> }
  >();

  read(sourceFile: string): { tests: ReadonlyMap<string, ExtractedWdioStory>; cacheHit: boolean } {
    const source = fs.readFileSync(sourceFile, 'utf8');
    const digest = sourceDigest(source);
    const cached = this.sources.get(sourceFile);
    if (cached?.digest === digest && [...cached.helpers].every(([file, expected]) => helperDigest(file) === expected)) {
      return { tests: cached.tests, cacheHit: true };
    }
    const helpers = new Map<string, string | undefined>();
    const tests = extractWdioTests(source, sourceFile, (file, content) => {
      helpers.set(file, content === undefined ? undefined : sourceDigest(content));
    });
    this.sources.set(sourceFile, { digest, helpers, tests });
    return { tests, cacheHit: false };
  }
}
