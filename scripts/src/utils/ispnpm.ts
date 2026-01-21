import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const scriptsDir = (() => {
  let scriptDir: string | undefined = undefined;
  return () => {
    if (!scriptDir) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      scriptDir = path.resolve(__dirname, '../..');
    }
    return scriptDir as string;
  };
})();

export const isPnpmMode = () => {
  let isPnpmModeCached: boolean | undefined = undefined;
  return () => {
    if (isPnpmModeCached === undefined) {
      const yarnConfigPath = path.resolve(scriptsDir(), '../.yarnrc.yml');
      const yarnConfig = fs.readFileSync(yarnConfigPath, { encoding: 'utf-8' });
      isPnpmModeCached = yarnConfig.includes('nodeLinker: pnpm');
    }
    return isPnpmModeCached as boolean;
  };
};
