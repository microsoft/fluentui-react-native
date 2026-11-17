import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolingRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(import.meta.url);

export function formatAssessmentDocument(content: string, file = 'ASSESSMENT.md'): string {
  const manifest = require.resolve('oxfmt/package.json', {
    paths: [process.env.FURN_ASSESSMENT_TOOLS ?? toolingRoot],
  });
  const command = path.join(path.dirname(manifest), 'bin', 'oxfmt');
  const result = spawnSync(
    process.execPath,
    [command, `--stdin-filepath=${file}`, `--config=${path.join(toolingRoot, '.oxfmtrc.json')}`, '--disable-nested-config', '--threads=1'],
    { cwd: toolingRoot, input: content, encoding: 'utf8', maxBuffer: 8_000_000 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0 || !result.stdout.trim())
    throw new Error(`Assessment Markdown formatting failed: ${result.stderr || `exit ${result.status}`}`);
  return result.stdout;
}
