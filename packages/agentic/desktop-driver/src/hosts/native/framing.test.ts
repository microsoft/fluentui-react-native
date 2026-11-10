import { NativeFrameDecoder, encodeBinaryFrame, encodeJsonFrame } from './framing';

describe('native host framing', () => {
  test('decodes chunked JSON and binary frames', () => {
    const decoder = new NativeFrameDecoder();
    const messages: unknown[] = [];
    const binaries: { data: number[]; id: string }[] = [];
    decoder.on('json', (message) => messages.push(message));
    decoder.on('binary', ({ data, id }) => binaries.push({ data: [...data], id }));

    const payload = Buffer.concat([
      encodeJsonFrame({ id: 'request-1', result: { ready: true }, type: 'response' }),
      encodeBinaryFrame('image-1', Uint8Array.from([1, 2, 3, 4])),
    ]);
    decoder.write(payload.subarray(0, 7));
    decoder.write(payload.subarray(7, 19));
    decoder.write(payload.subarray(19));

    expect(messages).toEqual([{ id: 'request-1', result: { ready: true }, type: 'response' }]);
    expect(binaries).toEqual([{ data: [1, 2, 3, 4], id: 'image-1' }]);
  });

  test('rejects invalid frame magic', () => {
    const decoder = new NativeFrameDecoder();
    const errors: Error[] = [];
    decoder.on('error', (error) => errors.push(error));

    decoder.write(Buffer.alloc(12));

    expect(errors[0]?.message).toContain('invalid frame magic');
  });

  test('rejects reserved header bytes and oversized frames before buffering payloads', () => {
    const reservedDecoder = new NativeFrameDecoder();
    const reservedErrors: Error[] = [];
    reservedDecoder.on('error', (error) => reservedErrors.push(error));
    const reserved = encodeJsonFrame({ id: 'request-1', result: null, type: 'response' });
    reserved[5] = 1;
    reservedDecoder.write(reserved);
    expect(reservedErrors[0]?.message).toContain('reserved frame bytes');

    const oversizedDecoder = new NativeFrameDecoder();
    const oversizedErrors: Error[] = [];
    oversizedDecoder.on('error', (error) => oversizedErrors.push(error));
    const header = Buffer.alloc(12);
    header.write('FDR1');
    header[4] = 1;
    header.writeUInt32LE(8 * 1024 * 1024 + 1, 8);
    oversizedDecoder.write(header);
    expect(oversizedErrors[0]?.message).toContain('exceeds');
  });

  test('rejects oversized outbound frames before writing a header', () => {
    expect(() =>
      encodeJsonFrame({
        id: 'request-1',
        result: 'x'.repeat(8 * 1024 * 1024),
        type: 'response',
      }),
    ).toThrow('exceeds');
  });

  test('delivers every frame that shares a chunk and every frame split across single-byte chunks', () => {
    const frames = [
      encodeJsonFrame({ event: 'first', type: 'event' }),
      encodeBinaryFrame('image-1', Uint8Array.from([9, 8, 7])),
      encodeJsonFrame({ event: 'second', type: 'event' }),
    ];
    for (const chunks of [[Buffer.concat(frames)], Array.from(Buffer.concat(frames), (byte) => Buffer.from([byte]))]) {
      const decoder = new NativeFrameDecoder();
      const seen: string[] = [];
      decoder.on('json', (message) => seen.push(message.type === 'event' ? message.event : message.type));
      decoder.on('binary', ({ id }) => seen.push(id));
      for (const chunk of chunks) {
        decoder.write(chunk);
      }
      expect(seen).toEqual(['first', 'image-1', 'second']);
    }
  });

  test('stops at the first malformed frame, reports it once, and ignores everything after it', () => {
    const decoder = new NativeFrameDecoder();
    const errors: Error[] = [];
    const messages: unknown[] = [];
    decoder.on('error', (error) => errors.push(error));
    decoder.on('json', (message) => messages.push(message));

    decoder.write(
      Buffer.concat([encodeJsonFrame({ event: 'ok', type: 'event' }), Buffer.alloc(12), encodeJsonFrame({ event: 'late', type: 'event' })]),
    );
    decoder.write(Buffer.alloc(12));
    decoder.write(encodeJsonFrame({ event: 'later', type: 'event' }));

    expect(messages).toEqual([{ event: 'ok', type: 'event' }]);
    expect(errors).toHaveLength(1);
  });

  test('reports a JSON payload that does not parse, then ignores later frames', () => {
    const decoder = new NativeFrameDecoder();
    const errors: Error[] = [];
    const messages: unknown[] = [];
    decoder.on('error', (error) => errors.push(error));
    decoder.on('json', (message) => messages.push(message));
    const garbage = encodeJsonFrame({ event: 'x', type: 'event' });
    garbage[garbage.length - 2] = 0x7b;

    decoder.write(Buffer.concat([garbage, encodeJsonFrame({ event: 'late', type: 'event' })]));

    expect(errors).toHaveLength(1);
    expect(messages).toEqual([]);
  });

  test('lets a throwing listener propagate instead of reporting it as malformed output', () => {
    const decoder = new NativeFrameDecoder();
    const errors: Error[] = [];
    decoder.on('error', (error) => errors.push(error));
    decoder.on('json', () => {
      throw new Error('listener failed');
    });

    expect(() => decoder.write(encodeJsonFrame({ event: 'x', type: 'event' }))).toThrow('listener failed');
    expect(errors).toEqual([]);
  });

  test('stops decoding after end()', () => {
    const decoder = new NativeFrameDecoder();
    const messages: unknown[] = [];
    decoder.on('json', (message) => messages.push(message));

    decoder.write(encodeJsonFrame({ event: 'first', type: 'event' }).subarray(0, 5));
    decoder.end();
    decoder.write(encodeJsonFrame({ event: 'second', type: 'event' }));

    expect(messages).toEqual([]);
  });

  test('reassembles a large frame from small chunks in linear time', () => {
    const decoder = new NativeFrameDecoder();
    const payload = Buffer.alloc(8 * 1024 * 1024, 0x5a);
    const frame = encodeBinaryFrame('image-1', payload);
    const received: Uint8Array[] = [];
    decoder.on('binary', ({ data }) => received.push(data));

    const started = performance.now();
    for (let offset = 0; offset < frame.length; offset += 1024) {
      decoder.write(frame.subarray(offset, offset + 1024));
    }
    const elapsedMs = performance.now() - started;

    expect(received).toHaveLength(1);
    expect(Buffer.from(received[0] as Uint8Array).equals(payload)).toBe(true);
    // Re-concatenating the buffer for every chunk took several seconds here; a chunk list takes milliseconds.
    expect(elapsedMs).toBeLessThan(2000);
  });
});
