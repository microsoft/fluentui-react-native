const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { expectRunnerResponseLoss } = require('./nativeRunnerSupport.cjs');

async function main() {
  const mode = process.argv[2];
  const packageRoot = path.resolve(__dirname, '../..');
  const lib = (name) => pathToFileURL(path.join(packageRoot, 'lib', name)).href;
  const { DesktopSupervisor } = await import(lib('supervisor.js'));
  const { DesktopRunReporter } = await import(lib('reporting/collector.js'));
  const { createManagedDesktopHostResource } = await import(lib('managedHost.js'));
  const { connectDesktopSupervisor, createDesktopSupervisorConnector, defaultSupervisorDescriptor } = await import(
    lib('supervisorConnection.js')
  );
  const { runDesktopWdioSuite } = await import(lib('wdio/run.js'));
  const { createDesktopRunnerBroker } = await import(lib('wdio/runnerConnection.js'));
  const { resolveDesktopScopeDomains } = await import('@fluentui-react-native/desktop-driver/authoring');
  const { publishConnectionDescriptor } = await import('@fluentui-react-native/desktop-driver/authority');
  const { FakeDesktopHost } = await import('@fluentui-react-native/desktop-driver/testing');
  const { createDesktopDriverClient, DesktopDriverClient } = await import('@fluentui-react-native/desktop-driver/client');
  const managed = mode === 'managed' || mode === 'managed-mcp' || mode === 'managed-drain-failure';
  const artifacts = path.join(packageRoot, 'artifacts', 'runner-contracts');
  fs.mkdirSync(artifacts, { recursive: true });
  const root = fs.mkdtempSync(path.join(artifacts, 'runner-contract-'));
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
  const identity = /** @type {const} */ ({
    platform: 'windows',
    pid: process.pid,
    startedAt: 'test-process-start',
    executablePath: 'C:\\fixture\\node.exe',
    interactiveSession: 'test-session',
  });
  const verifyService = async () => true;
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
        return publishConnectionDescriptor(storage, connection.descriptor, {
          version: 1,
          url: connection.url,
          grant: connection.grant,
          service: { ...identity, incarnation: connection.incarnation },
        });
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
    path.join(root, 'credential-child.cjs'),
    `const assert = require('node:assert/strict');
for (const name of ['DESKTOP_WDIO_BROKER_URL', 'DESKTOP_WDIO_BROKER_TOKEN', 'DESKTOP_WDIO_WORKER_TOKEN']) {
  assert(!Object.hasOwn(process.env, name), 'A child inherited runner credentials.');
}
process.stdout.write('credentials-private');
`,
  );
  const hooks = path.join(root, 'hooks.mjs');
  fs.writeFileSync(
    hooks,
    `import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const probe = () => {
  assert.equal(execFileSync(process.execPath, [fileURLToPath(new URL('./credential-child.cjs', import.meta.url))], { encoding: 'utf8' }), 'credentials-private');
};
probe();
export default { onPrepare: probe, onWorkerStart: probe, onWorkerEnd: probe, beforeSession: probe };
`,
  );
  fs.writeFileSync(
    spec,
    mode === 'worker-crash'
      ? "describe('crashed worker', () => { it('leaves its session for the parent to drain', () => { process.exit(17); }); });"
      : managed
        ? [
            "import { desktopIt } from '@fluentui-react-native/desktop-test/jasmine';",
            "desktopIt('uses a managed worker-owned session', async () => {",
            "  for (const name of ['DESKTOP_WDIO_BROKER_URL', 'DESKTOP_WDIO_BROKER_TOKEN', 'DESKTOP_WDIO_WORKER_TOKEN']) {",
            '    expect(Object.hasOwn(process.env, name)).toBeFalse();',
            '  }',
            "  expect(await (await browser.$('~button-primary')).isDisplayed()).toBeTrue();",
            '});',
          ].join('\n')
        : [
            "import { execFileSync } from 'node:child_process';",
            "import { fileURLToPath } from 'node:url';",
            "describe('protected runner', () => {",
            "  it('uses the worker-owned native session', async () => {",
            "    for (const name of ['DESKTOP_WDIO_BROKER_URL', 'DESKTOP_WDIO_BROKER_TOKEN', 'DESKTOP_WDIO_WORKER_TOKEN']) {",
            '      expect(Object.hasOwn(process.env, name)).toBeFalse();',
            '    }',
            '    const credential = /fdg1\\.[0-9a-f]{32}\\.[A-Za-z0-9_-]{43}/;',
            '    expect(credential.test(JSON.stringify(browser.options))).toBeFalse();',
            '    expect(credential.test(JSON.stringify(browser.capabilities))).toBeFalse();',
            "    const child = execFileSync(process.execPath, [fileURLToPath(new URL('./credential-child.cjs', import.meta.url))], { encoding: 'utf8' });",
            "    expect(child).toBe('credentials-private');",
            "    console.log('child credential isolation confirmed');",
            "    expect(await (await browser.$('~button-primary')).isDisplayed()).toBeTrue();",
            '  });',
            '});',
          ].join('\n'),
  );
  const config = {
    config: {
      schemaVersion: 1,
      targets: { win32: target },
      suites: { fixture: { kind: 'wdio', framework: 'jasmine', specs: [spec], hooks, agent: { lanes: ['physical'] } } },
    },
    projectRoot: packageRoot,
    configPath: target.configPath,
    targets: { win32: target },
    reporting: { artifactsRoot: root },
    testScopes: resolveDesktopScopeDomains(),
  };
  let client;
  let management;
  let mcpOutput = '';
  const revoke = DesktopDriverClient.prototype.revokeConnection;
  const request = DesktopDriverClient.prototype.request;
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
    await expectRunnerResponseLoss({
      acquire: () => createDesktopRunnerBroker({ connection, targetId: target.id, addSecret: (secret) => run.addSecret(secret) }),
      whileReserved: () => assert.rejects(client.newSession(capabilities), { code: 'session not created' }),
    });
    let failure;
    let reportRoot = run.root;
    if (managed) {
      let controlPrincipal;
      if (mode === 'managed-drain-failure') {
        DesktopDriverClient.prototype.request = async function (...args) {
          const value = await request.apply(this, args);
          if (args[1] === '/furn/grants/runner-connection') controlPrincipal = value.token.split('.')[1];
          return value;
        };
        DesktopDriverClient.prototype.revokeConnection = async function (...args) {
          if (this.principalId === controlPrincipal) throw new Error('Injected runner drain failure.');
          return revoke.apply(this, args);
        };
      }
      const manager = createManagedDesktopHostResource({
        config,
        target,
        hostLane: 'physical',
        driver: { record: agent.descriptor, url: agent.url, runnerRecord: workload.descriptor },
        addSecret: (secret) => serviceReport.addSecret(secret),
        onFailure: (error) => service.services.fail(error),
        openEnvironment: async () => ({
          storage,
          verifyService,
          identity,
          driver: {
            record: agent.descriptor,
            digest: createHash('sha256').update(records.get(agent.descriptor)).digest('hex'),
            incarnation: agent.incarnation,
            targetId: target.id,
            url: agent.url,
          },
        }),
      });
      await service.services.contribute([manager.resource], { targetId: target.id, targetInstanceId: target.instanceId });
      assert.equal(manager.descriptor, defaultSupervisorDescriptor);
      if (mode === 'managed-mcp') {
        const mcpRoot = path.resolve(packageRoot, '../desktop-mcp');
        const mcpRequire = createRequire(path.join(mcpRoot, 'package.json'));
        const { createDesktopMcpServer } = await import(pathToFileURL(path.join(mcpRoot, 'lib/server.js')).href);
        const { Client } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/sdk/client/index.js')).href);
        const { InMemoryTransport } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/sdk/inMemory.js')).href);
        const server = createDesktopMcpServer({
          mode: 'supervisor',
          connector: createDesktopSupervisorConnector({ storage, verifyService }),
          version: 'test',
        });
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        await server.connect(serverTransport);
        const mcp = new Client({ name: 'managed-runner-contract', version: '1.0.0' });
        await mcp.connect(clientTransport);
        const call = async (name, args) => {
          const result = await mcp.callTool({ name, arguments: args });
          mcpOutput += JSON.stringify(result);
          assert(!result.isError, 'MCP tool failed');
          assert.equal(result.content[0].type, 'text');
          return JSON.parse(result.content[0].text);
        };
        const opened = await call('desktop_session', { action: 'open', target: target.id });
        assert(opened.id, 'MCP opens the verified driver session');
        assert.deepEqual(await call('desktop_session', { action: 'relinquish' }), { relinquished: true });
        management = {
          request: (input) => call('desktop_workload', input),
          close: async () => {
            await mcp.close();
            await server.close();
          },
        };
      } else {
        management = await connectDesktopSupervisor({ storage, verifyService });
      }
      const catalog = await management.request({ action: 'catalog' });
      assert.deepEqual(catalog.catalog, [{ id: 'fixture', kind: 'wdio', lanes: ['physical'] }]);
      const accepted = await management.request({
        action: 'run',
        workload: 'fixture',
        lane: 'physical',
        requestId: 'managed-fixture',
      });
      let settled;
      for (let attempt = 0; attempt < 300; attempt++) {
        const status = await management.request({ action: 'status', handle: accepted.run.handle, waitMs: 1000 });
        if (status.run.phase === 'settled') {
          settled = status;
          break;
        }
      }
      assert(settled, 'the managed workload must settle');
      assert.equal(settled.run.outcome, mode === 'managed-drain-failure' ? 'failed' : 'passed', JSON.stringify(settled));
      assert.equal(settled.run.cleanup, mode === 'managed-drain-failure' ? 'failed' : 'settled', JSON.stringify(settled));
      assert.equal(settled.availability, mode === 'managed-drain-failure' ? 'fenced' : 'available', JSON.stringify(settled));
      const results = await management.request({ action: 'results', handle: accepted.run.handle, category: 'status' });
      assert.equal(results.terminal, true);
      assert.deepEqual(results.lane, { input: 'physical', source: 'management', policyEnforced: true });
      const report = fs.readdirSync(root, { withFileTypes: true }).find((entry) => {
        const filename = path.join(root, entry.name, 'run.json');
        return (
          entry.isDirectory() && fs.existsSync(filename) && JSON.parse(fs.readFileSync(filename, 'utf8')).lane?.source === 'management'
        );
      });
      assert(report, 'the managed run must own a separate report');
      reportRoot = path.join(root, report.name);
      if (mode !== 'managed-drain-failure') await management.close();
      else {
        await assert.rejects(
          management.request({ action: 'run', workload: 'fixture', lane: 'physical', requestId: 'after-failed-drain' }),
          { code: 'unavailable' },
        );
        await assert.rejects(client.newSession(capabilities), { code: 'session not created' });
      }
    } else {
      try {
        await runDesktopWdioSuite(runner, config, 'fixture', undefined, { connection });
      } catch (error) {
        failure = error;
        if (mode === 'worker-crash') run.fail(error);
      }
      if (mode === 'worker-crash') assert(failure, 'a crashed worker must fail its run');
      else assert.equal(failure, undefined, `${failure?.stack}\n${output}`);
    }
    assert.equal(attached, mode === 'managed-mcp' ? 3 : 2);
    assert.equal(closed, mode === 'managed-mcp' ? 3 : 2, 'the parent must confirm deletion even when the worker crashes');
    await assert.rejects(session.getWindowHandles(), { code: 'unauthorized' });
    if (mode !== 'managed-drain-failure') {
      const next = await (await client.delegateConnection()).newSession(capabilities);
      await next.delete();
    }
    assert(fs.existsSync(path.join(locks, 'interactive.lock')), 'runner cleanup must not release the service claim');
    await runner.close();
    const result = await run.finish();
    if (!managed) assert.equal(result.status, mode === 'worker-crash' ? 'failed' : 'passed', JSON.stringify(result));
    const grantPattern = /fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}/;
    assert(!grantPattern.test(output), 'no grant reaches reporter output');
    assert(!grantPattern.test(mcpOutput) && !/dm[gp]1\.[A-Za-z0-9_-]{43}/.test(mcpOutput), 'no credential reaches MCP output');
    let retained = '';
    for (const entry of fs.readdirSync(reportRoot, { recursive: true, withFileTypes: true })) {
      if (entry.isFile()) {
        const content = fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8');
        retained += content;
        assert(!grantPattern.test(content), `no grant reaches ${entry.name}`);
      }
    }
    if (mode === 'handoff') assert(retained.includes('child credential isolation confirmed'), 'the spec child credential scan executed');
    DesktopDriverClient.prototype.revokeConnection = revoke;
    DesktopDriverClient.prototype.request = request;
    if (mode === 'managed-drain-failure') await assert.rejects(service.close());
    else await service.close();
    await serviceReport.finish();
    assert.equal(fs.existsSync(path.join(locks, 'interactive.lock')), mode === 'managed-drain-failure');
    assert(!records.has(defaultSupervisorDescriptor), 'management discovery is withdrawn before driver teardown');
    process.stdout.write(JSON.stringify({ mode, passed: true }));
  } finally {
    DesktopDriverClient.prototype.revokeConnection = revoke;
    DesktopDriverClient.prototype.request = request;
    await management?.close().catch(() => undefined);
    await runner.close();
    await service.close().catch((error) => {
      if (mode !== 'managed-drain-failure') throw error;
    });
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
