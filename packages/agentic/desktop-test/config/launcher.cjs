async function main() {
  const [launcherUrl, configPath] = process.argv.slice(2);
  const { randomUUID } = require('node:crypto');
  const { connectReportProducer } = await import('../lib/reporting/transport.js');
  const { DesktopReportedError, serializeReportError } = await import('../lib/reporting/protocol.js');
  let launcher;
  let stopped = false;
  const producer = await connectReportProducer(`wdio-launcher-${randomUUID()}`, undefined, async () => {
    stopped = true;
    await launcher?.runner?.shutdown();
  });
  try {
    const { Launcher } = await import(launcherUrl);
    launcher = new Launcher(configPath);
    await launcher.initialize();
    if (stopped) {
      process.exitCode = 1;
      return;
    }
    process.exitCode = (await launcher.run()) ?? 1;
  } catch (error) {
    const failure =
      error instanceof DesktopReportedError
        ? error.failure
        : { failureId: randomUUID(), kind: 'infrastructure', error: serializeReportError(error) };
    producer.emit({ kind: 'service-failed', payload: { failure } });
    process.exitCode = 1;
  } finally {
    await producer.finish(process.exitCode === 0 ? 'passed' : 'failed');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
