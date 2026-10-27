const fs = require('node:fs');
const path = require('node:path');

const componentNames = ['story-group', 'story-item', 'story-status', 'theme-picker', 'theme-tester'];

function validateCatalog(sourceRoot, entryPoint) {
  const index = fs.readFileSync(entryPoint, 'utf8');
  for (const name of componentNames) {
    const componentName = name.replace(/(^|-)([a-z])/g, (_, _separator, letter) => letter.toUpperCase());
    const contractPath = path.join(sourceRoot, name, 'CONTRACT.md');
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Missing local contract for ${name}: ${contractPath}`);
    }
    if (!new RegExp(`\\b${componentName}\\b`).test(index)) {
      throw new Error(`The test entry point does not export ${componentName}.`);
    }
  }
}

if (require.main === module) {
  const packageRoot = path.resolve(__dirname, '../..');
  validateCatalog(path.join(packageRoot, 'src/test'), path.join(packageRoot, 'src/test/index.ts'));
}

module.exports = { validateCatalog };
