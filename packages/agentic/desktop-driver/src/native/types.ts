import type { DesktopEndpoint } from '../protocol/types.js';
import type { MutationEffect } from '../protocol/settlement.js';

export type NativeDriverProvider = 'macos' | 'windows';
export type NativeDriverArchitecture = 'arm64' | 'x64';
export type NativeDriverConfiguration = 'debug' | 'release';
export type NativeDriverBuildPolicy = 'if-missing' | 'never';
export type NativeDriverArtifactOrigin = 'built' | 'cache' | 'explicit-path' | 'install-root';

export type NativeDriverWireProtocol = {
  major: number;
  minor: number;
};

export type NativeDriverSigning = {
  certificateHash?: string;
  designatedRequirement?: string;
  identity?: string;
  mode: 'adhoc' | 'none' | 'signed';
  teamId?: string;
};

export type NativeDriverArtifact = {
  architecture: NativeDriverArchitecture;
  artifactId: string;
  artifactRoot: string;
  buildFingerprint: string;
  buildId: string;
  compatibilityKey: string;
  configuration: NativeDriverConfiguration;
  endpoints: readonly DesktopEndpoint[];
  executablePath: string;
  features: readonly string[];
  origin: NativeDriverArtifactOrigin;
  provider: NativeDriverProvider;
  schemaVersion: 1;
  signing: NativeDriverSigning;
  sourceDigest: string;
  wireProtocol: NativeDriverWireProtocol;
};

export type NativeDriverBuildOptions = {
  architecture?: NativeDriverArchitecture;
  cacheRoot?: string;
  configuration?: NativeDriverConfiguration;
  force?: boolean;
  macosSigningIdentity?: string;
  platform: DesktopEndpoint;
  signal?: AbortSignal;
};

export type NativeDriverResolveOptions = NativeDriverBuildOptions & {
  buildPolicy?: NativeDriverBuildPolicy;
  helperPath?: string;
  installRoot?: string;
};

/** Native-verified process identity without a controlling application lease. */
export type NativeApplicationIdentity = Readonly<{
  processId: number;
  processStartedAt: string;
  /** Required Windows evidence; the executable also distinguishes each Win32 REX host incarnation. */
  executablePath?: string;
  interactiveSession?: string;
  aumid?: string;
}>;

export type NativeDesktopApplicationDescriptor = {
  arguments?: readonly string[];
  aumid?: string;
  bundleIdentifier?: string;
  executablePath?: string;
  leaseNonce?: string;
  leasePath?: string;
  /** Exact native attach identity. Never grants launch/termination authority and cannot be combined with a legacy lease. */
  processIdentity?: NativeApplicationIdentity;
  windowTitle?: string;
  workingDirectory?: string;
};

export type NativeHostHello = {
  architecture: NativeDriverArchitecture;
  buildId: string;
  features: string[];
  minimumOs?: string;
  protocol: NativeDriverWireProtocol;
  provider: NativeDriverProvider;
  sourceDigest: string;
  type: 'hello';
};

export type NativeHostRequest = {
  command: string;
  id: string;
  params?: unknown;
  type: 'request';
};

export type NativeApplicationSettlement = 'not-started' | 'exited' | 'unknown';

type NativeHostFailureData = Record<string, unknown> & {
  /** Launch acquisition settlement, distinct from an input mutation effect. */
  applicationSettlement?: NativeApplicationSettlement;
};

export type NativeHostResponse = {
  binary?: {
    height?: number;
    id: string;
    mimeType?: string;
    scaleFactor?: number;
    width?: number;
  };
  error?: {
    code: string;
    data?: NativeHostFailureData;
    /** What a failed mutating command left behind. Absent means the provider cannot rule an effect out. */
    effect?: MutationEffect;
    message: string;
  };
  id: string;
  result?: unknown;
  type: 'response';
};

export type NativeHostEventMessage = {
  event: string;
  payload?: unknown;
  sequence?: number;
  type: 'event';
};

export type NativeHostCancel = {
  id: string;
  type: 'cancel';
};

export type NativeHostCancelled = {
  /** What the cancelled mutating command left behind. Absent means the provider cannot rule an effect out. */
  effect?: MutationEffect;
  /** Provider lifecycle settlement evidence, including an unleased application that a cancelled launch created. */
  data?: NativeHostFailureData;
  id: string;
  type: 'cancelled';
};

export type NativeHostJsonMessage =
  | NativeHostCancel
  | NativeHostCancelled
  | NativeHostEventMessage
  | NativeHostHello
  | NativeHostRequest
  | NativeHostResponse;
