import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/** @type {boolean | undefined} */
let isPnpmModeCached = undefined;

function checkPnpmMode() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const yarnConfigPath = path.resolve(__dirname, "../../../.yarnrc.yml");
  const yarnConfig = fs.readFileSync(yarnConfigPath, { encoding: "utf-8" });
  return yarnConfig.includes("nodeLinker: pnpm");
}

export function isPnpmMode() {
  isPnpmModeCached ??= checkPnpmMode();
  return isPnpmModeCached;
}