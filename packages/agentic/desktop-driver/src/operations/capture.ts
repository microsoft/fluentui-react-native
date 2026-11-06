import { z } from 'zod';

import type { NativeImage } from '../host/types.js';
import type { Artifact } from './artifacts.js';
import { operationError } from './envelope.js';
import { artifactLimits, artifactPageBytes } from './limits.js';
import { assertContentAllowed } from './policy.js';
import { referenceFailureError } from './refs.js';
import { registerOperation } from './runtime.js';
import type { OperationCapabilities, OperationAvailability, OperationRuntime } from './runtime.js';
import { flushLedger, interpretFailure } from './sampling.js';
import { budgetField, referenceSchema, warningSchema } from './shapes.js';

const artifactIdSchema = z.string().regex(/^a[1-9][0-9]{0,9}$/, 'An artifact id is "a" followed by a number, as capture returned it.');

const captureInput = z.strictObject({
  ref: referenceSchema.optional().describe('An element to capture, instead of the whole window.'),
  image: z.boolean().default(false).describe('Also return the PNG inline, as base64, when it fits in 1 MiB.'),
});

export type CaptureInput = z.input<typeof captureInput>;

const imageFields = {
  artifact: z.string().describe('Read the image again, in pages, with the artifact operation.'),
  mimeType: z.literal('image/png'),
  bytes: z.number(),
  sha256: z.string(),
};

const captureOutput = z.strictObject({
  ...imageFields,
  scope: z.enum(['window', 'element']),
  window: z.string(),
  ref: z.string().optional(),
  width: z.number().describe('Pixels.'),
  height: z.number(),
  scaleFactor: z.number().describe('Pixels per point.'),
  capturedAt: z.string(),
  incarnation: z.number().describe('The application incarnation the image shows.'),
  previewGeneration: z.number().describe('The preview region generation the image shows.'),
  image: z.string().optional().describe('The PNG as base64, when asked for and it fit.'),
  imageOmitted: z.literal('too-large').optional().describe('The image did not fit inline; page it with artifact.'),
  warnings: z.array(warningSchema).optional(),
});

export type CaptureResult = z.infer<typeof captureOutput>;

const artifactInput = z.strictObject({
  artifact: artifactIdSchema,
  offset: z.number().int().min(0).default(0).describe('Byte offset to read from; next from the previous page.'),
  length: budgetField(artifactPageBytes).describe('Most bytes to return.'),
});

export type ArtifactInput = z.input<typeof artifactInput>;

const artifactOutput = z.strictObject({
  ...imageFields,
  offset: z.number(),
  data: z.string().describe('These bytes as base64.'),
  next: z.number().optional().describe('The offset of the next page; absent at the end.'),
});

export type ArtifactResult = z.infer<typeof artifactOutput>;

function requireCapture(capabilities: OperationCapabilities): OperationAvailability {
  if (!capabilities.boundedObservation) {
    return { available: false, reason: 'bounded-observation-unsupported' };
  }
  return capabilities.windowCapture ? { available: true } : { available: false, reason: 'capture-unsupported' };
}

/** Pixels show whatever the application displays, so capture and reading a capture are content. */
function assertCaptureAllowed(runtime: OperationRuntime): void {
  assertContentAllowed(runtime, true);
}

type Subject = { nativeId?: string; ref?: string; windowId: string };

function resolveSubject(runtime: OperationRuntime, ref: string | undefined): Subject {
  if (ref === undefined) {
    const windowId = runtime.currentWindowId();
    if (windowId === undefined) {
      throw operationError('no such window', 'no-window', 'The session has no window to capture.');
    }
    return { windowId };
  }
  if (!runtime.capabilities.elementCapture) {
    throw operationError('unsupported operation', 'element-capture-unsupported', 'This provider cannot capture one element.');
  }
  const resolution = runtime.state.refs.resolve(ref, runtime.previewGeneration());
  if (resolution.ok === false) {
    throw referenceFailureError(resolution.failure, ref);
  }
  return { nativeId: resolution.entry.nativeId, ref, windowId: resolution.entry.windowId };
}

