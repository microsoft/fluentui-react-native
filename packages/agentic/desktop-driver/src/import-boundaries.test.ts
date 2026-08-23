import * as fs from 'node:fs';
import * as path from 'node:path';

const sourceRoot = path.resolve(__dirname);

function files(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? files(file)
      : entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')
        ? [file]
        : [];
  });
}

function imports(file: string): string[] {
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/(?:from\s+|import\()\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

describe('desktop-driver dependency boundaries', () => {
  it('keeps the RN-safe protocol free of Node and runtime integrations', () => {
    for (const file of files(path.join(sourceRoot, 'protocol'))) {
      expect(imports(file).filter((entry) => entry.startsWith('node:') || /(?:wdio|server|appium|storybook)/.test(entry))).toEqual([]);
    }
  });

  it('keeps core and platform modules independent of WDIO and server implementation', () => {
    for (const area of ['core', 'platforms']) {
      for (const file of files(path.join(sourceRoot, area))) {
        expect(imports(file).filter((entry) => /(?:^|\/)(?:wdio|server)(?:\/|$)/.test(entry))).toEqual([]);
      }
    }
  });

  it('keeps server implementation independent of the WDIO service layer', () => {
    for (const file of files(path.join(sourceRoot, 'server'))) {
      expect(imports(file).filter((entry) => /(?:^|\/)wdio(?:\/|$)/.test(entry))).toEqual([]);
    }
  });
});
