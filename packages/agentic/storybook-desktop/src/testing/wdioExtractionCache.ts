import { createHash } from 'node:crypto';
import fs from 'node:fs';

import { extractWdioTests, type ExtractedWdioStory } from './extractWdioTests.js';

/** Owned by one test/smoke run, with only the latest source identity retained for each file. */
export class WdioExtractionCache {
  private readonly sources = new Map<string, { digest: string; tests: ReadonlyMap<string, ExtractedWdioStory> }>();

  read(sourceFile: string): { tests: ReadonlyMap<string, ExtractedWdioStory>; cacheHit: boolean } {
    const source = fs.readFileSync(sourceFile, 'utf8');
    const digest = createHash('sha256').update(source).digest('hex');
    const cached = this.sources.get(sourceFile);
    if (cached?.digest === digest) return { tests: cached.tests, cacheHit: true };
    const tests = extractWdioTests(source, sourceFile);
    this.sources.set(sourceFile, { digest, tests });
    return { tests, cacheHit: false };
  }
}
