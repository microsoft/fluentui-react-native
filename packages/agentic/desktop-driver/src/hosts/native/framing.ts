import { Buffer } from 'node:buffer';
import { EventEmitter } from 'node:events';

import type { NativeHostJsonMessage } from '../../native/types.js';

const frameMagic = Buffer.from('FDR1');
const frameHeaderBytes = 12;
const jsonFrameType = 1;
const binaryFrameType = 2;
const maximumJsonFrameBytes = 8 * 1024 * 1024;
const maximumBinaryFrameBytes = 64 * 1024 * 1024;
const maximumBinaryIdentifierBytes = 1024;

export type NativeBinaryFrame = {
  data: Uint8Array;
  id: string;
};

type FrameHeader = { length: number; type: number };

/**
 * Decodes FDR1 frames from helper output. The first malformed frame emits one `error` and ends the stream: the
 * decoder drops its buffer and ignores every later chunk, because nothing after a bad frame can be trusted to
 * line up. Frames are emitted outside the parse, so a listener that throws is never reported as malformed output.
 */
export class NativeFrameDecoder extends EventEmitter<{
  binary: [NativeBinaryFrame];
  error: [Error];
  json: [NativeHostJsonMessage];
}> {
  private chunks: Buffer[] = [];
  private buffered = 0;
  private pending?: FrameHeader;
  private ended = false;

  /** Takes ownership of `chunk`; it is never copied or modified. */
  write(chunk: Uint8Array): void {
    if (this.ended || chunk.byteLength === 0) {
      return;
    }
    this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength));
    this.buffered += chunk.byteLength;
    while (!this.ended) {
      const header = this.pending ?? this.readHeader();
      if (header === undefined) {
        return;
      }
      if (header instanceof Error) {
        this.fail(header);
        return;
      }
      if (this.buffered < header.length) {
        this.pending = header;
        return;
      }
      this.pending = undefined;
      const payload = this.take(header.length);
      let message: NativeHostJsonMessage | undefined;
      let binary: NativeBinaryFrame | undefined;
      try {
        if (header.type === jsonFrameType) {
          message = JSON.parse(payload.toString('utf8')) as NativeHostJsonMessage;
        } else {
          binary = decodeBinaryPayload(payload);
        }
      } catch (error) {
        this.fail(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      if (message !== undefined) {
        this.emit('json', message);
      } else if (binary) {
        this.emit('binary', binary);
      }
    }
  }

  /** Stops decoding and releases buffered bytes, for a stream that failed for a reason the decoder cannot see. */
  end(): void {
    this.ended = true;
    this.chunks = [];
    this.buffered = 0;
    this.pending = undefined;
  }

  private fail(error: Error): void {
    this.end();
    this.emit('error', error);
  }

  /** Returns the next frame header, an error for a malformed one, or nothing until twelve bytes have arrived. */
  private readHeader(): FrameHeader | Error | undefined {
    if (this.buffered < frameHeaderBytes) {
      return undefined;
    }
    const header = this.take(frameHeaderBytes);
    if (!header.subarray(0, 4).equals(frameMagic)) {
      return new Error('Native driver helper emitted an invalid frame magic.');
    }
    const type = header[4];
    if (header[5] !== 0 || header[6] !== 0 || header[7] !== 0) {
      return new Error('Native driver helper emitted nonzero reserved frame bytes.');
    }
    const maximumLength = type === jsonFrameType ? maximumJsonFrameBytes : type === binaryFrameType ? maximumBinaryFrameBytes : undefined;
    if (maximumLength === undefined) {
      return new Error(`Native driver helper emitted unsupported frame type ${String(type)}.`);
    }
    const length = header.readUInt32LE(8);
    if (length > maximumLength) {
      return new Error(`Native driver helper frame length ${length} exceeds the ${maximumLength}-byte type limit.`);
    }
    return { length, type };
  }

  /** Removes the next `size` bytes, copying only when they span chunks. */
  private take(size: number): Buffer {
    this.buffered -= size;
    const first = this.chunks[0];
    if (first && first.length >= size) {
      if (first.length === size) {
        this.chunks.shift();
        return first;
      }
      this.chunks[0] = first.subarray(size);
      return first.subarray(0, size);
    }
    const pieces: Buffer[] = [];
    let remaining = size;
    let consumed = 0;
    while (remaining > 0) {
      const chunk = this.chunks[consumed] as Buffer;
      if (chunk.length <= remaining) {
        pieces.push(chunk);
        remaining -= chunk.length;
        consumed += 1;
      } else {
        pieces.push(chunk.subarray(0, remaining));
        this.chunks[consumed] = chunk.subarray(remaining);
        remaining = 0;
      }
    }
    this.chunks.splice(0, consumed);
    return Buffer.concat(pieces, size);
  }
}

export function encodeJsonFrame(message: NativeHostJsonMessage): Buffer {
  return encodeFrame(jsonFrameType, Buffer.from(JSON.stringify(message), 'utf8'));
}

export function encodeBinaryFrame(id: string, data: Uint8Array): Buffer {
  const idBytes = Buffer.from(id, 'utf8');
  const payload = Buffer.alloc(4 + idBytes.length + data.byteLength);
  payload.writeUInt32LE(idBytes.length, 0);
  idBytes.copy(payload, 4);
  Buffer.from(data).copy(payload, 4 + idBytes.length);
  return encodeFrame(binaryFrameType, payload);
}

function encodeFrame(type: number, payload: Buffer): Buffer {
  const maximumLength = type === jsonFrameType ? maximumJsonFrameBytes : type === binaryFrameType ? maximumBinaryFrameBytes : undefined;
  if (maximumLength === undefined || payload.length > maximumLength) {
    throw new RangeError(`Native driver frame length ${payload.length} exceeds the supported type limit.`);
  }
  const header = Buffer.alloc(frameHeaderBytes);
  frameMagic.copy(header, 0);
  header[4] = type;
  header.writeUInt32LE(payload.length, 8);
  return Buffer.concat([header, payload]);
}

function decodeBinaryPayload(payload: Buffer): NativeBinaryFrame {
  if (payload.length < 4) {
    throw new Error('Native driver binary frame is missing its identifier length.');
  }
  const idLength = payload.readUInt32LE(0);
  if (idLength === 0 || idLength > maximumBinaryIdentifierBytes || payload.length < 4 + idLength) {
    throw new Error('Native driver binary frame contains a truncated identifier.');
  }
  return {
    data: payload.subarray(4 + idLength),
    id: payload.subarray(4, 4 + idLength).toString('utf8'),
  };
}
