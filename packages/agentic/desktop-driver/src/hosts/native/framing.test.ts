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
});
