import type { DesktopEndpoint } from '../protocol/types.js';

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
  platform: DesktopEndpoint;
  signal?: AbortSignal;
};

export type NativeDriverResolveOptions = NativeDriverBuildOptions & {
  buildPolicy?: NativeDriverBuildPolicy;
  helperPath?: string;
  installRoot?: string;
};

export type NativeDesktopApplicationDescriptor = {
  arguments?: readonly string[];
  aumid?: string;
  bundleIdentifier?: string;
  executablePath?: string;
  leaseNonce?: string;
  leasePath?: string;
  windowTitle?: string;
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
    data?: Record<string, unknown>;
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
