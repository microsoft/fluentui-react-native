import { NodeDesktopCommandRunner } from '../../lib/commands.js';

const [fixture, mode, marker, artifactsRoot, preload] = process.argv.slice(2);
const runner = new NodeDesktopCommandRunner({ logDirectory: artifactsRoot, shutdownTimeoutMs: 2000, output: { write: () => true } });
const running = runner.start({
  command: process.execPath,
  args: [fixture, mode, marker, preload],
  cwd: process.cwd(),
  env: {},
});
const ready = await running.waitForReadiness({ tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' }, 15_000);
process.send(ready);
await new Promise((resolve) => process.once('message', resolve));
await runner.close();
