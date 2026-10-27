const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { validateCatalog } = require('./check-test-contracts.cjs');

const componentNames = ['story-group', 'story-item', 'story-status', 'theme-picker', 'theme-tester'];

test('requires a contract and explicit entry-point export for every test component', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'components-test-contracts-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sourceRoot = path.join(root, 'src', 'test');
  fs.mkdirSync(sourceRoot, { recursive: true });

  for (const name of componentNames) {
    const directory = path.join(sourceRoot, name);
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'CONTRACT.md'), `# ${name}\n`);
  }

  const entryPoint = path.join(sourceRoot, 'index.ts');
  fs.writeFileSync(entryPoint, componentNames.map((name) => `export { ${name} } from './${name}/${name}';`).join('\n'));
  assert.doesNotThrow(() => validateCatalog(sourceRoot, entryPoint));

  fs.rmSync(path.join(sourceRoot, 'theme-picker', 'CONTRACT.md'));
  assert.throws(() => validateCatalog(sourceRoot, entryPoint), /Missing local contract for theme-picker/);

  fs.writeFileSync(path.join(sourceRoot, 'theme-picker', 'CONTRACT.md'), '# theme-picker\n');
  fs.writeFileSync(entryPoint, componentNames.filter((name) => name !== 'theme-picker').join('\n'));
  assert.throws(() => validateCatalog(sourceRoot, entryPoint), /does not export ThemePicker/);
});
