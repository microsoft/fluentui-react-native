const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { Writable } = require('node:stream');
const { spawnSync } = require('node:child_process');

const mode = process.argv[2];
const packageRoot = path.resolve(__dirname, '..');
const lib = (filename) => pathToFileURL(path.join(packageRoot, 'lib', filename)).href;
const capture = () => {
  let text = '';
  return {
    write(chunk) {
      text += chunk.toString();
      return true;
    },
    text: () => text,
  };
};
const waitFor = async (condition) => {
  const start = Date.now();
  while (!condition()) {
    assert(Date.now() - start < 5000, 'fixture deadline exceeded');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

function memoryRecovery() {
  const records = new Map();
  return {
    storage: {
      read: async (name) => records.get(name),
      publish: async (name, contents) => {
        assert(!records.has(name), 'never replace a private record');
        records.set(name, contents);
      },
      remove: async (name, contents) => {
        if (records.get(name) !== contents) return false;
        return records.delete(name);
      },
    },
    records,
  };
}

async function main() {
  const { DesktopRunReporter } = await import(lib('reporting/collector.js'));
  const { NodeDesktopCommandRunner } = await import(lib('commands.js'));
  const { DesktopServiceScope, DesktopStopRequested } = await import(lib('services.js'));
  const { loadDesktopConfig, defineDesktopConfig, resolveDesktopSpecs } = await import(lib('config.js'));
  // Config resolution canonicalizes paths; macOS temporary directories are symlinked (/var -> /private/var).
  const root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-harness-contract-')));
  const out = capture();
  const err = capture();
  const reporter = (options = {}) =>
    new DesktopRunReporter({ artifactsRoot: root, output: out, errorOutput: err, summary: false, ...options });
  const command = (source, label = 'fixture') => ({ command: process.execPath, args: ['-e', source], cwd: root, env: {}, label });
  // Fixture code stays constant; values reach it through process.argv.slice(1) rather than being spliced into the
  // source, which CodeQL reports as improper code sanitization (R-SCAN-002).
  const script = (source, values, label = 'fixture') => ({ ...command(source, label), args: ['-e', source, ...values] });
  try {
    if (mode === 'config') {
      const source = await import(pathToFileURL(path.join(packageRoot, 'src', 'config.ts')).href);
      assert.equal(typeof source.defineDesktopConfig, 'function', 'config must be source-loadable');
      const app = {
        schemaVersion: 1,
        targets: { win32: { host: { kind: 'installed', application: { executablePath: 'app.exe', windowTitle: 'Fixture' } } } },
      };
      assert.throws(() => defineDesktopConfig({ ...app, unrecognized: true }), /Unknown/);
      assert.throws(
        () =>
          defineDesktopConfig({
            ...app,
            integration: {
              name: 'fixture',
              validate() {
                throw new Error('Unexpected config validation.');
              },
              unrecognized: true,
            },
          }),
        /Unknown integration field/,
      );
      assert.throws(
        () => defineDesktopConfig({ ...app, targets: { win32: { use: { config: 'app.mjs', target: 'win32' }, host: {} } } }),
        /ambiguous/,
      );
      fs.mkdirSync(path.join(root, 'app'));
      fs.mkdirSync(path.join(root, 'suite'));
      fs.writeFileSync(path.join(root, 'app', 'desktop.config.mjs'), `export default ${JSON.stringify(app)};`);
      const suite = {
        schemaVersion: 1,
        targets: {
          alias: { use: { config: '../app/desktop.config.mjs', target: 'win32' } },
          aliasTwo: { use: { config: '../app/desktop.config.mjs', target: 'win32' } },
        },
        reporting: { artifactsRoot: 'reports' },
      };
      fs.writeFileSync(path.join(root, 'suite', 'desktop.config.mjs'), `export default ${JSON.stringify(suite)};`);
      const direct = await loadDesktopConfig(path.join(root, 'app', 'desktop.config.mjs'));
      const referred = await loadDesktopConfig(path.join(root, 'suite', 'desktop.config.mjs'));
      assert.notEqual(direct.targets.win32.id, referred.targets.alias.id);
      assert.notEqual(referred.targets.alias.id, referred.targets.aliasTwo.id);
      assert.equal(direct.targets.win32.instanceId, referred.targets.alias.instanceId);
      assert.equal(referred.targets.alias.instanceId, referred.targets.aliasTwo.instanceId);
      assert.equal(referred.targets.alias.host.application.executablePath, path.join(root, 'app', 'app.exe'));
      assert.equal(referred.reporting.artifactsRoot, path.join(root, 'suite', 'reports'));
      fs.writeFileSync(
        path.join(root, 'cycle.mjs'),
        'export default {schemaVersion:1, targets:{win32:{use:{config:"cycle.mjs",target:"win32"}}}}',
      );
      await assert.rejects(loadDesktopConfig(path.join(root, 'cycle.mjs')), /cycle/);
      fs.writeFileSync(path.join(root, 'one.spec.mjs'), '');
      fs.writeFileSync(path.join(root, 'two.spec.mjs'), '');
      assert.deepEqual(resolveDesktopSpecs({ kind: 'wdio', framework: 'jasmine', specs: [['*.spec.mjs']] }, 'win32', root), [
        [path.join(root, 'one.spec.mjs'), path.join(root, 'two.spec.mjs')],
      ]);
      assert.throws(
        () => resolveDesktopSpecs({ kind: 'wdio', framework: 'jasmine', specs: ['missing.*'] }, 'windows', root),
        /refusing reduced coverage/,
      );
    } else if (mode === 'adapters') {
      const { resolveDesktopApplication } = await import(lib('adapters.js'));
      const project = path.join(root, 'app');
      const products = path.join(project, 'macos', 'DerivedData', 'Build', 'Products', 'Debug');
      const contents = path.join(products, 'ReactTestApp.app', 'Contents');
      const embedded = path.join(contents, 'Resources', 'index.macos.jsbundle');
      fs.mkdirSync(project);
      fs.writeFileSync(
        path.join(project, 'app.json'),
        JSON.stringify({
          name: 'Fixture',
          components: [{ appKey: 'fixture', displayName: 'Fixture Window' }],
          resources: { macos: ['dist/assets', 'dist/index.macos.jsbundle'] },
        }),
      );
      const target = (renderer, application) => ({
        endpoint: 'macos',
        projectRoot: project,
        host: { kind: 'react-native-test-app', renderer, application },
      });
      const leasePath = path.join(root, 'lease.json');
      assert.deepEqual(
        { ...(await resolveDesktopApplication(target('paper', { leasePath }))) },
        { bundleIdentifier: 'com.microsoft.ReactTestApp', windowTitle: 'Fixture Window', leasePath },
        'configured identity must not require local build products',
      );
      const rexDirectory = path.join(project, 'node_modules', '@office-iss', 'rex-win32');
      fs.mkdirSync(rexDirectory, { recursive: true });
      fs.writeFileSync(path.join(rexDirectory, 'rex-win32.js'), '');
      const rexTarget = {
        endpoint: 'win32',
        projectRoot: project,
        host: { kind: 'rex', renderer: 'paper', component: 'Fixture', windowTitle: 'Fixture (Win32)' },
      };
      await assert.rejects(resolveDesktopApplication(rexTarget), /REX bundle is missing/);
      assert.deepEqual(
        { ...(await resolveDesktopApplication(rexTarget, undefined, { attach: true })) },
        { executablePath: path.join(fs.realpathSync(rexDirectory), 'ReactTest.exe'), windowTitle: 'Fixture (Win32)' },
        'an attach identity must not require a bundle or carry launch arguments',
      );
      if (process.platform === 'darwin') {
        const writeInfo = ({ identifier = 'com.microsoft.ReactTestApp', newArch = 'false' } = {}) =>
          fs.writeFileSync(
            path.join(contents, 'Info.plist'),
            `<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>${identifier}</string>` +
              `<key>CFBundleExecutable</key><string>ReactTestApp</string>${newArch ? `<key>RCTNewArchEnabled</key><${newArch}/>` : ''}</dict></plist>`,
          );
        await assert.rejects(resolveDesktopApplication(target('paper')), /Built macOS application missing/);
        fs.mkdirSync(path.join(contents, 'MacOS'), { recursive: true });
        fs.mkdirSync(path.join(contents, 'Resources'));
        fs.writeFileSync(path.join(contents, 'MacOS', 'ReactTestApp'), '');
        fs.writeFileSync(embedded, '');
        writeInfo();
        assert.deepEqual(
          { ...(await resolveDesktopApplication(target('paper'))) },
          { executablePath: path.join(contents, 'MacOS', 'ReactTestApp'), windowTitle: 'Fixture Window' },
          'unconfigured identity must launch the exact built product, not a Launch Services bundle-identifier match',
        );
        await assert.rejects(resolveDesktopApplication(target('fabric')), /renderer fabric does not match built paper/);
        writeInfo({ newArch: 'true' });
        assert.equal((await resolveDesktopApplication(target('fabric'))).executablePath, path.join(contents, 'MacOS', 'ReactTestApp'));
        writeInfo({ newArch: '' });
        await assert.rejects(resolveDesktopApplication(target('paper')), /does not declare RCTNewArchEnabled/);
        writeInfo({ identifier: 'com.example.Other' });
        await assert.rejects(resolveDesktopApplication(target('paper')), /expected bundle identifier com\.microsoft\.ReactTestApp/);
        writeInfo();
        fs.rmSync(embedded);
        await assert.rejects(resolveDesktopApplication(target('paper')), /does not embed index\.macos\.jsbundle.*bundle, then prep/);
        fs.writeFileSync(embedded, '');
        fs.mkdirSync(path.join(products, 'Stale.app'));
        await assert.rejects(resolveDesktopApplication(target('paper')), /Expected one built macOS application/);
      }
    } else if (mode === 'reporting') {
      const run = reporter({ secrets: ['secret-value'], console: 'github-actions' });
      run.emit({ kind: 'output', payload: { stream: 'stderr', text: '::error::untrusted secret-value\n' } });
      const error = run.failure(new Error('original secret-value', { cause: new Error('root cause') }), 'test');
      const title = 'retries \u{1f680} <&\u0001';
      run.emit({ kind: 'test-start', payload: { testId: 'retry', title, attempt: 0 } });
      run.emit({
        kind: 'test-result',
        payload: { testId: 'retry', title, attempt: 0, status: 'failed', durationMs: 2, failure: error },
      });
      run.emit({ kind: 'test-start', payload: { testId: 'retry', title, attempt: 1_000_000 } });
      run.emit({ kind: 'test-result', payload: { testId: 'retry', title, attempt: 1_000_000, status: 'passed', durationMs: 3 } });
      const result = await run.finish();
      assert.equal(result.status, 'passed');
      assert.equal(result.counts.flaky, 1);
      assert.equal(result.counts.selected, 1);
      assert.equal(result.counts.retries, 1);
      assert(out.text().includes('(attempt 2)'), 'sparse attempt keys are labeled by ordinal');
      const structuredOut = capture();
      const structuredErr = capture();
      const structured = new DesktopRunReporter({
        artifactsRoot: root,
        output: structuredOut,
        errorOutput: structuredErr,
        reporterMode: 'json',
        kind: 'tests',
      });
      structured.emit({ kind: 'test-start', payload: { testId: 'bounded', title: 'Bounded output', attempt: 0 } });
      structured.emit({
        kind: 'test-result',
        payload: { testId: 'bounded', title: 'Bounded output', attempt: 0, status: 'passed', durationMs: 1 },
      });
      await structured.finish();
      const summaryText = structuredOut.text().trim();
      const summary = JSON.parse(summaryText);
      assert.equal(summary.type, 'summary');
      assert.equal(summary.counts.passed, 1);
      assert.equal(summary.artifacts.runJson, path.join(structured.root, 'run.json'));
      assert(Buffer.byteLength(summaryText) <= 4 * 1024);
      assert.equal(structuredErr.text(), '', 'structured mode suppresses the human presenter');
      const failedOut = capture();
      const failedErr = capture();
      const failedStructured = new DesktopRunReporter({
        artifactsRoot: root,
        output: failedOut,
        errorOutput: failedErr,
        reporterMode: 'json',
        kind: 'tests',
      });
      failedStructured.emit({
        kind: 'test-result',
        payload: {
          testId: 'failed',
          title: 'Failed test',
          attempt: 0,
          status: 'failed',
          durationMs: 1,
          failure: failedStructured.failure(new Error('assertion failed'), 'test'),
        },
      });
      await failedStructured.finish();
      assert.equal(JSON.parse(failedOut.text()).status, 'failed');
      assert.equal(failedErr.text(), '', 'structured test failures do not write human diagnostics to stderr');

      const ndjsonOut = capture();
      const ndjsonErr = capture();
      const ndjson = new DesktopRunReporter({
        artifactsRoot: root,
        output: ndjsonOut,
        errorOutput: ndjsonErr,
        reporterMode: 'ndjson',
        eventLevel: 'milestones',
        kind: 'tests',
      });
      for (let index = 0; index < 10_000; index++) {
        ndjson.emit({ kind: 'test-start', payload: { testId: `passing-${index}`, title: `Passing ${index}`, attempt: 0 } });
        ndjson.emit({
          kind: 'test-result',
          payload: { testId: `passing-${index}`, title: `Passing ${index}`, attempt: 0, status: 'passed', durationMs: 1 },
        });
      }
      await ndjson.finish();
      const records = ndjsonOut
        .text()
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      assert.equal(records[0].type, 'start');
      assert.equal(records[0].runId, ndjson.runId);
      assert.equal(records.at(-1).type, 'summary');
      assert.equal(records.filter((record) => record.type === 'event').length, 1, 'passing tests do not inflate milestone output');
      assert.equal(records.filter((record) => record.type === 'suppressed').length, 1);
      assert.equal(records.at(-1).counts.passed, 10_000);
      assert.equal(ndjsonErr.text(), '');
      assert(!out.text().includes('(attempt 1000001)'));
      const interruptedOut = capture();
      const interrupted = new DesktopRunReporter({
        artifactsRoot: root,
        output: interruptedOut,
        errorOutput: capture(),
        reporterMode: 'ndjson',
        kind: 'tests',
      });
      const interruptedServices = new DesktopServiceScope(
        {
          start: () => {
            throw new Error('not used');
          },
        },
        interrupted,
      );
      interruptedServices.requestStop();
      await assert.rejects(interruptedServices.guard(Promise.resolve()), DesktopStopRequested);
      await interruptedServices.close();
      await interrupted.finish();
      const interruptedRecords = interruptedOut
        .text()
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      assert.equal(interruptedRecords.at(-1).status, 'incomplete');
      assert.equal(
        interruptedRecords.some((record) => record.type === 'event' && record.kind === 'diagnostic' && record.payload.level === 'error'),
        false,
        'user cancellation is not an infrastructure failure',
      );
      const closedError = new Error('consumer closed stdout');
      const closedOut = new Writable({
        write(_chunk, _encoding, callback) {
          callback(closedError);
        },
      });
      const closedErr = capture();
      const closed = new DesktopRunReporter({
        artifactsRoot: root,
        output: closedOut,
        errorOutput: closedErr,
        reporterMode: 'json',
        kind: 'lifecycle',
      });
      const closedResult = await closed.finish();
      assert.equal(closedResult.status, 'passed');
      assert.equal(closedResult.failures.length, 0);
      assert(closedErr.text().includes('Structured output stopped: consumer closed stdout'));
      const closedJournal = fs.readFileSync(path.join(closed.root, 'events.jsonl'), 'utf8');
      assert(closedJournal.includes('"level":"warning"'));
      assert(closedJournal.includes('Structured output stopped: consumer closed stdout'));
      const journal = fs.readFileSync(path.join(run.root, 'events.jsonl'), 'utf8');
      assert(!journal.includes('secret-value'));
      assert(journal.includes('root cause'));
      assert(err.text().includes('::stop-commands::'));
      assert.equal((err.text().match(/::error title=/g) || []).length, 1);
      const junit = fs.readFileSync(path.join(run.root, 'junit.xml'), 'utf8');
      assert(junit.includes('attempt'));
      assert(junit.includes('\u{1f680} &lt;&amp;'));
      assert(!junit.includes('\u0001'));
      const partialStack = reporter({ console: 'github-actions' });
      partialStack.emit({
        kind: 'test-result',
        payload: {
          testId: 'original-message',
          title: 'original message',
          attempt: 0,
          status: 'failed',
          durationMs: 1,
          failure: partialStack.failure({ name: 'TypeError', message: 'original assertion message', stack: '    at fixture:1:2' }, 'test'),
        },
      });
      await partialStack.finish();
      assert(err.text().includes('TypeError: original assertion message\n    at fixture:1:2'));
      assert(err.text().includes('TypeError: original assertion message%0A    at fixture:1:2'));
      for (const optional of [false, true]) {
        const skipped = reporter({ optional });
        skipped.emit({ kind: 'work-selected', payload: { workId: 'unsupported', label: 'unsupported group' } });
        skipped.emit(
          { kind: 'scope-start', payload: { label: 'unsupported group', category: 'worker' } },
          'unsupported',
          undefined,
          'unsupported',
        );
        skipped.emit(
          {
            kind: 'test-result',
            payload: {
              testId: 'skip',
              title: 'skip',
              attempt: 0,
              status: 'unsupported',
              durationMs: 0,
              reason: 'Physical input unavailable.',
            },
          },
          'unsupported',
        );
        skipped.emit({ kind: 'scope-end', payload: { status: 'unsupported' } }, 'unsupported');
        const skippedResult = await skipped.finish();
        assert.equal(skippedResult.work[0].status, 'unsupported');
        assert.equal(skippedResult.status, optional ? 'skipped' : 'incomplete');
      }
      assert.equal((await reporter().finish()).status, 'incomplete');
      const omitted = reporter();
      omitted.emit({ kind: 'work-selected', payload: { workId: 'omitted', label: 'selected group' } });
      omitted.emit({
        kind: 'test-result',
        payload: { testId: 'other', title: 'completed test', attempt: 0, status: 'passed', durationMs: 1 },
      });
      const omittedResult = await omitted.finish();
      assert.equal(omittedResult.status, 'incomplete');
      assert.equal(omittedResult.work[0].status, 'not-run');
      assert(fs.readFileSync(path.join(omitted.root, 'junit.xml'), 'utf8').includes('selected group'));
      const missing = reporter();
      missing.emit({ kind: 'test-start', payload: { testId: 'crash', title: 'crashed', attempt: 0 } });
      assert.equal((await missing.finish()).status, 'incomplete');
      const malformed = reporter({ kind: 'lifecycle' });
      assert.throws(() => malformed.accept({ schemaVersion: 2 }), /Unsupported|Unknown/);
      const source = malformed.source('child');
      source({ kind: 'producer-finished', payload: { status: 'passed' } });
      assert.equal((await malformed.finish()).status, 'passed');
      const stuck = new Writable({
        write(_chunk, _encoding, _callback) {
          // Simulate a sink that never acknowledges its write.
        },
      });
      const slow = reporter({ kind: 'lifecycle', output: stuck, flushTimeoutMs: 20 });
      slow.emit({ kind: 'diagnostic', payload: { level: 'info', message: 'slow sink' } });
      assert.equal((await slow.finish()).status, 'failed');
      stuck.destroy();
      const failedWrite = reporter({ kind: 'lifecycle' });
      const rename = fs.renameSync;
      let fail = true;
      fs.renameSync = (...args) => {
        if (fail && args[1] === path.join(failedWrite.root, 'junit.xml')) {
          fail = false;
          throw new Error('disk fixture');
        }
        return rename(...args);
      };
      try {
        assert.equal((await failedWrite.finish()).status, 'failed');
      } finally {
        fs.renameSync = rename;
      }
      const summaryPath = path.join(root, 'summary.md');
      const priorSummary = process.env.GITHUB_STEP_SUMMARY;
      process.env.GITHUB_STEP_SUMMARY = summaryPath;
      const late = reporter({
        kind: 'lifecycle',
        summary: 'auto',
        output: {
          write(text) {
            if (text.includes('[desktop] PASSED:')) throw new Error('late terminal fixture');
            return true;
          },
        },
      });
      try {
        const final = await late.finish();
        assert.equal(final.status, 'failed');
        assert.equal(JSON.parse(fs.readFileSync(path.join(late.root, 'run.json'), 'utf8')).status, final.status);
        const events = fs
          .readFileSync(path.join(late.root, 'events.jsonl'), 'utf8')
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line));
        assert.equal(events.at(-1).payload.status, final.status);
        assert(fs.readFileSync(summaryPath, 'utf8').includes('failed'));
        assert(fs.readFileSync(path.join(late.root, 'junit.xml'), 'utf8').includes('late terminal fixture'));
      } finally {
        if (priorSummary === undefined) delete process.env.GITHUB_STEP_SUMMARY;
        else process.env.GITHUB_STEP_SUMMARY = priorSummary;
      }
    } else if (mode === 'reporter-cli') {
      const configPath = path.join(root, 'desktop.config.mjs');
      fs.writeFileSync(
        configPath,
        `export default ${JSON.stringify({
          schemaVersion: 1,
          targets: { win32: { host: { kind: 'installed', application: { executablePath: 'app.exe' } } } },
        })};`,
      );
      const response = spawnSync(
        process.execPath,
        [path.join(packageRoot, 'config', 'cli.cjs'), '--config', configPath, '--target', 'missing', '--reporter', 'json', 'prep'],
        { cwd: root, encoding: 'utf8' },
      );
      assert.equal(response.status, 1, response.stderr);
      assert.equal(response.stderr, '');
      assert.deepEqual(JSON.parse(response.stdout), {
        schemaVersion: 1,
        type: 'error',
        error: { code: 'unknown-target', message: 'Unknown target "missing".' },
      });
    } else if (mode === 'commands') {
      const run = reporter({ kind: 'lifecycle', console: 'github-actions' });
      const runner = new NodeDesktopCommandRunner({ reporter: run });
      const running = runner.start(
        command(
          "process.stdout.write('ready\\n'); setTimeout(()=>process.stderr.write('live diagnostic\\n'),30); setInterval(()=>{},1000);",
        ),
      );
      try {
        await waitFor(() => err.text().includes('live diagnostic'));
        assert(!run.resultSnapshot, 'diagnostic must arrive before shutdown');
      } finally {
        await running.stop();
      }
      await Promise.all(
        ['one', 'two'].map((label) =>
          runner.run({
            ...command(
              `process.stdout.write('::warning::${label}\\n'); process.stdout.write(Buffer.from([0xe2])); setTimeout(()=>process.stdout.write(Buffer.from([0x82,0xac,10])),10);`,
              label,
            ),
            category: 'worker',
          }),
        ),
      );
      const result = await run.finish();
      assert.equal(result.status, 'passed');
      const logs = fs
        .readdirSync(path.join(run.root, 'commands'))
        .map((file) => fs.readFileSync(path.join(run.root, 'commands', file), 'utf8'))
        .join('');
      assert(logs.includes('\u20ac'));
      assert(logs.includes('[stderr] live diagnostic'));
      assert.equal((out.text().match(/::group::/g) || []).length, 2);
      assert.equal((out.text().match(/::endgroup::/g) || []).length, 2);
      const groupOne = out
        .text()
        .slice(out.text().indexOf('::group::one'), out.text().indexOf('::endgroup::', out.text().indexOf('::group::one')));
      assert(groupOne.includes('::stop-commands::'));
      assert(!groupOne.includes('::warning::two'));
    } else if (mode === 'command-secrets') {
      const run = reporter({ kind: 'lifecycle' });
      const runner = new NodeDesktopCommandRunner({ reporter: run });
      // Secret-named variables with short values (flags, counters) must not rewrite machine output; 8 characters and up are redacted.
      await runner.run({
        ...command(
          "console.log(JSON.stringify({ delegated: true, exitCode: 0 })); console.log('seven ' + process.env.FIXTURE_SEVEN_NONCE); console.log('eight ' + process.env.FIXTURE_EIGHT_SECRET);",
          'secret-environment',
        ),
        env: { FIXTURE_FLAG_TOKEN: 'true', FIXTURE_SEVEN_NONCE: '1234567', FIXTURE_EIGHT_SECRET: 'abcdefgh' },
      });
      assert.equal((await run.finish()).status, 'passed');
      const output = fs
        .readFileSync(path.join(run.root, 'events.jsonl'), 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
        .filter((event) => event.kind === 'output' && event.payload.stream === 'stdout')
        .map((event) => event.payload.text);
      assert.deepEqual(JSON.parse(output.find((text) => text.includes('"delegated"'))), { delegated: true, exitCode: 0 });
      assert(output.includes('seven 1234567\n'), JSON.stringify(output));
      assert(output.includes('eight [REDACTED]\n'), JSON.stringify(output));
      assert(!output.join('').includes('abcdefgh'));
    } else if (mode === 'command-arguments') {
      const run = reporter({ kind: 'lifecycle' });
      const runner = new NodeDesktopCommandRunner({ reporter: run });
      const bin = path.join(root, 'command shims (test)');
      fs.mkdirSync(bin);
      const fixture = path.join(bin, 'argv.cjs');
      fs.writeFileSync(fixture, "require('node:fs').writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)));");
      const output = path.join(root, 'arguments.json');
      const values = ['', 'with spaces', 'a&b|(c)<d>^e', '"quoted"', 'trailing\\', '%COMMAND_TEST_VALUE%'];
      let prepared = {
        command: process.execPath,
        args: [fixture, output, ...values],
        cwd: root,
        env: { COMMAND_TEST_VALUE: 'must not expand' },
      };
      if (process.platform === 'win32') {
        fs.writeFileSync(path.join(bin, 'argv-fixture.cmd'), '@"%COMMAND_TEST_NODE%" "%~dp0argv.cjs" %*\r\n');
        prepared = {
          ...prepared,
          command: 'argv-fixture',
          args: [output, ...values],
          env: { ...prepared.env, COMMAND_TEST_NODE: process.execPath, PATH: `${bin}${path.delimiter}${process.env.PATH}` },
        };
      }
      await runner.run(prepared);
      assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), values);
      const result = await run.finish();
      assert.equal(result.status, 'passed');
    } else if (mode === 'transport') {
      const { startReportTransport } = await import(lib('reporting/transport.js'));
      const run = reporter({ kind: 'lifecycle' });
      const transport = await startReportTransport(run);
      const runner = new NodeDesktopCommandRunner({ reporter: run, environment: transport.environment });
      // One constant producer module receives the transport module URL and its producer ID as arguments, then starts
      // its own grandchild producer.
      const producerScript = path.join(root, 'producer.mjs');
      fs.writeFileSync(
        producerScript,
        [
          "import { spawn } from 'node:child_process';",
          'const [moduleUrl, id] = process.argv.slice(2);',
          'const { connectReportProducer } = await import(moduleUrl);',
          'const producer = await connectReportProducer(id);',
          "producer.emit({ kind: 'diagnostic', payload: { level: 'warning', message: 'hello ' + id } });",
          'await producer.finish();',
          "if (id === 'parent') {",
          "  const child = spawn(process.execPath, [process.argv[1], moduleUrl, 'grandchild'], { stdio: 'inherit' });",
          "  child.on('close', (code) => (process.exitCode = code));",
          '}',
        ].join('\n'),
      );
      try {
        await runner.run({
          command: process.execPath,
          args: [producerScript, lib('reporting/transport.js'), 'parent'],
          cwd: root,
          env: {},
          label: 'fixture',
        });
      } finally {
        await transport.close();
      }
      assert.equal((await run.finish()).status, 'passed');
      assert(err.text().includes('[grandchild]'));
      const events = fs.readFileSync(path.join(run.root, 'events.jsonl'), 'utf8');
      assert(events.includes('"sourceId":"grandchild"'));
      assert(!events.includes(JSON.parse(Object.values(transport.environment)[0]).nonce));
      const delegatedRun = reporter({ kind: 'lifecycle' });
      const delegatedTransport = await startReportTransport(delegatedRun);
      const delegatedRunner = new NodeDesktopCommandRunner({ reporter: delegatedRun, environment: delegatedTransport.environment });
      const filename = path.join(root, 'delegated.mjs');
      fs.writeFileSync(
        filename,
        `
        const {createDesktopReportSession} = await import(process.argv[2]);
        const report = await createDesktopReportSession({artifactsRoot:'.',kind:'lifecycle'});
        report.reporter.addSecret('child-only-secret');
        const nested = report.reporter.source('nested');
        nested({kind:'diagnostic',payload:{level:'warning',message:'child-only-secret'}});
        nested({kind:'work-selected',payload:{workId:'delegated-case',label:'delegated case'}});
        nested({kind:'scope-start',payload:{label:'delegated case',category:'worker'}},'delegated-case',undefined,'delegated-case');
        nested({kind:'test-result',payload:{testId:'delegated-case',title:'delegated case',attempt:0,status:'passed',durationMs:1}},'delegated-case');
        nested({kind:'scope-end',payload:{status:'passed'}},'delegated-case');
        nested({kind:'producer-finished',payload:{status:'passed'}});
        await report.reporter.assertSuccessful(['delegated-case']);
        await (await import('node:assert/strict')).rejects(report.reporter.assertSuccessful(['missing-case']), /unknown or empty/);
        await report.close();`,
      );
      try {
        await delegatedRunner.run({ command: process.execPath, args: [filename, lib('reporting/session.js')], cwd: root, env: {} });
      } finally {
        await delegatedTransport.close();
      }
      assert.equal((await delegatedRun.finish()).status, 'passed');
      assert(!fs.readFileSync(path.join(delegatedRun.root, 'events.jsonl'), 'utf8').includes('child-only-secret'));
    } else if (mode === 'delegated-cli') {
      const { createDesktopReportSession } = await import(lib('reporting/session.js'));
      const session = await createDesktopReportSession({
        artifactsRoot: root,
        errorOutput: err,
        eventLevel: 'all',
        kind: 'lifecycle',
        output: out,
        reporterMode: 'ndjson',
        summary: false,
      });
      const runner = new NodeDesktopCommandRunner({ reporter: session.reporter, environment: session.environment });
      const configPath = path.join(root, 'desktop.config.mjs');
      fs.writeFileSync(
        configPath,
        `export default ${JSON.stringify({
          schemaVersion: 1,
          targets: {
            win32: {
              host: { kind: 'installed', application: { executablePath: 'not-launched.exe' } },
              commands: {
                prep: {
                  command: process.execPath,
                  args: ['-e', "process.stderr.write('nested CLI diagnostic ' + process.env.DESKTOP_REPORTER + '\\n')"],
                },
              },
            },
          },
          reporting: { artifactsRoot: path.join(root, 'competing-collector') },
        })}`,
      );
      let exitCode;
      try {
        await runner.run({
          command: process.execPath,
          args: [path.join(packageRoot, 'config', 'cli.cjs'), '--config', configPath, '--target', 'win32', 'prep'],
          cwd: root,
          env: { GITHUB_ACTIONS: 'true' },
        });
      } finally {
        await runner.close();
        exitCode = await session.close();
      }
      assert(!fs.existsSync(path.join(root, 'competing-collector')));
      assert.equal(session.reporter.runId.length, 36);
      assert.equal(exitCode, 0);
      assert.equal(session.result.status, 'passed', JSON.stringify(session.result));
      assert.equal(err.text(), '', `structured runs keep stderr empty: ${err.text()}`);
      const records = out
        .text()
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      const terminal = records.at(-1);
      assert.equal(terminal.status, 'passed');
      assert.equal(terminal.type, 'summary');
      const journal = fs
        .readFileSync(path.join(session.reporter.root, 'events.jsonl'), 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      const machine = journal.find(
        (event) => event.kind === 'output' && event.payload.stream === 'stdout' && event.payload.text.includes('"delegated"'),
      );
      assert.deepEqual(JSON.parse(machine.payload.text), {
        schemaVersion: 1,
        type: 'terminal',
        result: { runId: session.reporter.runId, delegated: true, exitCode: 0 },
      });
      assert(
        records.some(
          (record) => record.type === 'event' && record.kind === 'output' && record.payload.text.includes('nested CLI diagnostic ndjson'),
        ),
      );
    } else if (mode === 'owned-service') {
      const { startReportTransport } = await import(lib('reporting/transport.js'));
      const run = reporter({ kind: 'lifecycle' });
      const transport = await startReportTransport(run);
      const runner = new NodeDesktopCommandRunner({ reporter: run, environment: transport.environment, shutdownTimeoutMs: 10_000 });
      const descriptor = path.join(root, 'service.json');
      fs.writeFileSync(
        descriptor,
        JSON.stringify({
          command: {
            command: process.execPath,
            args: ['-e', "setTimeout(()=>process.stderr.write('grandchild live diagnostic\\n'),30);setInterval(()=>{},1000)"],
            cwd: root,
          },
          stopPath: path.join(root, 'service.stop'),
          label: 'owned fixture',
        }),
      );
      const running = runner.start({
        command: process.execPath,
        args: [path.join(packageRoot, 'config', 'service.cjs'), descriptor],
        cwd: root,
        env: {},
      });
      try {
        await waitFor(() => err.text().includes('grandchild live diagnostic'));
      } finally {
        await running.stop();
        await transport.close();
      }
      assert.equal(await running.completed, 0);
      const result = await run.finish();
      assert.equal(result.status, 'passed', JSON.stringify(result));
      assert.equal((out.text().match(/\[desktop\] PASSED:/g) || []).length, 1, 'only the parent renders the run');
      const abandoned = reporter({ kind: 'lifecycle' });
      const abandonedTransport = await startReportTransport(abandoned);
      const abandonedRunner = new NodeDesktopCommandRunner({ reporter: abandoned, environment: abandonedTransport.environment });
      const marker = path.join(root, 'owned-pid.json');
      const orphanDescriptor = path.join(root, 'orphan-service.json');
      fs.writeFileSync(
        orphanDescriptor,
        JSON.stringify({
          command: {
            command: process.execPath,
            args: ['-e', "require('node:fs').writeFileSync(process.argv[1],JSON.stringify(process.pid));setInterval(()=>{},1000);", marker],
            cwd: root,
          },
          stopPath: path.join(root, 'orphan-service.stop'),
          label: 'orphan fixture',
        }),
      );
      const parent = abandonedRunner.start(
        script(
          `
        const [service, descriptor, marker] = process.argv.slice(1);
        require('node:child_process').spawn(process.execPath, [service, descriptor], {stdio:'ignore',detached:true,windowsHide:true});
        setInterval(() => { if(require('node:fs').existsSync(marker)) process.exit(9); }, 50);`,
          [path.join(packageRoot, 'config', 'service.cjs'), orphanDescriptor, marker],
        ),
      );
      try {
        assert.equal(await parent.completed, 9);
      } finally {
        await parent.stop();
        await abandonedRunner.close();
        await abandonedTransport.close();
      }
      assert.throws(() => process.kill(JSON.parse(fs.readFileSync(marker, 'utf8')), 0), /ESRCH|no such process/i);
      const abandonedResult = await abandoned.finish();
      assert.equal(abandonedResult.status, 'failed');
      assert(!abandonedResult.failures.some(({ kind }) => kind === 'cleanup' || kind === 'reporting'), JSON.stringify(abandonedResult));
    } else if (mode === 'services') {
      const run = reporter({ kind: 'lifecycle' });
      const runner = new NodeDesktopCommandRunner({ reporter: run });
      const services = new DesktopServiceScope(runner, run);
      services.start('outer', command('setInterval(()=>{},1000);'));
      services.start('metro', command("process.stderr.write('original metro failure\\n'); setTimeout(()=>process.exitCode=7,20);"));
      let settleGuardedWork;
      const guardedWork = new Promise((resolve) => {
        settleGuardedWork = resolve;
      });
      try {
        await assert.rejects(services.guard(guardedWork), /exited.*code 7/);
        let closeSettled = false;
        const closing = services.close().then(() => {
          closeSettled = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 30));
        assert.equal(closeSettled, false, 'shutdown must await guarded work after required-service failure');
        settleGuardedWork();
        await closing;
      } finally {
        settleGuardedWork();
        await services.close();
      }
      const result = await run.finish();
      assert.equal(result.status, 'failed');
      assert(err.text().includes('original metro failure'));
    } else if (mode === 'resources') {
      const { DesktopServiceScope } = await import(lib('services.js'));
      const { createDesktopWorkloadClaim, inspectDesktopWorkloadClaim } = await import(lib('ownership.js'));
      const { orderDesktopResourceContributions } = await import(lib('resources.js'));
      const { DesktopSupervisor } = await import(lib('supervisor.js'));
      assert.throws(
        () =>
          orderDesktopResourceContributions([
            {
              id: 'duplicate',
              ownership: 'owned',
              prepare() {
                throw new Error('Duplicate resources must be rejected before preparation.');
              },
            },
            {
              id: 'duplicate',
              ownership: 'owned',
              prepare() {
                throw new Error('Duplicate resources must be rejected before preparation.');
              },
            },
          ]),
        /Duplicate resource contribution/,
      );
      assert.throws(
        () =>
          orderDesktopResourceContributions([
            {
              id: 'first',
              dependsOn: ['second'],
              ownership: 'owned',
              prepare() {
                throw new Error('Cycles must be rejected before preparation.');
              },
            },
            {
              id: 'second',
              dependsOn: ['first'],
              ownership: 'owned',
              prepare() {
                throw new Error('Cycles must be rejected before preparation.');
              },
            },
          ]),
        /dependency cycle/,
      );
      const ready = {
        tier: 'service-ready',
        service: 'fixture-service',
        descriptor: 'fixture.json',
        incarnation: 'inc_fixture',
        processId: process.pid,
      };
      const events = [];
      const runner = {
        start() {
          throw new Error('No process should be started by this fixture.');
        },
        run() {
          throw new Error('No process should be run by this fixture.');
        },
      };
      const claimDirectory = path.join(root, 'resource-lock');
      const claim = createDesktopWorkloadClaim({
        runId: 'resource-run',
        targetId: 'registered-target',
        targetInstanceId: 'physical-target',
        directory: claimDirectory,
      });
      const scope = new DesktopServiceScope(runner, undefined, 'resource-run');
      scope.setResourceObserver((resource) => claim.updateResource(resource));
      await scope.contribute(
        [
          {
            id: 'dependent',
            dependsOn: ['foundation'],
            ownership: 'owned',
            prepare: () => ({
              identity: 'dependent-instance',
              async acquire() {
                events.push('acquire-dependent');
              },
              async dispose() {
                events.push('dispose-dependent');
              },
            }),
          },
          {
            id: 'foundation',
            ownership: 'owned',
            prepare: () => ({
              identity: 'foundation-instance',
              async acquire() {
                events.push('acquire-foundation');
                return ready;
              },
              async dispose() {
                events.push('dispose-foundation');
              },
            }),
          },
        ],
        { targetId: 'registered-target', targetInstanceId: 'physical-target' },
      );
      assert.deepEqual(events, ['acquire-foundation', 'acquire-dependent']);
      assert.equal(claim.record.resources[0].serviceReady.incarnation, ready.incarnation);
      assert.equal(claim.record.resources[0].serviceReady.processId, process.pid);
      await scope.close();
      assert.deepEqual(events, ['acquire-foundation', 'acquire-dependent', 'dispose-dependent', 'dispose-foundation']);
      claim.release();
      assert.throws(() => fs.readFileSync(path.join(claimDirectory, 'interactive.lock')), /ENOENT/);

      const lateDirectory = path.join(root, 'late-lock');
      const lateClaim = createDesktopWorkloadClaim({
        runId: 'late-run',
        targetId: 'registered-target',
        targetInstanceId: 'physical-target',
        directory: lateDirectory,
      });
      const lateScope = new DesktopServiceScope(runner, undefined, 'late-run');
      lateScope.setResourceObserver((resource) => lateClaim.updateResource(resource));
      let finishAcquire;
      let lateDisposed = false;
      const lateAcquisition = lateScope.contribute(
        [
          {
            id: 'late',
            ownership: 'owned',
            prepare: () => ({
              identity: 'late-instance',
              acquire: () =>
                new Promise((resolve) => {
                  finishAcquire = resolve;
                }),
              async dispose() {
                lateDisposed = true;
              },
            }),
          },
        ],
        { targetId: 'registered-target', targetInstanceId: 'physical-target' },
      );
      lateScope.fail(new Error('cancel during acquisition'));
      await assert.rejects(lateAcquisition, /cancel during acquisition/);
      const lateClose = lateScope.close();
      await Promise.resolve();
      assert.equal(lateDisposed, false, 'shutdown must wait for the in-flight acquisition');
      finishAcquire(ready);
      await lateClose;
      assert.equal(lateDisposed, true, 'late acquisition must be disposed before shutdown settles');
      assert.equal(lateClaim.record.resources[0].disposal, 'settled');
      lateClaim.release();

      const failedDirectory = path.join(root, 'failed-lock');
      const failedClaim = createDesktopWorkloadClaim({
        runId: 'failed-run',
        targetId: 'registered-target',
        targetInstanceId: 'physical-target',
        directory: failedDirectory,
      });
      const failedScope = new DesktopServiceScope(runner, undefined, 'failed-run');
      failedScope.setResourceObserver((resource) => failedClaim.updateResource(resource));
      await failedScope.contribute(
        [
          {
            id: 'unstoppable',
            ownership: 'owned',
            prepare: () => ({
              identity: 'exact-resource-instance',
              acquire: () => Promise.resolve(),
              async dispose() {
                throw new Error('dispose failed');
              },
            }),
          },
        ],
        { targetId: 'registered-target', targetInstanceId: 'physical-target' },
      );
      await assert.rejects(failedScope.close(), /did not shut down cleanly/);
      assert.equal(failedClaim.record.state, 'fenced');
      assert.deepEqual(
        failedClaim.record.resources.map(({ id, identity, generation, ownership, disposal }) => ({
          id,
          identity,
          generation,
          ownership,
          disposal,
        })),
        [{ id: 'failed-run:unstoppable', identity: 'exact-resource-instance', generation: 1, ownership: 'owned', disposal: 'failed' }],
      );
      assert.equal(failedClaim.record.unresolvedEffects[0].resourceIdentity, 'exact-resource-instance');
      assert.throws(() => failedClaim.release(), /unresolved effects/);
      const ownerFile = path.join(failedDirectory, 'interactive.lock');
      const live = await inspectDesktopWorkloadClaim(ownerFile, async (owner) => ({
        state: 'alive',
        processStartedAt: owner.processStartedAt,
      }));
      const unknown = await inspectDesktopWorkloadClaim(ownerFile, async () => ({ state: 'unknown' }));
      const reused = await inspectDesktopWorkloadClaim(ownerFile, async (owner) => ({
        state: 'alive',
        processStartedAt: new Date(Date.parse(owner.processStartedAt) + 1000).toISOString(),
      }));
      assert.equal(live.state, 'live');
      assert.equal(unknown.state, 'unknown');
      assert.equal(reused.state, 'pid-reused');
      assert.equal(fs.existsSync(ownerFile), true, 'inspection must never reclaim a claim');
      assert.throws(
        () =>
          createDesktopWorkloadClaim({
            runId: 'concurrent-run',
            targetId: 'registered-target',
            targetInstanceId: 'physical-target',
            directory: failedDirectory,
          }),
        /Another desktop workload holds/,
      );

      const marker = path.join(root, 'dependent-started');
      const serviceRun = reporter({ kind: 'lifecycle' });
      const serviceSupervisor = new DesktopSupervisor({
        target: {
          endpoint: 'win32',
          host: { kind: 'installed', application: { windowTitle: 'fixture' } },
          id: 'service-target',
          instanceId: 'physical-target',
          projectRoot: root,
          configPath: path.join(root, 'desktop.config.mjs'),
          launchTimeoutMs: 2000,
          services: [
            {
              id: 'required',
              command: { command: process.execPath, args: ['-e', 'process.exitCode = 7'] },
              readyUrl: 'https://127.0.0.1:1',
            },
            {
              id: 'dependent',
              command: { command: process.execPath, args: ['-e', "require('node:fs').writeFileSync(process.argv[1], 'started')", marker] },
              readyUrl: 'https://127.0.0.1:1',
              dependsOn: ['required'],
            },
          ],
        },
        reporter: serviceRun,
        lockDirectory: path.join(root, 'service-lock'),
      });
      await serviceSupervisor.open();
      await assert.rejects(serviceSupervisor.startConfiguredServices(), /exited.*code 7/);
      await serviceSupervisor.close();
      await serviceRun.finish();
      assert.equal(fs.existsSync(marker), false, 'a dependant must not start after its required service fails');

      const reportLockDirectory = path.join(root, 'report-lock');
      const reportSupervisor = new DesktopSupervisor({
        target: {
          endpoint: 'win32',
          host: { kind: 'installed', application: { windowTitle: 'fixture' } },
          id: 'reported-target',
          instanceId: 'physical-target',
          projectRoot: root,
          configPath: path.join(root, 'desktop.config.mjs'),
        },
        reporter: { runId: 'report-delegated-run' },
        reportSession: { environment: {} },
        lockDirectory: reportLockDirectory,
      });
      await reportSupervisor.open();
      assert.equal(
        JSON.parse(fs.readFileSync(path.join(reportLockDirectory, 'interactive.lock'), 'utf8')).owner.targetId,
        'reported-target',
        'reporting delegation must not suppress workload ownership',
      );
      await reportSupervisor.close();
      const workloadDirectory = path.join(root, 'delegated-workload-lock');
      const delegatedClaim = createDesktopWorkloadClaim({
        runId: 'parent-run',
        targetId: 'registered-target',
        targetInstanceId: 'physical-target',
        directory: workloadDirectory,
      });
      const workloadSupervisor = new DesktopSupervisor({
        target: {
          endpoint: 'win32',
          host: { kind: 'installed', application: { windowTitle: 'fixture' } },
          id: 'delegated-target',
          instanceId: 'physical-target',
          projectRoot: root,
          configPath: path.join(root, 'desktop.config.mjs'),
        },
        reporter: { runId: 'child-run' },
        reportSession: { environment: {} },
        workload: { kind: 'delegated', claim: delegatedClaim },
        lockDirectory: path.join(root, 'unused-child-lock'),
      });
      await workloadSupervisor.open();
      await workloadSupervisor.close();
      assert.equal(fs.existsSync(path.join(workloadDirectory, 'interactive.lock')), true);
      delegatedClaim.release();
    } else if (mode === 'agent') {
      const { DesktopSupervisor } = await import(lib('supervisor.js'));
      const { FakeDesktopHost } = await import('@fluentui-react-native/desktop-driver/testing');
      const { createDesktopDriverClient } = await import('@fluentui-react-native/desktop-driver/client');
      const target = {
        endpoint: 'win32',
        host: { kind: 'installed', application: { windowTitle: 'fake' }, renderer: 'paper' },
        id: 'agent-app',
        instanceId: 'agent',
        projectRoot: packageRoot,
        configPath: path.join(root, 'desktop.config.mjs'),
      };
      const capabilities = { alwaysMatch: { platformName: 'windows', 'furn:target': 'agent-app' } };
      const published = [];
      let removed = 0;
      const run = reporter({ kind: 'lifecycle' });
      const supervisor = new DesktopSupervisor({
        target,
        recovery: memoryRecovery(),
        reporter: run,
        lockDirectory: path.join(root, 'locks'),
        hostFactory: async () => new FakeDesktopHost({ endpoint: 'win32', features: { boundedObservation: true } }),
        agent: {
          root: path.join(root, 'private'),
          publish: async (connection) => {
            published.push(connection);
            return async () => void removed++;
          },
        },
      });
      try {
        await supervisor.start();
        assert.equal(published.length, 1);
        const [connection] = published;
        assert.equal(connection.descriptor, 'agent-connection.json');
        assert.equal(supervisor.agentDescriptor, 'agent-connection.json');
        assert.equal(connection.root, path.join(root, 'private'));
        assert.equal(connection.url, supervisor.server.url);
        assert.equal(connection.target.id, 'agent-app');
        assert.match(connection.incarnation, /^inc_/);
        // Every route needs the grant once an agent connection is published.
        await assert.rejects(createDesktopDriverClient({ url: connection.url }).newSession(capabilities));
        await assert.rejects(createDesktopDriverClient({ grant: `${connection.grant}x`, url: connection.url }).newSession(capabilities));
        const session = await createDesktopDriverClient({ grant: connection.grant, url: connection.url }).newSession(capabilities);
        assert.equal((await session.operations()).operations.find(({ name }) => name === 'observe')?.available, true);
        await session.delete();
      } finally {
        await supervisor.close();
      }
      assert.equal(removed, 1);
      assert.equal(supervisor.agentDescriptor, undefined);
      const result = await run.finish();
      assert.equal(result.status, 'passed', JSON.stringify(result));
      const { grant } = published[0];
      assert(!out.text().includes(grant) && !err.text().includes(grant), 'the grant must never reach reporter output');
      for (const entry of fs.readdirSync(root, { recursive: true, withFileTypes: true }))
        if (entry.isFile())
          assert(
            !fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8').includes(grant),
            `the grant must never reach ${entry.name}`,
          );
      assert(!fs.existsSync(path.join(root, 'locks', 'interactive.lock')));

      const failing = new DesktopSupervisor({
        target,
        recovery: memoryRecovery(),
        reporter: reporter({ kind: 'lifecycle' }),
        lockDirectory: path.join(root, 'locks'),
        hostFactory: async () => new FakeDesktopHost({ endpoint: 'win32' }),
        agent: {
          publish: async () => {
            throw new Error('original publication failure');
          },
        },
      });
      await assert.rejects(failing.start(), /original publication failure/);
      assert.equal(failing.agentDescriptor, undefined);
      assert(!fs.existsSync(path.join(root, 'locks', 'interactive.lock')), 'a failed publication must release the claim');

      const failedCleanupLocks = path.join(root, 'failed-cleanup-locks');
      const failedCleanup = new DesktopSupervisor({
        target,
        recovery: memoryRecovery(),
        reporter: reporter({ kind: 'lifecycle' }),
        lockDirectory: failedCleanupLocks,
        hostFactory: async () => {
          const host = new FakeDesktopHost({ endpoint: 'win32' });
          const dispose = host.dispose.bind(host);
          host.dispose = async (...args) => {
            await dispose(...args);
            throw new Error('injected cleanup uncertainty');
          };
          return host;
        },
      });
      await failedCleanup.start();
      await assert.rejects(failedCleanup.close(), /cleanup failed/);
      assert(fs.existsSync(path.join(failedCleanupLocks, 'interactive.lock')), 'uncertain cleanup must retain the workload claim');
      const { claimDesktopWorkload } = await import(lib('supervisor.js'));
      assert.throws(() => claimDesktopWorkload('replacement', failedCleanupLocks), /Another desktop workload/);

      // The Storybook channel child's composition: one service, protected and published from the process that listens.
      const { startDesktopService } = await import(lib('driverService.js'));
      const { publishDesktopAgent } = await import(lib('agentConnection.js'));
      const { DesktopAuthority } = await import('@fluentui-react-native/desktop-driver/authority');
      const serviceTarget = { endpoint: 'win32', id: 'agent-service', platformName: 'windows', renderer: 'paper', launchModes: ['launch'] };
      const serviceCapabilities = { alwaysMatch: { platformName: 'windows', 'furn:target': 'agent-service' } };
      const trackedHost = (steps) => {
        const host = new FakeDesktopHost({ endpoint: 'win32' });
        const dispose = host.dispose.bind(host);
        host.dispose = async (...args) => {
          steps.push('dispose');
          return dispose(...args);
        };
        return host;
      };
      const steps = [];
      const secrets = [];
      const servicePublished = [];
      const service = await startDesktopService(trackedHost(steps), {
        target: serviceTarget,
        recovery: memoryRecovery(),
        addSecret: (secret) => secrets.push(secret),
        agent: {
          descriptor: 'service.json',
          publish: async (connection) => {
            servicePublished.push(connection);
            steps.push('publish');
            return async () => void steps.push('withdraw');
          },
        },
      });
      try {
        const [connection] = servicePublished;
        assert.equal(connection.descriptor, 'service.json');
        assert.deepEqual(connection.target, { endpoint: 'win32', id: 'agent-service' });
        assert.equal(connection.url, service.url);
        assert.deepEqual(secrets, [connection.grant]);
        await assert.rejects(createDesktopDriverClient({ url: service.url }).newSession(serviceCapabilities));
        const session = await createDesktopDriverClient({ grant: connection.grant, url: service.url }).newSession(serviceCapabilities);
        await session.delete();
      } finally {
        await service.close();
      }
      await service.close();
      assert.deepEqual(steps, ['publish', 'withdraw', 'dispose'], 'withdraw the descriptor before closing the listener');

      const failedSteps = [];
      await assert.rejects(
        startDesktopService(trackedHost(failedSteps), {
          target: serviceTarget,
          recovery: memoryRecovery(),
          agent: {
            publish: async () => {
              throw new Error('original service publication failure');
            },
          },
        }),
        /original service publication failure/,
      );
      assert.deepEqual(failedSteps, ['dispose'], 'a failed publication closes the service');

      // A publication that completes after its owner's guard settles is withdrawn, and its grant is revoked.
      const authority = new DesktopAuthority();
      const issued = [];
      const issue = authority.issue.bind(authority);
      authority.issue = (request) => {
        const grant = issue(request);
        issued.push(grant);
        return grant;
      };
      let release;
      let lateRemoved = 0;
      await assert.rejects(
        publishDesktopAgent({
          authority,
          connection: { publish: () => new Promise((resolve) => (release = resolve)) },
          target: { endpoint: 'win32', id: 'late' },
          url: service.url,
          guard: () => Promise.reject(new Error('original guard failure')),
        }),
        /original guard failure/,
      );
      assert.equal(authority.authenticate(`Bearer ${issued[0].token}`), undefined, 'an abandoned publication revokes its grant');
      release(async () => void lateRemoved++);
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(lateRemoved, 1, 'a late publication is withdrawn');
    } else if (mode === 'recovery') {
      const { DesktopSupervisor } = await import(lib('supervisor.js'));
      const { startDesktopService } = await import(lib('driverService.js'));
      const { FakeDesktopHost } = await import('@fluentui-react-native/desktop-driver/testing');
      const { createDesktopDriverClient } = await import('@fluentui-react-native/desktop-driver/client');
      const target = {
        endpoint: 'win32',
        host: { kind: 'installed', ownership: 'external', application: { windowTitle: 'fake' } },
        id: 'durable-target',
        instanceId: 'recovery',
        projectRoot: packageRoot,
        configPath: path.join(root, 'desktop.config.mjs'),
      };
      const capabilities = { alwaysMatch: { platformName: 'windows', 'furn:target': target.id, 'furn:launchMode': 'attach' } };
      const quarantined = (error) => error.data?.reason === 'target-quarantined';
      const uncertain = (error) => error.data?.mutation?.quarantined === true;
      for (const firstPath of ['supervisor', 'channel']) {
        const recovery = memoryRecovery();
        let state = 'running';
        const probed = [];
        recovery.probeApplication = async (application) => {
          probed.push(application);
          return state;
        };
        const start = async (servicePath) => {
          const host = new FakeDesktopHost({ endpoint: 'win32' });
          if (servicePath === 'channel') {
            const server = await startDesktopService(host, {
              target: { endpoint: target.endpoint, id: target.id, platformName: 'windows', launchModes: ['attach'] },
              recovery,
            });
            return { server, host, close: () => server.close() };
          }
          const supervisor = new DesktopSupervisor({
            target,
            recovery,
            reporter: reporter({ kind: 'lifecycle' }),
            lockDirectory: path.join(root, `locks-${firstPath}`),
            hostFactory: async () => host,
          });
          await supervisor.start();
          return { server: supervisor.server, host, close: () => supervisor.close() };
        };
        let service = await start(firstPath);
        const open = () => createDesktopDriverClient({ url: service.server.url }).newSession(capabilities);
        try {
          const session = await open();
          const button = await session.findElement('accessibility id', 'button-primary');
          service.host.injectFault('click', { mode: 'lost-response' });
          service.server.sessions.get(session.id).desktopTimeouts.nativeCommand = 10;
          await assert.rejects(button.click(), uncertain);
          assert(recovery.records.size > 0, 'quarantine must be durable before responding');
          await service.close();

          service = await start(firstPath === 'supervisor' ? 'channel' : 'supervisor');
          await assert.rejects(open(), quarantined, 'replacement composition cannot forget uncertain attached-target effects');
          const record = service.server.sessions.getQuarantine(target.id);
          assert.deepEqual(probed.at(-1), { processId: 1000, processStartedAt: new Date(0).toISOString() });
          state = 'unknown';
          await assert.rejects(
            service.server.recoverTarget(target.id, { evidence: 'application-exited', quarantineId: record.id }),
            /not proven/,
          );
          await assert.rejects(open(), quarantined);
          state = 'exited';
          await service.server.recoverTarget(target.id, { evidence: 'application-exited', quarantineId: record.id });
          assert.equal(recovery.records.size, 0);
          const recovered = await open();
          await recovered.delete();
          await service.close();

          // A malformed journal never becomes absence, even when the probe claims exit.
          const seed = await start(firstPath);
          service = seed;
          const seeded = await open();
          const element = await seeded.findElement('accessibility id', 'button-primary');
          seed.host.injectFault('click', { mode: 'lost-response' });
          seed.server.sessions.get(seeded.id).desktopTimeouts.nativeCommand = 10;
          await assert.rejects(element.click());
          await seed.close();
          for (const name of recovery.records.keys()) recovery.records.set(name, '{"invalid":true}');
          service = await start(firstPath === 'supervisor' ? 'channel' : 'supervisor');
          await assert.rejects(open(), quarantined);
          const corrupt = service.server.sessions.getQuarantine(target.id);
          assert.equal(corrupt.application, undefined);
          await assert.rejects(
            service.server.recoverTarget(target.id, { evidence: 'application-exited', quarantineId: corrupt.id }),
            /not proven/,
          );
        } finally {
          await service.close();
        }
      }

      let disposed = 0;
      let published = 0;
      const host = new FakeDesktopHost({ endpoint: 'win32' });
      host.dispose = async () => void disposed++;
      await assert.rejects(
        startDesktopService(host, {
          target: { endpoint: 'win32', id: target.id, platformName: 'windows' },
          recovery: {
            storage: {
              ...memoryRecovery().storage,
              read: async () => {
                throw new Error('inaccessible recovery');
              },
            },
          },
          agent: {
            publish: async () => {
              published++;
              return async () => undefined;
            },
          },
        }),
        /inaccessible recovery/,
      );
      assert.equal(disposed, 1);
      assert.equal(published, 0, 'unreadable recovery must fail before descriptor publication');

      let settle;
      const settling = new Promise((resolve) => (settle = resolve));
      const settlingHost = new FakeDesktopHost({ endpoint: 'win32' });
      settlingHost.dispose = () => settling;
      const service = await startDesktopService(settlingHost, {
        target: { endpoint: 'win32', id: target.id, platformName: 'windows' },
        recovery: memoryRecovery(),
      });
      let closed = false;
      const closing = service.close().then(() => (closed = true));
      assert.equal(service.close(), service.close(), 'shutdown is one settled operation');
      await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(closed, false, 'shutdown must await disposal, not just listener closure');
      settle();
      await closing;
    } else if (mode === 'agent-cli') {
      const { createDesktopReportSession } = await import(lib('reporting/session.js'));
      // serve --agent passes the agent options to an integration that serves agents, and rejects one that does not.
      const configPath = path.join(root, 'desktop.config.mjs');
      fs.writeFileSync(
        configPath,
        [
          "import fs from 'node:fs';",
          'export default {',
          '  schemaVersion: 1,',
          "  targets: { win32: { host: { kind: 'installed', application: { executablePath: 'not-launched.exe' } } } },",
          '  integration: {',
          "    name: 'fixture',",
          "    supportsAgent: process.env.FIXTURE_SUPPORTS_AGENT === '1',",
          '    validate() {},',
          '    async run({ action, agent, reporterMode }) {',
          '      fs.writeFileSync(process.env.FIXTURE_MARKER, JSON.stringify({ action, agent: agent ?? null, reporterMode }));',
          '    },',
          '  },',
          '};',
          '',
        ].join('\n'),
      );
      const invoke = async (supportsAgent, args) => {
        const session = await createDesktopReportSession({
          artifactsRoot: root,
          errorOutput: err,
          kind: 'lifecycle',
          output: out,
          reporterMode: 'ndjson',
          summary: false,
        });
        const runner = new NodeDesktopCommandRunner({ reporter: session.reporter, environment: session.environment });
        const marker = path.join(root, `marker-${supportsAgent}-${args.join('-').replace(/[^a-z-]/g, '')}.json`);
        let failure;
        try {
          await runner.run({
            command: process.execPath,
            args: [path.join(packageRoot, 'config', 'cli.cjs'), '--config', configPath, '--target', 'win32', ...args],
            cwd: root,
            env: { FIXTURE_MARKER: marker, FIXTURE_SUPPORTS_AGENT: supportsAgent ? '1' : '0' },
          });
        } catch (error) {
          failure = error;
        } finally {
          await runner.close();
          await session.close(failure);
        }
        return { failure, marker: fs.existsSync(marker) ? JSON.parse(fs.readFileSync(marker, 'utf8')) : undefined };
      };
      const commandLogs = () =>
        fs
          .readdirSync(root, { recursive: true, withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name.endsWith('.log'))
          .map((entry) => fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8'));
      const privateRoot = path.join(root, 'private');
      // serve writes no final output, so only serve receives the output format for the integration's readiness record.
      const served = await invoke(true, [
        '--reporter',
        'ndjson',
        'serve',
        '--agent',
        '--descriptor',
        'storybook.json',
        '--root',
        privateRoot,
      ]);
      assert.equal(served.failure, undefined, commandLogs().join('\n'));
      assert.deepEqual(served.marker, {
        action: 'serve',
        agent: { descriptor: 'storybook.json', root: privateRoot },
        reporterMode: 'ndjson',
      });
      assert.deepEqual((await invoke(true, ['serve'])).marker, { action: 'serve', agent: null, reporterMode: 'ndjson' });
      assert.deepEqual((await invoke(true, ['--reporter', 'ndjson', 'prep'])).marker, { action: 'prep', agent: null });
      const refused = await invoke(false, ['serve', '--agent']);
      assert(refused.failure, 'an integration that does not serve agents must refuse --agent');
      assert.equal(refused.marker, undefined);
      const logs = commandLogs();
      assert(
        logs.some((log) => log.includes('serve --agent requires an integration that supports agents; \\"fixture\\" does not.')),
        logs.join('\n'),
      );
    } else {
      const { DesktopSupervisor } = await import(lib('supervisor.js'));
      const { runDesktopWdioSuite } = await import(lib('wdio/run.js'));
      const { FakeDesktopHost } = await import('@fluentui-react-native/desktop-driver/testing');
      const run = reporter({ context: { endpoint: 'win32', renderer: 'paper' } });
      const fixture = path.join(root, mode === 'typescript' ? 'spec.ts' : 'spec.mjs');
      const second = path.join(root, 'second.mjs');
      let source;
      if (mode === 'typescript') {
        fs.writeFileSync(path.join(root, 'helper.ts'), 'export const marker: string = "typescript";');
        fs.writeFileSync(
          path.join(root, 'hooks.ts'),
          "import { marker } from './helper'; export default { before() { globalThis.hookMarker = marker; } };",
        );
        source =
          "import { marker } from './helper'; describe('TypeScript fixture',()=>{it('preserves source imports in hooks and specs',()=>{const expected: string = marker;expect(globalThis.hookMarker).toBe(expected);});});";
      } else if (mode === 'retry') {
        // The spec finds its sibling marker through import.meta.url rather than an embedded path.
        source =
          "import fs from 'node:fs'; const marker = new URL('./attempt', import.meta.url); describe('retry fixture',()=>{it('retains failed attempt',()=>{if(!fs.existsSync(marker)){fs.writeFileSync(marker,'attempt');throw new Error('first attempt');}});});";
      } else if (mode === 'hook-failure') {
        source =
          "describe('hook fixture',()=>{beforeAll(()=>{throw new Error('original setup failure');});it('does not execute',()=>{throw new Error('body must not run');});});";
      } else if (mode === 'crash') {
        source = 'process.exit(17);';
      } else if (mode === 'bail') {
        source = "describe('bail fixture',()=>{it('fails first',()=>{throw new Error('original bail failure');});});";
        fs.writeFileSync(
          second,
          "describe('omitted group',()=>{it('must not execute',()=>{throw new Error('bail did not stop scheduling');});});",
        );
      } else {
        source =
          "describe('native WDIO fixture',()=>{beforeAll(()=>{globalThis.groupedMarker='preserved';});it('uses native display and focus without execute',async()=>{const e=await browser.$('~button-primary');await e.waitForDisplayed();await expect(await e.isDisplayed()).withContext('Jasmine matchers remain available').toBeTrue();await e.click();await expect(await e.isFocused()).toBeTrue();await expect(typeof browser.desktopOpenStory).toBe('undefined');});xit('explicit skip',()=>{});});";
        fs.writeFileSync(
          second,
          "describe('second grouped file',()=>{it('preserves Jasmine globals and grouping',()=>{expect(globalThis.groupedMarker).toBe('preserved');});});",
        );
      }
      fs.writeFileSync(fixture, source);
      const target = {
        endpoint: 'win32',
        host: { kind: 'installed', application: { windowTitle: 'fake' }, renderer: 'paper' },
        id: 'plain-app',
        instanceId: 'plain',
        projectRoot: packageRoot,
        configPath: path.join(root, 'desktop.config.mjs'),
      };
      const host = new FakeDesktopHost({ endpoint: 'win32' });
      let launches = 0;
      const launch = host.launch.bind(host);
      host.launch = (...args) => {
        launches++;
        return launch(...args);
      };
      const supervisor = new DesktopSupervisor({
        target,
        recovery: memoryRecovery(),
        reporter: run,
        lockDirectory: path.join(root, 'locks'),
        hostFactory: async () => host,
      });
      const config = {
        config: {
          schemaVersion: 1,
          targets: { win32: target },
          suites: {
            fixture: {
              kind: 'wdio',
              framework: 'jasmine',
              specs: mode === 'bail' ? [fixture, second] : [[fixture, ...(mode === 'wdio' ? [second] : [])]],
              specFileRetries: mode === 'retry' ? 1 : 0,
            },
          },
        },
        projectRoot: packageRoot,
        configPath: target.configPath,
        targets: { win32: target },
        reporting: { artifactsRoot: root },
      };
      if (mode === 'config-hook-failure')
        config.config.suites.fixture.readiness = { kind: 'native', testId: 'missing-readiness-marker', timeoutMs: 50 };
      if (mode === 'typescript') config.config.suites.fixture.hooks = path.join(root, 'hooks.ts');
      if (mode === 'config-load-failure') {
        config.config.suites.fixture.hooks = path.join(root, 'hooks.mts');
        fs.writeFileSync(
          config.config.suites.fixture.hooks,
          "throw new Error('original config import failure', { cause: new Error('original config cause') });",
        );
      }
      if (mode === 'bail') {
        config.config.suites.fixture.specs = [fixture, second];
        config.config.suites.fixture.bail = 1;
      }
      let failure;
      try {
        await supervisor.start();
        const duplicate = new DesktopSupervisor({
          target,
          recovery: memoryRecovery(),
          reporter: run,
          lockDirectory: path.join(root, 'locks'),
          hostFactory: async () => host,
        });
        await assert.rejects(duplicate.start(), /Another desktop workload/);
        try {
          await runDesktopWdioSuite(supervisor, config, 'fixture');
        } catch (error) {
          failure = error;
          run.fail(error);
        }
      } finally {
        await supervisor.close();
      }
      const result = await run.finish();
      if (['hook-failure', 'config-hook-failure', 'config-load-failure', 'crash', 'bail'].includes(mode)) {
        assert(failure, `hook failure must fail launcher\n${JSON.stringify(result)}\n${err.text()}\n${out.text()}`);
        assert.equal(result.status, 'failed');
        assert(!out.text().includes('PASSED WDIO fixture'), out.text());
        if (mode !== 'crash')
          assert(!result.failures.some(({ kind }) => kind === 'cleanup' || kind === 'reporting'), JSON.stringify(result));
        if (mode === 'hook-failure') assert(JSON.stringify(result).includes('original setup failure'), JSON.stringify(result));
        if (mode === 'config-hook-failure') assert(JSON.stringify(result).includes('missing-readiness-marker'), JSON.stringify(result));
        if (mode === 'config-load-failure') {
          assert(JSON.stringify(result).includes('original config import failure'), JSON.stringify(result));
          assert(JSON.stringify(result).includes('original config cause'), JSON.stringify(result));
          assert.equal(launches, 0);
          assert(result.work.every(({ status }) => status === 'not-run'));
        }
        if (mode === 'bail')
          assert(
            result.work.some(({ status }) => status === 'not-run'),
            JSON.stringify(result),
          );
      } else {
        assert.equal(failure, undefined, `${failure?.stack}\n${err.text()}\n${out.text()}`);
        assert.equal(result.status, 'passed', JSON.stringify(result));
        assert.equal(launches, mode === 'retry' ? 2 : 1, 'WDIO must own exactly one session per grouped attempt');
        assert.equal(result.counts.flaky, mode === 'retry' ? 1 : 0, JSON.stringify(result));
        if (mode === 'wdio') {
          assert.equal(result.counts.passed, 2);
          assert.equal(result.counts.skipped, 1);
        }
      }
      assert(!fs.existsSync(path.join(root, 'locks', 'interactive.lock')));
    }
    process.stdout.write(JSON.stringify({ mode, passed: true }));
  } finally {
    // Windows can hold WDIO worker handles briefly after exit, which surfaces as transient EPERM/EBUSY.
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? String(error));
  process.exitCode = 1;
});
