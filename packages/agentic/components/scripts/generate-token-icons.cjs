const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateTokenCompanion } = require('./spec-contracts/token-companion.cjs');

const root = path.resolve(__dirname, '..');
const { output } = require('../package.json').furn.tokenAssets['fluent-icon'];
const destination = path.resolve(root, output);
const check = process.argv[2] === '--check';
const manifestName = 'manifest.generated.json';

if (!/^src\/common\/generated\/[a-z][a-z0-9-]*$/.test(output)) {
  throw new Error('The Fluent icon output must be a dedicated directory under src/common/generated.');
}

const required = new Set();
for (const file of fs.globSync('src/components/*/spec/tokens.json', { cwd: root }).sort()) {
  const component = path.basename(path.dirname(path.dirname(file)));
  const icons = validateTokenCompanion(fs.readFileSync(path.join(root, file), 'utf8'), component, file);
  for (const icon of icons) required.add(icon);
}

const staging = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'furn-token-icons-'));
try {
  const jobs = [...required].sort().map((icon) => ({ output: `${icon}.generated.tsx`, icons: [icon] }));
  const manifest = path.join(staging, manifestName);
  if (jobs.length > 0) {
    const config = path.join(staging, 'extraction.json');
    fs.writeFileSync(config, JSON.stringify({ extractIcons: jobs }));
    // Repository prebuild runs before tsc has created the extractor's bin.
    const cli = path.join(path.dirname(require.resolve('@fluentui-react-native/extract-icons/package.json')), 'src', 'cli.ts');
    const result = spawnSync(process.execPath, [cli, '--config', config, '--manifest', manifest], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Token icon extraction failed (${result.signal ?? result.status}).`);
  } else {
    fs.writeFileSync(manifest, '{\n  "schemaVersion": 1,\n  "artifacts": []\n}\n');
  }

  const names = new Set([manifestName, ...jobs.map((job) => job.output)]);
  const stale = fs.existsSync(destination)
    ? fs.readdirSync(destination).filter((file) => /^[A-Z][A-Za-z0-9]*\.generated\.tsx$/.test(file) && !names.has(file))
    : [];
  const changed = [...names].filter((file) => {
    const target = path.join(destination, file);
    return !fs.existsSync(target) || !fs.readFileSync(target).equals(fs.readFileSync(path.join(staging, file)));
  });
  if (check && (changed.length || stale.length)) {
    throw new Error(`Generated Fluent icons are out of date: ${[...changed, ...stale].join(', ')}. Run yarn prebuild.`);
  }
  if (!check) {
    fs.mkdirSync(destination, { recursive: true });
    for (const file of changed) {
      const target = path.join(destination, file);
      const pending = `${target}.${process.pid}.tmp`;
      try {
        fs.copyFileSync(path.join(staging, file), pending);
        fs.renameSync(pending, target);
      } finally {
        fs.rmSync(pending, { force: true });
      }
    }
    for (const file of stale) fs.unlinkSync(path.join(destination, file));
  }
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
}
