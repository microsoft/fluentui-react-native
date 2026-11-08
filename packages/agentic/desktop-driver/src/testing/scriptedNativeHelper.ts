import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import { encodeJsonFrame, NativeFrameDecoder } from '../hosts/native/framing.js';
import type { NativeHostJsonMessage } from '../native/types.js';

export type ScriptedNativeRequest = Extract<NativeHostJsonMessage, { type: 'request' }>;
export type ScriptedNativeSend = (message: NativeHostJsonMessage) => void;

class ScriptedNativeChild extends EventEmitter {
  readonly stdin = new PassThrough();
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;

  kill(): boolean {
    this.finish();
    return true;
  }

  finish(): void {
    this.exitCode = 0;
    setImmediate(() => {
      this.emit('exit', 0, null);
      this.emit('close', 0, null);
    });
  }
}

/**
 * Scripts the next native helper a host spawns. The helper says hello with `features`, answers each request through
 * `handler`, and acknowledges `dispose` and exits. Pass the test's mocked `spawn`; the returned list collects requests.
 */
export function scriptNativeHelper(
  spawn: { mockImplementationOnce(implementation: () => unknown): unknown },
  handler: (message: ScriptedNativeRequest, send: ScriptedNativeSend) => void,
  features: readonly string[] = [],
): ScriptedNativeRequest[] {
  const child = new ScriptedNativeChild();
  const decoder = new NativeFrameDecoder();
  const received: ScriptedNativeRequest[] = [];
  const send: ScriptedNativeSend = (message) => void child.stdout.write(encodeJsonFrame(message));
  child.stdin.on('data', (chunk: Buffer) => decoder.write(chunk));
  decoder.on('json', (message) => {
    if (message.type !== 'request') {
      return;
    }
    if (message.command === 'dispose') {
      send({ id: message.id, result: {}, type: 'response' });
      child.finish();
      return;
    }
    received.push(message);
    handler(message, send);
  });
  spawn.mockImplementationOnce(() => {
    setImmediate(() =>
      send({
        architecture: 'arm64',
        buildId: 'build',
        features: [...features],
        protocol: { major: 1, minor: 0 },
        provider: 'macos',
        sourceDigest: 'source',
        type: 'hello',
      }),
    );
    return child;
  });
  return received;
}
