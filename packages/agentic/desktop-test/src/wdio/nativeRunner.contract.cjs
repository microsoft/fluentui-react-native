const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { pathToFileURL } = require('node:url');
const {
  nativeRunnerCaptureEnabled,
  nativeRunnerCapture,
  nativeRunnerEnabled,
  nativeRunnerFixture,
  waitForNativeFixture,
  nativeRunnerRecords,
  removeNativeRunnerDescriptors,
  nativeRunnerExecution,
  runNativeRunnerCase,
} = require('./nativeRunnerSupport.cjs');

async function main() {
  const mode = process.argv[2];
  assert(nativeRunnerEnabled(process.platform, process.env), 'Native runner contracts require the supported host and explicit opt-ins.');
  assert(
    ['handoff', 'operator-preempt', 'worker-crash', 'lost-response', 'capture', 'cleanup'].includes(mode),
    'Unknown native runner scenario.',
  );
  if (mode === 'capture')
    assert(nativeRunnerCaptureEnabled(process.platform, process.env), 'Capture is unavailable under this host policy.');
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
  const { NativeDesktopHost, resolveNativeDesktopDriver } = await import('@fluentui-react-native/desktop-driver');
  const { createMacOSApplicationProbe, createMacOSPrivateStorage, createWindowsApplicationProbe, createWindowsPrivateStorage } =
    await import('@fluentui-react-native/desktop-driver/authority');
  if (mode === 'cleanup') {
    const root = process.argv[3];
    const parent = path.join(repositoryRoot, 'artifacts', 'desktop', 'f11');
    assert.equal(path.dirname(root), parent, 'cleanup must name a parent-owned native case root');
    assert(/^native-(handoff|operator-preempt|worker-crash|lost-response|capture)-/.test(path.basename(root)));
    const ownerPid = Number(process.argv[4]);
    assert(Number.isSafeInteger(ownerPid) && ownerPid > 0, 'cleanup requires the exited child PID');
    const { privateRoot, agentDescriptor, runnerDescriptor } = nativeRunnerRecords(process.platform, root);
    const artifact = await resolveNativeDesktopDriver({
      platform: process.platform === 'win32' ? 'windows' : 'macos',
      buildPolicy: 'never',
    });
    const storage =
      process.platform === 'win32' ? await createWindowsPrivateStorage({ artifact }) : await createMacOSPrivateStorage(privateRoot);
    const result = await removeNativeRunnerDescriptors(storage, [agentDescriptor, runnerDescriptor], ownerPid);
    process.stdout.write(JSON.stringify(result));
    if (result.retained.length) process.exitCode = 1;
    return;
  }
  const { connectWithDescriptor } = await import(pathToFileURL(path.join(mcpRoot, 'lib/connection.js')).href);
  const { createDesktopDriverMcpServer } = await import(pathToFileURL(path.join(mcpRoot, 'lib/server.js')).href);
  const { Client } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/sdk/client/index.js')).href);
  const { InMemoryTransport } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/sdk/inMemory.js')).href);
  const parent = path.join(repositoryRoot, 'artifacts', 'desktop', 'f11');
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  const root = process.argv[3] ?? fs.mkdtempSync(path.join(parent, `native-${mode}-`));
  assert.equal(path.dirname(root), parent, 'native case artifacts must stay in the dedicated contract directory');
  assert(path.basename(root).startsWith(`native-${mode}-`), 'the parent must provide a case-specific artifact root');
  const evidence = {
    mode,
    passed: false,
    revision: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, encoding: 'utf8' }).stdout.trim(),
    endpoint: process.platform === 'win32' ? 'win32' : 'macos',
    fixturePreserved: false,
    descriptorsRemoved: false,
    claimReleased: false,
    cleanupConfirmed: false,
  };
  let output = '';
  const sink = { write: (chunk) => ((output += chunk.toString()), true) };
  const reporting = (kind) => new DesktopRunReporter({ artifactsRoot: root, kind, output: sink, errorOutput: sink, summary: false });
  // Windows validates every storage ancestor; project scratch need not be owner-only. Use unique records in its
  // validated default store, not an ACL repair or a copy of the descriptors into artifacts.
  const windows = process.platform === 'win32';
  const { privateRoot, agentDescriptor, runnerDescriptor } = nativeRunnerRecords(process.platform, root);
  const locks = path.join(root, 'locks');
  const ready = path.join(root, 'fixture.ready');
  const fixturePlan = nativeRunnerFixture(
    process.platform,
    fs.realpathSync(process.env.FURN_NATIVE_HANDOFF_APP_PATH),
    path.basename(root),
    ready,
    { capture: mode === 'capture' },
  );
  const artifact = await resolveNativeDesktopDriver({ platform: fixturePlan.endpoint, buildPolicy: 'never' });
  const storage = windows ? await createWindowsPrivateStorage({ artifact }) : undefined;
  const probeApplication = windows ? createWindowsApplicationProbe({ artifact }) : createMacOSApplicationProbe({ artifact });
  const serviceReport = reporting('lifecycle');
  const run = reporting('tests');
  evidence.fixture = fixturePlan.application;
  evidence.helper = { artifactId: artifact.artifactId, sourceDigest: artifact.sourceDigest, provider: artifact.provider };
  let fixture;
  const target = {
    endpoint: fixturePlan.endpoint,
    host: {
      kind: 'installed',
      ownership: 'external',
      application: fixturePlan.application,
    },
    id: windows ? path.basename(root) : 'native-runner-attached',
    instanceId: windows ? path.basename(root) : 'native-runner-attached',
    projectRoot: packageRoot,
    configPath: path.join(root, 'desktop.config.mjs'),
  };
  const service = new DesktopSupervisor({
    target,
    reporter: serviceReport,
    lockDirectory: locks,
    input: 'accessible',
    recovery: { root: privateRoot },
    agent: { root: privateRoot, descriptor: agentDescriptor, runner: { descriptor: runnerDescriptor, allowPreempt: true } },
  });
  const runner = new DesktopSupervisor({ target, reporter: run, lockDirectory: locks });
  const modelResults = [];
  let client;
  let server;
  let cleanup;
  let incarnation;
  let completed;
  let readinessWork;
  let runFinished = false;
  let readinessDisposed = !windows;
  const shutdown = () =>
    (cleanup ??= (async () => {
      const failures = [];
      for (const close of [
        async () => {
          try {
            await readinessWork;
          } catch (error) {
            if (!readinessDisposed) throw error;
          }
        },
        async () => client?.close(),
        async () => server?.close(),
        () => runner.close(),
        async () => completed,
        () => service.close(),
      ]) {
        try {
          await close();
        } catch (error) {
          failures.push(error);
        }
      }
      try {
        evidence.fixturePreserved =
          fixture !== undefined &&
          fixture.exitCode === null &&
          fixture.signalCode === null &&
          (incarnation === undefined || (await probeApplication(incarnation)) === 'running');
        evidence.descriptorsRemoved = storage
          ? (await storage.read(agentDescriptor)) === undefined && (await storage.read(runnerDescriptor)) === undefined
          : !fs.existsSync(path.join(privateRoot, agentDescriptor)) && !fs.existsSync(path.join(privateRoot, runnerDescriptor));
      } catch (error) {
        failures.push(error);
      }
      evidence.claimReleased = !fs.existsSync(path.join(locks, 'interactive.lock'));
      if (fixture?.pid !== undefined && fixture.exitCode === null && fixture.signalCode === null) {
        try {
          const exited = once(fixture, 'exit', { signal: AbortSignal.timeout(5_000) });
          fixture.kill('SIGTERM');
          await exited;
        } catch (error) {
          failures.push(error);
        }
      }
      evidence.fixtureExited = fixture?.pid === undefined || fixture.exitCode !== null || fixture.signalCode !== null;
      if (incarnation && evidence.fixtureExited) {
        try {
          assert.equal(await probeApplication(incarnation), 'exited');
        } catch (error) {
          failures.push(error);
        }
      }
      for (const report of [run, serviceReport]) {
        try {
          if (failures.length && (report !== run || !runFinished)) report.fail(new Error('Native fixture cleanup was not confirmed.'));
          const result = await report.finish();
          if (report === run) runFinished = true;
          assert.equal(result.terminal, true);
          evidence[report === run ? 'run' : 'serviceRun'] = { id: result.runId, status: result.status, counts: result.counts };
        } catch (error) {
          failures.push(error);
        }
      }
      evidence.readinessHelperDisposed = readinessDisposed;
      evidence.cleanupConfirmed =
        readinessDisposed && failures.length === 0 && evidence.fixtureExited && evidence.descriptorsRemoved && evidence.claimReleased;
      fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence, null, 2), { mode: 0o600 });
      if (failures.length) throw new AggregateError(failures, 'Native handoff fixture cleanup failed.');
    })());
  async function execute(signal) {
    fixture = spawn(fixturePlan.executable, fixturePlan.args, { stdio: 'ignore', windowsHide: true });
    fixture.once('error', () => undefined);
    if (windows) {
      readinessWork = waitForNativeFixture({
        host: new NativeDesktopHost({ artifact, application: fixturePlan.application, endpoint: fixturePlan.endpoint }),
        target,
        fixture,
        statusId: fixturePlan.statusId,
        signal,
        onDisposed: () => {
          readinessDisposed = true;
        },
      });
      incarnation = await readinessWork;
      evidence.readiness = 'native exact executable/title/PID and Ready control';
    } else {
      await waitFor(ready, fixture, signal);
      assert.equal(Number(fs.readFileSync(ready, 'utf8')), fixture.pid);
      evidence.readiness = 'fixture ready-file/PID';
    }
    await service.start();
    evidence.descriptorPublished = true;
    const connection = await connectDesktopRunner({ descriptor: runnerDescriptor, root: privateRoot });
    server = createDesktopDriverMcpServer({
      connect: connectWithDescriptor({ descriptor: agentDescriptor, root: privateRoot }),
      version: '0.0.0-native-contract',
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'native-handoff-contract', version: '1.0.0' });
    await client.connect(clientTransport);
    const call = async (name, args = {}) => {
      signal.throwIfAborted();
      const result = await client.callTool({ name, arguments: args }, undefined, { signal });
      signal.throwIfAborted();
      modelResults.push(result);
      return result;
    };
    const json = (reply) => {
      assert(!reply.isError, JSON.stringify(reply));
      return JSON.parse(reply.content.find(({ type }) => type === 'text').text);
    };
    const status = json(await call('desktop_session'));
    assert.deepEqual(status.targets.find(({ id }) => id === target.id).launchModes, ['attach']);
    assert((await call('desktop_session', { action: 'open', target: target.id, launch: true })).isError);
    evidence.attachOnly = true;
    const original = json(await call('desktop_session', { action: 'open', target: target.id }));
    const originalLease = service.server.sessions.get(original.id).lease;
    assert.equal(originalLease.processId, fixture.pid);
    if (incarnation) assert.equal(originalLease.processStartedAt, incarnation.processStartedAt);
    incarnation = { processId: originalLease.processId, processStartedAt: originalLease.processStartedAt };
    assert.equal(await probeApplication(incarnation), 'running');
    evidence.incarnation = incarnation;
    evidence.nativeSessionOpened = true;
    const observed = json(await call('desktop_observe', { observe: { budget: { maxNodes: 1 } } })).result;
    assert(observed.next);
    const found = json(await call('desktop_observe', { find: { automationId: fixturePlan.activateId } })).result;
    assert.equal(found.matches.length, 1);
    const stale = found.matches[0].ref;
    let captured;
    if (!windows || mode === 'capture') {
      const capture = await nativeRunnerCapture({
        enabled: nativeRunnerCaptureEnabled(process.platform, process.env),
        capture: () => call('desktop_capture'),
      });
      captured = capture.artifact;
      evidence.capture = capture.status;
      if (capture.skipped) {
        evidence.captureSkipped = true;
        evidence.captureSkipReason = capture.reason;
      }
    } else {
      evidence.capture = nativeRunnerCaptureEnabled(process.platform, process.env)
        ? 'not run (separate capture case)'
        : 'skipped (host input policy)';
    }
    await runner.open(false);
    await assert.rejects(
      createDesktopRunnerBroker({ connection, targetId: target.id, addSecret: (secret) => run.addSecret(secret), signal }),
      {
        code: 'session not created',
      },
    );
    evidence.defaultBusy = true;
    if (mode !== 'operator-preempt') {
      assert.deepEqual(json(await call('desktop_session', { action: 'relinquish' })), { relinquished: true });
      assert.throws(() => service.server.sessions.get(original.id), { code: 'invalid session id' });
    }
    if (mode === 'lost-response') {
      const fetcher = globalThis.fetch;
      let dropped = false;
      globalThis.fetch = async (input, init) => {
        const response = await fetcher(input, init);
        if (String(input).endsWith('/furn/grants/runner') && response.status === 200) {
          dropped = true;
          await response.body?.cancel();
          const busy = await call('desktop_session', { action: 'open', target: target.id });
          assert(busy.isError);
          assert.equal(JSON.parse(busy.content[0].text).reason, 'target-busy');
          throw new Error('Injected runner acquisition response loss.');
        }
        return response;
      };
      try {
        await assert.rejects(
          createDesktopRunnerBroker({ connection, targetId: target.id, addSecret: (secret) => run.addSecret(secret), signal }),
          {
            message: 'Injected runner acquisition response loss.',
          },
        );
      } finally {
        globalThis.fetch = fetcher;
      }
      assert(dropped, 'the fault must discard a real successful runner-grant response');
      const recovered = json(await call('desktop_session', { action: 'open', target: target.id }));
      assert.notEqual(recovered.id, original.id);
      json(await call('desktop_session', { action: 'close' }));
      assert.throws(() => service.server.sessions.get(recovered.id), { code: 'invalid session id' });
      evidence.lostResponseDrained = true;
    }
    const spec = path.join(packageRoot, 'fixtures', 'native-runner', 'spec.mjs');
    process.env.FURN_NATIVE_HANDOFF_RUN_ROOT = root;
    process.env.FURN_NATIVE_HANDOFF_JASMINE_MODULE = lib('jasmine/index.js');
    process.env.FURN_NATIVE_HANDOFF_MODE = mode;
    process.env.FURN_NATIVE_HANDOFF_STATUS_ID = fixturePlan.statusId;
    process.env.FURN_NATIVE_HANDOFF_ACTIVATE_ID = fixturePlan.activateId;
    const config = {
      config: {
        schemaVersion: 1,
        targets: { [target.endpoint]: target },
        suites: { fixture: { kind: 'wdio', framework: 'jasmine', specs: [spec] } },
      },
      projectRoot: packageRoot,
      configPath: target.configPath,
      targets: { [target.endpoint]: target },
      reporting: { artifactsRoot: root },
      testScopes: resolveDesktopScopeDomains(),
    };
    completed = runDesktopWdioSuite(runner, config, 'fixture', 'accessible', { connection, preempt: mode === 'operator-preempt' }).then(
      () => undefined,
      (error) => error,
    );
    if (mode !== 'worker-crash') {
      await waitFor(path.join(root, 'worker.ready'), fixture, signal);
      if (mode === 'operator-preempt') {
        const old = await call('desktop_check', { ref: stale, expect: { enabled: true } });
        assert(old.isError);
        assert.equal(JSON.parse(old.content[0].text).reason, 'service-unavailable');
        assert.throws(() => service.server.sessions.get(original.id), { code: 'invalid session id' });
        evidence.operatorPreempted = true;
      }
      const busy = await call('desktop_session', { action: 'open', target: target.id });
      assert(busy.isError);
      assert.equal(JSON.parse(busy.content[0].text).reason, 'target-busy');
      fs.writeFileSync(path.join(root, 'worker.continue'), 'continue');
      evidence.noConcurrentMcp = true;
    }
    const failure = await completed;
    if (mode === 'worker-crash') {
      assert(failure, 'the crashed native worker must fail its run');
      assert(fs.existsSync(path.join(root, 'worker.session.json')), 'the crash must occur in a worker that opened its native session');
      run.fail(failure);
    } else assert.equal(failure, undefined, failure?.stack);
    const worker = JSON.parse(fs.readFileSync(path.join(root, 'worker.session.json'), 'utf8'));
    assert.equal(typeof worker.sessionId, 'string');
    assert.throws(() => service.server.sessions.get(worker.sessionId), { code: 'invalid session id' });
    evidence.worker = worker;
    evidence.workerDrained = true;
    const fresh = json(await call('desktop_session', { action: 'open', target: target.id }));
    assert.notEqual(fresh.id, original.id);
    assert.notEqual(fresh.id, worker.sessionId);
    const freshLease = service.server.sessions.get(fresh.id).lease;
    assert.equal(freshLease.processId, incarnation.processId);
    assert.equal(freshLease.processStartedAt, incarnation.processStartedAt);
    const checked = await call('desktop_check', { ref: stale, expect: { enabled: true } });
    assert(checked.isError);
    const page = await call('desktop_observe', { read: { cursor: observed.next } });
    assert(page.isError);
    assert.equal(JSON.parse(page.content[0].text).reason, 'observation-cursor-expired');
    const acted = json(await call('desktop_act', { steps: [{ act: { action: 'activate', ref: stale, sample: found.sample.id } }] }));
    assert.equal(acted.result.status, 'stopped');
    if (captured) await assert.rejects(client.readResource({ uri: captured.uri }, { signal }));
    evidence.staleResourcesRejected = true;
    json(await call('desktop_session', { action: 'close' }));
    await runner.close();
    assert(fs.existsSync(path.join(locks, 'interactive.lock')));
    const grantPattern = /fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}/;
    assert(!grantPattern.test(JSON.stringify(modelResults)));
    assert(!grantPattern.test(output));
    const result = await run.finish();
    runFinished = true;
    assert.equal(result.terminal, true);
    assert.equal(result.status, mode === 'worker-crash' ? 'failed' : 'passed');
    evidence.wdio = nativeRunnerExecution(result.counts, mode);
    for (const report of [run, serviceReport]) {
      for (const entry of fs.readdirSync(report.root, { recursive: true, withFileTypes: true })) {
        if (entry.isFile()) assert(!grantPattern.test(fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8')));
      }
    }
    evidence.credentialsConfined = true;
  }
  const stop = new AbortController();
  const terminate = () => stop.abort(new Error('Native runner case interrupted.'));
  process.once('SIGTERM', terminate);
  const deadline = await runNativeRunnerCase({
    signal: stop.signal,
    shutdown,
    work: execute,
    onAbort(reason) {
      runner.services.fail(reason);
      service.services.fail(reason);
    },
    onError(error) {
      evidence.error ??= (error instanceof Error ? error.message : 'Native handoff fixture failed.').replace(
        /fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}/g,
        '[redacted]',
      );
      if (!runFinished) run.fail(error);
    },
  });
  process.removeListener('SIGTERM', terminate);
  evidence.deadline = deadline;
  if (deadline.cleanupTimedOut) evidence.cleanupConfirmed = false;
  evidence.passed = !evidence.error && evidence.fixturePreserved && evidence.cleanupConfirmed;
  fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence, null, 2), { mode: 0o600 });
  await new Promise((resolve) =>
    process.stdout.write(
      JSON.stringify({
        mode,
        passed: evidence.passed,
        cleanupConfirmed: evidence.cleanupConfirmed,
        capture: evidence.capture,
        captureSkipped: evidence.captureSkipped,
        captureSkipReason: evidence.captureSkipReason,
        evidence: path.join(root, 'evidence.json'),
      }),
      resolve,
    ),
  );
  if (!evidence.passed) process.exit(1);
  setTimeout(() => {
    evidence.error = 'Native contract process remained alive after shutdown.';
    evidence.passed = false;
    evidence.cleanupConfirmed = false;
    fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence, null, 2), { mode: 0o600 });
    process.exit(1);
  }, 5_000).unref();
}

async function waitFor(file, fixture, signal) {
  const deadline = AbortSignal.any([signal, AbortSignal.timeout(60_000)]);
  while (!fs.existsSync(file)) {
    if (fixture.pid === undefined || fixture.exitCode !== null || fixture.signalCode !== null)
      throw new Error('The native application fixture exited before readiness.');
    deadline.throwIfAborted();
    await delay(50, undefined, { signal: deadline });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
