import fs from 'node:fs';
import { spawn } from 'node:child_process';

const [mode, marker, preload] = process.argv.slice(2);
const control = globalThis[Symbol.for('furn.desktop.process-control')];
if (mode === 'late') {
  fs.writeFileSync(marker, 'entry-must-not-run');
} else if (mode === 'wrapper') {
  fs.writeFileSync(`${marker}.wrapper`, String(process.pid));
  const child = spawn(process.execPath, ['--import', preload, import.meta.filename, 'service', marker], {
    env: process.env,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  child.on('error', (error) => {
    throw error;
  });
  setInterval(() => undefined, 60_000);
} else if (mode === 'borrowed') {
  fs.writeFileSync(marker, String(process.pid));
  setInterval(() => undefined, 60_000);
} else {
  const keepAlive = setInterval(() => undefined, 60_000);
  fs.writeFileSync(`${marker}.socket`, JSON.parse(process.env.FURN_DESKTOP_PROCESS_CONTROL).address);
  fs.writeFileSync(marker, String(process.pid));
  control.register(async () => {
    if (mode === 'stalled') await new Promise(() => undefined);
    if (mode === 'failed') throw new Error('Injected descriptor withdrawal failure.');
    await new Promise((resolve) => setTimeout(resolve, 30));
    fs.rmSync(marker);
    clearInterval(keepAlive);
    control.finish();
  });
  await control.ready({ tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' });
}
