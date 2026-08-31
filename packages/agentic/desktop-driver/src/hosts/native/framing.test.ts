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
});
