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

export class NativeFrameDecoder extends EventEmitter<{
  binary: [NativeBinaryFrame];
  error: [Error];
  json: [NativeHostJsonMessage];
}> {
  private buffer = Buffer.alloc(0);

  write(chunk: Uint8Array): void {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(chunk)]);
    while (this.buffer.length >= frameHeaderBytes) {
      if (!this.buffer.subarray(0, 4).equals(frameMagic)) {
        this.emit('error', new Error('Native driver helper emitted an invalid frame magic.'));
        return;
      }
      const type = this.buffer[4];
      const length = this.buffer.readUInt32LE(8);
      if (this.buffer[5] !== 0 || this.buffer[6] !== 0 || this.buffer[7] !== 0) {
        this.emit('error', new Error('Native driver helper emitted nonzero reserved frame bytes.'));
        return;
      }
      const maximumLength = type === jsonFrameType ? maximumJsonFrameBytes : type === binaryFrameType ? maximumBinaryFrameBytes : undefined;
      if (maximumLength === undefined) {
        this.emit('error', new Error(`Native driver helper emitted unsupported frame type ${String(type)}.`));
        return;
      }
      if (length > maximumLength) {
        this.emit('error', new Error(`Native driver helper frame length ${length} exceeds the ${maximumLength}-byte type limit.`));
        return;
      }
      if (this.buffer.length < frameHeaderBytes + length) {
        return;
      }
      const payload = this.buffer.subarray(frameHeaderBytes, frameHeaderBytes + length);
      this.buffer = this.buffer.subarray(frameHeaderBytes + length);
      try {
        if (type === jsonFrameType) {
          this.emit('json', JSON.parse(payload.toString('utf8')) as NativeHostJsonMessage);
        } else if (type === binaryFrameType) {
          this.emit('binary', decodeBinaryPayload(payload));
        }
      } catch (error) {
        this.emit('error', error instanceof Error ? error : new Error(String(error)));
        return;
      }
    }
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
