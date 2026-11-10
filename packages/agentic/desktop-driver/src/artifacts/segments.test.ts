import { artifactDirectorySegments, authoredArtifactKey, isReservedArtifactName, testArtifactDirectory } from './segments.js';

describe('testArtifactDirectory', () => {
  test('nests the story and the test, so ids that only differ in where a hyphen falls never share a directory', () => {
    const left = testArtifactDirectory('a', 'b-c');
    const right = testArtifactDirectory('a-b', 'c');
    expect(left).toHaveLength(2);
    expect(left[0]).toBe('a');
    expect(right[0]).toBe('a-b');
    expect(left.join('/')).not.toBe(right.join('/'));
  });

  test('keeps ids that sanitize to the same text apart with the hash of the exact pair', () => {
    const colon = testArtifactDirectory('story', 'a:b');
    const dash = testArtifactDirectory('story', 'a-b');
    expect(colon[1]).toMatch(/^a-b-[0-9a-f]{12}$/);
    expect(dash[1]).toMatch(/^a-b-[0-9a-f]{12}$/);
    expect(colon[1]).not.toBe(dash[1]);
  });

  test('bounds long ids and falls back for ids with nothing to name a directory', () => {
    const [story, test] = testArtifactDirectory('s'.repeat(300), 't'.repeat(300));
    expect(story).toHaveLength(64);
    expect(test).toHaveLength(64 + 13);
    expect(testArtifactDirectory('...', '..')[0]).toBe('_');
  });

  test('is stable for the same pair', () => {
    expect(testArtifactDirectory('story', 'test')).toEqual(testArtifactDirectory('story', 'test'));
  });
});

describe('artifactDirectorySegments', () => {
  test('sanitizes every segment and refuses an empty directory', () => {
    expect(artifactDirectorySegments(['../x', 'y:z'])).toEqual(['-x', 'y-z']);
    expect(artifactDirectorySegments('../story:id')).toEqual(['-story-id']);
    expect(() => artifactDirectorySegments([])).toThrow('at least one segment');
  });
});

describe('authored artifact names', () => {
  test('key the file a name lands on, ignoring case and what sanitizing removes', () => {
    expect(authoredArtifactKey('screenshot', 'Shot 1')).toBe(authoredArtifactKey('screenshot', 'shot-1'));
    expect(authoredArtifactKey('screenshot', 'shot')).not.toBe(authoredArtifactKey('source', 'shot'));
  });

  test('reserve the failure namespace', () => {
    expect(isReservedArtifactName('failure')).toBe(true);
    expect(isReservedArtifactName('Failure-source')).toBe(true);
    expect(isReservedArtifactName('failure window')).toBe(true);
    expect(isReservedArtifactName('failures')).toBe(false);
    expect(isReservedArtifactName('before-failure')).toBe(false);
  });
});
