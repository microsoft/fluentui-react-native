import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commands.js';
import { DesktopServiceScope, DesktopStopRequested } from './services.js';
import type { DesktopResourceContribution, DesktopResourceRecord } from './resources.js';

class FakeRunner implements DesktopCommandRunner {
  readonly stopped: string[] = [];
  readonly stopOptions: { failed?: boolean }[] = [];
  async run(): Promise<void> {}
  start(command: PreparedDesktopCommand): RunningDesktopCommand {
    let exit!: (code: number) => void;
    const completed = new Promise<number>((resolve) => {
      exit = resolve;
    });
    return {
      completed,
      stop: async (options = {}) => {
        this.stopped.push(command.label!);
        this.stopOptions.push(options);
        exit(0);
      },
    };
  }
}

const context = { targetId: 'target', targetInstanceId: 'instance' };
const command = { command: 'service', args: [], cwd: '.', env: {} };

function resource(id: string, disposed: string[]): DesktopResourceContribution {
  return {
    id,
    ownership: 'owned',
    prepare: () => ({
      identity: `fixture:${id}`,
      acquire: async () => undefined,
      dispose: async () => {
        disposed.push(id);
      },
    }),
  };
}

describe('desktop service scope shutdown', () => {
  test('disposes services and owned resources in reverse acquisition order', async () => {
    const runner = new FakeRunner();
    const scope = new DesktopServiceScope(runner);
    scope.start('first', command);
    await scope.contribute([resource('middle', runner.stopped)], context);
    scope.start('last', command);
    await scope.close();
    expect(runner.stopped).toEqual(['last', 'middle', 'first']);
    expect(runner.stopOptions).toEqual([{ failed: false }, { failed: false }]);
  });

  test('a service stopped after a scope failure is reported failed, and a stop request is not a failure', async () => {
    const failedRunner = new FakeRunner();
    const failedScope = new DesktopServiceScope(failedRunner);
    failedScope.start('service', command);
    failedScope.fail(new Error('Required dependency failed'));
    await failedScope.close();
    expect(failedRunner.stopOptions).toEqual([{ failed: true }]);

    const stoppedRunner = new FakeRunner();
    const stoppedScope = new DesktopServiceScope(stoppedRunner);
    stoppedScope.start('service', command);
    stoppedScope.requestStop();
    await stoppedScope.close();
    expect(stoppedRunner.stopOptions).toEqual([{ failed: false }]);
  });

  test('close settles work that waits for a stop request', async () => {
    const scope = new DesktopServiceScope(new FakeRunner());
    const waiting = scope.guard(scope.waitForStop());
    await scope.close();
    await expect(waiting).rejects.toThrow('closing');
  });

  test('closing from tracked work is bounded by the drain deadline', async () => {
    const scope = new DesktopServiceScope(new FakeRunner(), undefined, 'desktop', { drainTimeoutMs: 100 });
    let inner: Promise<void> | undefined;
    const tracked = scope.guard(
      (async () => {
        await Promise.resolve();
        inner = scope.close();
        await inner;
      })(),
    );
    await expect(tracked).rejects.toThrow('closing');
    await expect(inner).rejects.toThrow('did not shut down cleanly');
    await expect(scope.close()).rejects.toMatchObject({
      errors: [expect.objectContaining({ message: expect.stringContaining('did not settle within 100ms') })],
    });
  });

  test.each([0, 1.5, -1, 2 ** 31])('rejects drainTimeoutMs %p', (drainTimeoutMs) => {
    expect(() => new DesktopServiceScope(new FakeRunner(), undefined, 'desktop', { drainTimeoutMs })).toThrow(RangeError);
  });

  test('a resource observer failure during close still disposes everything and fails the close', async () => {
    const runner = new FakeRunner();
    const scope = new DesktopServiceScope(runner);
    const observed: DesktopResourceRecord[] = [];
    scope.start('first', command);
    scope.start('second', command);
    scope.setResourceObserver((record) => {
      observed.push(record);
      if (record.disposal === 'pending' && observed.length > 2) throw new Error('Claim write failed');
    });
    scope.requestStop();
    await expect(scope.close()).rejects.toMatchObject({ errors: [expect.objectContaining({ message: 'Claim write failed' })] });
    expect(runner.stopped).toEqual(['second', 'first']);
  });

  test('a resource observer failure before close fails the scope', async () => {
    const scope = new DesktopServiceScope(new FakeRunner());
    scope.setResourceObserver(() => {
      throw new Error('Claim write failed');
    });
    expect(() => scope.start('service', command)).toThrow('Claim write failed');
    await expect(scope.waitForStop()).rejects.toThrow('Claim write failed');
    await expect(scope.close()).rejects.toThrow('did not shut down cleanly');
    expect(scope.controller.signal.reason).not.toBeInstanceOf(DesktopStopRequested);
  });
});
