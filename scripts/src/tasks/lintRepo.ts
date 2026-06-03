import { isFixMode } from '../utils/env.ts';
import { exec } from 'node:child_process';
import { styleText } from 'node:util';

type CommandVariants = {
  check: string;
  fix: string;
};

const lintCommands: Record<string, CommandVariants> = {
  'yarn-constraints': {
    check: 'yarn constraints',
    fix: 'yarn constraints --fix',
  },
  'align-deps': {
    check: 'yarn rnx-align-deps',
    fix: 'yarn rnx-align-deps --fix',
  },
  knip: {
    check: 'yarn knip --no-progress',
    fix: 'yarn knip --fix --no-progress',
  },
  'lint-lockfile': {
    check: 'yarn lint-lockfile',
    fix: 'yarn lint-lockfile --fix',
  },
  // format should come last to clean up any formatting issues introduced by the other commands
  oxfmt: {
    check: 'yarn oxfmt --check',
    fix: 'yarn oxfmt --write',
  },
};

const fix = isFixMode(process.argv.includes('--fix'));
const verbose = process.argv.includes('--verbose');

async function execute() {
  const key: keyof CommandVariants = fix ? 'fix' : 'check';
  const ops: Promise<boolean>[] = [];
  for (const cmdName of Object.keys(lintCommands)) {
    const command = lintCommands[cmdName][key];
    if (command) {
      if (fix) {
        if (!(await execCommand(cmdName, command))) {
          return 1;
        }
      } else {
        ops.push(execCommand(cmdName, command));
      }
    }
  }
  if (ops.length > 0) {
    const results = await Promise.all(ops);
    if (results.some((result) => !result)) {
      return 1;
    }
  }
  return 0;
}

/**
 * Executes a command with exec and returns a promise that resolves with the stdout and stderr output.
 * @param command The command to execute.
 * @returns A promise that resolves with an object containing stdout, stderr, and error properties.
 */
async function execCommand(cmdName: string, command: string): Promise<boolean> {
  const startTime = performance.now();
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      const success = error == null;
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      if (success) {
        let message = `${styleText('cyan', cmdName)}: ${styleText(['green', 'bold'], 'success')} (${duration}s)`;
        if (verbose && stdout) {
          message += `\n${stdout}`;
        }
        console.log(message);
      } else {
        let message = `${styleText('cyan', cmdName)}: ${styleText('red', 'failed')} (${duration}s)`;
        if (stdout) {
          message += `\n${stdout}`;
        }
        if (stderr) {
          message += `\n${stderr}`;
        }
        if (error.message) {
          message += `\n${error.message}`;
        }
        console.error(message);
      }
      resolve(success);
    });
  });
}

await execute().then((result) => {
  process.exit(result);
});
