import type { DesktopServiceRunStatus } from '../types.ts';

import type { DESKTOP_PROTOCOL_VERSION } from './versions.ts';

export const DESKTOP_HOST_READY_EVENT = 'desktopTestHostReady';
export const DESKTOP_HOST_CLOSING_EVENT = 'desktopTestHostClosing';
export const DESKTOP_RUN_REQUEST_EVENT = 'desktopTestRunRequest';
export const DESKTOP_RUN_STATUS_EVENT = 'desktopTestRunStatus';
export const DESKTOP_RUN_CANCEL_EVENT = 'desktopTestRunCancel';

export interface DesktopHostReady {
  protocolVersion: typeof DESKTOP_PROTOCOL_VERSION;
  serviceId: string;
  manifest: {
    schemaVersion: number;
    digest: string;
    tests: readonly {
      storyId: string;
      planId: string;
      kind: 'inline' | 'spec';
    }[];
  };
  capabilities: {
    runModes: readonly ['selected', 'all'];
    cancellation: true;
    maxConcurrentRuns: 1;
  };
}

export interface DesktopChannelRunRequest {
  protocolVersion: typeof DESKTOP_PROTOCOL_VERSION;
  serviceId: string;
  requestId: string;
  manifestDigest: string;
  mode: 'selected' | 'all';
  storyIds?: readonly string[];
}

export interface DesktopChannelRunStatus {
  protocolVersion: typeof DESKTOP_PROTOCOL_VERSION;
  serviceId: string;
  requestId: string;
  sequence: number;
  status: DesktopServiceRunStatus;
}

export interface DesktopChannelRunCancel {
  protocolVersion: typeof DESKTOP_PROTOCOL_VERSION;
  serviceId: string;
  runId: string;
}
