import fs from 'node:fs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';

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
} else if (mode === 'signal') {
  const keepAlive = setInterval(() => undefined, 60_000);
  process.once('SIGTERM', () => {
    setTimeout(() => {
      fs.writeFileSync(marker, 'graceful');
      clearInterval(keepAlive);
    }, 30);
  });
  fs.writeFileSync(marker, 'started');
} else if (mode === 'borrowed') {
  fs.writeFileSync(marker, String(process.pid));
  setInterval(() => undefined, 60_000);
} else if (mode === 'startup-unsettled' || mode === 'listener-startup-unsettled') {
  await control.register(async () => process.exit(0));
  if (mode === 'listener-startup-unsettled') {
    const server = http.createServer((_request, response) => response.end('ready'));
    server.listen(Number(marker), '127.0.0.1', () => fs.writeFileSync(preload, 'acquisition started'));
  } else {
    fs.writeFileSync(marker, 'acquisition started');
    setInterval(() => undefined, 60_000);
  }
} else if (
  mode === 'listener' ||
  mode === 'listener-close' ||
  mode === 'listener-ipv6' ||
  mode === 'listener-preflight' ||
  mode === 'listener-exit-on-stop' ||
  mode === 'listener-with-descriptor'
) {
  const server = http.createServer((_request, response) => response.end('ready'));
  const keepAlive = setInterval(() => undefined, 60_000);
  server.on('error', () => undefined);
  const host = mode === 'listener-ipv6' ? '::1' : '127.0.0.1';
  const start = () =>
    server.listen({ port: Number(marker), host, ...(mode === 'listener-ipv6' ? { ipv6Only: true } : {}) }, () => {
      if (mode === 'listener-close') setTimeout(() => server.close(), 500);
      if (mode === 'listener-with-descriptor')
        void control.ready({ tier: 'service-ready', service: 'descriptor', descriptor: 'fixture.json' });
    });
  if (mode === 'listener-preflight') {
    const probe = net.createServer();
    probe.listen(Number(marker), host, () => probe.close(start));
  } else start();
  process.once('SIGTERM', () => {
    if (mode === 'listener-exit-on-stop' || mode === 'listener-with-descriptor') process.exit(0);
    if (server.listening) server.close();
    clearInterval(keepAlive);
  });
} else if (mode === 'reported-slow') {
  const { createDesktopReportSession } = await import('../../lib/reporting/index.js');
  const report = await createDesktopReportSession({ artifactsRoot: '.', kind: 'lifecycle' });
  const keepAlive = setInterval(() => undefined, 60_000);
  let disposal;
  const dispose = () =>
    (disposal ??= (async () => {
      await new Promise((resolve) => setTimeout(resolve, 11_000));
      fs.rmSync(marker);
      clearInterval(keepAlive);
      await report.close();
      control.finish();
    })());
  await control.register(dispose);
  report.onStop(dispose);
  await control.ready({ tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' });
  fs.writeFileSync(marker, String(process.pid));
} else {
  const keepAlive = setInterval(() => undefined, 60_000);
  fs.writeFileSync(`${marker}.socket`, JSON.parse(process.env.FURN_DESKTOP_PROCESS_CONTROL).address);
  fs.writeFileSync(marker, String(process.pid));
  await control.register(async () => {
    if (mode === 'stalled') await new Promise(() => undefined);
    if (mode === 'failed') throw new Error('Injected descriptor withdrawal failure.');
    await new Promise((resolve) => setTimeout(resolve, 30));
    fs.rmSync(marker);
    clearInterval(keepAlive);
    control.finish();
  });
  await control.ready({ tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' });
}
