const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { pathToFileURL } = require('node:url');

async function main() {
  const mode = process.argv[2];
  const packageRoot = path.resolve(__dirname, '../..');
  const repositoryRoot = path.resolve(packageRoot, '../../..');
  const lib = (name) => pathToFileURL(path.join(packageRoot, 'lib', name)).href;
  const mcpRoot = path.resolve(packageRoot, '../desktop-driver-mcp');
  const mcpRequire = createRequire(path.join(mcpRoot, 'package.json'));
  const { DesktopSupervisor } = await import(lib('supervisor.js'));
  const { DesktopRunReporter } = await import(lib('reporting/collector.js'));
  const { runDesktopWdioSuite } = await import(lib('wdio/run.js'));
  const { connectDesktopRunner, createDesktopRunnerBroker } = await import(lib('wdio/runnerConnection.js'));
  const { resolveDesktopScopeDomains } = await import('@fluentui-react-native/desktop-driver/authoring');
  const { connectWithDescriptor } = await import(pathToFileURL(path.join(mcpRoot, 'lib/connection.js')).href);
  const { createDesktopDriverMcpServer } = await import(pathToFileURL(path.join(mcpRoot, 'lib/server.js')).href);
  const { Client } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/sdk/client/index.js')).href);
  const { InMemoryTransport } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/sdk/inMemory.js')).href);
  const parent = path.join(repositoryRoot, 'artifacts/desktop/f11');
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  const root = fs.mkdtempSync(path.join(parent, `native-${mode}-`));
  const evidence = {
    mode,
    passed: false,
    revision: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, encoding: 'utf8' }).stdout.trim(),
    fixture: 'com.microsoft.furn.application-ownership-fixture',
    fixturePreserved: false,
    descriptorsRemoved: false,
    claimReleased: false,
  };
  let output = '';
  const sink = { write: (chunk) => ((output += chunk.toString()), true) };
  const reporting = (kind) => new DesktopRunReporter({ artifactsRoot: root, kind, output: sink, errorOutput: sink, summary: false });
  const serviceReport = reporting('lifecycle');
  const run = reporting('tests');
  const privateRoot = path.join(root, 'private');
  const locks = path.join(root, 'locks');
  const ready = path.join(root, 'fixture.ready');
  const fixture = spawn(
    path.join(fs.realpathSync(process.env.FURN_NATIVE_HANDOFF_APP_PATH), 'Contents/MacOS/fixture'),
    ['--title', path.basename(root), '--ready-file', ready],
    { stdio: 'ignore' },
  );
  fixture.once('error', () => undefined);
  const target = {
    endpoint: 'macos',
    host: {
      kind: 'installed',
      ownership: 'external',
      application: { bundleIdentifier: evidence.fixture, windowTitle: path.basename(root) },
    },
    id: 'native-runner-attached',
    instanceId: 'native-runner-attached',
    projectRoot: packageRoot,
    configPath: path.join(root, 'desktop.config.mjs'),
  };
  const service = new DesktopSupervisor({
    target,
    reporter: serviceReport,
    lockDirectory: locks,
    input: 'accessible',
    recovery: { root: privateRoot },
    agent: { root: privateRoot },
  });
  const runner = new DesktopSupervisor({ target, reporter: run, lockDirectory: locks });
  const modelResults = [];
  let client;
  let server;
  let cleanup;
  const shutdown = () =>
    (cleanup ??= (async () => {
      const failures = [];
      for (const close of [async () => client?.close(), async () => server?.close(), () => runner.close(), () => service.close()]) {
        try {
          await close();
        } catch (error) {
          failures.push(error);
        }
      }
      evidence.fixturePreserved = fixture.exitCode === null && fixture.signalCode === null;
      evidence.descriptorsRemoved =
        !fs.existsSync(path.join(privateRoot, 'agent-connection.json')) && !fs.existsSync(path.join(privateRoot, 'runner-connection.json'));
      evidence.claimReleased = !fs.existsSync(path.join(locks, 'interactive.lock'));
      if (fixture.exitCode === null && fixture.signalCode === null) {
        const exited = once(fixture, 'exit');
        fixture.kill('SIGTERM');
        await exited;
      }
      evidence.fixtureExited = fixture.exitCode !== null || fixture.signalCode !== null;
      for (const report of [run, serviceReport]) {
        try {
          await report.finish();
        } catch (error) {
          failures.push(error);
        }
      }
      fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence, null, 2), { mode: 0o600 });
      if (failures.length) throw new AggregateError(failures, 'Native handoff fixture cleanup failed.');
    })());
  process.once('SIGTERM', () => void shutdown().finally(() => process.exit(143)));
  try {
    await waitFor(ready, fixture);
    assert.equal(Number(fs.readFileSync(ready, 'utf8')), fixture.pid);
    await service.start();
    evidence.descriptorPublished = true;
    const connection = await connectDesktopRunner({ root: privateRoot });
    server = createDesktopDriverMcpServer({
      connect: connectWithDescriptor({ descriptor: 'agent-connection.json', root: privateRoot }),
      version: '0.0.0-native-contract',
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'native-handoff-contract', version: '1.0.0' });
    await client.connect(clientTransport);
    const call = async (name, args = {}) => {
      const result = await client.callTool({ name, arguments: args });
      modelResults.push(result);
      return result;
    };
    const json = (reply) => {
      assert(!reply.isError, JSON.stringify(reply));
      return JSON.parse(reply.content.find(({ type }) => type === 'text').text);
    };
    const original = json(await call('desktop_session', { action: 'open', target: target.id }));
    assert.equal(service.server.sessions.get(original.id).lease.processId, fixture.pid);
    evidence.nativeSessionOpened = true;
    const observed = json(await call('desktop_observe', { observe: { budget: { maxNodes: 1 } } })).result;
    assert(observed.next);
    const found = json(await call('desktop_observe', { find: { automationId: 'ownership-fixture-increment' } })).result;
    assert.equal(found.matches.length, 1);
    const stale = found.matches[0].ref;
    const capture = await call('desktop_capture');
    const artifact = capture.content.find(({ type }) => type === 'resource_link');
    evidence.capture = artifact ? 'passed' : 'unsupported';
    await runner.open(false);
    await assert.rejects(createDesktopRunnerBroker({ connection, targetId: target.id, addSecret: (secret) => run.addSecret(secret) }), {
      code: 'session not created',
    });
    evidence.defaultBusy = true;
    assert.deepEqual(json(await call('desktop_session', { action: 'relinquish' })), { relinquished: true });
    const spec = path.join(root, 'spec.mjs');
    process.env.FURN_NATIVE_HANDOFF_RUN_ROOT = root;
    process.env.FURN_NATIVE_HANDOFF_JASMINE_MODULE = lib('jasmine/index.js');
    fs.writeFileSync(
      spec,
      mode === 'worker-crash'
        ? [
            'const { desktopIt } = await import(process.env.FURN_NATIVE_HANDOFF_JASMINE_MODULE);',
            "desktopIt('leaves its native session for parent drain', () => { process.exit(17); });",
          ].join('\n')
        : [
            "import fs from 'node:fs';",
            "import path from 'node:path';",
            'const { desktopIt } = await import(process.env.FURN_NATIVE_HANDOFF_JASMINE_MODULE);',
            "describe('native scoped runner', () => {",
            "  desktopIt('holds exclusive control and uses accessibility input', { requires: ['accessibility-click'] }, async () => {",
            '    const root = process.env.FURN_NATIVE_HANDOFF_RUN_ROOT;',
            "    fs.writeFileSync(path.join(root, 'worker.ready'), 'ready');",
            "    await browser.waitUntil(() => fs.existsSync(path.join(root, 'worker.continue')), { timeout: 30000 });",
            "    const count = await browser.$('~ownership-fixture-count');",
            '    const before = await count.getText();',
            "    await (await browser.$('~ownership-fixture-increment')).click();",
            '    expect(await count.getText()).not.toBe(before);',
            "    console.log('redaction probe', process.env.DESKTOP_WDIO_WORKER_TOKEN, process.env.DESKTOP_WDIO_BROKER_TOKEN);",
            '  });',
            '});',
          ].join('\n'),
    );
    const config = {
      config: { schemaVersion: 1, targets: { macos: target }, suites: { fixture: { kind: 'wdio', framework: 'jasmine', specs: [spec] } } },
      projectRoot: packageRoot,
      configPath: target.configPath,
      targets: { macos: target },
      reporting: { artifactsRoot: root },
      testScopes: resolveDesktopScopeDomains(),
    };
    const completed = runDesktopWdioSuite(runner, config, 'fixture', 'accessible', { connection }).then(
      () => undefined,
      (error) => error,
    );
    if (mode === 'handoff') {
      await waitFor(path.join(root, 'worker.ready'), fixture);
      const busy = await call('desktop_session', { action: 'open', target: target.id });
      assert(busy.isError);
      assert.equal(JSON.parse(busy.content[0].text).reason, 'target-busy');
      fs.writeFileSync(path.join(root, 'worker.continue'), 'continue');
      evidence.noConcurrentMcp = true;
    }
    const failure = await completed;
    if (mode === 'worker-crash') {
      assert(failure, 'the crashed native worker must fail its run');
      run.fail(failure);
    } else assert.equal(failure, undefined, failure?.stack);
    evidence.workerDrained = true;
    const fresh = json(await call('desktop_session', { action: 'open', target: target.id }));
    assert.notEqual(fresh.id, original.id);
    const checked = await call('desktop_check', { ref: stale, expect: { enabled: true } });
    assert(checked.isError);
    const page = await call('desktop_observe', { read: { cursor: observed.next } });
    assert(page.isError);
    assert.equal(JSON.parse(page.content[0].text).reason, 'observation-cursor-expired');
    const acted = json(await call('desktop_act', { steps: [{ act: { action: 'activate', ref: stale, sample: found.sample.id } }] }));
    assert.equal(acted.result.status, 'stopped');
    if (artifact) await assert.rejects(client.readResource({ uri: artifact.uri }));
    evidence.staleResourcesRejected = true;
    json(await call('desktop_session', { action: 'close' }));
    await runner.close();
    assert(fs.existsSync(path.join(locks, 'interactive.lock')));
    const grantPattern = /fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}/;
    assert(!grantPattern.test(JSON.stringify(modelResults)));
    assert(!grantPattern.test(output));
    const result = await run.finish();
    assert.equal(result.status, mode === 'worker-crash' ? 'failed' : 'passed');
    for (const entry of fs.readdirSync(run.root, { recursive: true, withFileTypes: true })) {
      if (entry.isFile()) assert(!grantPattern.test(fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8')));
    }
    evidence.credentialsConfined = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Native handoff fixture failed.';
    evidence.error = message;
    run.fail(error);
    throw new Error(`Native ${mode} qualification failed; evidence ${path.join(root, 'evidence.json')}: ${message}`);
  } finally {
    await shutdown();
  }
  assert(evidence.fixturePreserved, 'the externally owned fixture must survive all service cleanup');
  assert(evidence.fixtureExited && evidence.descriptorsRemoved && evidence.claimReleased);
  evidence.passed = true;
  fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence, null, 2), { mode: 0o600 });
  process.stdout.write(JSON.stringify({ mode, passed: true, evidence: path.join(root, 'evidence.json') }));
}

async function waitFor(file, fixture) {
  const deadline = Date.now() + 60_000;
  while (!fs.existsSync(file)) {
    if (fixture.exitCode !== null || fixture.signalCode !== null)
      throw new Error('The native application fixture exited before readiness.');
    if (Date.now() >= deadline) throw new Error('The native application fixture did not report readiness.');
    await delay(50);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
