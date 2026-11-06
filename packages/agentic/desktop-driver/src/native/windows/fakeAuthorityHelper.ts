// Test-only fake of the Windows helper's authority modes. A test routes a mocked `spawn` to this fake and scripts each
// helper launch, so the adapters and the spawn client run on every host without the Windows helper.
import { EventEmitter } from 'node:events';
import { Writable } from 'node:stream';

export type FakeHelperLaunch = {
  readonly args: readonly string[];
  readonly executable: string;
  killed: boolean;
  readonly options: unknown;
  /** The standard input the helper received, complete once the client ends it. */
  request: string;
  readonly stdin: Writable;
};

type Script =
  | { chunks: readonly Buffer[]; code: number; kind: 'output' }
  | { error: Error; kind: 'error' }
  | { error: Error; kind: 'refuse' }
  | { kind: 'silent' };

export class FakeAuthorityHelper {
  /** Every launch the fake accepted, in order. A launch the test did not script throws instead. */
  readonly launches: FakeHelperLaunch[] = [];
  private readonly scripts: Script[] = [];

  /** The implementation behind the mocked `spawn`. */
  readonly spawn = (executable: string, args: readonly string[], options: unknown): unknown => this.launch(executable, args, options);

  /** Queues a JSON answer. The exit status follows `ok`, as the real helper's does. */
  answer(answer: Record<string, unknown>, code: number = answer.ok === true ? 0 : 1): this {
    return this.output(JSON.stringify(answer), code);
  }

  /** Queues raw standard output, as one chunk or several, and the exit status. */
  output(output: string | Buffer | Buffer[], code = 0): this {
    const chunks = (Array.isArray(output) ? output : [output]).map((chunk) =>
      typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : Buffer.from(chunk),
    );
    this.scripts.push({ chunks, code, kind: 'output' });
    return this;
  }

  /** Queues a helper that cannot start: the child reports an `error` event. */
  fail(error: Error): this {
    this.scripts.push({ error, kind: 'error' });
    return this;
  }

  /** Queues a `spawn` call that throws. */
  refuse(error: Error): this {
    this.scripts.push({ error, kind: 'refuse' });
    return this;
  }

  /** Queues a helper that reads its request and never answers. */
  silent(): this {
    this.scripts.push({ kind: 'silent' });
    return this;
  }

  private launch(executable: string, args: readonly string[], options: unknown): unknown {
    const script = this.scripts.shift();
    if (script === undefined) {
      throw new Error('The test scripted no answer for this helper launch.');
    }
    if (script.kind === 'refuse') {
      throw script.error;
    }
    const stdout = new EventEmitter();
    const child = new EventEmitter();
    const launch: FakeHelperLaunch = {
      args,
      executable,
      killed: false,
      options,
      request: '',
      stdin: new Writable({
        final(done) {
          done();
          if (script.kind === 'output') {
            setImmediate(() => {
              script.chunks.forEach((chunk) => stdout.emit('data', chunk));
              child.emit('close', script.code, null);
            });
          }
        },
        write(chunk: Buffer, _encoding, done) {
          launch.request += chunk.toString('utf8');
          done();
        },
      }),
    };
    this.launches.push(launch);
    if (script.kind === 'error') {
      setImmediate(() => child.emit('error', script.error));
    }
    return Object.assign(child, {
      kill: () => {
        launch.killed = true;
        return true;
      },
      stderr: null,
      stdin: launch.stdin,
      stdout,
    });
  }
}
