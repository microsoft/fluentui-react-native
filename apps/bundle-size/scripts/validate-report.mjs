import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateBundleSizeReport } from './post-pr-comment.mjs';

const workspaceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const reportPath = process.argv[2] ? resolve(process.argv[2]) : join(workspaceRoot, 'dist', 'bundle-size', 'report.md');

validateBundleSizeReport(await readFile(reportPath, 'utf8'));
process.stdout.write(`Validated bundle-size report: ${reportPath}\n`);
