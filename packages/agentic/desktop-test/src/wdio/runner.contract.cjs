const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');

async function main() {
  const mode = process.argv[2];
  const packageRoot = path.resolve(__dirname, '../..');
  const lib = (name) => pathToFileURL(path.join(packageRoot, 'lib', name)).href;
  const { DesktopSupervisor } = await import(lib('supervisor.js'));
  const { DesktopRunReporter } = await import(lib('reporting/collector.js'));
  const { runDesktopWdioSuite } = await import(lib('wdio/run.js'));
  const { createDesktopRunnerBroker } = await import(lib('wdio/runnerConnection.js'));
  const { resolveDesktopScopeDomains } = await import('@fluentui-react-native/desktop-driver/authoring');
  const { FakeDesktopHost } = await import('@fluentui-react-native/desktop-driver/testing');
  const { createDesktopDriverClient } = await import('@fluentui-react-native/desktop-driver/client');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'runner-contract-'));
  let output = '';
  const sink = { write: (chunk) => ((output += chunk.toString()), true) };
  const reporting = (kind) => new DesktopRunReporter({ artifactsRoot: root, kind, output: sink, errorOutput: sink, summary: false });
  const serviceReport = reporting('lifecycle');
  const run = reporting('tests');
  const target = {
    endpoint: 'win32',
    host: { kind: 'installed', ownership: 'external', application: { windowTitle: 'fake' }, renderer: 'paper' },
    id: 'runner-attached',
    instanceId: 'runner-attached',
    projectRoot: packageRoot,
    configPath: path.join(root, 'desktop.config.mjs'),
  };
  const records = new Map();
  const storage = {
    read: async (name) => records.get(name),
    publish: async (name, value) => {
      assert(!records.has(name));
      records.set(name, value);
    },
    remove: async (name, value) => records.get(name) === value && records.delete(name),
  };
  const published = [];
  const host = new FakeDesktopHost({ endpoint: 'win32', features: { boundedObservation: true } });
  let attached = 0;
  let closed = 0;
  const attach = host.attach.bind(host);
  host.attach = (...args) => {
    attached++;
    return attach(...args);
  };
  const close = host.closeApplication.bind(host);
  host.closeApplication = (...args) => {
    closed++;
    return close(...args);
  };
  const locks = path.join(root, 'locks');
  const service = new DesktopSupervisor({
    target,
    reporter: serviceReport,
    recovery: { storage },
    lockDirectory: locks,
    hostFactory: async () => host,
    agent: {
      publish: async (connection) => {
        published.push(connection);
        return async () => undefined;
      },
    },
  });
  const runner = new DesktopSupervisor({
    target,
    reporter: run,
    lockDirectory: locks,
    hostFactory: async () => {
      throw new Error('An attached runner must never start a second host.');
    },
  });
  const spec = path.join(root, 'spec.mjs');
  fs.writeFileSync(
    spec,
    mode === 'worker-crash'
      ? "describe('crashed worker', () => { it('leaves its session for the parent to drain', () => { process.exit(17); }); });"
      : [
          "describe('protected runner', () => {",
          "  it('uses the worker-owned native session', async () => {",
          '    const grant = process.env.DESKTOP_WDIO_WORKER_TOKEN;',
          "    expect(typeof grant).toBe('string');",
          '    expect(JSON.stringify(browser.options)).not.toContain(grant);',
          '    expect(JSON.stringify(browser.capabilities)).not.toContain(grant);',
          "    console.log('redaction probe', grant, process.env.DESKTOP_WDIO_BROKER_TOKEN);",
          "    expect(await (await browser.$('~button-primary')).isDisplayed()).toBeTrue();",
          '  });',
          '});',
        ].join('\n'),
  );
  const config = {
    config: { schemaVersion: 1, targets: { win32: target }, suites: { fixture: { kind: 'wdio', framework: 'jasmine', specs: [spec] } } },
    projectRoot: packageRoot,
    configPath: target.configPath,
    targets: { win32: target },
    reporting: { artifactsRoot: root },
    testScopes: resolveDesktopScopeDomains(),
  };
  let client;
  try {
    await service.start();
    assert.equal(published.length, 2, 'generic attach-only services publish separate agent and workload connections');
    const agent = published.find(({ descriptor }) => descriptor === 'agent-connection.json');
    const workload = published.find(({ descriptor }) => descriptor === 'runner-connection.json');
    assert(agent && workload);
    client = createDesktopDriverClient({ grant: agent.grant, url: agent.url });
    const controller = await client.delegateConnection();
    const capabilities = { alwaysMatch: { 'furn:target': target.id, 'furn:launchMode': 'attach' } };
    const session = await controller.newSession(capabilities);
    const connection = { client: createDesktopDriverClient({ grant: workload.grant, url: workload.url }), url: workload.url };
    await runner.open(false);
    assert(fs.existsSync(path.join(locks, 'interactive.lock')), 'the service keeps the one machine claim');
    await assert.rejects(createDesktopRunnerBroker({ connection, targetId: target.id, addSecret: (secret) => run.addSecret(secret) }), {
      code: 'session not created',
      message: /already has an active session/,
    });
    assert.equal(attached, 1, 'a busy request never opens another native session');
    await controller.revokeConnection();
    const fetcher = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const response = await fetcher(input, init);
      if (String(input).endsWith('/furn/grants/runner')) {
        await response.body?.cancel();
        throw new Error('injected runner acquisition response loss');
      }
      return response;
    };
    try {
      await assert.rejects(createDesktopRunnerBroker({ connection, targetId: target.id, addSecret: (secret) => run.addSecret(secret) }));
    } finally {
      globalThis.fetch = fetcher;
    }
    let failure;
    try {
      await runDesktopWdioSuite(runner, config, 'fixture', undefined, { connection });
    } catch (error) {
      failure = error;
      if (mode === 'worker-crash') run.fail(error);
    }
    if (mode === 'worker-crash') assert(failure, 'a crashed worker must fail its run');
    else assert.equal(failure, undefined, `${failure?.stack}\n${output}`);
    assert.equal(attached, 2);
    assert.equal(closed, 2, 'the parent must confirm deletion even when the worker crashes');
    await assert.rejects(session.getWindowHandles(), { code: 'unauthorized' });
    const next = await (await client.delegateConnection()).newSession(capabilities);
    await next.delete();
    assert(fs.existsSync(path.join(locks, 'interactive.lock')), 'runner cleanup must not release the service claim');
    await runner.close();
    const result = await run.finish();
    assert.equal(result.status, mode === 'worker-crash' ? 'failed' : 'passed', JSON.stringify(result));
    const grantPattern = /fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}/;
    assert(!grantPattern.test(output), 'no grant reaches reporter output');
    let retained = '';
    for (const entry of fs.readdirSync(run.root, { recursive: true, withFileTypes: true })) {
      if (entry.isFile()) {
        const content = fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8');
        retained += content;
        assert(!grantPattern.test(content), `no grant reaches ${entry.name}`);
      }
    }
    if (mode === 'handoff') assert(retained.includes('redaction probe [REDACTED]'), 'deliberately printed worker credentials are redacted');
    await service.close();
    await serviceReport.finish();
    assert(!fs.existsSync(path.join(locks, 'interactive.lock')));
    process.stdout.write(JSON.stringify({ mode, passed: true }));
  } finally {
    await runner.close();
    await service.close();
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
