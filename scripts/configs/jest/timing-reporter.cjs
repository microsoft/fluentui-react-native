const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

module.exports = class TimingReporter {
  /**
   * @param {{maxWorkers: number, testTimeout: number}} config
   * @param {{directory: string, platform: string, workspace: string}} options
   */
  constructor(config, { directory, platform, workspace }) {
    fs.mkdirSync(directory, { recursive: true });
    this.file = path.join(directory, `${randomUUID()}.ndjson`);
    this.write({
      kind: 'run',
      workspace,
      platform,
      availableCPUs: os.availableParallelism(),
      maxWorkers: config.maxWorkers,
      testTimeoutMs: config.testTimeout,
    });
  }

  /**
   * @param {{path: string, context: {config: {rootDir: string}}}} test
   * @param {{perfStats: {runtime?: number}, numPassingTests: number, numFailingTests: number, numPendingTests: number, numTodoTests: number, testExecError?: unknown, snapshot?: {failure?: boolean}, skipped: boolean}} result
   */
  onTestResult(test, result) {
    this.write({
      kind: 'suite',
      file: path.relative(test.context.config.rootDir, test.path).split(path.sep).join('/'),
      durationMs: result.perfStats.runtime,
      passed: result.numPassingTests,
      failed: result.numFailingTests,
      skipped: result.numPendingTests + result.numTodoTests,
      status: result.testExecError || result.numFailingTests || result.snapshot?.failure ? 'failed' : result.skipped ? 'skipped' : 'passed',
    });
  }

  /**
   * @param {unknown} _contexts
   * @param {{wasInterrupted: boolean, numFailedTestSuites: number}} result
   */
  onRunComplete(_contexts, result) {
    this.write({ kind: 'summary', interrupted: result.wasInterrupted, failedSuites: result.numFailedTestSuites });
  }

  /** @param {Record<string, unknown>} record */
  write(record) {
    fs.appendFileSync(this.file, `${JSON.stringify(record)}\n`);
  }
};
