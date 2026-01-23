import { exec } from 'node:child_process';
import { scriptsDir } from './ispnpm.ts';

export async function getCatalog(): Promise<Record<string, string>> {
  const command = 'yarn config get catalog --json';
  const output = await execWithOutput(command);
  return JSON.parse(output) as Record<string, string>;
}

function execWithOutput(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = { cwd: scriptsDir() };
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(stderr));
        return;
      }
      resolve(stdout);
    });
  });
}
