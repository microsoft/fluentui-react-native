import net from 'node:net';

// --import waits for this handshake before executing the entry point, including in late-spawned Node descendants.
const encoded = process.env.FURN_DESKTOP_PROCESS_CONTROL;
if (encoded) {
  const context = JSON.parse(encoded);
  if (context.schemaVersion !== 1 || typeof context.address !== 'string' || typeof context.nonce !== 'string')
    throw new TypeError('Invalid owned process lifeline.');
  const socket = net.createConnection(context.address);
  socket.setEncoding('utf8');
  const disposers = new Set();
  const pending = new Map();
  let stopping;
  let finished = false;
  let buffer = '';
  let resolveHandshake;
  let rejectHandshake;
  const handshake = new Promise((resolve, reject) => {
    resolveHandshake = resolve;
    rejectHandshake = reject;
  });
  const timer = setTimeout(() => lost(new Error('Owned process lifeline handshake timed out.')), 5000);
  function lost(error) {
    clearTimeout(timer);
    rejectHandshake(error);
    for (const { reject, timer } of pending.values()) {
      clearTimeout(timer);
      reject(error);
    }
    pending.clear();
    if (finished || stopping) return;
    stopping = (async () => {
      if (disposers.size) {
        const results = await Promise.allSettled([...disposers].map((dispose) => Promise.resolve().then(dispose)));
        const failures = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
        if (failures.length) throw new AggregateError(failures, 'Owned process disposal is incomplete; recovery remains fenced.');
      } else {
        // Metro and command wrappers keep their own signal handlers. Never kill a parent process group from a child.
        // Windows terminates on a self-SIGTERM without running handlers, so dispatch installed handlers directly.
        if (process.listenerCount('SIGTERM')) process.emit('SIGTERM', 'SIGTERM');
        else process.kill(process.pid, 'SIGTERM');
      }
    })();
    void stopping.catch((failure) => {
      process.stderr.write(`${failure.stack ?? failure}\n`);
      process.exitCode = 1;
      if (!socket.destroyed) socket.write(`${JSON.stringify({ type: 'disposal-failed', message: String(failure.message ?? failure) })}\n`);
    });
  }
  socket.on('error', lost);
  socket.on('close', () => lost(new Error('Owned process parent lifeline closed.')));
  socket.on('connect', () => socket.write(`${JSON.stringify({ type: 'hello', nonce: context.nonce, processId: process.pid })}\n`));
  socket.on('data', (text) => {
    buffer += text;
    if (Buffer.byteLength(buffer) > 65536) {
      lost(new Error('Oversized process control frame.'));
      socket.destroy();
      return;
    }
    let newline;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      try {
        const frame = JSON.parse(line);
        if (frame.type === 'accepted') {
          clearTimeout(timer);
          resolveHandshake();
        } else if (frame.type === 'stop') {
          lost(new Error('Owned process stop requested.'));
        } else if (frame.type === 'acknowledged' && pending.has(frame.requestId)) {
          const item = pending.get(frame.requestId);
          clearTimeout(item.timer);
          pending.delete(frame.requestId);
          item.resolve();
        } else throw new Error('Invalid owned process control response.');
      } catch (error) {
        lost(error);
        socket.destroy();
      }
    }
  });
  await handshake;
  if (stopping) throw new Error('Owned process stopped before its entry point.');
  socket.unref();
  globalThis[Symbol.for('furn.desktop.process-control')] = {
    register(dispose) {
      if (finished || stopping) throw new Error('Owned process is already stopping.');
      disposers.add(dispose);
      return () => disposers.delete(dispose);
    },
    async ready(readiness) {
      if (finished || stopping) throw new Error('A stopping process cannot publish readiness.');
      const requestId = `${process.pid}-${pending.size}-${Date.now()}`;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error('Owned service readiness was not acknowledged.'));
        }, 5000);
        pending.set(requestId, { resolve, reject, timer });
        socket.write(`${JSON.stringify({ type: 'ready', requestId, readiness })}\n`);
      });
    },
    finish() {
      finished = true;
      socket.end('{"type":"disposed"}\n');
    },
  };
}
