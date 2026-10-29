import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { GeneratedFile, makeComment } from './file.ts';

describe('GeneratedFile', () => {
  it('renders, reports whether the file is current, and writes only changes', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'generated-file-'));
    try {
      const target = path.join(directory, 'nested', 'tokens.generated.ts');
      const create = (value: string) => {
        const file = new GeneratedFile(target);
        file.header = makeComment('Generated.', 'line');
        file.add('\n', `export const value = '${value}';`);
        return file;
      };

      const first = create('a');
      assert.equal(first.render(), "// Generated.\n\nexport const value = 'a';\n");
      assert.equal(first.isCurrent(), false);
      assert.equal(first.commit(), true);
      assert.equal(fs.readFileSync(target, 'utf8'), first.render());

      const modified = fs.statSync(target).mtimeMs;
      const same = create('a');
      assert.equal(same.isCurrent(), true);
      assert.equal(same.commit(), false);
      assert.equal(fs.statSync(target).mtimeMs, modified);

      const changed = create('b');
      assert.equal(changed.isCurrent(), false);
      assert.equal(changed.commit(), true);
      assert.equal(fs.readFileSync(target, 'utf8'), "// Generated.\n\nexport const value = 'b';\n");
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
