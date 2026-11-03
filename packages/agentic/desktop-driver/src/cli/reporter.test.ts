import {
  formatDesktopReporterError,
  formatDesktopReporterValue,
  projectDesktopCliError,
  resolveDesktopEventLevel,
  resolveDesktopReporterMode,
  resolveDesktopReporterModeFromArgv,
} from './reporter.js';

describe('desktop reporter modes', () => {
  test('uses the first explicit source in flag, environment, config order', () => {
    expect(resolveDesktopReporterMode({ flag: 'json', environment: 'ndjson', configured: 'plain' })).toBe('json');
    expect(resolveDesktopReporterMode({ environment: 'ndjson', configured: 'plain' })).toBe('ndjson');
    expect(resolveDesktopReporterMode({ configured: 'github-actions' })).toBe('github-actions');
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
});
