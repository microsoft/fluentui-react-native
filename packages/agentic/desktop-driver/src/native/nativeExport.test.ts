import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

type ExportConditions = {
  types?: string;
  import?: string;
  default?: string;
};

describe('desktop-driver native entry', () => {
  test('exposes the helper implementation as a dedicated package subpath', () => {
    const packageRoot = path.resolve(__dirname, '../..');
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, ExportConditions>;
    };
    const nativeEntry = manifest.exports['./native'];

    expect(nativeEntry).toEqual({
      types: './lib/native/nativeDriver.d.ts',
      import: './lib/native/nativeDriver.js',
      default: './src/native/nativeDriver.ts',
    });
    expect(existsSync(path.join(packageRoot, nativeEntry.default ?? ''))).toBe(true);
    expect(existsSync(path.join(packageRoot, nativeEntry.types ?? ''))).toBe(true);
  });
});