async function captureSubject(runtime: OperationRuntime, subject: Subject): Promise<NativeImage> {
  try {
    return await runtime.command('Capturing the application', (signal) =>
      subject.nativeId === undefined
        ? runtime.host.captureWindow(subject.windowId, signal)
        : runtime.host.captureElement(subject.nativeId, signal),
    );
  } catch (error) {
    throw interpretFailure(runtime, { windowId: subject.windowId, within: subject.ref }, error);
  }
}

function encodePage(artifact: Artifact, offset: number, length: number): { data: string; next?: number } {
  const end = Math.min(artifact.data.byteLength, offset + length);
  const data = Buffer.from(artifact.data.buffer, artifact.data.byteOffset + offset, end - offset).toString('base64');
  return end < artifact.data.byteLength ? { data, next: end } : { data };
}

function describeImage(artifact: Artifact) {
  return { artifact: artifact.id, mimeType: artifact.mimeType, bytes: artifact.data.byteLength, sha256: artifact.sha256 };
}

export const captureOperation = registerOperation({
  availability: requireCapture,
  effect: 'read',
  input: captureInput,
  name: 'capture',
  output: captureOutput,
  summary:
    'Captures the window, or one element, as a PNG kept as an artifact with where and when it was taken. Returns the image inline only when asked.',
  async run(input, runtime) {
    assertCaptureAllowed(runtime);
    const subject = resolveSubject(runtime, input.ref);
    const image = await captureSubject(runtime, subject);
    if (image.data.byteLength > artifactLimits.maxBytes) {
      throw operationError(
        'unsupported operation',
        'capture-too-large',
        'The image is larger than one capture may be. Capture an element instead.',
      );
    }
    const artifact = runtime.state.artifacts.add(image, {
      capturedAt: new Date().toISOString(),
      incarnation: runtime.state.incarnation,
      previewGeneration: runtime.previewGeneration(),
      ...(subject.ref === undefined ? {} : { ref: subject.ref }),
      scope: subject.ref === undefined ? 'window' : 'element',
      window: subject.windowId,
    });
    const fits = artifact.data.byteLength <= artifactPageBytes.ceiling;
    const warnings = await flushLedger(runtime);
    return {
      ...describeImage(artifact),
      scope: artifact.scope,
      window: artifact.window,
      ...(artifact.ref === undefined ? {} : { ref: artifact.ref }),
      width: artifact.width,
      height: artifact.height,
      scaleFactor: artifact.scaleFactor,
      capturedAt: artifact.capturedAt,
      incarnation: artifact.incarnation,
      previewGeneration: artifact.previewGeneration,
      ...(input.image && fits ? { image: encodePage(artifact, 0, artifact.data.byteLength).data } : {}),
      ...(input.image && !fits ? { imageOmitted: 'too-large' as const } : {}),
      ...(warnings.length > 0 ? { warnings } : {}),
    };
  },
  summarize(input, output) {
    return {
      image: input.image,
      scope: input.ref === undefined ? 'window' : 'element',
      ...(output ? { artifact: output.artifact, bytes: output.bytes, height: output.height, width: output.width } : {}),
    };
  },
});

export const artifactOperation = registerOperation({
  availability: requireCapture,
  effect: 'read',
  input: artifactInput,
  name: 'artifact',
  output: artifactOutput,
  summary: 'Reads a captured image in base64 pages of up to 1 MiB. The session keeps its 16 most recent captures.',
  async run(input, runtime) {
    assertCaptureAllowed(runtime);
    const lookup = runtime.state.artifacts.get(input.artifact);
    if (lookup.ok === false) {
      throw lookup.failure === 'expired'
        ? operationError('invalid argument', 'artifact-expired', 'That capture was dropped to make room for newer ones. Capture again.')
        : operationError('invalid argument', 'artifact-unknown', 'No capture in this session has that id.');
    }
    const { artifact } = lookup;
    if (input.offset > artifact.data.byteLength) {
      throw operationError('invalid argument', 'offset-out-of-range', 'offset is past the end of the image.');
    }
    return { ...describeImage(artifact), offset: input.offset, ...encodePage(artifact, input.offset, input.length) };
  },
  summarize(input, output) {
    return { artifact: input.artifact, offset: input.offset, ...(output ? { bytes: output.bytes } : {}) };
  },
});
