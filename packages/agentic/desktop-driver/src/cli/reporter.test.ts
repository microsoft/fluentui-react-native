import { PassThrough } from 'node:stream';

import { Command } from 'commander';

import {
  configureDesktopCliCommandTree,
  describeDesktopCliError,
  formatDesktopReporterError,
  formatDesktopReporterValue,
  projectDesktopCliError,
  resolveDesktopEventLevel,
  resolveDesktopReporterMode,
  resolveDesktopReporterModeFromArgv,
  tolerateClosedDesktopStdout,
} from './reporter.js';

describe('desktop reporter modes', () => {
  test('uses the first explicit source in flag, environment, config order', () => {
    expect(resolveDesktopReporterMode({ flag: 'json', environment: 'ndjson', configured: 'plain' })).toBe('json');
    expect(resolveDesktopReporterMode({ environment: 'ndjson', configured: 'plain' })).toBe('ndjson');
    expect(resolveDesktopReporterMode({ configured: 'github-actions' })).toBe('github-actions');
  });

  test('treats empty environment and configuration values as unset', () => {
    expect(resolveDesktopReporterMode({ environment: '', configured: ' ', githubActions: false })).toBe('plain');
    expect(resolveDesktopReporterMode({ environment: '', configured: 'ndjson' })).toBe('ndjson');
    expect(resolveDesktopEventLevel({ environment: '', configured: 'all' })).toBe('all');
    expect(resolveDesktopEventLevel({ environment: '' })).toBe('milestones');
  });

  test('keeps a consumer-closed stdout from crashing a command', () => {
    const stream = new PassThrough() as unknown as NodeJS.WriteStream;
    tolerateClosedDesktopStdout(stream);
    tolerateClosedDesktopStdout(stream);
    expect(stream.listenerCount('error')).toBe(1);
    expect(() => stream.emit('error', Object.assign(new Error('closed'), { code: 'EPIPE' }))).not.toThrow();
    expect(() => stream.emit('error', Object.assign(new Error('closed'), { code: 'ERR_STREAM_DESTROYED' }))).not.toThrow();
    expect(() => stream.emit('error', new Error('disk failure'))).toThrow('disk failure');
  });

  test('resolves auto to the current human renderer', () => {
    expect(resolveDesktopReporterMode({ githubActions: true })).toBe('github-actions');
    expect(resolveDesktopReporterMode({ githubActions: false })).toBe('plain');
  });

  test('emits compact JSON or one terminal NDJSON record', () => {
    const value = { status: 'passed', count: 1 };
    expect(formatDesktopReporterValue('json', value)).toBe('{"status":"passed","count":1}\n');
    expect(formatDesktopReporterValue('ndjson', value)).toBe(
      '{"schemaVersion":1,"type":"terminal","result":{"status":"passed","count":1}}\n',
    );
    expect(formatDesktopReporterValue('plain', value)).toContain('\n  "status": "passed"');
  });

  test('rejects invalid mode values as configuration errors', () => {
    expect(() => resolveDesktopReporterMode({ environment: 'yaml' })).toThrow(/Reporter must be one of/);
    try {
      resolveDesktopReporterMode({ configured: 'yaml' });
    } catch (error) {
      expect(error).toMatchObject({ code: 'config' });
    }
  });

  test('resolves event detail from flag, environment, config, then milestones', () => {
    expect(resolveDesktopEventLevel({ flag: 'all', environment: 'progress', configured: 'milestones' })).toBe('all');
    expect(resolveDesktopEventLevel({ environment: 'progress', configured: 'all' })).toBe('progress');
    expect(resolveDesktopEventLevel({ configured: 'all' })).toBe('all');
    expect(resolveDesktopEventLevel()).toBe('milestones');
    expect(() => resolveDesktopEventLevel({ environment: 'verbose' })).toThrow(/Event level must be one of/);
  });

  test('selects a reporter before parsing and projects bounded machine-readable errors', () => {
    expect(resolveDesktopReporterModeFromArgv(['node', 'cli', 'serve', '--reporter', 'ndjson'])).toBe('ndjson');
    expect(resolveDesktopReporterModeFromArgv(['node', 'cli', '--json', 'serve'], { environment: 'plain' })).toBe('json');
    const error = Object.assign(new Error('x'.repeat(10_000)), { code: 'commander.unknownOption' });
    const projected = projectDesktopCliError(error);
    expect(projected.error.code).toBe('usage');
    expect(Buffer.byteLength(JSON.stringify(projected))).toBeLessThan(2 * 1024);
    expect(JSON.parse(formatDesktopReporterError('json', new Error('invalid')))).toMatchObject({
      schemaVersion: 1,
      type: 'error',
      error: { code: 'internal', message: 'invalid' },
    });
  });

  test('reports NDJSON errors as the same record as JSON, without a terminal wrapper', () => {
    const error = Object.assign(new Error('bad input'), { code: 'commander.invalidArgument' });
    expect(formatDesktopReporterError('ndjson', error)).toBe(formatDesktopReporterError('json', error));
    expect(JSON.parse(formatDesktopReporterError('ndjson', error))).toEqual({
      schemaVersion: 1,
      type: 'error',
      error: { code: 'usage', message: 'bad input' },
    });
  });

  test.each([
    { label: 'invalid argument', fields: { code: 'invalid argument' }, kind: 'usage' },
    { label: 'invalid selector', fields: { code: 'invalid selector' }, kind: 'usage' },
    { label: 'unsupported operation', fields: { code: 'unsupported operation' }, kind: 'unsupported' },
    { label: 'webdriver client name', fields: { name: 'unsupported operation' }, kind: 'unsupported' },
    { label: 'target-busy session', fields: { code: 'session not created', data: { reason: 'target-busy' } }, kind: 'busy' },
    { label: 'session not created', fields: { code: 'session not created' }, kind: 'internal' },
    { label: 'no such element', fields: { code: 'no such element' }, kind: 'internal' },
  ])('maps WebDriver $label errors to $kind', ({ fields, kind }) => {
    expect(projectDesktopCliError(Object.assign(new Error('x'), fields)).error.code).toBe(kind);
  });

  test('routes usage errors from nested subcommands to the reporter', async () => {
    const root = new Command('root');
    root
      .command('group')
      .command('leaf')
      .requiredOption('--url <url>')
      .action(() => undefined);
    const stderr: string[] = [];
    configureDesktopCliCommandTree(root, { writeErr: (text) => stderr.push(text), writeOut: () => undefined });

    const error: unknown = await root.parseAsync(['group', 'leaf'], { from: 'user' }).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ code: 'commander.missingMandatoryOptionValue', exitCode: 1 });
    expect(projectDesktopCliError(error).error.code).toBe('usage');
    expect(stderr.join('')).toContain("required option '--url <url>' not specified");
  });

  test('clips messages to the byte limit at a character boundary', () => {
    const message = describeDesktopCliError(new Error('é'.repeat(2_000)));
    expect(Buffer.byteLength(message)).toBeLessThanOrEqual(1024);
    expect(message.endsWith('…')).toBe(true);
  });
});
